const https = require('https');
const fs = require('fs');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';

const authenticUrls = {
    "chicken-65": "https://upload.wikimedia.org/wikipedia/commons/3/30/Chicken_65_%28Dish%29.jpg",
    "chili-paneer": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Chilli_Paneer.jpg",
    "dal-makhani": "https://upload.wikimedia.org/wikipedia/commons/6/69/Punjabi_style_Dal_Makhani.jpg",
    "fish-amritsari": "https://upload.wikimedia.org/wikipedia/commons/c/cd/Fried_fish_pieces.jpg",
    "goan-fish": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Goan_Fish_Curry.jpg",
    "hara-bhara": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Hara_Bhara_Kabab.jpg",
    "kadai-chicken": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Karahi_Chicken.jpg",
    "malai-kofta": "https://upload.wikimedia.org/wikipedia/commons/2/23/Malai_Kofta_-_A_North_Indian_Dish.jpg",
    "mango-lassi": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Mango_Lassi.jpg"
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                let loc = response.headers.location;
                if (!loc.startsWith('http')) loc = 'https://upload.wikimedia.org' + loc;
                downloadImage(loc, filepath).then(resolve).catch(reject);
            } else {
                reject(`Status Code: ${response.statusCode}`);
            }
        }).on('error', err => { fs.unlink(filepath, () => { }); reject(err.message); });
    });
};

async function processImages() {
    console.log("Downloading Authentic Indian Dish Photos...");
    for (const [name, url] of Object.entries(authenticUrls)) {
        const outPath = path.join(publicImgPath, `${name}.jpg`);
        try {
            if (fs.existsSync(outPath)) {
                fs.unlinkSync(outPath); // delete the generic unsplash photo
            }
            console.log(`Fetching authentic ${name}...`);
            await downloadImage(url, outPath);
            console.log(`Success! Saved ${name}.jpg`);
            // Add a small delay
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`Failed on ${name}: ${e}`);
        }
    }
}

processImages();
