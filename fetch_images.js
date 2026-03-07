const https = require('https');
const fs = require('fs');

const dishes = [
    "Samosa", "Paneer_tikka", "Tandoori_chicken", "Amritsari_fish",
    "Chicken_65", "Biryani", "Butter_chicken", "Chicken_tikka_masala",
    "Paneer_makhani", "Dal_makhani", "Rogan_josh", "Kofta", "Palak_paneer",
    "Chana_masala", "Naan", "Gulab_jamun", "Lassi"
];

async function getImageUrl(title) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=600`;
        const options = { headers: { 'User-Agent': 'KhaliyaMenu/1.0' } };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== "-1" && pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(null);
                    }
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function main() {
    const results = {};
    for (const dish of dishes) {
        let url = await getImageUrl(dish);
        results[dish] = url;
    }
    fs.writeFileSync('images_wiki.json', JSON.stringify(results, null, 2));
    console.log("Done");
}
main();
