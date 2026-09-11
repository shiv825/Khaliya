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

    if (mode === 'segmented') {
        return (
            <div className="language-segmented" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
                {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '10px 8px',
                                background: isSelected 
                                    ? 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)' 
                                    : 'rgba(255, 255, 255, 0.04)',
                                border: isSelected 
                                    ? '1.5px solid #FFD700' 
                                    : '1px solid rgba(212, 175, 55, 0.25)',
                                borderRadius: '12px',
                                color: isSelected ? '#000000' : '#E2E8F0',
                                fontWeight: '900',
                                fontSize: '0.86rem',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isSelected ? '0 4px 15px rgba(212, 175, 55, 0.35)' : 'none'
                            }}
                        >
                            <span style={{ fontSize: '1.05rem' }}>{lang.flag}</span>
                            <span>{lang.localName}</span>
                        </button>
                    );
                })}
            </div>
        );
    }

    if (mode === 'list') {
        return (
            <div className="language-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {languages.map((lang) => (
                    <motion.div
                        key={lang.code}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ y: -2 }}
                        onClick={() => handleLanguageChange(lang.code)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '18px',
                            padding: '20px 25px', // Increased padding for larger size
                            background: language === lang.code ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)' : 'var(--bg-surface)',
                            borderRadius: '20px', // More modern rounding
                            border: `2px solid ${language === lang.code ? 'var(--primary-color)' : 'transparent'}`, // Thicker border for selected
                            boxShadow: language === lang.code ? '0 10px 25px rgba(212, 175, 55, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)', // Modern shadows
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>{lang.flag}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '900', color: language === lang.code ? 'var(--primary-color)' : 'var(--text-dark)', fontSize: '1.2rem', letterSpacing: '0.5px' }}>{lang.localName}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>{lang.name}</div>
                        </div>
                        {language === lang.code && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: 'var(--primary-color)', color: '#FFF', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(212, 175, 55, 0.4)' }}>
                                <i className="fas fa-check" style={{ fontSize: '0.9rem' }}></i>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="language-dropdown-container" style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ filter: 'brightness(1.1)' }}
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
