const PWAManager = {
    deferredPrompt: null,
    lastLang: localStorage.getItem('lang') || 'en',

    init: () => {
        console.log('🚀 [PWA] Manager v2.4 Initialized');
        
        // Handle debug force mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('pwa_reset')) {
            console.log('🧹 [PWA] Resetting dismissal state via URL param');
            sessionStorage.removeItem('pwa_dismissed');
        }

        PWAManager.registerServiceWorker();
        PWAManager.setupInstallPrompt();
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
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('🎉 [PWA] App successfully installed');
            window.dispatchEvent(new CustomEvent('khaliya-pwa-ready', { detail: false }));
        });

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            console.log('📱 [PWA] Running in standalone (installed) mode');
        }
    },

    promptInstall: () => {
        if (!PWAManager.deferredPrompt) {
            console.warn('⚠️ [PWA] Native install prompt not directly available. Opening instruction modal.');
            window.dispatchEvent(new CustomEvent('khaliya-show-pwa-modal'));
            if (typeof window.forceShowPwaBanner === 'function') {
                window.forceShowPwaBanner();
            }
            return false;
        }

        try {
            PWAManager.deferredPrompt.prompt();
            PWAManager.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ [PWA] User accepted the installation');
                } else {
                    console.log('❌ [PWA] User dismissed the installation');
                    window.dispatchEvent(new CustomEvent('khaliya-show-pwa-modal'));
                }
                PWAManager.deferredPrompt = null;
            });
            return true;
        } catch (err) {
            console.error('❌ [PWA] Error triggering install prompt:', err);
            window.dispatchEvent(new CustomEvent('khaliya-show-pwa-modal'));
            if (typeof window.forceShowPwaBanner === 'function') {
                window.forceShowPwaBanner();
            }
            return false;
        }
    },

    showInstallBanner: () => {
        window.dispatchEvent(new CustomEvent('khaliya-show-pwa-modal'));
        if (typeof window.forceShowPwaBanner === 'function') {
            window.forceShowPwaBanner();
        }
    }
};

// Global helpers
window.promptInstall = PWAManager.promptInstall;
window.forceShowPwaBanner = PWAManager.showInstallBanner;

// Initialize with slight delay
setTimeout(() => {
    PWAManager.init();
}, 500);

