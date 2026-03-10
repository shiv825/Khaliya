import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is running the app in standalone mode (installed PWA)
 * or in a standard browser tab.
 */
export function useAppMode() {
    const [isAppMode, setIsAppMode] = useState(false);

    useEffect(() => {
        // Function to determine if we should show the App Mode
        const checkAppMode = () => {
            const isTabletOrMobile = window.innerWidth <= 1024;
            // Only trigger Native App Shell if in standalone mode AND on a mobile/tablet screen size
            return (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) && isTabletOrMobile;
        };

        // Initial check
        setIsAppMode(checkAppMode());

        // Listen for standalone mode changes & resize
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = () => setIsAppMode(checkAppMode());

        mediaQuery.addEventListener('change', handleChange);
        window.addEventListener('resize', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            window.removeEventListener('resize', handleChange);
        };
    }, []);

    return isAppMode;
}
