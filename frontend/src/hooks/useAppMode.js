import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is running the app in standalone mode (installed PWA)
 * or in a standard browser tab.
 */
export function useAppMode() {
    const [isAppMode, setIsAppMode] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Explicit query param (Strongest signal from manifest.json start_url)
        const hasModeParam = searchParams.has('mode') && searchParams.get('mode') === 'pwa';
        
        // 2. Forced website override
        const isForcedWebsite = searchParams.has('mode') && searchParams.get('mode') === 'website';

        if (isForcedWebsite) {
            sessionStorage.removeItem('khaliya_app_mode');
            setIsAppMode(false);
            return;
        }

        if (hasModeParam) {
            sessionStorage.setItem('khaliya_app_mode', 'true');
            setIsAppMode(true);
            return;
        }

        if (sessionStorage.getItem('khaliya_app_mode') === 'true') {
            setIsAppMode(true);
            return;
        }

        // Default to false (Website mode)
        setIsAppMode(false);

    }, []);

    return isAppMode;
}
