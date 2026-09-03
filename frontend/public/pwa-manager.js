const PWAManager = {
    deferredPrompt: null,
    lastLang: localStorage.getItem('lang') || 'en',

    init: () => {
        console.log('🚀 [PWA] Manager v2.3 Initialized');
        
        // Handle debug force mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('pwa_reset')) {
            console.log('🧹 [PWA] Resetting dismissal state via URL param');
            sessionStorage.removeItem('pwa_dismissed');
        }

        PWAManager.registerServiceWorker();
        PWAManager.setupInstallPrompt();
        PWAManager.setupLaterButton();
        PWAManager.listenForLanguageChanges();
    },
    registerServiceWorker: () => {
        if ('serviceWorker' in navigator) {
            // Disable Service Worker on local development server to prevent HMR infinite reload loops
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                navigator.serviceWorker.getRegistrations().then(regs => {
                    for (let r of regs) r.unregister();
                });
                return;
            }

            const register = () => {
                const isGithubPages = window.location.pathname.startsWith('/Khaliya-Restaurant');
                const swPath = isGithubPages ? '/Khaliya-Restaurant/service-worker.js' : '/service-worker.js';
                
                console.log('🔍 [PWA] Registering Service Worker at:', swPath);
                navigator.serviceWorker.register(swPath)
                    .then(reg => {
                        console.log('✅ [PWA] Service Worker registered:', reg.scope);
                    })
                    .catch(err => {
                        console.error('❌ [PWA] SW Registration failed:', err);
                    });
            };

            if (document.readyState === 'complete') {
                register();
            } else {
                window.addEventListener('load', register);
            }
        }
    },
    setupInstallPrompt: () => {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📥 [PWA] beforeinstallprompt event fired');
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            PWAManager.deferredPrompt = e;
            
            // Dispatch custom event for React components
            window.dispatchEvent(new CustomEvent('khaliya-pwa-ready', { detail: true }));

            // Show banner immediately when prompt is ready, if not dismissed
            const isDismissed = sessionStorage.getItem('pwa_dismissed');
            console.log('🔍 [PWA] Checking dismissal state:', isDismissed);
            
            if (!isDismissed) {
                PWAManager.showInstallBanner();
            } else {
                console.log('ℹ️ [PWA] Banner suppressed: Already dismissed in this session.');
            }
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('🎉 [PWA] App successfully installed');
            window.dispatchEvent(new CustomEvent('khaliya-pwa-ready', { detail: false }));
            PWAManager.closeInstallBanner();
        });

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            console.log('📱 [PWA] Running in standalone (installed) mode');
        }
    },

    promptInstall: () => {
        if (!PWAManager.deferredPrompt) {
            console.error('❌ [PWA] Install prompt not available. User clicked Install too early or browser blocked it.');
            alert("To install the app, please look for the install icon in your browser's address bar, or use the 'Add to Home Screen' option in your browser menu.");
            return false;
        }

        PWAManager.deferredPrompt.prompt();
        PWAManager.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ [PWA] User accepted the installation');
            } else {
                console.log('❌ [PWA] User dismissed the installation');
            }
            PWAManager.deferredPrompt = null;
            PWAManager.closeInstallBanner();
        });
        return true;
    },

    showInstallBanner: () => {
        console.log('✨ [PWA] Attempting to show banner...');
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            PWAManager.updateBannerContent();
            banner.classList.add('active');
            console.log('🎬 [PWA] Banner is now ACTIVE');
            
            // Haptic feedback if available
            if ("vibrate" in navigator) {
                try {
                    navigator.vibrate(50);
                } catch(e) { /* Ignore vibration errors if blocked */ }
            }
        } else {
            console.error('❌ [PWA] Banner element #pwaInstallBanner not found in DOM');
        }
    },

    closeInstallBanner: () => {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            console.log('🙈 [PWA] Closing banner');
            banner.classList.remove('active');
        }
    },

    setupLaterButton: () => {
        const attachLater = () => {
            const laterBtn = document.getElementById('pwaLaterBtn');
            if (laterBtn) {
                // Clear any existing onclick to avoid duplicates
                laterBtn.onclick = null;
                
                laterBtn.addEventListener('click', (e) => {
                    if (!e.isTrusted) {
                        console.warn('⚠️ [PWA] Untrusted click detected on Later button! Preventing automatic dismissal.');
                        // If it's not a real user click, we might want to ignore it
                        // but for now let's just log and continue to see the trace.
                        console.trace('Programmatic Click Trace');
                        return; 
                    }
                    
                    console.log('⏳ [PWA] User clicked "Later"');
                    sessionStorage.setItem('pwa_dismissed', 'true');
                    PWAManager.closeInstallBanner();
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachLater);
        } else {
            attachLater();
        }
    },

    updateBannerContent: () => {
        const lang = localStorage.getItem('lang') || 'en';
        const i18n = window.KHALIYA_i18n ? window.KHALIYA_i18n[lang] : null;

        if (!i18n) {
            console.warn('⚠️ [PWA] No i18n data found for language:', lang);
            return;
        }

        const title = document.getElementById('pwaInstallTitle');
        const desc = document.getElementById('pwaInstallDesc');
        const installBtn = document.getElementById('pwaInstallBtn');
        const laterBtn = document.getElementById('pwaLaterBtn');

        if (title) title.innerText = i18n.pwa?.installTitle || 'Install Khaliya App';
        if (desc) desc.innerText = i18n.pwa?.installDesc || 'Fast access to our menu.';
        if (installBtn) installBtn.innerText = i18n.pwa?.installBtn || 'Install';
        if (laterBtn) laterBtn.innerText = i18n.pwa?.cancelBtn || 'Later';
    },

    listenForLanguageChanges: () => {
        window.addEventListener('storage', (e) => {
            if (e.key === 'lang') {
                PWAManager.updateBannerContent();
            }
        });

        setInterval(() => {
            const currentLang = localStorage.getItem('lang') || 'en';
            if (PWAManager.lastLang !== currentLang) {
                PWAManager.lastLang = currentLang;
                PWAManager.updateBannerContent();
            }
        }, 1000);
    }
};

// Global helpers
window.promptInstall = PWAManager.promptInstall;
window.forceShowPwaBanner = PWAManager.showInstallBanner;

// Initialize with slight delay to ensure translations are available
setTimeout(() => {
    PWAManager.init();
}, 800);

