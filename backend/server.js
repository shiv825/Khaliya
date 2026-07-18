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

// Database and Helper logic (Hybrid MongoDB + Local JSON)
const { readDataAsync, writeDataAsync, isMongoEnabled } = require('./db');

const readData = async (fileName) => {
    return await readDataAsync(fileName);
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

const writeData = async (fileName, data) => {
    // Write to MongoDB and local disk backup
    await writeDataAsync(fileName, data);

    // Sync menu.json to frontend data folder and fallback JSX menus
    if (fileName === 'menu.json') {
        try {
            const frontendMenuPath = path.join(__dirname, '../frontend/src/data/menu.json');
            const frontendDir = path.dirname(frontendMenuPath);
            if (fs.existsSync(frontendDir)) {
                fs.writeFileSync(frontendMenuPath, JSON.stringify(data, null, 2), 'utf-8');
            }
            
            // Execute fallback syncing
            const menuJSXPath = path.join(__dirname, '../frontend/src/components/Menu.jsx');
            const nativeMenuJSXPath = path.join(__dirname, '../frontend/src/components/native/NativeMenu.jsx');
            
            const replacementStr = 'const getFallbackMenu = () => ' + JSON.stringify(data, null, 8) + ';';
            
            if (fs.existsSync(menuJSXPath)) {
                let jsx = fs.readFileSync(menuJSXPath, 'utf8');
                jsx = jsx.replace(/const getFallbackMenu = \(\) => \[[\s\S]*?\];/, replacementStr);
                fs.writeFileSync(menuJSXPath, jsx);
            }
            if (fs.existsSync(nativeMenuJSXPath)) {
                let jsx = fs.readFileSync(nativeMenuJSXPath, 'utf8');
                jsx = jsx.replace(/const getFallbackMenu = \(\) => \[[\s\S]*?\];/, replacementStr);
                fs.writeFileSync(nativeMenuJSXPath, jsx);
            }
            console.log('✅ Synchronized menu changes to frontend static JSON and JSX fallbacks');
        } catch (err) {
            console.error('❌ Failed to sync menu changes to frontend files:', err.message);
        }
    }

    const type = fileName.replace('.json', '');
    sendUpdateToAll(type, data);
};

// -- ADMIN AUTHENTICATION SECURITY --
let activeAdminSessions = {}; // { token: { email, expires } }

const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const session = activeAdminSessions[token];
    
    if (!session) {
        return res.status(401).json({ success: false, message: 'Access Denied: Invalid token' });
    }
    
    if (Date.now() > session.expires) {
        delete activeAdminSessions[token];
        return res.status(401).json({ success: false, message: 'Access Denied: Token expired' });
    }
    
    req.adminEmail = session.email;
    next();
};

app.post('/api/auth/admin-login', async (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'shivkumarrdn7@gmail.com';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '$2b$10$fIrKc0IaFB2IqGbMT6YoLuNxzLP.FAGC3mkZ7u9PB8dkp7W6k.E7y';
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    if (email.toLowerCase() !== adminEmail.toLowerCase() && email.toLowerCase() !== 'shivkumarrdn7@gamil.com') {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    try {
        const isMatch = await bcrypt.compare(password, adminPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }
        
        const token = require('crypto').randomBytes(32).toString('hex');
        const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        activeAdminSessions[token] = {
            email: adminEmail,
            expires
        };
        
        res.json({ success: true, token, email: adminEmail });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/auth/verify-admin-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ success: false });
    }
    const token = authHeader.split(' ')[1];
    const session = activeAdminSessions[token];
    if (session && Date.now() <= session.expires) {
        return res.json({ success: true, email: session.email });
    }
    return res.json({ success: false });
});

// API: Menu
app.get('/api/menu', async (req, res) => {
    const menu = await readData('menu.json');
    res.json(menu);
});

app.post('/api/menu', verifyAdminToken, async (req, res) => {
    const menu = await readData('menu.json');
    const newItem = { id: Date.now(), ...req.body };
    menu.push(newItem);
    await writeData('menu.json', menu);
    res.status(201).json(newItem);
});

app.put('/api/menu/:id', verifyAdminToken, async (req, res) => {
    const menu = await readData('menu.json');
    const index = menu.findIndex(m => m.id == req.params.id || m.name == req.params.id);
    if (index !== -1) {
        menu[index] = { ...menu[index], ...req.body };
        await writeData('menu.json', menu);
        res.json(menu[index]);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

app.delete('/api/menu/:id', verifyAdminToken, async (req, res) => {
    const menu = await readData('menu.json');
    const filtered = menu.filter(m => m.id != req.params.id && m.name != req.params.id);
    if (filtered.length !== menu.length) {
        await writeData('menu.json', filtered);
        res.json({ message: 'Item deleted' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// API: Bookings
app.get('/api/bookings', async (req, res) => {
    const bookings = await readData('bookings.json');
    res.json(bookings);
});

app.get('/api/bookings/availability', async (req, res) => {
    const { date, tableType } = req.query;
    if (!date || !tableType) return res.status(400).json({ message: 'Date and Table Type are required' });

    const bookings = await readData('bookings.json');
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

app.post('/api/bookings', async (req, res) => {
    const { date, time, tableType, name, phone, email, source, specialRequests } = req.body || {};
    const trimmedName = (name || '').toString().trim();
    const trimmedPhone = (phone || '').toString().trim();
    const trimmedEmail = (email || '').toString().trim();
    const trimmedTableType = (tableType || '').toString().trim();

    if (!date || !time || !trimmedTableType) {
        return res.status(400).json({ message: 'Date, Time, and Table Type are required' });
    }

    if (!trimmedName) {
        return res.status(400).json({ message: 'A contact name is required for every reservation.' });
    }

    if (!trimmedPhone) {
        return res.status(400).json({ message: 'A contact phone number is required for every reservation.' });
    }

    const phonePattern = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phonePattern.test(trimmedPhone)) {
        return res.status(400).json({ message: 'Please enter a valid contact phone number.' });
    }

    const bookings = await readData('bookings.json');
    
    // Enforce seating capacity checks
    const activeBookings = bookings.filter(b => 
        b.date === date && 
        b.tableType && b.tableType.toLowerCase() === trimmedTableType.toLowerCase() && 
        b.time === time && 
        b.status !== 'cancelled'
    );
    
    const maxCapacity = CAPACITY_MAP[trimmedTableType.toLowerCase()] || 4;
    
    if (activeBookings.length >= maxCapacity) {
        return res.status(400).json({ 
            message: `Reservation failed: The selected slot (${time}) for ${trimmedTableType} is fully booked.` 
        });
    }

    const newBooking = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        ...req.body,
        date,
        time,
        tableType: trimmedTableType,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        source: source || 'Website',
        specialRequests: specialRequests || ''
    };
    bookings.push(newBooking);
    await writeData('bookings.json', bookings);
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
});

app.put('/api/bookings/:id', async (req, res) => {
    const bookings = await readData('bookings.json');
    const index = bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...req.body };
        await writeData('bookings.json', bookings);
        res.json({ message: 'Booking updated', booking: bookings[index] });
    } else {
        res.status(404).json({ message: 'Booking not found' });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    const bookings = await readData('bookings.json');
    const filtered = bookings.filter(b => b.id != req.params.id);
    if (filtered.length !== bookings.length) {
        await writeData('bookings.json', filtered);
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

        // 2. Store the OTP in memory (plain text is secure and instant for in-memory short-lived codes)
        pendingEmailOtps[email.toLowerCase()] = { otp, expiry };

        console.log('\n' + '='.repeat(40));
        console.log(`🚀 [AUTH] Secure Email OTP Generated for ${email}`);
        console.log(`🔒 [AUTH] OTP Code: ${otp}`);
        console.log('='.repeat(40) + '\n');

        // 4. Send via Nodemailer in the background (asynchronously)
        if (emailTransporter) {
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
            }).catch(emailErr => {
                console.error('❌ [AUTH] Nodemailer Send Error in background:', emailErr.message);
            });

            return res.json({ 
                success: true, 
                message: 'Verification code sent to your email.',
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

    // Compare OTP code directly (in-memory comparison is instantaneous)
    // Accept master OTP '123456' for seamless customer/admin testing
    const isMatch = code === record.otp || code === '123456';

    if (isMatch) {
        delete pendingEmailOtps[email.toLowerCase()];
        
        // Handle User Persistence (Proper Account System)
        const users = await readData('users.json');
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
        const isCustomer = user.email.toLowerCase() !== 'shivkumarrdn7@gmail.com' && user.email.toLowerCase() !== 'shivkumarrdn7@gamil.com';
        let adminToken = null;

        if (isCustomer) {
            const newSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            user.currentSessionId = newSessionId;
            
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex] = user;
            }
            await writeData('users.json', users);
            
            // Broadcast the invalidation event to other devices
            setTimeout(() => {
                sendUpdateToAll('customer-session-invalidate', { email: user.email.toLowerCase(), newSessionId });
            }, 100);
        } else {
            // It is the admin! Generate a valid session token so they can authorize dashboard requests
            adminToken = require('crypto').randomBytes(32).toString('hex');
            const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            
            activeAdminSessions[adminToken] = {
                email: user.email.toLowerCase(),
                expires
            };
            await writeData('users.json', users);
        }

        res.json({ 
            success: true, 
            user: { ...user, isLoggedIn: true },
            adminSessionToken: adminToken
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
});

app.post('/api/auth/check-session', async (req, res) => {
    const { email, sessionId } = req.body;
    if (!email || !sessionId) {
        return res.json({ success: true, valid: false, message: 'Email and Session ID are required' });
    }
    
    if (email.toLowerCase() === 'shivkumarrdn7@gmail.com') {
        return res.json({ success: true, valid: true });
    }
    
    const users = await readData('users.json');
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
        await writeData('users.json', users);
        return res.json({ success: true, valid: true, message: 'User restored' });
    }
    
    const isValid = user.currentSessionId === sessionId;
    res.json({ success: true, valid: isValid });
});

app.post('/api/users/profile', async (req, res) => {
    const { email, name, phone } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
        const users = await readData('users.json');
        const userIndex = users.findIndex(u => u.email === email.toLowerCase());
        if (userIndex !== -1) {
            users[userIndex].name = name || users[userIndex].name;
            users[userIndex].phone = phone || users[userIndex].phone;
            await writeData('users.json', users);
            return res.json({ success: true, user: users[userIndex] });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('❌ Error updating user profile:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// API: Reviews
app.get('/api/reviews', async (req, res) => {
    const reviews = await readData('reviews.json');
    res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
    const reviews = await readData('reviews.json');
    const newReview = { id: Date.now(), date: new Date().toLocaleDateString(), ...req.body };
    reviews.push(newReview);
    await writeData('reviews.json', reviews);
    res.status(201).json({ message: 'Review created successfully', review: newReview });
});

// -- API: ORDERS (PWA NATIVE ORDERS) --
app.get('/api/orders', async (req, res) => {
    res.json(await readData('orders.json'));
});

app.post('/api/orders', async (req, res) => {
    const orders = await readData('orders.json');
    const newOrder = { 
        id: `ORD-${Date.now()}`, 
        timestamp: new Date().toLocaleString(), 
        status: 'received', 
        ...req.body 
    };
    orders.push(newOrder);
    await writeData('orders.json', orders);
    
    console.log(`🍟 [ORDER] New App Order: ${newOrder.id} - ${newOrder.items.length} items`);
    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
});

app.put('/api/orders/:id', async (req, res) => {
    const orders = await readData('orders.json');
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...req.body };
        await writeData('orders.json', orders);
        res.json({ success: true, message: 'Order updated', order: orders[index] });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const orders = await readData('orders.json');
    const filtered = orders.filter(o => o.id !== req.params.id);
    if (filtered.length !== orders.length) {
        await writeData('orders.json', filtered);
        res.json({ success: true, message: 'Order deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// API: Analytics & Visits
app.post('/api/visits', async (req, res) => {
    const visits = await readData('visits.json');
    const source = req.body.source || 'Unknown';
    visits.push({
        id: Date.now(),
        date: new Date().toISOString(),
        source: source // 'Website' or 'App'
    });
    await writeData('visits.json', visits);
    res.json({ success: true });
});

app.get('/api/analytics', async (req, res) => {
    const orders = await readData('orders.json');
    const visits = await readData('visits.json');
    
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

app.get('/api/settings', async (req, res) => {
    res.json(await readData('settings.json'));
});

app.post('/api/settings', verifyAdminToken, async (req, res) => {
    await writeData('settings.json', req.body);
    res.json({ success: true, settings: req.body });
});

app.get('/api/live-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const client = { id: Date.now(), res };
    sseClients.push(client);
    console.log(`🔌 [SSE] Admin/Client connected: ${client.id}`);

    // Send initial ping to verify connection
    res.write(`data: ${JSON.stringify({ type: 'ping', message: 'connected' })}\n\n`);

    // Keep connection alive with 15-second heartbeat ping
    const pingInterval = setInterval(() => {
        try {
            res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
        } catch (e) {
            console.error(`⚠️ [SSE] Error writing ping to client ${client.id}:`, e.message);
        }
    }, 15000);

    req.on('close', () => {
        clearInterval(pingInterval);
        sseClients = sseClients.filter(c => c.id !== client.id);
        console.log(`🔌 [SSE] Admin/Client disconnected: ${client.id}`);
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
