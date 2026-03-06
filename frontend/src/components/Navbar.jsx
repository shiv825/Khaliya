import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            return (
            <motion.nav
                className={`main-nav ${scrolled ? 'nav-scrolled' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="nav-container">
                    <div className="nav-brand">
                        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{t('common.name')}</h1>
                    </div>

                    <div className="nav-controls">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="language-selector"
                            title="Select language"
                        >
                            <option value="en">EN</option>
                            <option value="hi">हिंदी</option>
                            <option value="ar">عربي</option>
                        </select>
                        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </button>
                    </div>

                    <AnimatePresence>
                        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                            <a href="#home" onClick={toggleMenu}>{t('nav.home')}</a>
                            <a href="#menu" onClick={toggleMenu}>{t('nav.menu')}</a>
                            <a href="#loyalty" onClick={toggleMenu}><i className="fas fa-gem" style={{ color: 'var(--accent-color)', marginRight: '5px' }}></i> {t('nav.loyalty')}</a>
                            <a href="#reservations" onClick={toggleMenu}>{t('nav.reservations')}</a>
                            <a href="#contact" onClick={toggleMenu}>{t('nav.contact')}</a>
                        </div>
                    </AnimatePresence>
                </div>
            </motion.nav>
            );
        </>
    );
}
