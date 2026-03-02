import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Movements() {
    const { t } = useLanguage();

    return (
        <section className="accent-section movements" data-aos="fade-up" data-aos-duration="800">
            <h2>{t('movements.title')}</h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '900px', margin: '0 auto 1rem auto', textAlign: 'center' }}>
                {t('movements.sub')}
            </p>

            <div className="movement-track" aria-hidden="false">
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585937421612-70a008356f96?w=1400&q=80')", animationDelay: '0s' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1588166524941-3bf61a7c4aeb?w=1400&q=80')", animationDelay: '5s' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')", animationDelay: '10s' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=80')", animationDelay: '15s' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601050638917-3f9478f7e3ba?w=1400&q=80')", animationDelay: '20s' }}></div>
                <div className="movement-item" title="Sizzling Delight" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596797038558-9650999e570b?w=1400&q=80')", animationDelay: '25s' }}></div>
                <div className="movement-item" title="Artistic Plating" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1400&q=80')", animationDelay: '30s' }}></div>
                <div className="movement-item" title="Warm Service" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1400&q=80')", animationDelay: '35s' }}></div>
            </div>

            <div className="movement-info" style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="movement-card">
                    <strong>{t('movements.sizzle')}</strong>
                    <p>{t('movements.sizzle_desc')}</p>
                </div>
                <div className="movement-card">
                    <strong>{t('movements.plating')}</strong>
                    <p>{t('movements.plating_desc')}</p>
                </div>
                <div className="movement-card">
                    <strong>{t('movements.service')}</strong>
                    <p>{t('movements.service_desc')}</p>
                </div>
            </div>
        </section>
    );
}
