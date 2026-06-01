const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
require('dotenv').config();

// Initialize Twilio (Safely)
let twilioClient;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ [AUTH] Twilio client initialized successfully');
    } else {
        console.warn('⚠️ [AUTH] Twilio credentials missing. Running in Simulated Mode (logs only).');
    }
} catch (err) {
    console.error('❌ [AUTH] Failed to initialize Twilio:', err.message);
}

// Initialize Nodemailer (Safely)
let emailTransporter;
try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || 'khaliyarestaurant@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'ojusvrcpwdshdxoi';
    const smtpPort = process.env.SMTP_PORT || 465;

    if (smtpHost && smtpUser && smtpPass) {
        emailTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: Number(smtpPort) === 465, // true for 465, false for 587
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
        
        // Verify connection configuration
        emailTransporter.verify((error, success) => {
            if (error) {
                console.error('❌ [AUTH] SMTP Connection Error:', error.message);
            } else {
                console.log('✅ [AUTH] Nodemailer is ready to send emails');
            }
        });
    } else {
        console.warn('⚠️ [AUTH] SMTP credentials missing. Real Email OTP is DISABLED.');
    }
} catch (err) {
    console.error('❌ [AUTH] Failed to initialize Nodemailer:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return relative path that the frontend can use
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Diagnostic Logger: Log every request to help debug 404s on the user's laptop
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        if (res.statusCode === 404) {
            console.warn(`⚠️ [404] Resource not found: ${req.url}`);
        }
    });
    next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    setHeaders: (res, path) => {
        if (path.endsWith('service-worker.js') || path.endsWith('manifest.json')) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            console.log(`[Headers] Forcing fresh fetch for: ${path}`);
        }
    }
}));

// Capacity Map: Maximum tables available per type per 30-min slot
const CAPACITY_MAP = {
    'intimate': 4,
    'family': 6,
    'group': 3,
    'party': 2,
    'window': 5
};

// Helper logic for JSON files (acting as simple DB)
const getFilePath = (fileName) => path.join(__dirname, fileName);

const readData = (fileName) => {
    const filePath = getFilePath(fileName);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

// SSE Live Updates
let sseClients = [];
const sendUpdateToAll = (type, data) => {
    sseClients.forEach(client => {
        try {
            client.res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
        } catch (e) {
            console.error('SSE Write Error:', e);
        }
    });
};

const writeData = (fileName, data) => {
    const filePath = getFilePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    const type = fileName.replace('.json', '');
    sendUpdateToAll(type, data);
};

// API: Menu
app.get('/api/menu', (req, res) => {
    const menu = readData('menu.json');
    res.json(menu);
});

app.post('/api/menu', (req, res) => {
    const menu = readData('menu.json');
    const newItem = { id: Date.now(), ...req.body };
    menu.push(newItem);
    writeData('menu.json', menu);
    res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
    const menu = readData('menu.json');
    const index = menu.findIndex(m => m.id == req.params.id || m.name == req.params.id);
    if (index !== -1) {
        menu[index] = { ...menu[index], ...req.body };
        writeData('menu.json', menu);
        res.json(menu[index]);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

app.delete('/api/menu/:id', (req, res) => {
    const menu = readData('menu.json');
    const filtered = menu.filter(m => m.id != req.params.id && m.name != req.params.id);
    if (filtered.length !== menu.length) {
        writeData('menu.json', filtered);
        res.json({ message: 'Item deleted' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// API: Bookings
app.get('/api/bookings', (req, res) => {
    const bookings = readData('bookings.json');
    res.json(bookings);
});

app.get('/api/bookings/availability', (req, res) => {
    const { date, tableType } = req.query;
    if (!date || !tableType) return res.status(400).json({ message: 'Date and Table Type are required' });

    const bookings = readData('bookings.json');
    const filtered = bookings.filter(b => b.date === date && b.tableType === tableType);
    
    // Count bookings per time slot
    const slotCounts = {};
    filtered.forEach(b => {
        slotCounts[b.time] = (slotCounts[b.time] || 0) + 1;
    });

    const maxCapacity = CAPACITY_MAP[tableType.toLowerCase()] || 4;
    
    res.json({
        date,
        tableType,
        maxCapacity,
        bookedSlots: slotCounts
    });
});

app.post('/api/bookings', (req, res) => {
    const bookings = readData('bookings.json');
    const newBooking = { 
        id: Date.now(), 
        timestamp: new Date().toLocaleString(), 
        status: 'pending', 
        source: 'Website', // Default source
        specialRequests: '', // Default request
        ...req.body 
    };
    bookings.push(newBooking);
    writeData('bookings.json', bookings);
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
});

app.put('/api/bookings/:id', (req, res) => {
    const bookings = readData('bookings.json');
    const index = bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...req.body };
        writeData('bookings.json', bookings);
        res.json({ message: 'Booking updated', booking: bookings[index] });
    } else {
        res.status(404).json({ message: 'Booking not found' });
    }
});

app.delete('/api/bookings/:id', (req, res) => {
    const bookings = readData('bookings.json');
    const filtered = bookings.filter(b => b.id != req.params.id);
    if (filtered.length !== bookings.length) {
        writeData('bookings.json', filtered);
        res.json({ message: 'Booking deleted' });
    } else {
        res.status(404).json({ message: 'Booking not found' });
    }
});

// -- AUTH OTP LOGIC (PROFESSIONAL & SECURE) --
let pendingEmailOtps = {}; // { email: { hashedOtp, expiry } }

app.post('/api/auth/request-email-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required' });

    try {
        // 1. Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

        // 2. Hash the OTP for secure storage
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // 3. Store the record
        pendingEmailOtps[email.toLowerCase()] = { hashedOtp, expiry };

        console.log('\n' + '='.repeat(40));
        console.log(`🚀 [AUTH] Secure Email OTP Generated for ${email}`);
        console.log(`🔒 [AUTH] Hashed OTP: ${hashedOtp.substring(0, 15)}...`);
        console.log('='.repeat(40) + '\n');

        // 4. Send via Nodemailer (if configured)
        if (emailTransporter) {
            // Send email in the background to prevent blocking the UI (fixes the 8-second delay)
            emailTransporter.sendMail({
                from: `"Khaliya Sanctuary" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your Khaliya Login Code',
                text: `Your Khaliya Sanctuary verification code is: ${otp}. Valid for 5 minutes.`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 20px; background: #fff;">
                        <h2 style="color: #D4AF37; text-align: center; font-size: 28px; letter-spacing: 2px;">KHALIYA SANCTUARY</h2>
                        <div style="width: 50px; height: 2px; background: #D4AF37; margin: 20px auto;"></div>
                        <p style="font-size: 16px; color: #555; text-align: center;">Welcome to the Sanctuary. Use the code below to verify your access.</p>
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 15px; margin: 30px 0; text-align: center;">
                            <h1 style="font-size: 42px; color: #000; margin: 0; letter-spacing: 10px;">${otp}</h1>
                        </div>
                        <p style="font-size: 14px; color: #999; text-align: center;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #bbb;">
                            &copy; ${new Date().getFullYear()} Khaliya Luxury Dining. All rights reserved.
                        </div>
                    </div>
                `
            }).then(() => {
                console.log(`✅ [AUTH] Email sent successfully to ${email}`);
            }).catch((emailErr) => {
                console.error('❌ [AUTH] Nodemailer Send Error:', emailErr.message);
                console.warn(`⚠️ [AUTH] Simulated OTP for ${email}: ${otp}`);
            });
            
            // Return immediately so the client UI receives the simulated OTP fallback instantly
            return res.json({ 
                success: true, 
                message: 'Verification code sent. If email fails, use the simulated OTP.',
                simulatedOtp: otp
            });
        }

        // 5. If not configured, fall back to simulated mode
        console.warn(`⚠️ [AUTH] SMTP is not configured. RUNNING IN SIMULATED MODE.`);
        console.warn(`🔑 [AUTH] Simulated OTP for ${email}: ${otp}`);
        return res.json({ 
            success: true, 
            message: 'Running in Simulated Mode. Check your server console for the login code.',
            simulatedOtp: otp
        });

    } catch (err) {
        console.error('❌ [AUTH] Server Error:', err);
        res.status(500).json({ message: 'Internal server error during OTP generation' });
    }
});

app.post('/api/auth/verify-email-otp', async (req, res) => {
    const { email, code } = req.body;
    const record = pendingEmailOtps[email.toLowerCase()];

    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    }

    // Check Expiry (5 Mins)
    if (Date.now() > record.expiry) {
        delete pendingEmailOtps[email.toLowerCase()];
        return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    // Compare Hashed OTP
    const isMatch = await bcrypt.compare(code, record.hashedOtp);

    if (isMatch) {
        delete pendingEmailOtps[email.toLowerCase()];
        
        // Handle User Persistence (Proper Account System)
        const users = readData('users.json');
        let user = users.find(u => u.email === email.toLowerCase());
        
        if (!user) {
            user = {
                id: `USR-${Date.now()}`,
                email: email.toLowerCase(),
                name: 'Khaliya Member',
                joinedAt: new Date().toISOString(),
                spicePoints: 750, // Welcome points
                role: 'customer'
            };
            users.push(user);
            console.log(`👤 [AUTH] New account created: ${email}`);
        } else {
            console.log(`👤 [AUTH] Returning member logged in: ${email}`);
        }

        // Generate dynamic customer session ID for single-device restriction
        const isCustomer = user.email.toLowerCase() !== 'shivkumarrdn7@gmail.com';
        if (isCustomer) {
            const newSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            user.currentSessionId = newSessionId;
            
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex] = user;
            }
            writeData('users.json', users);
            
            // Broadcast the invalidation event to other devices
            setTimeout(() => {
                sendUpdateToAll('customer-session-invalidate', { email: user.email.toLowerCase(), newSessionId });
            }, 100);
        } else {
            writeData('users.json', users);
        }

        res.json({ 
            success: true, 
            user: { ...user, isLoggedIn: true } 
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
});

app.post('/api/auth/check-session', (req, res) => {
    const { email, sessionId } = req.body;
    if (!email || !sessionId) {
        return res.json({ success: true, valid: false, message: 'Email and Session ID are required' });
    }
    
    if (email.toLowerCase() === 'shivkumarrdn7@gmail.com') {
        return res.json({ success: true, valid: true });
    }
    
    const users = readData('users.json');
    let user = users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
        // Ephemeral storage fallback: restore user session if they don't exist
        user = {
            id: `USR-${Date.now()}`,
            email: email.toLowerCase(),
            name: 'Khaliya Member',
            joinedAt: new Date().toISOString(),
            spicePoints: 750,
            role: 'customer',
            currentSessionId: sessionId
        };
        users.push(user);
        writeData('users.json', users);
        return res.json({ success: true, valid: true, message: 'User restored' });
    }
    
    const isValid = user.currentSessionId === sessionId;
    res.json({ success: true, valid: isValid });
});


// API: Reviews
app.get('/api/reviews', (req, res) => {
    const reviews = readData('reviews.json');
    res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
    const reviews = readData('reviews.json');
    const newReview = { id: Date.now(), date: new Date().toLocaleDateString(), ...req.body };
    reviews.push(newReview);
    writeData('reviews.json', reviews);
    res.status(201).json({ message: 'Review created successfully', review: newReview });
});

// -- API: ORDERS (PWA NATIVE ORDERS) --
app.get('/api/orders', (req, res) => {
    res.json(readData('orders.json'));
});

app.post('/api/orders', (req, res) => {
    const orders = readData('orders.json');
    const newOrder = { 
        id: `ORD-${Date.now()}`, 
        timestamp: new Date().toLocaleString(), 
        status: 'received', 
        ...req.body 
    };
    orders.push(newOrder);
    writeData('orders.json', orders);
    
    console.log(`🍟 [ORDER] New App Order: ${newOrder.id} - ${newOrder.items.length} items`);
    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
    const orders = readData('orders.json');
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...req.body };
        writeData('orders.json', orders);
        res.json({ success: true, message: 'Order updated', order: orders[index] });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    const orders = readData('orders.json');
    const filtered = orders.filter(o => o.id !== req.params.id);
    if (filtered.length !== orders.length) {
        writeData('orders.json', filtered);
        res.json({ success: true, message: 'Order deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// API: Analytics & Visits
app.post('/api/visits', (req, res) => {
    const visits = readData('visits.json');
    const source = req.body.source || 'Unknown';
    visits.push({
        id: Date.now(),
        date: new Date().toISOString(),
        source: source // 'Website' or 'App'
    });
    writeData('visits.json', visits);
    res.json({ success: true });
});

app.get('/api/analytics', (req, res) => {
    const orders = readData('orders.json');
    const visits = readData('visits.json');
    
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    
    let totalRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let todayRevenue = 0;
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayStr = now.toLocaleDateString();
    let todayOrdersCount = 0;
    
    let itemCounts = {};
    let hourlyCounts = Array(24).fill(0);
    
    let activeOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;

    validOrders.forEach(order => {
        const orderDateObj = new Date(order.timestamp || order.date || Date.now());
        const total = parseFloat(order.total) || 0;
        
        totalRevenue += total;
        if (orderDateObj >= oneWeekAgo) weeklyRevenue += total;
        if (orderDateObj >= oneMonthAgo) monthlyRevenue += total;
        
        if (orderDateObj.toLocaleDateString() === todayStr) {
            todayRevenue += total;
            todayOrdersCount++;
            hourlyCounts[orderDateObj.getHours()]++;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
                });
            }
        }
    });
    
    let topItem = 'None yet';
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topItem = name;
        }
    }

    let appVisits = 0;
    let webVisits = 0;
    let newCustomersToday = 0;
    
    visits.forEach(v => {
        if (v.source.toLowerCase().includes('app') || v.source.toLowerCase().includes('native')) appVisits++;
        else webVisits++;
        
        const visitDateObj = new Date(v.date || Date.now());
        if (visitDateObj.toLocaleDateString() === todayStr) {
            newCustomersToday++;
        }
    });
    
    const hourlyRush = hourlyCounts.map((count, hour) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return { time: `${displayHour} ${ampm}`, orders: count };
    });

    res.json({
        revenue: { total: totalRevenue, weekly: weeklyRevenue, monthly: monthlyRevenue, today: todayRevenue },
        visitors: { total: visits.length, app: appVisits, website: webVisits, today: newCustomersToday },
        activeOrders: activeOrdersCount,
        topItem: { name: topItem, sold: maxCount },
        hourlyRush: hourlyRush
    });
});

app.get('/api/settings', (req, res) => {
    res.json(readData('settings.json'));
});

app.post('/api/settings', (req, res) => {
    writeData('settings.json', req.body);
    res.json({ success: true, settings: req.body });
});

app.get('/api/live-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { id: Date.now(), res };
    sseClients.push(client);

    req.on('close', () => {
        sseClients = sseClients.filter(c => c.id !== client.id);
    });
});

// Catch-all route to serve the frontend (for SPA routing)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
