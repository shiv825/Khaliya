const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
}

console.log('Connecting to MongoDB...');

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
}).then(async () => {
    console.log('✅ Connected to MongoDB.');
    const db = mongoose.connection.db;
    const collection = db.collection('bookings');
    
    const query = { name: { $regex: /Test/i } };
    
    // Find before deleting to show what was found
    const testBookings = await collection.find(query).toArray();
    console.log(`Found ${testBookings.length} test bookings.`);
    
    if (testBookings.length > 0) {
        const result = await collection.deleteMany(query);
        console.log(`✅ Successfully deleted ${result.deletedCount} test bookings.`);
    } else {
        console.log('ℹ️ No test bookings found to delete.');
    }
    
    process.exit(0);
}).catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
});
