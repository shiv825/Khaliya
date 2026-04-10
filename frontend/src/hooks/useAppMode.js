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
            
            // Check if URL has the ?app=true flag from manifest.json start_url
            if (window.location.search.includes('app=true')) {
                sessionStorage.setItem('isLaunchedFromAppIcon', 'true');
            }
            
            // Allow Native App Shell ONLY if they specifically launched the installed app
            // (either they just launched it, or they are keeping the app open in this session)
            const isLaunchedFromAppIcon = sessionStorage.getItem('isLaunchedFromAppIcon') === 'true';
            
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

            // Only trigger Native App Shell if in standalone mode AND launched from icon AND on mobile
            return isStandalone && isLaunchedFromAppIcon && isTabletOrMobile;
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
