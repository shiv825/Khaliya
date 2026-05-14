import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
    const { t } = useLanguage();
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handlePwaReady = (e) => {
            setIsInstallable(e.detail);
        };
        window.addEventListener('khaliya-pwa-ready', handlePwaReady);
        return () => window.removeEventListener('khaliya-pwa-ready', handlePwaReady);
    }, []);

    return (
        <section id="home" className="hero">
            {/* High-impact background video / image */}
            <div className="hero-bg" style={{ overflow: 'hidden', position: 'relative' }}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        minWidth: '100%',
                        minHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        transform: 'translate(-50%, -50%) scale(1.05)',
                        objectFit: 'cover',
                        zIndex: 0,
                        filter: 'brightness(0.7)'
                    }}
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-chef-pouring-sauce-over-a-dish-in-a-fine-dining-42036-large.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="hero-overlay-gradient" style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, var(--bg-body) 100%)',
                zIndex: 1
            }}></div>

            {/* Floating Gold Particles Decoration (Optional) */}
            <div className="hero-accents" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: 'radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.05) 0%, transparent 50%)' }}></div>

            <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
                <motion.h1 
                    className="hero-title"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ 
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #FDFFFC 0%, var(--accent-light) 50%, var(--spice-saffron) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))',
                        marginBottom: '20px',
                        letterSpacing: '-2px',
                        lineHeight: 1.1
                    }}
                >
                    {t('hero.title')}
                </motion.h1>

                <motion.p
                    className="hero-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    style={{
                        fontSize: 'clamp(1rem, 2vw, 1.6rem)',
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: '850px',
                        margin: '0 auto 50px auto',
                        lineHeight: '1.6',
                        fontWeight: '500',
                        letterSpacing: '1px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    {t('hero.sub')}
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                    <a href="#reservations" className="btn btn-primary">{t('hero.makeReservation')}</a>
                    <a href="#menu" className="btn">{t('hero.seeMenu')}</a>
                    {isInstallable && (
                        <button 
                            onClick={() => window.promptInstall && window.promptInstall()}
                            className="btn btn-primary"
                            style={{ 
                                background: 'var(--indigo-gradient)', 
                                border: 'none',
                                color: '#FFF'
                            }}
                        >
                            <i className="fas fa-download"></i> {t('pwa.installBtn') || 'Download App'}
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </section>
    );
}
