const fs = require('fs');
const path = require('path');

const menuPath = './frontend/src/components/Menu.jsx';
const nativeMenuPath = './frontend/src/components/native/NativeMenu.jsx';
const syncNativeMenuPath = './frontend/src/components/native/NativeMenu.jsx';

let menuContent = fs.readFileSync(menuPath, 'utf8');
let nativeContent = fs.readFileSync(nativeMenuPath, 'utf8');

// 1. Extract the fallback menu from Menu.jsx
const fallbackMatch = menuContent.match(/const getFallbackMenu = \(\) => \[[\s\S]*?\];/);
if (fallbackMatch) {
    const fallbackStr = fallbackMatch[0];
    nativeContent = nativeContent.replace(/const getFallbackMenu = \(\) => \[[\s\S]*?\];/, fallbackStr);
}

// 2. Fix the infinite loading timeout bug in NativeMenu.jsx
nativeContent = nativeContent.replace(
    /axios\.get\(`\$\{API_URL\}\/api\/menu`\)/g,
    "axios.get(`${API_URL}/api/menu`, { timeout: 5000 })"
);

// 3. Fix the image path loading in NativeMenu.jsx (Make it exactly like Menu.jsx offline paths)
nativeContent = nativeContent.replace(
    /<img loading="lazy"[\s\S]*?src=\{[\s\S]*?\}[\s\S]*?alt=\{[\s\S]*?\}[\s\S]*?onError=\{[\s\S]*?\}[\s\S]*?\/>/,
    `<img loading="lazy" src={item.image} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop"; }} />`
);

// 4. Syphon the card design: add futuristic-glass if missing
nativeContent = nativeContent.replace(/className="native-menu-card"/g, 'className="native-menu-card futuristic-glass"');

// 5. Add Tags (veg/non-veg/spicy) below the price or next to description
const tagsBlock = `
                                <div className="menu-item-tags" style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                    {item.tags && item.tags.map(tag => {
                                        if (tag === 'veg') return <span key={tag} className="tag tag-veg" title="Vegetarian" style={{ fontSize: '0.8rem' }}>🌱</span>;
                                        if (tag === 'non-veg') return <span key={tag} className="tag tag-nonveg" title="Non-Vegetarian" style={{ fontSize: '0.8rem' }}>🍖</span>;
                                        if (tag === 'spicy-1') return <span key={tag} className="tag tag-spicy" title="Mild Spicy" style={{ fontSize: '0.8rem' }}>🌶️</span>;
                                        if (tag === 'spicy-2') return <span key={tag} className="tag tag-spicy" title="Medium Spicy" style={{ fontSize: '0.8rem' }}>🌶️🌶️</span>;
                                        if (tag === 'spicy-3') return <span key={tag} className="tag tag-spicy" title="Extra Spicy" style={{ fontSize: '0.8rem' }}>🌶️🌶️🌶️</span>;
                                        return null;
                                    })}
                                </div>
`;

// Insert tags after <h3> title if not already there
if (!nativeContent.includes("menu-item-tags")) {
    nativeContent = nativeContent.replace(
        /<h3>\{getLocalized\(item\.name\)\}<\/h3>/,
        `<h3>{getLocalized(item.name)}</h3>${tagsBlock}`
    );
}

fs.writeFileSync(nativeMenuPath, nativeContent);
fs.writeFileSync(syncNativeMenuPath, nativeContent); // Write to both workspaces!

console.log("SUCCESS: NativeMenu.jsx synced!");
