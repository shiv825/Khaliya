const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\SHIV KUMAR\\.gemini\\antigravity\\brain\\9aafe332-1b66-4f42-aa58-f12e316a3d91';
const publicDir = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\public\\menu-images';
const syncDir = 'c:\\Users\\SHIV KUMAR\\khaliya reactjs,node js\\frontend\\public\\menu-images';

const fileMap = {
    "chicken-65.jpg": "chicken_65_1772876051589.png",
    "chili-paneer.jpg": "chili_paneer_1772876074941.png",
    "fish-amritsari.jpg": "fish_amritsari_1772876093262.png",
    "goan-fish.jpg": "goan_fish_1772876118436.png",
    "hara-bhara.jpg": "hara_bhara_1772876137314.png",
    "kadai-chicken.jpg": "kadai_chicken_1772876154425.png",
    "malai-kofta.jpg": "malai_kofta_1772876169320.png",
    "mango-lassi.jpg": "mango_lassi_1772876188323.png"
};

for (const [target, source] of Object.entries(fileMap)) {
    const srcPath = path.join(brainPath, source);

    // Desktop folder
    const destPath1 = path.join(publicDir, target);
    if (fs.existsSync(destPath1)) fs.unlinkSync(destPath1);
    fs.copyFileSync(srcPath, destPath1);

    // Sync folder
    const destPath2 = path.join(syncDir, target);
    if (fs.existsSync(destPath2)) fs.unlinkSync(destPath2);
    fs.copyFileSync(srcPath, destPath2);

    console.log(`Successfully mapped and replaced ${target} with AI authentic photo!`);
}
console.log("ALL DONE!");
