const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';

const brokenMap = {
    "chicken-65": "https://upload.wikimedia.org/wikipedia/commons/3/30/Chicken_65_%28Dish%29.jpg",
    "chili-paneer": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Chilli_Paneer.jpg",
    "dal-makhani": "https://upload.wikimedia.org/wikipedia/commons/6/69/Punjabi_style_Dal_Makhani.jpg",
    "fish-amritsari": "https://upload.wikimedia.org/wikipedia/commons/c/cd/Fried_fish_pieces.jpg",
    "goan-fish": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Goan_Fish_Curry.jpg",
    "gulab-jamun": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Bowl_of_Gulab_Jamuns.jpg",
    "hara-bhara": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Hara_Bhara_Kabab.jpg",
    "kadai-chicken": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Karahi_Chicken.jpg",
    "malai-kofta": "https://upload.wikimedia.org/wikipedia/commons/2/23/Malai_Kofta_-_A_North_Indian_Dish.jpg",
    "mango-lassi": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Mango_Lassi.jpg"
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    console.log("Downloading the 10 missing RAW images directly...");
    for (const [name, url] of Object.entries(brokenMap)) {
        const outPath = path.join(publicImgPath, `${name}.jpg`);
        // Remove the existing broken 2KB HTML files
        if (fs.existsSync(outPath) && fs.statSync(outPath).size < 5000) {
            fs.unlinkSync(outPath);
        }

        console.log(`Curling ${name} RAW...`);
        try {
            execSync(`curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36" -sSL "${url}" -o "${outPath}"`);
            await delay(1500); // polite delay
        } catch (e) {
            console.error(`Curl failed for ${name} RAW`, e);
        }
    }

    console.log("CURL sequence RAW complete!");
}

run();
