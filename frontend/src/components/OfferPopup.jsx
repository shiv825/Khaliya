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
                            background: '#fff',
                            borderRadius: '30px',
                            maxWidth: '450px',
                            width: '100%',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)'
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
                                zIndex: 1
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="offer-image" style={{ height: '200px', background: 'url("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80") center/cover' }}>
                            <div style={{
                                height: '100%',
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 100%)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: '20px'
                            }}>
                                <span style={{
                                    background: 'var(--accent-color)',
                                    color: '#fff',
                                    padding: '5px 15px',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.9rem'
                                }}>LIMITED OFFER</span>
                            </div>
                        </div>

                        <div className="offer-content" style={{ padding: '30px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#1a1a1a' }}>
                                {t('offer.title', 'Unlock 15% Off!')}
                            </h2>
                            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>
                                {t('offer.sub', 'Join our loyalty family and get an instant discount code for your first online reservation!')}
                            </p>

                            <div className="offer-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input 
                                    type="email" 
                                    placeholder={t('offer.emailPlaceholder', 'Enter your email')}
                                    style={{
                                        padding: '15px 20px',
                                        borderRadius: '15px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleClose}
                                    style={{
                                        padding: '15px',
                                        borderRadius: '15px',
                                        fontWeight: '700',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.3)'
                                    }}
                                >
                                    {t('offer.cta', 'Claim My Discount')}
                                </button>
                                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
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
