import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Loyalty() {
    const { t } = useLanguage();

    return (
        <section id="loyalty" style={{ background: 'var(--bg-body)', padding: '8rem 0', position: 'relative', overflow: 'hidden' }} data-aos="fade-up">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
                        {t('loyalty.title') || 'Loyalty'}
                    </h2>
                    <p style={{ color: 'var(--text-light)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
                        {t('loyalty.sub') || 'We have removed the premium club experience from the website and app.'}
                    </p>
                </div>
            </div>
        </section>
    );
}
