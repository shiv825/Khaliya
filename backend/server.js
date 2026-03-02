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

app.post('/api/menu', (req, res) => {
    const menu = readData('menu.json');
    const newItem = { id: Date.now().toString(), ...req.body };
    menu.push(newItem);
    writeData('menu.json', menu);
    res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
    const menu = readData('menu.json');
    const index = menu.findIndex(item => item.id == req.params.id || item.name === req.params.id);
    if (index !== -1) {
        menu[index] = { ...menu[index], ...req.body };
        writeData('menu.json', menu);
        res.json(menu[index]);
    } else {
        res.status(404).json({ message: 'Menu item not found' });
    }
});

app.delete('/api/menu/:id', (req, res) => {
    let menu = readData('menu.json');
    menu = menu.filter(item => item.id != req.params.id && item.name !== req.params.id);
    writeData('menu.json', menu);
    res.json({ message: 'Menu item deleted' });
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

app.delete('/api/bookings/:id', (req, res) => {
    let bookings = readData('bookings.json');
    bookings = bookings.filter(b => b.id != req.params.id);
    writeData('bookings.json', bookings);
    res.json({ message: 'Booking deleted' });
});

// API: Clear Bookings
app.delete('/api/bookings', (req, res) => {
    writeData('bookings.json', []);
    res.json({ message: 'All bookings cleared' });
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
