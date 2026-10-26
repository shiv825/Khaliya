/**
 * Khaliya Restaurant - Database Seeder
 * 
 * Usage:
 *   node seed.js [mongodb_uri]
 * Or from project root:
 *   node database/seed-data/seed.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined. Please set it in backend/.env or pass it as an argument.');
    process.exit(1);
}

const schemas = {
    menu: new mongoose.Schema({}, { strict: false, collection: 'menu' }),
    tables: new mongoose.Schema({}, { strict: false, collection: 'tables' }),
    settings: new mongoose.Schema({}, { strict: false, collection: 'settings' }),
    reviews: new mongoose.Schema({}, { strict: false, collection: 'reviews' }),
    users: new mongoose.Schema({}, { strict: false, collection: 'users' })
};

async function seed() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const files = ['menu', 'tables', 'settings', 'reviews', 'users'];

    for (const name of files) {
        const filePath = path.join(__dirname, `${name}.json`);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${filePath}`);
            continue;
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        const Model = mongoose.model(name, schemas[name]);

        console.log(`🧹 Clearing existing ${name}...`);
        await Model.deleteMany({});

        if (Array.isArray(data) && data.length > 0) {
            console.log(`📥 Inserting ${data.length} records into ${name}...`);
            await Model.insertMany(data);
        } else if (!Array.isArray(data) && data && Object.keys(data).length > 0) {
            console.log(`📥 Inserting record into ${name}...`);
            await Model.create(data);
        }
        console.log(`✅ ${name} seeded successfully.`);
    }

    console.log('🎉 Database seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
