const fs = require('fs');
const path = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
const menu = JSON.parse(fs.readFileSync(path, 'utf8'));

const images = {
    "Samosa (4 pcs)": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Samosa-and-Chatni.jpg/960px-Samosa-and-Chatni.jpg",
    "Paneer Tikka": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
    "Tandoori Chicken (Half)": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
    "Hara Bhara Kabab (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Hara_Bhara_Kabab.jpg/960px-Hara_Bhara_Kabab.jpg",
    "Fish Amritsari": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
    "Chili Paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
    "Chicken 65": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Chicken_65_%28Dish%29.jpg/960px-Chicken_65_%28Dish%29.jpg",
    "Chicken Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg",
    "Butter Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
    "Chicken Tikka Masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
    "Paneer Butter Masala": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Paneer_Makhani_Veggie.jpeg",
    "Dal Makhani": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/960px-Punjabi_style_Dal_Makhani.jpg",
    "Lamb Rogan Josh": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
    "Malai Kofta": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Paneer_Makhani_Veggie.jpeg",
    "Palak Paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Palakpaneer_Rayagada_Odisha_0009.jpg/960px-Palakpaneer_Rayagada_Odisha_0009.jpg",
    "Kadai Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
    "Goan Fish Curry": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
    "Chana Masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chana_masala.jpg/960px-Chana_masala.jpg",
    "Garlic Naan": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Annapurna_Naan.jpg/960px-Annapurna_Naan.jpg",
    "Gulab Jamun": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bowl_of_Gulab_Jamuns.jpg/960px-Bowl_of_Gulab_Jamuns.jpg",
    "Mango Lassi": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mango_Lassi.jpg/960px-Mango_Lassi.jpg"
};

for (let item of menu) {
    if (images[item.name.en]) {
        item.image = images[item.name.en];
    }
}

fs.writeFileSync(path, JSON.stringify(menu, null, 4));
console.log("Updated menu.json");

const frontendPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\Menu.jsx';
let jsx = fs.readFileSync(frontendPath, 'utf8');

// I will just let the script update the fallback function's URLs through generic literal replacement... But actually it's safer to just let the script replace it in frontend too.
// I will just run a simple regex replace loop on the Menu.jsx text for each image.
for (const [name, url] of Object.entries(images)) {
    // Find the object block where name.en === name and replace its image string
    const blockRegex = new RegExp(`name:\\s*{\\s*en:\\s*["']${name}["'][^}]*},[\\s\\S]*?image:\\s*["'][^"']+["']`, 'gi');
    jsx = jsx.replace(blockRegex, (match) => {
        return match.replace(/image:\s*["'][^"']+["']/, `image: "${url}"`);
    });
}
fs.writeFileSync(frontendPath, jsx);
console.log("Updated Menu.jsx");
