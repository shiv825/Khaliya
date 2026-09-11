require('dotenv').config();
const { readDataAsync, writeDataAsync } = require('./db');

async function cleanupMenu() {
    console.log('🔄 Fetching menu items from MongoDB Atlas...');
    const rawMenu = await readDataAsync('menu');
    console.log(`📊 Initial menu count: ${rawMenu.length}`);

    const seenIds = new Set();
    const seenNames = new Set();
    const cleanMenu = [];

    // Process items in reverse (or order) to keep newest/updated items
    for (let i = rawMenu.length - 1; i >= 0; i--) {
        const item = rawMenu[i];
        if (!item) continue;

        // Ensure item has a valid id
        const rawId = item.id || item._id;
        const validId = rawId ? String(rawId) : `1780${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const nameEn = typeof item.name === 'object' ? item.name?.en : item.name;
        const normalizedName = nameEn ? String(nameEn).trim().toLowerCase() : '';

        // Check if duplicate by ID or Name
        if (validId && seenIds.has(validId)) {
            console.log(`🗑️ Removing duplicate by ID: ${validId} (${nameEn})`);
            continue;
        }
        if (normalizedName && seenNames.has(normalizedName)) {
            console.log(`🗑️ Removing duplicate by Name: ${nameEn}`);
            continue;
        }

        if (validId) seenIds.add(validId);
        if (normalizedName) seenNames.add(normalizedName);

        cleanMenu.unshift({
            ...item,
            id: validId
        });
    }

    console.log(`✨ Cleaned menu count: ${cleanMenu.length}`);
    await writeDataAsync('menu', cleanMenu);
    console.log('✅ MongoDB Atlas menu database successfully cleaned and deduplicated!');
    process.exit(0);
}

cleanupMenu().catch(err => {
    console.error('❌ Error during menu cleanup:', err);
    process.exit(1);
});
