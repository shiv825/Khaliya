const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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

// -- AUTH OTP LOGIC (PROFESSIONAL & SECURE) --
let pendingOtps = {}; // { phone: { hashedOtp, expiry } }

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

// Catch-all route to serve the frontend (for SPA routing)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
