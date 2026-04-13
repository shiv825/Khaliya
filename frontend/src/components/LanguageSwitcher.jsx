import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', localName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', localName: 'हिंदी' },
    { code: 'ar', name: 'Arabic', flag: '🇦🇪', localName: 'عربي' }
];

export default function LanguageSwitcher({ mode = 'dropdown' }) {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    const handleLanguageChange = (code) => {
        setLanguage(code);
        setIsOpen(false);
    };

    if (mode === 'list') {
        return (
            <div className="language-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {languages.map((lang) => (
                    <motion.div
                        key={lang.code}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageChange(lang.code)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px 20px',
                            background: language === lang.code ? 'var(--accent-glow)' : 'var(--bg-surface)',
                            borderRadius: '15px',
                            border: `1px solid ${language === lang.code ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', color: 'var(--text-dark)', fontSize: '1rem' }}>{lang.localName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang.name}</div>
                        </div>
                        {language === lang.code && <i className="fas fa-check-circle" style={{ color: 'var(--primary-color)' }}></i>}
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="language-dropdown-container" style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 15px',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '25px',
                    color: 'var(--text-dark)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>{currentLang.flag}</span>
                <span className="lang-code" style={{ textTransform: 'uppercase' }}>{currentLang.code}</span>
                <i className={`fas fa-chevron-down`} style={{ fontSize: '0.7rem', transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'none' }}></i>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: document.dir === 'rtl' ? 'auto' : 0,
                            left: document.dir === 'rtl' ? 0 : 'auto',
                            minWidth: '180px',
                            background: 'var(--bg-surface)',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-lg)',
                            border: '1px solid var(--border-color)',
                            zIndex: 1001,
                            marginTop: '8px'
                        }}
                    >
                        <div style={{ padding: '10px 0' }}>
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        width: '100%',
                                        padding: '12px 20px',
                                        border: 'none',
                                        background: language === lang.code ? 'var(--accent-glow)' : 'transparent',
                                        color: language === lang.code ? 'var(--primary-color)' : 'var(--text-dark)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        fontWeight: language === lang.code ? '800' : '600',
                                        fontSize: '0.95rem'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = language === lang.code ? 'var(--accent-glow)' : 'transparent'}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                                    <span>{lang.localName}</span>
                                    {language === lang.code && <i className="fas fa-check" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}></i>}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
