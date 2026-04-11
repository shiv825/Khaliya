const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

app.post('/api/bookings', (req, res) => {
    const bookings = readData('bookings.json');
    const newBooking = { id: Date.now(), timestamp: new Date().toLocaleString(), status: 'pending', ...req.body };
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

// -- AUTH OTP LOGIC --
let pendingOtps = {}; // { phone: { code, expiry } }

app.post('/api/auth/request-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

    pendingOtps[phone] = { otp, expiry };

    console.log('\n' + '='.repeat(40));
    console.log(`🚀 [AUTH] OTP for +91-${phone} is: \x1b[32m${otp}\x1b[0m`);
    console.log('='.repeat(40) + '\n');

    res.json({ message: 'OTP sent successfully (Simulated)' });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, code } = req.body;
    const record = pendingOtps[phone];

    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this number' });
    }

    if (Date.now() > record.expiry) {
        delete pendingOtps[phone];
        return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (record.otp === code) {
        delete pendingOtps[phone];
        return res.json({ 
            success: true, 
            user: { name: 'Shiv Kumar', email: 'shiv@khaliya.luxury', phone } 
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP code' });
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

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
