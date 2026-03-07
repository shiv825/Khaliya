const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';
if (!fs.existsSync(publicImgPath)) {
    fs.mkdirSync(publicImgPath, { recursive: true });
}

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

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    console.log("Starting secure cURL downloads...");
    for (const [name, url] of Object.entries(wikiMap)) {
        const outPath = path.join(publicImgPath, `${name}.jpg`);
        if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 1000) {
            console.log(`Curling ${name}...`);
            try {
                // Must act like a normal browser or wget, sometimes -A is enough
                execSync(`curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36" -sSL "${url}" -o "${outPath}"`);
                await delay(2000); // 2 full seconds
            } catch (e) {
                console.error(`Curl failed for ${name}`, e);
            }
        } else {
            console.log(`Skipping ${name}, exists and is valid.`);
        }
    }

    // Now update menu.json
    let menuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
    let menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

    for (let i = 0; i < menu.length; i++) {
        let item = menu[i];
        let urlTarget = "";
        for (let k in wikiMap) {
            if (item.name.en.toLowerCase().includes(k.replace('-', ' '))) { urlTarget = k; break; }
        }
        if (!urlTarget && item.name.en.includes("Samosa")) urlTarget = "samosa";
        if (!urlTarget && item.name.en.includes("Hara Bhara")) urlTarget = "hara-bhara";
        if (!urlTarget && item.name.en.includes("Tikka Masala")) urlTarget = "tikka-masala";
        if (!urlTarget && item.name.en.includes("Paneer Butter")) urlTarget = "paneer-butter";
        if (!urlTarget && item.name.en.includes("Lamb Rogan")) urlTarget = "lamb-rogan";

        if (urlTarget) {
            item.image = `/menu-images/${urlTarget}.jpg`;
        } else {
            item.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop";
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

    console.log("CURL sequence complete and local paths saved!");
}

run();
