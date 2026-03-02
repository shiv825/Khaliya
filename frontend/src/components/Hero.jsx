import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
    const { t } = useLanguage();

    return (
        <section id="home" className="hero">
            <div className="hero-overlay"></div>
            <div className="hero-content" data-aos="zoom-in" data-aos-duration="1200">
                <h2 className="hero-title">{t('hero.title')}</h2>
                <p className="hero-sub">{t('hero.sub')}</p>
                <div className="hero-cta">
                    <a href="#reservations" className="btn">{t('hero.makeReservation')}</a>
                    <a href="#menu" className="btn">{t('hero.seeMenu')}</a>
                </div>
            </div>
        </section>
    );
}
