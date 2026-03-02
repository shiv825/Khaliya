import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <>
            <header data-aos="fade-down" data-aos-duration="800">
                <h1>{t('common.name')}</h1>
                <p>{t('header.sub')}</p>
            </header>
            <nav data-aos="fade-right" data-aos-duration="600" data-aos-delay="200">
                <div style={{ display: 'inline-block', marginRight: '1rem' }}>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #ddd', background: 'white', fontWeight: 'bold' }}
                        title="Select language"
                    >
                        <option value="en">EN</option>
                        <option value="hi">हिंदी</option>
                        <option value="ar">عربي</option>
                    </select>
                </div>
                <a href="#home">{t('nav.home')}</a>
                <a href="#menu">{t('nav.menu')}</a>
                <a href="#loyalty"><i className="fas fa-gem" style={{ color: 'var(--accent-color)', marginRight: '5px' }}></i> {t('nav.loyalty')}</a>
                <a href="#hours">{t('nav.hours')}</a>
                <a href="#track">{t('nav.track')}</a>
                <a href="#tables">{t('nav.tables')}</a>
                <a href="#contact">{t('nav.contact')}</a>
                <a href="#reservations">{t('nav.reservations')}</a>
            </nav>
        </>
    );
}
