import { useState, useEffect } from 'react';

/**
 * Hook to detect time of day and return a corresponding theme string.
 * Morning: 5am - 12pm
 * Afternoon: 12pm - 6pm (18:00)
 * Evening: 6pm - 5am
 */
export function useDynamicTheme() {
    const [theme, setTheme] = useState('morning');

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            
            if (hour >= 5 && hour < 12) {
                setTheme('morning');
            } else if (hour >= 12 && hour < 18) {
                setTheme('afternoon');
            } else {
                setTheme('evening');
            }
        };

        // Initial check
        updateTheme();

        // Check every minute
        const interval = setInterval(updateTheme, 60000);
        return () => clearInterval(interval);
    }, []);

    return theme;
}
