const fs = require('fs');
const path = require('path');

const menuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
const menuJsxPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\Menu.jsx';
const nativeMenuPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\native\\NativeMenu.jsx';

// 1. Optimize URLs in JSON
let menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

for (let item of menu) {
    let url = item.image;
    if (url && url.includes('wikimedia.org')) {
        // If it's already a thumb URL, just change the size
        if (url.includes('/thumb/')) {
            url = url.replace(/\/(\d+)px-/, '/320px-');
        } else {
            // It's a raw un-thumbnailed image, e.g. https://.../commons/e/e1/Chickentandoori.jpg
            // Convert to thumb
            const parts = url.split('/commons/');
            if (parts.length === 2) {
                const filename = url.split('/').pop();
                url = `${parts[0]}/commons/thumb/${parts[1]}/320px-${filename}`;
            }
        }
        item.image = url;
    }
}

fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4));

// 2. Generate Fallback JS array
const fallbackStr = 'const getFallbackMenu = () => ' + JSON.stringify(menu, null, 8) + ';';

// 3. Sync to Menu.jsx
let menuJsx = fs.readFileSync(menuJsxPath, 'utf8');
menuJsx = menuJsx.replace(/const getFallbackMenu = \(\) => \[\s*[\s\S]*?\];/, fallbackStr);

// add loading lazy
if (!menuJsx.includes('loading="lazy"')) {
    menuJsx = menuJsx.replace(/<img([^>]*)src=/g, '<img loading="lazy"$1src=');
}
fs.writeFileSync(menuJsxPath, menuJsx);

// 4. Sync to NativeMenu.jsx
let nativeJsx = fs.readFileSync(nativeMenuPath, 'utf8');
nativeJsx = nativeJsx.replace(/const getFallbackMenu = \(\) => \[\s*[\s\S]*?\];/, fallbackStr);

// add loading lazy
if (!nativeJsx.includes('loading="lazy"')) {
    nativeJsx = nativeJsx.replace(/<img([^>]*)src=/g, '<img loading="lazy"$1src=');
}
fs.writeFileSync(nativeMenuPath, nativeJsx);

console.log("Images optimized to 320px Thumbnails and synced to App!");
