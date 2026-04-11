const PWAManager = {
    deferredPrompt: null,
    lastLang: localStorage.getItem('lang') || 'en',

    init: () => {
        console.log('🚀 [PWA] Manager v2.2 Initialized');
        PWAManager.registerServiceWorker();
        PWAManager.setupInstallPrompt();
        PWAManager.setupLaterButton();
        PWAManager.listenForLanguageChanges();
    },

    registerServiceWorker: () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => {
                        console.log('✅ [PWA] Service Worker registered:', reg.scope);
                    })
                    .catch(err => console.error('❌ [PWA] SW Registration failed:', err));
            });
        }
    },

    setupInstallPrompt: () => {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📥 [PWA] beforeinstallprompt event fired');
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            PWAManager.deferredPrompt = e;
            
            // Show banner immediately when prompt is ready, if not dismissed
            if (!sessionStorage.getItem('pwa_dismissed')) {
                PWAManager.showInstallBanner();
            }
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('🎉 [PWA] App successfully installed');
            PWAManager.closeInstallBanner();
        });

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            console.log('📱 [PWA] Running in standalone (installed) mode');
        }
    },

    promptInstall: () => {
        if (!PWAManager.deferredPrompt) {
            console.log('⚠️ [PWA] Install prompt not available.');
            // Even if prompt is unavailable, the user just wants the button. 
            // The browser dictates if the prompt shows or not.
            return;
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
    },

    showInstallBanner: () => {
        console.log('✨ [PWA] Attempting to show banner...');
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            PWAManager.updateBannerContent();
            banner.classList.add('active');
            
            // Haptic feedback if available
            if ("vibrate" in navigator) {
                navigator.vibrate(50);
            }
        } else {
            console.warn('❌ [PWA] Banner element #pwaInstallBanner not found in DOM');
        }
    },

    closeInstallBanner: () => {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.classList.remove('active');
    },

    setupLaterButton: () => {
        // Robust later button setup
        const attachLater = () => {
            const laterBtn = document.getElementById('pwaLaterBtn');
            if (laterBtn) {
                laterBtn.onclick = () => {
                    console.log('⏳ [PWA] User clicked "Later"');
                    sessionStorage.setItem('pwa_dismissed', 'true');
                    PWAManager.closeInstallBanner();
                };
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

        if (installBtn) {
            installBtn.innerText = i18n.pwa?.installBtn || 'Install';
        }
        
        if (laterBtn) laterBtn.innerText = 'Cancel';
    },

    listenForLanguageChanges: () => {
        window.addEventListener('storage', (e) => {
            if (e.key === 'lang') {
                console.log('🌐 [PWA] Language change detected via storage');
                PWAManager.updateBannerContent();
            }
        });

        setInterval(() => {
            const currentLang = localStorage.getItem('lang') || 'en';
            if (PWAManager.lastLang !== currentLang) {
                console.log('🌐 [PWA] Language change detected via poller:', currentLang);
                PWAManager.lastLang = currentLang;
                PWAManager.updateBannerContent();
            }
        }, 1000);
    }
};

// Global helpers
window.promptInstall = PWAManager.promptInstall;
window.forceShowPwaBanner = PWAManager.showInstallBanner;

// Initialize immediately
PWAManager.init();
