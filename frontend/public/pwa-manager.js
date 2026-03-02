const PWAManager = {
    deferredPrompt: null,

    init: () => {
        PWAManager.registerServiceWorker();
        PWAManager.setupInstallPrompt();
    },

    registerServiceWorker: () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Use absolute path for React Router compatibility
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => {
                        console.log('✅ Service Worker registered:', reg.scope);
                    })
                    .catch(err => console.error('❌ Service Worker registration failed:', err));
            });
        }
    },

    setupInstallPrompt: () => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            PWAManager.deferredPrompt = e;

            // Show banner immediately when prompt is ready
            PWAManager.showInstallBanner();
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('✅ PWA was installed');
            PWAManager.closeInstallBanner();
        });
    },

    promptInstall: () => {
        if (!PWAManager.deferredPrompt) {
            console.log('Install prompt not available');
            return;
        }

        PWAManager.deferredPrompt.prompt();
        PWAManager.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            PWAManager.deferredPrompt = null;
            PWAManager.closeInstallBanner();
        });
    },

    showInstallBanner: () => {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.classList.add('active');
    },

    closeInstallBanner: () => {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.classList.remove('active');
    }
};

window.promptInstall = PWAManager.promptInstall;
document.addEventListener('DOMContentLoaded', PWAManager.init);
