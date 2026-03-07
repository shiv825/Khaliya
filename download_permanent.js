const fs = require('fs');
const https = require('https');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';
if (!fs.existsSync(publicImgPath)) {
    fs.mkdirSync(publicImgPath, { recursive: true });
}

const menuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
const menuJsxPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\Menu.jsx';
const nativeMenuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\native\\NativeMenu.jsx';

let menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

// Helper to download image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirect
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(`Failed to download ${url}: ${response.statusCode}`);
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err.message);
        });
    });
};

async function processImages() {
    console.log("Downloading images permanently to local assets...");
    for (let i = 0; i < menu.length; i++) {
        let item = menu[i];
        if (item.image && item.image.startsWith('http')) {
            // Clean name for filename
            const cleanName = item.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const fileName = `${cleanName}.jpg`;
            const filePath = path.join(publicImgPath, fileName);

            try {
                // Only download if it doesn't already exist or it points to unsplash (which means it's wrong)
                if (!fs.existsSync(filePath)) {
                    console.log(`Downloading ${item.name.en}...`);
                    await downloadImage(item.image, filePath);
                }
                // Update JSON to point to absolute local path!
                item.image = `/menu-images/${fileName}`;
            } catch (e) {
                console.error(`Failed on ${item.name.en}: ${e}`);
            }
        }
    }

    console.log("Saving new local-path backend JSON...");
    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4));

    const fallbackStr = 'const getFallbackMenu = () => ' + JSON.stringify(menu, null, 8) + ';';

    console.log("Syncing Menu.jsx...");
    let menuJsx = fs.readFileSync(menuJsxPath, 'utf8');
    menuJsx = menuJsx.replace(/const getFallbackMenu = \(\) => \[\s*[\s\S]*?\];/, fallbackStr);
    fs.writeFileSync(menuJsxPath, menuJsx);

    console.log("Syncing NativeMenu.jsx...");
    let nativeJsx = fs.readFileSync(nativeMenuPath, 'utf8');
    nativeJsx = nativeJsx.replace(/const getFallbackMenu = \(\) => \[\s*[\s\S]*?\];/, fallbackStr);
    fs.writeFileSync(nativeMenuPath, nativeJsx);

    console.log("SUCCESS! All images are now local.");
}

processImages();
