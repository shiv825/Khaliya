import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is running the app in standalone mode (installed PWA)
 * or in a standard browser tab.
 */
export function useAppMode() {
    const [isAppMode, setIsAppMode] = useState(false);

    useEffect(() => {
        // Check if the app is installed and running in standalone mode
        const mediaQuery = window.matchMedia('(display-mode: standalone)');

        // Initial check
        setIsAppMode(mediaQuery.matches || window.navigator.standalone === true);

        // Listen for changes (e.g., if user installs and it switches immediately)
        const handleChange = (e) => setIsAppMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isAppMode;
}
