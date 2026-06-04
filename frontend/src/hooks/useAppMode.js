import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is running the app in standalone mode (installed PWA)
 * or in a standard browser tab.
 */
export function useAppMode() {
    const [isAppMode, setIsAppMode] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Explicit display mode check (Standalone PWA installed app)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        
        // 2. Explicit query params
        const hasPwaParam = searchParams.get('mode') === 'pwa';
        const hasWebsiteParam = searchParams.get('mode') === 'website';

        if (hasWebsiteParam) {
            setIsAppMode(false);
            return;
        }

        if (isStandalone || hasPwaParam) {
            setIsAppMode(true);
            return;
        }

        // Default to false (Website mode in standard browser tab)
        setIsAppMode(false);

    }, []);

    return isAppMode;
}
