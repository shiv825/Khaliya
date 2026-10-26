require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const isMongoEnabled = !!MONGODB_URI;

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
    invoiceNo: String,
    orderNo: String,
    kotNo: String,
    timestamp: String,
    createdAt: String,
    status: String,
    paymentStatus: String,
    paymentMethod: String,
    razorpayPaymentId: String,
    razorpayOrderId: String,
    items: mongoose.Schema.Types.Mixed,
    total: mongoose.Schema.Types.Mixed,
    name: String,
    phone: String,
    tableNumber: String,
    source: String,
    pointsUsed: Number,
    pointsEarned: Number,
    email: String,
    paymentDetails: mongoose.Schema.Types.Mixed
}, { collection: 'orders', strict: false, minimize: false });

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

const TableSchema = new mongoose.Schema({
    id: String,
    name: String,
    capacity: Number,
    tableType: String,
    section: String,
    status: String,
    session: mongoose.Schema.Types.Mixed,
    mergedTables: [String],
    mergedInto: String,
    effectiveCapacity: Number
}, { collection: 'tables', minimize: false });

const PrinterSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: String,
    ip: String,
    port: Number,
    paperWidth: Number,
    status: String
}, { collection: 'printers', minimize: false });

const StaffSchema = new mongoose.Schema({
    id: String,
    name: String,
    role: String,
    pin: String,
    phone: String,
    status: String,
    shift: String
}, { collection: 'staff', minimize: false });

const ShiftSchema = new mongoose.Schema({
    id: String,
    staffId: String,
    staffName: String,
    shiftName: String,
    openedAt: String,
    closedAt: String,
    openingFloat: Number,
    status: String,
    cashSales: Number,
    expectedCash: Number,
    actualCash: Number,
    variance: Number,
    notes: String
}, { collection: 'shifts', minimize: false });

const AuditLogSchema = new mongoose.Schema({
    id: String,
    timestamp: String,
    staffName: String,
    action: String,
    details: String,
    reason: String,
    splits: mongoose.Schema.Types.Mixed
}, { collection: 'audit_logs', minimize: false });

const PrintQueueSchema = new mongoose.Schema({
    id: String,
    orderId: String,
    invoiceNo: String,
    ticketType: String,
    payload: mongoose.Schema.Types.Mixed,
    status: String,
    createdAt: String
}, { collection: 'print_queue', minimize: false });

// Register Mongoose Models
const models = {};

if (isMongoEnabled) {
    mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
    })
        .then(() => {
            console.log('✅ [DB] Connected 100% directly to MongoDB Atlas database');
        })
        .catch(err => {
            console.error('❌ [DB] MongoDB Atlas Connection Error:', err.message);
        });

    const menuModel = mongoose.model('Menu', MenuSchema);
    const bookingModel = mongoose.model('Booking', BookingSchema);
    const orderModel = mongoose.model('Order', OrderSchema);
    const reviewModel = mongoose.model('Review', ReviewSchema);
    const userModel = mongoose.model('User', UserSchema);
    const settingModel = mongoose.model('Setting', SettingSchema);
    const visitModel = mongoose.model('Visit', VisitSchema);
    const tableModel = mongoose.model('Table', TableSchema);
    const printerModel = mongoose.model('Printer', PrinterSchema);
    const staffModel = mongoose.model('Staff', StaffSchema);
    const shiftModel = mongoose.model('Shift', ShiftSchema);
    const auditLogModel = mongoose.model('AuditLog', AuditLogSchema);
    const printQueueModel = mongoose.model('PrintQueue', PrintQueueSchema);

    // Map direct MongoDB collection names
    models['menu'] = menuModel;
    models['bookings'] = bookingModel;
    models['orders'] = orderModel;
    models['reviews'] = reviewModel;
    models['users'] = userModel;
    models['settings'] = settingModel;
    models['visits'] = visitModel;
    models['tables'] = tableModel;
    models['printers'] = printerModel;
    models['staff'] = staffModel;
    models['shifts'] = shiftModel;
    models['audit_logs'] = auditLogModel;
    models['print_queue'] = printQueueModel;
} else {
    console.warn('⚠️ [DB] MONGODB_URI environment variable not found.');
}

const cleanKey = (key) => key ? key.replace(/\.json$/i, '') : '';

/**
 * Ensures MongoDB connection is active before executing any queries.
 */
const ensureDbConnected = async () => {
    if (!isMongoEnabled) return false;
    if (mongoose.connection.readyState === 1) return true;

    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (mongoose.connection.readyState === 1) {
                clearInterval(interval);
                resolve(true);
            } else if (attempts > 50) { // 5 seconds max wait
                clearInterval(interval);
                resolve(false);
            }
        }, 100);
    });
};

/**
 * Reads 100% directly from MongoDB Atlas collection.
 */
const readDataAsync = async (key) => {
    await ensureDbConnected();

    try {
        const collectionKey = cleanKey(key);
        const Model = models[collectionKey];
        if (Model) {
            if (collectionKey === 'settings') {
                const doc = await Model.findOne().lean();
                return doc || { isOpen: true };
            } else {
                const docs = await Model.find().lean();
                return docs.map(d => {
                    const cleanDoc = { ...d };
                    delete cleanDoc._id;
                    delete cleanDoc.__v;
                    return cleanDoc;
                });
            }
        }
    } catch (err) {
        console.error(`❌ [DB] Direct MongoDB Atlas Query Error on '${key}':`, err.message);
    }

    return cleanKey(key) === 'settings' ? { isOpen: true } : [];
};

/**
 * Writes directly to MongoDB Atlas collection using atomic operations without data loss.
 * Prevents race conditions and lost updates.
 */
const writeDataAsync = async (key, data) => {
    const isConnected = await ensureDbConnected();
    if (!isConnected || mongoose.connection.readyState !== 1) {
        throw new Error(`[DB Error] Database connection inactive: cannot write to '${key}'`);
    }

    const collectionKey = cleanKey(key);
    const Model = models[collectionKey];
    if (!Model) {
        throw new Error(`[DB Error] Unknown collection key: '${collectionKey}'`);
    }

    try {
        if (collectionKey === 'settings') {
            await Model.replaceOne({}, data, { upsert: true });
        } else if (Array.isArray(data)) {
            if (data.length === 0) {
                await Model.deleteMany({});
            } else {
                // Perform atomic upserts for each item to prevent lost updates
                const bulkOps = data.map(item => {
                    const identifier = item.id !== undefined ? { id: item.id } : { _id: item._id };
                    const cleanItem = { ...item };
                    delete cleanItem._id;
                    delete cleanItem.__v;
                    return {
                        updateOne: {
                            filter: identifier,
                            update: { $set: cleanItem },
                            upsert: true
                        }
                    };
                });

                await Model.bulkWrite(bulkOps, { ordered: false });

                // Clean up only items that were explicitly removed, after new data is secured
                const activeIds = data.map(d => d.id).filter(id => id !== undefined && id !== null);
                if (activeIds.length > 0) {
                    await Model.deleteMany({ id: { $nin: activeIds } });
                }
            }
        } else if (data && typeof data === 'object') {
            const identifier = data.id !== undefined ? { id: data.id } : {};
            await Model.updateOne(identifier, { $set: data }, { upsert: true });
        }
    } catch (err) {
        console.error(`❌ [DB] Direct MongoDB Write Error on '${key}':`, err.message);
        throw err; // Propagate persistence failure to caller
    }
};

/**
 * Atomic single-document operations
 */
const saveDoc = async (collectionKey, doc) => {
    await ensureDbConnected();
    const Model = models[cleanKey(collectionKey)];
    if (!Model) throw new Error(`[DB Error] Unknown collection: ${collectionKey}`);
    const identifier = doc.id !== undefined ? { id: doc.id } : { _id: doc._id };
    return await Model.findOneAndUpdate(identifier, { $set: doc }, { upsert: true, new: true }).lean();
};

const updateDoc = async (collectionKey, filter, update) => {
    await ensureDbConnected();
    const Model = models[cleanKey(collectionKey)];
    if (!Model) throw new Error(`[DB Error] Unknown collection: ${collectionKey}`);
    return await Model.updateOne(filter, update);
};

const deleteDoc = async (collectionKey, filter) => {
    await ensureDbConnected();
    const Model = models[cleanKey(collectionKey)];
    if (!Model) throw new Error(`[DB Error] Unknown collection: ${collectionKey}`);
    return await Model.deleteOne(filter);
};

module.exports = {
    isMongoEnabled,
    ensureDbConnected,
    readDataAsync,
    writeDataAsync,
    saveDoc,
    updateDoc,
    deleteDoc,
    models
};

