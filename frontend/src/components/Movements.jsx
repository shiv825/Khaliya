import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Movements() {
    const { t } = useLanguage();

    return (
        <section className="accent-section movements" data-aos="fade-up" data-aos-duration="800">
            <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
                {t('movements.title')}
            </h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '900px', margin: '0 auto 3rem auto', textAlign: 'center', fontSize: '1.1rem', lineHeight: '1.8' }}>
                {t('movements.sub')}
            </p>

            <div className="movement-track" aria-hidden="false" style={{ marginBottom: '4rem' }}>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585937421612-70a008356f96?w=1400&q=80')", animationDelay: '0s', borderRadius: '20px' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1588166524941-3bf61a7c4aeb?w=1400&q=80')", animationDelay: '5s', borderRadius: '20px' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')", animationDelay: '10s', borderRadius: '20px' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=80')", animationDelay: '15s', borderRadius: '20px' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601050638917-3f9478f7e3ba?w=1400&q=80')", animationDelay: '20s', borderRadius: '20px' }}></div>
                <div className="movement-item" title="Sizzling Delight" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596797038558-9650999e570b?w=1400&q=80')", animationDelay: '25s', borderRadius: '20px' }}></div>
                <div className="movement-item" title="Artistic Plating" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1400&q=80')", animationDelay: '30s', borderRadius: '20px' }}></div>
                <div className="movement-item" title="Warm Service" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1400&q=80')", animationDelay: '35s', borderRadius: '20px' }}></div>
            </div>

            <div className="movement-info" style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="movement-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '25px', padding: '2.5rem', textAlign: 'center', transition: 'var(--transition)', maxWidth: '350px', boxShadow: 'var(--shadow-md)' }}>
                    <i className="fas fa-fire" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'block' }}></i>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--text-dark)', display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{t('movements.sizzle')}</strong>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>{t('movements.sizzle_desc')}</p>
                </div>
                <div className="movement-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '25px', padding: '2.5rem', textAlign: 'center', transition: 'var(--transition)', maxWidth: '350px', boxShadow: 'var(--shadow-md)' }}>
                    <i className="fas fa-utensils" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'block' }}></i>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--text-dark)', display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{t('movements.plating')}</strong>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>{t('movements.plating_desc')}</p>
                </div>
                <div className="movement-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '25px', padding: '2.5rem', textAlign: 'center', transition: 'var(--transition)', maxWidth: '350px', boxShadow: 'var(--shadow-md)' }}>
                    <i className="fas fa-heart" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'block' }}></i>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--text-dark)', display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{t('movements.service')}</strong>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>{t('movements.service_desc')}</p>
                </div>
            </div>
        </section>
    );
}
