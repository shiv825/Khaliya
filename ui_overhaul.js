const fs = require('fs');

const basePath = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend';

// 1. Upgrade style.css with Futuristic Glassmorphism
let stylePath = basePath + '\\src\\assets\\style.css';
let css = fs.readFileSync(stylePath, 'utf8');

// Change standard dark colors to Deep Space / Neon Red aesthetic
css = css.replace(/--primary-color: #D32F2F;/, '--primary-color: #ff2a4d;');
css = css.replace(/--bg-body: #121212;/, '--bg-body: #050510;');
css = css.replace(/--bg-surface: #1E1E1E;/, '--bg-surface: rgba(18, 18, 28, 0.7);');
css = css.replace(/--bg-light: #2A2A2A;/, '--bg-light: rgba(35, 35, 50, 0.6);');

if (!css.includes('.futuristic-glass')) {
    css += `
/* ========================================= */
/*      FUTURISTIC UI ANIMATIONS OVERRIDE    */
/* ========================================= */
.futuristic-glass {
    background: rgba(16, 18, 27, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 42, 77, 0.2);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.menu-card, .native-menu-card {
    background: rgba(20, 20, 30, 0.5) !important;
    backdrop-filter: blur(16px) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.menu-card:hover, .native-menu-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(255, 42, 77, 0.8) !important;
    box-shadow: 0 10px 40px rgba(255, 42, 77, 0.3), 0 0 20px rgba(255, 193, 7, 0.2) !important;
}

.menu-card img, .native-menu-card img {
    filter: brightness(0.9) contrast(1.1);
    transition: filter 0.5s ease;
}
.menu-card:hover img, .native-menu-card:hover img {
    filter: brightness(1.1) contrast(1.15);
}

.btn-primary {
    background: linear-gradient(135deg, #ff2a4d 0%, #cc0022 100%) !important;
    box-shadow: 0 4px 15px rgba(255, 42, 77, 0.4) !important;
    border: none !important;
    position: relative;
    overflow: hidden;
}
.btn-primary::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: rgba(255,255,255,0.1);
    transform: rotate(45deg);
    transition: all 0.5s ease;
    opacity: 0;
}
.btn-primary:hover::after {
    opacity: 1;
    transform: rotate(45deg) translateY(-50%);
}
.btn-primary:hover {
    box-shadow: 0 6px 25px rgba(255, 42, 77, 0.6), 0 0 10px rgba(255, 42, 77, 0.4) !important;
    transform: translateY(-3px) !important;
}

/* Pulsing accent for hero */
.hero-bg::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle at center, rgba(255,42,77,0.1) 0%, transparent 70%);
    animation: slowPulse 8s infinite alternate;
}
@keyframes slowPulse {
    0% { opacity: 0.5; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.1); }
}
`;
}
fs.writeFileSync(stylePath, css);

// Sync to style.min.css as well to guarantee overrides apply
const styleMinPath = basePath + '\\src\\assets\\style.min.css';
if (fs.existsSync(styleMinPath)) {
    let minCss = fs.readFileSync(styleMinPath, 'utf8');
    minCss += `.menu-card,.native-menu-card{background:rgba(20,20,30,.5)!important;backdrop-filter:blur(16px)!important;border:1px solid rgba(255,42,77,.2)!important}.menu-card:hover,.native-menu-card:hover{transform:translateY(-8px) scale(1.02)!important;box-shadow:0 10px 40px rgba(255,42,77,.3)!important;border-color:#ff2a4d!important}.btn-primary{background:linear-gradient(135deg,#ff2a4d 0%,#cc0022 100%)!important;box-shadow:0 4px 15px rgba(255,42,77,.4)!important}.btn-primary:hover{box-shadow:0 8px 25px rgba(255,42,77,.6)!important}`;
    fs.writeFileSync(styleMinPath, minCss);
}

// 2. Add staggerChildren animation to Menu.jsx
let menuPath = basePath + '\\src\\components\\Menu.jsx';
let menuJsx = fs.readFileSync(menuPath, 'utf8');
if (!menuJsx.includes('variants={containerVariants}')) {
    menuJsx = menuJsx.replace(/<div className="menu-grid">/, `<motion.div className="menu-grid"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                >`);
    menuJsx = menuJsx.replace(/<\/div>\s*<\/div>\s*<\/section>/, `</motion.div>\n            </div>\n        </section>`);
    // Convert cards to motion items
    menuJsx = menuJsx.replace(/<div\n\s*key=\{index\}\n\s*className="menu-card"/g, `<motion.div\n                            key={index}\n                            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}\n                            className="menu-card futuristic-glass"`);
    menuJsx = menuJsx.replace(/<\/div>\n\s*\}\)\}/g, `</motion.div>\n                        })}`);
    fs.writeFileSync(menuPath, menuJsx);
}

console.log("Futuristic styles and animations injected.");
