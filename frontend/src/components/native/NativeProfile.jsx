import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function NativeProfile() {
    const navigate = useNavigate();
    const { t, language = 'en' } = useLanguage();
    const [showLangSelector, setShowLangSelector] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'membership', 'feedback', 'about', 'settings'
    
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    let user = { name: 'shiv', email: 'shivkumarrdn7@gmail.com', phone: '8252731784' };
    try {
        if (storedUserStr) user = JSON.parse(storedUserStr);
    } catch (e) {
        console.warn('⚠️ [NativeProfile] User data corrupted');
    }

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

    // Detect if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    const baseMenuItems = [
        { icon: 'fas fa-globe', label: t('reviews.selectLanguage'), action: () => setShowLangSelector(true) },
        { icon: 'fas fa-thumbs-up', label: 'Your feedback', action: () => setActiveModal('feedback') },
        { icon: 'fas fa-info-circle', label: 'About', action: () => setActiveModal('about') },
        { icon: 'fas fa-cog', label: 'Settings', action: () => setActiveModal('settings') }
    ];

    // Only add download option if NOT in standalone mode
    const menuItems = isStandalone ? baseMenuItems : [
        { icon: 'fas fa-arrow-alt-circle-down', label: 'Download Khaliya App', action: () => {
            if (window.promptInstall) {
                window.promptInstall();
            } else {
                alert('App download is currently unavailable. Please refresh and try again.');
            }
        }},
        ...baseMenuItems
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
                    <span onClick={() => setActiveModal('membership')} style={{ color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>{t('reviews.memberSettings')} <i className="fas fa-caret-right"></i></span>
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
                            background: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
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

            {/* Profile Detail Modals */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'var(--bg-body)',
                            zIndex: 3000,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', padding: '10px', marginRight: '10px' }}>
                                <i className="fas fa-arrow-left" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                            </button>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)', margin: 0, textTransform: 'capitalize' }}>
                                {activeModal === 'membership' ? 'Saffron Membership' : activeModal}
                            </h2>
                        </div>

                        <div style={{ flex: 1, padding: '30px 20px', overflowY: 'auto' }}>
                            {activeModal === 'membership' && (
                                <div style={{ textAlign: 'center' }}>
                                    <i className="fas fa-crown" style={{ fontSize: '4rem', color: 'var(--primary-color)', marginBottom: '20px' }}></i>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)' }}>Saffron Select</h3>
                                    <p style={{ color: 'var(--text-light)', fontWeight: '600' }}>You have 750 Spice Points</p>
                                    <div style={{ marginTop: '30px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ color: 'var(--primary-color)', fontWeight: '800' }}>Member Perks</h4>
                                        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                            <li style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}><i className="fas fa-star" style={{ color: '#F4A261' }}></i> Priority Seating</li>
                                            <li style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}><i className="fas fa-star" style={{ color: '#F4A261' }}></i> Complimentary Dessert</li>
                                            <li style={{ display: 'flex', gap: '10px' }}><i className="fas fa-star" style={{ color: '#F4A261' }}></i> Exclusive Tasting Events</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'feedback' && (
                                <div>
                                    <textarea 
                                        placeholder="How was your experience at Khaliya?"
                                        style={{ width: '100%', height: '150px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '15px', outline: 'none', color: 'var(--text-dark)', fontWeight: '500' }}
                                    ></textarea>
                                    <button 
                                        onClick={() => { Swal.fire({ title: 'Thank you!', text: 'Your feedback matters.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); setActiveModal(null); }}
                                        style={{ width: '100%', background: 'var(--primary-color)', color: '#FFF', border: 'none', padding: '15px', borderRadius: '20px', fontWeight: '800', marginTop: '20px' }}
                                    >Submit Feedback</button>
                                </div>
                            )}

                            {activeModal === 'about' && (
                                <div style={{ color: 'var(--text-dark)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>Our Legacy</h3>
                                    <p style={{ fontWeight: '500', lineHeight: '1.6' }}>Khaliya Sanctuary is more than just a restaurant; it is a celebration of the legendary saffron heritage, blending authentic Indian flavors with modern culinary artistry.</p>
                                    <div style={{ marginTop: '20px' }}>
                                        <p><strong>Address:</strong> High Street, Flavor Town</p>
                                        <p><strong>Hours:</strong> 11:00 AM - 11:00 PM</p>
                                        <p><strong>Contact:</strong> +91 82527 31784</p>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'settings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700' }}>Push Notifications</span>
                                        <div style={{ width: '40px', height: '20px', background: 'var(--primary-color)', borderRadius: '10px' }}></div>
                                    </div>
                                    <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700' }}>Offline Mode</span>
                                        <div style={{ width: '40px', height: '20px', background: 'var(--border-color)', borderRadius: '10px' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
