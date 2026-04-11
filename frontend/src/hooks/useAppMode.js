import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is running the app in standalone mode (installed PWA)
 * or in a standard browser tab.
 */
export function useAppMode() {
    const [isAppMode, setIsAppMode] = useState(false);

    useEffect(() => {
        // Strict separation: To avoid aggressive Android WebAPK intent interception 
        // where opening a normal link forces the standalone container, we DEMAND
        // the ?mode=pwa query parameter to show the Native App Shell.
        // This parameter is set in manifest.json "start_url".

        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Explicit query param (Strongest signal from manifest.json start_url)
        if (searchParams.has('mode') && searchParams.get('mode') === 'pwa') {
            setIsAppMode(true);
            return;
        }

        // 2. iOS Safari standalone mode (iOS does not reliably pass start_url query params when added to homescreen)
        if (window.navigator.standalone === true) {
            setIsAppMode(true);
            return;
        }

        // 3. Optional fallback: If they explicitly request website
        if (searchParams.has('mode') && searchParams.get('mode') === 'website') {
            setIsAppMode(false);
            return;
        }

        // Force website mode by default for ALL other generic loads
        // We DO NOT trust window.matchMedia('(display-mode: standalone)') here
        // because it causes false positives in in-app browsers and WebAPK intents.
        setIsAppMode(false);

    }, []);

    return isAppMode;
}
