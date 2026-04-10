const https = require('https');
const fs = require('fs');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';

const unsplashMap = {
    "chicken-65": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&fit=crop",
    "chili-paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=800&fit=crop",
    "dal-makhani": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&fit=crop",
    "fish-amritsari": "https://images.unsplash.com/photo-1604908177520-25e98fbd52af?w=800&fit=crop",
    "goan-fish": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&fit=crop",
    "hara-bhara": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&fit=crop",
    "kadai-chicken": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&fit=crop",
    "malai-kofta": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=800&fit=crop",
    "mango-lassi": "https://images.unsplash.com/photo-1549128247-37e905ebdb3f?w=800&fit=crop"
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(`Status Code: ${response.statusCode}`);
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err.message);
        });
    });
};

async function process() {
    console.log("Downloading Unsplash replacements for broken Wiki files...");
    for (const [name, url] of Object.entries(unsplashMap)) {
        const outPath = path.join(publicImgPath, `${name}.jpg`);
        // Force delete the busted 2KB files
        if (fs.existsSync(outPath) && fs.statSync(outPath).size < 5000) {
            fs.unlinkSync(outPath);
        }

        console.log(`Fetching ${name} from Unsplash...`);
        try {
            await downloadImage(url, outPath);
        } catch (e) {
            console.error(`Failed on ${name}: ${e}`);
        }
    }
    console.log("Unsplash fallback complete!");
}

process();
