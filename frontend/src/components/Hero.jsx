import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
    const { t } = useLanguage();

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

            <div className="hero-overlay-gradient"></div>

            <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
                <motion.h2
                    className="hero-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #FFF 0%, var(--accent-color) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        marginBottom: '30px',
                        letterSpacing: '-1px'
                    }}
                >
                    {t('hero.title')}
                </motion.h2>

                <motion.p
                    className="hero-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    style={{
                        fontSize: '1.4rem',
                        color: 'var(--text-light)',
                        maxWidth: '800px',
                        margin: '0 auto 40px auto',
                        lineHeight: '1.6',
                        fontWeight: '400',
                        letterSpacing: '1px'
                    }}
                >
                    {t('hero.sub')}
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <a href="#reservations" className="btn btn-primary">{t('hero.makeReservation')}</a>
                    <a href="#menu" className="btn btn-outline">{t('hero.seeMenu')}</a>
                </motion.div>
            </motion.div>
        </section>
    );
}
