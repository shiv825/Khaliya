import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function NativeProfile() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [showLangSelector, setShowLangSelector] = useState(false);
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    const user = storedUserStr ? JSON.parse(storedUserStr) : { name: 'shiv', email: 'shivkumarrdn7@gmail.com', phone: '8252731784' };

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(touch.clientX - centerX);
        y.set(touch.clientY - centerY);
    };

    const handleTouchEnd = () => {
        x.set(0);
        y.set(0);
    };

    const handleAppLogout = () => {
        if (window.confirm(t('reviews.signOutConfirm'))) {
            localStorage.removeItem('khaliya_native_user');
            window.location.reload();
        }
    };

    const menuItems = [
        { icon: 'fas fa-globe', label: t('reviews.selectLanguage'), action: () => setShowLangSelector(true) },
        { icon: 'fas fa-thumbs-up', label: 'Your feedback' },
        { icon: 'fas fa-info-circle', label: 'About' },
        { icon: 'fas fa-cog', label: 'Settings' }
    ];

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '120px' }}>
            {/* Header / Back Arrow */}
            <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-arrow-left" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)', margin: '0 0 0 20px' }}>{t('reviews.yourProfile')}</h2>
            </div>

            {/* Profile Card */}
            <div className="zomato-profile-card" style={{ marginBottom: '15px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="zomato-avatar" style={{ backgroundColor: 'var(--primary-color)', color: '#FFF', fontWeight: '800' }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-dark)', margin: 0 }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-light)', margin: '2px 0 5px 0', fontSize: '0.95rem', fontWeight: '600' }}>{user.email}</p>
                    <span style={{ color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.9rem' }}>{t('reviews.memberSettings')} <i className="fas fa-caret-right"></i></span>
                </div>
            </div>

            {/* 3D Digital Membership Card - Gold Saffron High-Res Edition */}
            <motion.div 
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ 
                    perspective: 1200, 
                    padding: '10px 15px',
                    marginBottom: '20px'
                }}
            >
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        width: '100%',
                        height: '240px',
                        background: 'linear-gradient(135deg, #FF8F00 0%, #FFB300 30%, #FFD54F 100%)',
                        borderRadius: '30px',
                        padding: '30px',
                        color: '#FFF',
                        boxShadow: '0 40px 80px rgba(255, 143, 0, 0.25), inset 0 0 20px rgba(255,255,255,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        transformStyle: 'preserve-3d',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-25deg)', animation: 'shimmer 2.5s infinite ease-out' }}></div>
                    
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', pointerEvents: 'none' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(40px)' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', letterSpacing: '2.5px', fontWeight: '900', color: '#FFF', opacity: 0.8 }}>PREMIUM CLUB</div>
                            <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginTop: '4px', color: '#FFF', fontWeight: '900' }}>Saffron Select</div>
                        </div>
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-crown" style={{ fontSize: '1.6rem', color: '#FFF' }}></i>
                        </div>
                    </div>

                    <div style={{ transform: 'translateZ(60px)' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '2px', color: '#FFF' }}>750</div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#FFF', opacity: 0.9 }}>Available Spice Points</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', transform: 'translateZ(30px)' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '1.5px', color: '#FFF' }}>{user.name.toUpperCase()}</div>
                    </div>
                </motion.div>
            </motion.div>
            <style>{`@keyframes shimmer { 0% { left: -100% } 50% { left: 200% } 100% { left: 200% } }`}</style>

            {/* More Section */}
            <div className="more-section-title" style={{ background: 'var(--bg-body)', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 20px 10px' }}>Account Settings</div>

            <div className="zomato-settings-list">
                {menuItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        className="zomato-menu-item"
                        whileTap={{ background: 'var(--bg-body)' }}
                        onClick={item.action}
                        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}
                    >
                        <i className={item.icon} style={{ color: 'var(--primary-color)', fontSize: '1.2rem', width: '25px' }}></i>
                        <span style={{ color: 'var(--text-dark)', fontWeight: '600', flex: 1 }}>{item.label}</span>
                        <i className="fas fa-chevron-right" style={{ color: 'var(--border-color)', fontSize: '0.9rem' }}></i>
                    </motion.div>
                ))}

                <motion.div
                    className="zomato-menu-item profile-logout"
                    whileTap={{ background: '#FFF5F5' }}
                    onClick={handleAppLogout}
                    style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}
                >
                    <i className="fas fa-power-off" style={{ color: 'var(--primary-color)', width: '25px' }}></i>
                    <span style={{ color: 'var(--primary-color)', fontWeight: '800', flex: 1 }}>{t('reviews.signOut')}</span>
                    <i className="fas fa-chevron-right" style={{ color: 'var(--primary-color)', opacity: 0.3 }}></i>
                </motion.div>

                <motion.div
                    className="zomato-menu-item"
                    whileTap={{ background: '#fef2f2' }}
                    onClick={() => navigate('/admin')}
                    style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', padding: '20px' }}
                >
                    <i className="fas fa-shield-alt" style={{ color: 'var(--primary-color)' }}></i>
                    <span style={{ fontWeight: '900', color: 'var(--text-dark)' }}>Admin Command Center</span>
                    <i className="fas fa-external-link-alt" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}></i>
                </motion.div>
            </div>

            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ opacity: 0.1, fontWeight: 900, fontSize: '2.5rem', letterSpacing: '4px', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>KHALIYA</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px', fontWeight: '700' }}>v1.2.0 • Light Saffron Edition</p>
            </div>

            {/* Language Selection Modal */}
            <AnimatePresence>
                {showLangSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'flex-end'
                        }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                width: '100%',
                                background: 'var(--bg-body)',
                                borderTopLeftRadius: '30px',
                                borderTopRightRadius: '30px',
                                padding: '30px 20px 50px',
                                position: 'relative'
                            }}
                        >
                            <div style={{ width: '50px', height: '5px', background: 'var(--border-color)', borderRadius: '10px', margin: '0 auto 20px' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--primary-color)' }}>{t('reviews.selectLanguage')}</h3>
                                <button 
                                    onClick={() => setShowLangSelector(false)}
                                    style={{ background: 'var(--bg-surface)', border: 'none', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', boxShadow: 'var(--shadow-sm)' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <LanguageSwitcher mode="list" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
