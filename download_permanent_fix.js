const fs = require('fs');
const https = require('https');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';
if (!fs.existsSync(publicImgPath)) {
    fs.mkdirSync(publicImgPath, { recursive: true });
}

let menuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
let menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

// Wait function
const delay = ms => new Promise(res => setTimeout(res, ms));

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        };
        https.get(url, options, (response) => {
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
    console.log("Downloading with 2 second delays...");

    // Store original URLs so we know what to download, but if it already starts with /menu-images/, we need its original Wiki URL.
    // Fortunately I have the raw URLs in my mind, but let's reset to wikipedia URLs if it's already modified.

    // Instead of using the JSON which now has "/menu-images/..." we will reconstruct the list of urls based on names.
    const wikiMap = {
        "samosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Samosa-and-Chatni.jpg/320px-Samosa-and-Chatni.jpg",
        "paneer-tikka": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/320px-Paneer_tikka.jpg",
        "tandoori-chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chickentandoori.jpg/320px-Chickentandoori.jpg",
        "hara-bhara": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Hara_Bhara_Kabab.jpg/320px-Hara_Bhara_Kabab.jpg",
        "fish-amritsari": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fried_fish_pieces.jpg/320px-Fried_fish_pieces.jpg",
        "chili-paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Chilli_Paneer.jpg/320px-Chilli_Paneer.jpg",
        "chicken-65": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Chicken_65_%28Dish%29.jpg/320px-Chicken_65_%28Dish%29.jpg",
        "chicken-biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/320px-%22Hyderabadi_Dum_Biryani%22.jpg",
        "butter-chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/320px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
        "tikka-masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/320px-Chicken_tikka_masala_%28cropped%29.jpg",
        "paneer-butter": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Paneer_Makhani_Veggie.jpeg/320px-Paneer_Makhani_Veggie.jpeg",
        "dal-makhani": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/320px-Punjabi_style_Dal_Makhani.jpg",
        "lamb-rogan": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/320px-Rogan_Josh_Kashmiri.jpg",
        "malai-kofta": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Malai_Kofta_-_A_North_Indian_Dish.jpg/320px-Malai_Kofta_-_A_North_Indian_Dish.jpg",
        "palak-paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Palakpaneer_Rayagada_Odisha_0009.jpg/320px-Palakpaneer_Rayagada_Odisha_0009.jpg",
        "kadai-chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Karahi_Chicken.jpg/320px-Karahi_Chicken.jpg",
        "goan-fish": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Goan_Fish_Curry.jpg/320px-Goan_Fish_Curry.jpg",
        "chana-masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chana_masala.jpg/320px-Chana_masala.jpg",
        "garlic-naan": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Annapurna_Naan.jpg/320px-Annapurna_Naan.jpg",
        "gulab-jamun": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bowl_of_Gulab_Jamuns.jpg/320px-Bowl_of_Gulab_Jamuns.jpg",
        "mango-lassi": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mango_Lassi.jpg/320px-Mango_Lassi.jpg"
    };

    for (let i = 0; i < menu.length; i++) {
        let item = menu[i];
        let nameKey = item.name.en.toLowerCase().replace(/ \(.+\)/, '').split(' ').slice(0, 2).join('-');
        if (nameKey === 'tandoori-chicken') nameKey = 'tandoori-chicken';

        // Find best match in map
        let urlTarget = "";
        for (let k in wikiMap) {
            if (item.name.en.toLowerCase().includes(k.replace('-', ' '))) {
                urlTarget = wikiMap[k];
                break;
            }
        }
        if (!urlTarget && item.name.en.includes("Samosa")) urlTarget = wikiMap["samosa"];
        if (!urlTarget && item.name.en.includes("Hara Bhara")) urlTarget = wikiMap["hara-bhara"];
        if (!urlTarget && item.name.en.includes("Tikka Masala")) urlTarget = wikiMap["tikka-masala"];
        if (!urlTarget && item.name.en.includes("Paneer Butter")) urlTarget = wikiMap["paneer-butter"];
        if (!urlTarget && item.name.en.includes("Lamb Rogan")) urlTarget = wikiMap["lamb-rogan"];

        if (urlTarget) {
            const cleanName = item.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const fileName = `${cleanName}.jpg`;
            const filePath = path.join(publicImgPath, fileName);

            try {
                if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1000) {
                    console.log(`Downloading ${item.name.en}...`);
                    await downloadImage(urlTarget, filePath);
                    await delay(1500); // 1.5 second delay to avoid 429
                } else {
                    console.log(`Already have ${item.name.en}`);
                }
                item.image = `/menu-images/${fileName}`;
            } catch (e) {
                console.error(`Failed on ${item.name.en}: ${e}`);
                // fallback to unsplash if wikipedia completely blocks us
                item.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop";
            }
        } else {
            console.log("No url target for", item.name.en);
        }
    }

    fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4));

    const fallbackStr = 'const getFallbackMenu = () => ' + JSON.stringify(menu, null, 8) + ';';

    const menuJsxPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\Menu.jsx';
    let menuJsx = fs.readFileSync(menuJsxPath, 'utf8');
    menuJsx = menuJsx.replace(/const getFallbackMenu = \(\) => \[\s*[\s\S]*?\];/, fallbackStr);
    fs.writeFileSync(menuJsxPath, menuJsx);

    const nativeMenuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\native\\NativeMenu.jsx';
    let nativeJsx = fs.readFileSync(nativeMenuPath, 'utf8');
    nativeJsx = nativeJsx.replace(/const getFallbackMenu = \(\) => \[\s*[\s\S]*?\];/, fallbackStr);
    fs.writeFileSync(nativeMenuPath, nativeJsx);

    console.log("Images downloaded and injected!");
}

process();
