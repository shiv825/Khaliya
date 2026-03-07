const https = require('https');
const fs = require('fs');

const fallbackUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop';
const paths = [
    'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images\\chili-paneer.jpg',
    'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images\\fish-amritsari.jpg'
];

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

async function fix() {
    for (const p of paths) {
        if (fs.existsSync(p)) fs.unlinkSync(p);
        await downloadImage(fallbackUrl, p);
        console.log("Fixed", p);
    }
}
fix();
