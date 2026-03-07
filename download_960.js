const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicImgPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';
if (!fs.existsSync(publicImgPath)) {
    fs.mkdirSync(publicImgPath, { recursive: true });
}

const wikiMap = {
    "samosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Samosa-and-Chatni.jpg/960px-Samosa-and-Chatni.jpg",
    "paneer-tikka": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
    "tandoori-chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chickentandoori.jpg/960px-Chickentandoori.jpg",
    "hara-bhara": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Hara_Bhara_Kabab.jpg/960px-Hara_Bhara_Kabab.jpg",
    "fish-amritsari": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fried_fish_pieces.jpg/960px-Fried_fish_pieces.jpg",
    "chili-paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Chilli_Paneer.jpg/960px-Chilli_Paneer.jpg",
    "chicken-65": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Chicken_65_%28Dish%29.jpg/960px-Chicken_65_%28Dish%29.jpg",
    "chicken-biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg",
    "butter-chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
    "tikka-masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
    "paneer-butter": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Paneer_Makhani_Veggie.jpeg/960px-Paneer_Makhani_Veggie.jpeg",
    "dal-makhani": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/960px-Punjabi_style_Dal_Makhani.jpg",
    "lamb-rogan": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
    "malai-kofta": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Malai_Kofta_-_A_North_Indian_Dish.jpg/960px-Malai_Kofta_-_A_North_Indian_Dish.jpg",
    "palak-paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Palakpaneer_Rayagada_Odisha_0009.jpg/960px-Palakpaneer_Rayagada_Odisha_0009.jpg",
    "kadai-chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Karahi_Chicken.jpg/960px-Karahi_Chicken.jpg",
    "goan-fish": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Goan_Fish_Curry.jpg/960px-Goan_Fish_Curry.jpg",
    "chana-masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chana_masala.jpg/960px-Chana_masala.jpg",
    "garlic-naan": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Annapurna_Naan.jpg/960px-Annapurna_Naan.jpg",
    "gulab-jamun": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bowl_of_Gulab_Jamuns.jpg/960px-Bowl_of_Gulab_Jamuns.jpg",
    "mango-lassi": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mango_Lassi.jpg/960px-Mango_Lassi.jpg",
    "paneer-butter": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Paneer_Makhani_Veggie.jpeg"
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    console.log("Downloading 960px images...");
    for (const [name, url] of Object.entries(wikiMap)) {
        const outPath = path.join(publicImgPath, `${name}.jpg`);
        // Remove the existing broken 2KB HTML files
        if (fs.existsSync(outPath) && fs.statSync(outPath).size < 5000) {
            fs.unlinkSync(outPath);
        }

        if (!fs.existsSync(outPath)) {
            console.log(`Curling ${name}...`);
            try {
                execSync(`curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36" -sSL "${url}" -o "${outPath}"`);
                await delay(1500); // polite delay
            } catch (e) {
                console.error(`Curl failed for ${name}`, e);
            }
        } else {
            console.log(`Skipping ${name}, exists and is valid.`);
        }
    }

    console.log("CURL sequence complete!");
}

run();
