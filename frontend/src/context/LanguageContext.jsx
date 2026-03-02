import React, { createContext, useState, useContext, useEffect } from 'react';
import { i18nData } from '../i18nData';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

    useEffect(() => {
        localStorage.setItem('lang', language);
        document.documentElement.lang = language;
        if (['ar', 'he', 'fa', 'ur'].includes(language)) {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let result = i18nData[language] || i18nData.en;
        if (!result) return key;
        for (const k of keys) {
            if (result && result[k]) result = result[k];
            else return key;
        }
        return typeof result === 'string' ? result : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
