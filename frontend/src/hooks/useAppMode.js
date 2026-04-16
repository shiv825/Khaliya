import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is running the app in standalone mode (installed PWA)
 * or in a standard browser tab.
 */
export function useAppMode() {
    const [isAppMode, setIsAppMode] = useState(false);

    useEffect(() => {
        // Robust detection for Native App Mode
        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Explicit query param (Strongest signal from manifest.json start_url)
        const hasModeParam = searchParams.has('mode') && searchParams.get('mode') === 'pwa';
        
        // 2. Browser display-mode (Standalone/Fullscreen)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.matchMedia('(display-mode: fullscreen)').matches ||
                           window.navigator.standalone === true;

        // 3. Forced website override
        const isForcedWebsite = searchParams.has('mode') && searchParams.get('mode') === 'website';

        // 4. Detected Mobile Device (Recovery Override)
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isForcedWebsite) {
            setIsAppMode(false);
            return;
        }

        if (hasModeParam || isStandalone || isMobileDevice) {
            setIsAppMode(true);
            return;
        }

        // Default to false (Website mode)
        setIsAppMode(false);

    }, []);

    return isAppMode;
}
