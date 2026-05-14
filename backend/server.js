const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
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
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ [AUTH] Nodemailer initialized successfully');
    } else {
        console.warn('⚠️ [AUTH] SMTP credentials missing. Email OTP will run in Simulated Mode (logs only).');
    }
} catch (err) {
    console.error('❌ [AUTH] Failed to initialize Nodemailer:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://shiv825.github.io', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(bodyParser.json());

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

const writeData = (fileName, data) => {
    const filePath = getFilePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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
let pendingOtps = {}; // { phone: { hashedOtp, expiry } }
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
            try {
                await emailTransporter.sendMail({
                    from: `"Khaliya Sanctuary" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: 'Your Khaliya Login Code',
                    text: `Your Khaliya Sanctuary verification code is: ${otp}. Valid for 5 minutes.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #D4AF37; text-align: center;">Khaliya Sanctuary</h2>
                            <p style="font-size: 16px; color: #333;">Your verification code is:</p>
                            <h1 style="font-size: 36px; color: #000; text-align: center; letter-spacing: 5px;">${otp}</h1>
                            <p style="font-size: 14px; color: #666; text-align: center;">This code is valid for 5 minutes.</p>
                        </div>
                    `
                });
                console.log(`✅ [AUTH] Email sent to ${email}`);
                return res.json({ message: 'Verification code sent successfully' });
            } catch (emailErr) {
                console.error('❌ [AUTH] Email Error:', emailErr.message);
                console.log(`⚠️ [AUTH] FALLBACK OTP (Email Failed): \x1b[32m${otp}\x1b[0m`);
                return res.json({ message: 'Code generated (Simulated due to service error)', simulated: true });
            }
        }

        // 5. Fallback for Local Testing (if no SMTP keys provided)
        console.log(`ℹ️ [AUTH] Simulated Mode is ON. Email OTP: \x1b[32m${otp}\x1b[0m`);
        res.json({ message: 'Verification code generated (Simulated)', simulated: true });

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
        res.json({ 
            success: true, 
            user: { name: 'Khaliya Member', email: email, isLoggedIn: true } 
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
});

app.post('/api/auth/request-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        // 1. Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

        // 2. Hash the OTP for secure storage
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // 3. Store the record
        pendingOtps[phone] = { hashedOtp, expiry };

        console.log('\n' + '='.repeat(40));
        console.log(`🚀 [AUTH] Secure OTP Generated for +91-${phone}`);
        console.log(`🔒 [AUTH] Hashed OTP: ${hashedOtp.substring(0, 15)}...`);
        console.log('='.repeat(40) + '\n');

        // 4. Send via Twilio (if configured)
        if (twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `Your Khaliya Sanctuary verification code is: ${otp}. Valid for 5 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${phone}`
                });
                console.log(`✅ [AUTH] SMS sent to +91${phone}`);
                return res.json({ message: 'Verification code sent successfully' });
            } catch (twilioErr) {
                console.error('❌ [AUTH] Twilio Error:', twilioErr.message);
                // Fallback to console if Twilio fails but we are in dev/not configured
                console.log(`⚠️ [AUTH] FALLBACK OTP (SMS Failed): \x1b[32m${otp}\x1b[0m`);
                return res.json({ message: 'Code generated (Simulated due to service error)', simulated: true });
            }
        }

        // 5. Fallback for Local Testing (if no Twilio keys provided)
        console.log(`ℹ️ [AUTH] Simulated Mode is ON. OTP: \x1b[32m${otp}\x1b[0m`);
        res.json({ message: 'Verification code generated (Simulated)', simulated: true });

    } catch (err) {
        console.error('❌ [AUTH] Server Error:', err);
        res.status(500).json({ message: 'Internal server error during OTP generation' });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, code } = req.body;
    const record = pendingOtps[phone];

    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this number' });
    }

    // Check Expiry (5 Mins)
    if (Date.now() > record.expiry) {
        delete pendingOtps[phone];
        return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    // Compare Hashed OTP
    const isMatch = await bcrypt.compare(code, record.hashedOtp);

    if (isMatch) {
        delete pendingOtps[phone];
        res.json({ 
            success: true, 
            user: { name: 'Shiv Kumar', email: 'shiv@khaliya.luxury', phone } 
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
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

// Catch-all route to serve the frontend (for SPA routing)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
