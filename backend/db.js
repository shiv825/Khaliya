const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const isMongoEnabled = !!MONGODB_URI;

// Helper to resolve file paths
const getFilePath = (fileName) => path.join(__dirname, fileName);

// Mongoose Schemas & Models
const MenuSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.Mixed,
    category: String,
    name: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.Mixed,
    price: String,
    tags: [String],
    image: String
}, { collection: 'menu', minimize: false });

const BookingSchema = new mongoose.Schema({
    id: Number,
    timestamp: String,
    status: String,
    source: String,
    specialRequests: String,
    date: String,
    time: String,
    name: String,
    email: String,
    phone: String,
    guests: Number,
    tableType: String
}, { collection: 'bookings', minimize: false });

const OrderSchema = new mongoose.Schema({
    id: String,
    timestamp: String,
    status: String,
    items: mongoose.Schema.Types.Mixed,
    total: mongoose.Schema.Types.Mixed,
    name: String,
    phone: String,
    tableNumber: String,
    source: String,
    pointsUsed: Number,
    pointsEarned: Number,
    email: String
}, { collection: 'orders', minimize: false });

const ReviewSchema = new mongoose.Schema({
    id: Number,
    date: String,
    name: String,
    rating: Number,
    comment: String
}, { collection: 'reviews', minimize: false });

const UserSchema = new mongoose.Schema({
    id: String,
    email: String,
    name: String,
    joinedAt: String,
    spicePoints: Number,
    role: String,
    currentSessionId: String
}, { collection: 'users', minimize: false });

const SettingSchema = new mongoose.Schema({
    isOpen: { type: Boolean, default: true }
}, { collection: 'settings', strict: false, minimize: false });

const VisitSchema = new mongoose.Schema({
    id: Number,
    date: String,
    source: String
}, { collection: 'visits', minimize: false });

// Exportable models object
const models = {};

if (isMongoEnabled) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('✅ [DB] Connected to MongoDB Atlas successfully');
            seedDatabase();
        })
        .catch(err => {
            console.error('❌ [DB] MongoDB Connection Error:', err.message);
        });

    models['menu.json'] = mongoose.model('Menu', MenuSchema);
    models['bookings.json'] = mongoose.model('Booking', BookingSchema);
    models['orders.json'] = mongoose.model('Order', OrderSchema);
    models['reviews.json'] = mongoose.model('Review', ReviewSchema);
    models['users.json'] = mongoose.model('User', UserSchema);
    models['settings.json'] = mongoose.model('Setting', SettingSchema);
    models['visits.json'] = mongoose.model('Visit', VisitSchema);
} else {
    console.log('ℹ️ [DB] MONGODB_URI environment variable not found. Running in Local JSON File mode.');
}

/**
 * Automatically seeds the MongoDB database with local JSON file contents if the database collections are empty.
 */
async function seedDatabase() {
    try {
        console.log('🔄 [DB] Checking if MongoDB needs seeding...');
        
        // Clean up known dummy testing records from MongoDB
        const deletedOrders = await models['orders.json'].deleteMany({ id: { $in: ['ORD-1780129270435', 'ORD-17'] } });
        if (deletedOrders.deletedCount > 0) {
            console.log(`🧹 [DB] Cleaned up ${deletedOrders.deletedCount} dummy orders from MongoDB`);
        }
        const deletedBookings = await models['bookings.json'].deleteMany({ id: 1779958785272 });
        if (deletedBookings.deletedCount > 0) {
            console.log(`🧹 [DB] Cleaned up ${deletedBookings.deletedCount} dummy bookings from MongoDB`);
        }

        for (const [fileName, Model] of Object.entries(models)) {
            if (fileName === 'settings.json') {
                const count = await Model.countDocuments();
                if (count === 0) {
                    const filePath = getFilePath(fileName);
                    if (fs.existsSync(filePath)) {
                        const localData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        await Model.create(localData);
                        console.log(`🌱 [DB] Seeded settings from local settings.json`);
                    }
                }
            } else {
                const count = await Model.countDocuments();
                if (count === 0) {
                    const filePath = getFilePath(fileName);
                    if (fs.existsSync(filePath)) {
                        const localData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        if (Array.isArray(localData) && localData.length > 0) {
                            await Model.insertMany(localData);
                            console.log(`🌱 [DB] Seeded ${localData.length} records into '${Model.modelName}' from local ${fileName}`);
                        }
                    }
                }
            }
        }
        console.log('✅ [DB] Database seeding check complete.');
    } catch (err) {
        console.error('❌ [DB] Error seeding database:', err.message);
    }
}

/**
 * Asynchronously reads data. Returns an array (or object for settings) from MongoDB if enabled,
 * otherwise falls back to reading from local JSON files on disk.
 */
const readDataAsync = async (fileName) => {
    if (isMongoEnabled) {
        try {
            const Model = models[fileName];
            if (Model) {
                if (fileName === 'settings.json') {
                    const doc = await Model.findOne().lean();
                    return doc || { isOpen: true };
                } else {
                    const docs = await Model.find().lean();
                    // Clean up Mongoose fields to match exact JSON interface
                    return docs.map(d => {
                        const cleanDoc = { ...d };
                        delete cleanDoc._id;
                        delete cleanDoc.__v;
                        return cleanDoc;
                    });
                }
            }
        } catch (err) {
            console.error(`❌ [DB] Error reading ${fileName} from MongoDB (falling back to disk):`, err.message);
        }
    }

    // Local JSON file mode fallback
    const filePath = getFilePath(fileName);
    if (!fs.existsSync(filePath)) {
        return fileName === 'settings.json' ? { isOpen: true } : [];
    }
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ [DB] Error reading ${fileName} from filesystem:`, err.message);
        return fileName === 'settings.json' ? { isOpen: true } : [];
    }
};

/**
 * Asynchronously writes data. Writes to local JSON files as a backup/sync, and synchronizes to MongoDB if enabled.
 */
const writeDataAsync = async (fileName, data) => {
    // 1. Always write to local file as backup and to support local file-watchers
    const filePath = getFilePath(fileName);
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error(`❌ [DB] Failed to save local file backup of ${fileName}:`, err.message);
    }

    // 2. Synchronize to MongoDB if enabled (runs in background so it doesn't block the API response)
    if (isMongoEnabled) {
        (async () => {
            try {
                const Model = models[fileName];
                if (Model) {
                    if (fileName === 'settings.json') {
                        await Model.replaceOne({}, data, { upsert: true });
                    } else {
                        if (Array.isArray(data)) {
                            await Model.deleteMany({});
                            if (data.length > 0) {
                                await Model.insertMany(data);
                            }
                        } else {
                            console.warn(`⚠️ [DB] Data for ${fileName} is not an array, skipping MongoDB sync.`);
                        }
                    }
                }
            } catch (err) {
                console.error(`❌ [DB] Error writing ${fileName} to MongoDB in background:`, err.message);
            }
        })();
    }
};

module.exports = {
    isMongoEnabled,
    readDataAsync,
    writeDataAsync
};
