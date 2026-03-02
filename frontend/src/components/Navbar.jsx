import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header data-aos="fade-down" data-aos-duration="800">
                <h1>{t('common.name')}</h1>
                <p>{t('header.sub')}</p>
            </header>
            <nav className="main-nav" data-aos="fade-right" data-aos-duration="600" data-aos-delay="200">
                <div className="nav-container">
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

                    <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                        <a href="#home" onClick={toggleMenu}>{t('nav.home')}</a>
                        <a href="#menu" onClick={toggleMenu}>{t('nav.menu')}</a>
                        <a href="#loyalty" onClick={toggleMenu}><i className="fas fa-gem" style={{ color: 'var(--accent-color)', marginRight: '5px' }}></i> {t('nav.loyalty')}</a>
                        <a href="#hours" onClick={toggleMenu}>{t('nav.hours')}</a>
                        <a href="#track" onClick={toggleMenu}>{t('nav.track')}</a>
                        <a href="#tables" onClick={toggleMenu}>{t('nav.tables')}</a>
                        <a href="#contact" onClick={toggleMenu}>{t('nav.contact')}</a>
                        <a href="#reservations" onClick={toggleMenu}>{t('nav.reservations')}</a>
                    </div>
                </div>
            </nav>
        </>
    );
}
