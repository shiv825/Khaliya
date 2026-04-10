import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function OfferPopup() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem('khaliya_offer_seen');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 8000); // Show after 8 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('khaliya_offer_seen', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="offer-popup-overlay" style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <motion.div
                        className="offer-card"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        style={{
                            borderRadius: '30px',
                            maxWidth: '450px',
                            width: '100%',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'var(--shadow-lg)',
                            background: 'var(--bg-surface)'
                        }}
                    >
                        <button 
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(0,0,0,0.05)',
                                border: 'none',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                                color: 'var(--text-dark)'
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="offer-image" style={{ height: '220px', background: 'url("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80") center/cover' }}>
                            <div style={{
                                height: '100%',
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(142, 28, 28, 0.4) 100%)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: '25px'
                            }}>
                                <span style={{
                                    background: 'var(--primary-color)',
                                    color: '#fff',
                                    padding: '6px 18px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '0.8rem',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>LIMITED OFFER</span>
                            </div>
                        </div>

                        <div className="offer-content" style={{ padding: '35px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>
                                {t('offer.title', 'Unlock 15% Off!')}
                            </h2>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '30px', fontWeight: '500' }}>
                                {t('offer.sub', 'Join our loyalty family and get an instant discount code for your first online reservation!')}
                            </p>

                            <div className="offer-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input 
                                    type="email" 
                                    placeholder={t('offer.emailPlaceholder', 'Enter your email')}
                                    style={{
                                        padding: '18px 25px',
                                        borderRadius: '15px',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        background: 'var(--bg-body)',
                                        color: 'var(--text-dark)',
                                        transition: 'var(--transition)'
                                    }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleClose}
                                    style={{
                                        padding: '18px',
                                        borderRadius: '50px',
                                        fontWeight: '800',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {t('offer.cta', 'Claim My Discount')}
                                </button>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>
                                    {t('offer.footer', 'No spam. Just delicious updates and exclusive deals.')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
