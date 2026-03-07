const fs = require('fs');
const htmlPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\index.html';
const stylePath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\assets\\style.css';
const styleMinPath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\assets\\style.min.css';

// 1. Rewrite HTML
let html = fs.readFileSync(htmlPath, 'utf8');
const bannerRegex = /<div id="pwaInstallBanner"[\s\S]*?<\/div>[\s]*<\/div>/;
const slimBannerHtml = `<div id="pwaInstallBanner" class="pwa-install-banner">
    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <img src="./pwa-icon-192.png" alt="App Icon" class="pwa-banner-icon" style="width: 40px; height: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
        <div class="pwa-banner-text" style="flex: 1; text-align: left;">
            <h4 style="margin: 0; font-size: 1rem; color: #333;">Khaliya App</h4>
        </div>
    </div>
    <div class="pwa-banner-actions" style="display: flex; gap: 12px; align-items: center; flex-direction: row;">
        <button onclick="document.getElementById('pwaInstallBanner').classList.remove('active')" class="btn-text" style="background: transparent; border: none; cursor: pointer; color: #555; font-size: 0.9rem; padding: 0;">Close</button>
        <button onclick="window.promptInstall()" class="btn" style="border-radius: 6px; padding: 8px 16px; background: #E63946; color: white; border: none; cursor: pointer; font-weight: bold; font-size: 0.9rem; margin-top: 0;">Install</button>
    </div>
  </div>`;
html = html.replace(bannerRegex, slimBannerHtml);
fs.writeFileSync(htmlPath, html);

// 2. Rewrite CSS
let css = fs.readFileSync(stylePath, 'utf8');
const cssRegex = /\/\* Custom PWA Install Banner \(Modal Style\) \*\/[\s\S]*?.pwa-banner-actions \{(?:[^{}]*)\}/;
const slimCss = `/* Custom PWA Install Banner (Top Strip Style) */
.pwa-install-banner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    background: #ffffff;
    padding: 0.75rem 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    z-index: 10001;
    transition: transform 0.4s ease, opacity 0.4s ease;
    border-bottom: 1px solid var(--border-light);
}

.pwa-install-banner::before {
    display: none;
}

.pwa-install-banner.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
}

.pwa-banner-icon { margin-bottom: 0; }
.pwa-banner-text p { display: none; }
.pwa-banner-actions { flex-direction: row; width: auto; }`;
css = css.replace(cssRegex, slimCss);
fs.writeFileSync(stylePath, css);

// 3. Just blindly inject override in style.min.css globally at the end to be absolutely sure.
if (fs.existsSync(styleMinPath)) {
    let minCss = fs.readFileSync(styleMinPath, 'utf8');
    minCss += `.pwa-install-banner { position: fixed !important; top: 0 !important; left: 0 !important; transform: translateY(-100%) !important; width: 100% !important; height: auto !important; max-width: none !important; border-radius: 0 !important; flex-direction: row !important; padding: 0.75rem 1rem !important; background: #fff !important; box-sizing: border-box !important; } .pwa-install-banner.active { transform: translateY(0) !important; opacity: 1 !important; pointer-events: auto !important; } .pwa-install-banner::before { display: none !important; } .pwa-banner-actions { flex-direction: row !important; }`;
    fs.writeFileSync(styleMinPath, minCss);
}

console.log("Banner slimmed and styles applied!");
