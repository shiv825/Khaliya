const fs = require('fs');

const pathJSON = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
const pathJSX = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\Menu.jsx';

const manualImages = {
    // Give them perfectly correct wikimedia URLs so it matches 100%
    "Fish Amritsari": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fried_fish_pieces.jpg/960px-Fried_fish_pieces.jpg",
    "Chili Paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Chilli_Paneer.jpg/960px-Chilli_Paneer.jpg",
    "Malai Kofta": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Malai_Kofta_-_A_North_Indian_Dish.jpg/960px-Malai_Kofta_-_A_North_Indian_Dish.jpg",
    "Kadai Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Karahi_Chicken.jpg/960px-Karahi_Chicken.jpg",
    "Goan Fish Curry": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Goan_Fish_Curry.jpg/960px-Goan_Fish_Curry.jpg"
};

// 1. Update backend menu.json
let menu = JSON.parse(fs.readFileSync(pathJSON, 'utf8'));
for (let item of menu) {
    if (manualImages[item.name.en]) {
        item.image = manualImages[item.name.en];
    }
}
fs.writeFileSync(pathJSON, JSON.stringify(menu, null, 4));

// 2. Update frontend Menu.jsx
let jsxStr = 'const getFallbackMenu = () => ' + JSON.stringify(menu, null, 8) + ';';
let jsx = fs.readFileSync(pathJSX, 'utf8');
jsx = jsx.replace(/const getFallbackMenu = \(\) => \[[\s\S]*?\];/, jsxStr);
fs.writeFileSync(pathJSX, jsx);

// 3. Force absolute behavior to override standard CSS and minified sticky issues
const stylePath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\assets\\style.css';
let styleCss = fs.readFileSync(stylePath, 'utf8');
styleCss = styleCss.replace(/nav\s*{\s*([^}]+)}/g, (match, inner) => {
    let replaced = inner.replace(/position:\s*fixed;?/g, '').replace(/position:\s*absolute;?/g, '').replace(/position:\s*sticky;?/g, '');
    return 'nav {' + replaced + 'position: absolute !important;}';
});
// Add a rule to literally hide the nav-scrolled so it doesn't float over the page AT ALL
if (!styleCss.includes('.nav-scrolled { display: none !important; }')) {
    styleCss += '\n\n/* Force nav to hide on scroll so it only stays at top */\n.nav-scrolled { display: none !important; }\n';
}
fs.writeFileSync(stylePath, styleCss);

const styleMinPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\assets\\style.min.css';
if (fs.existsSync(styleMinPath)) {
    let minCss = fs.readFileSync(styleMinPath, 'utf8');
    minCss = minCss.replace(/position:fixed/g, 'position:absolute !important');
    minCss = minCss.replace(/position:sticky/g, 'position:absolute !important');
    minCss += ' .nav-scrolled{display:none !important;opacity:0 !important;visibility:hidden !important;pointer-events:none !important;}';
    fs.writeFileSync(styleMinPath, minCss);
}

console.log("Images and navbar css updated!");
