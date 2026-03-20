import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function NativeProfile() {
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
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('khaliya_native_user');
            window.location.reload();
        }
    };

    const menuItems = [
        { icon: 'fas fa-thumbs-up', label: 'Your feedback' },
        { icon: 'fas fa-info-circle', label: 'About' },
        { icon: 'fas fa-edit', label: 'Send feedback' },
        { icon: 'fas fa-exclamation-triangle', label: 'Report a safety emergency' },
        { icon: 'fas fa-universal-access', label: 'Accessibility' },
        { icon: 'fas fa-cog', label: 'Settings' }
    ];

    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header / Back Arrow */}
            <div style={{ padding: '20px 15px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-arrow-left" style={{ fontSize: '1.2rem', color: '#1c1c1c' }}></i>
            </div>

            {/* Profile Card */}
            <div className="zomato-profile-card" style={{ marginBottom: '10px' }}>
                <div className="zomato-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{user.name}</h2>
                    <p style={{ color: '#696969', margin: '2px 0 5px 0', fontSize: '0.9rem' }}>{user.email}</p>
                    <span style={{ color: '#E23744', fontWeight: 500, fontSize: '0.85rem' }}>View profile <i className="fas fa-caret-right"></i></span>
                </div>
            </div>

            {/* 3D Digital Platinum Card */}
            <motion.div 
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ 
                    perspective: 1200, 
                    padding: '10px 15px',
                    marginBottom: '10px'
                }}
            >
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        width: '100%',
                        height: '200px',
                        background: 'linear-gradient(135deg, #111 0%, #2a2a2a 50%, #000 100%)',
                        borderRadius: '20px',
                        padding: '20px',
                        color: '#DAA520',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        transformStyle: 'preserve-3d',
                        border: '1px solid rgba(218, 165, 32, 0.4)'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(218, 165, 32, 0.15), transparent)', transform: 'skewX(-25deg)', animation: 'shimmer 4s infinite' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(30px)' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', fontWeight: '800', color: '#888' }}>ROYALTY PASS</div>
                            <div style={{ fontSize: '1rem', fontFamily: "'Playfair Display', serif", marginTop: '2px', color: '#fff' }}>Gold Elite</div>
                        </div>
                        <i className="fas fa-crown" style={{ fontSize: '1.5rem', color: '#DAA520' }}></i>
                    </div>

                    <div style={{ transform: 'translateZ(50px)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '1px', color: '#fff' }}>150</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#DAA520' }}>Spice Points</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', transform: 'translateZ(25px)' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px', color: '#ccc' }}>{user.name.toUpperCase()}</div>
                    </div>
                </motion.div>
            </motion.div>
            <style>{`@keyframes shimmer { 0% { left: -100% } 50% { left: 200% } 100% { left: 200% } }`}</style>

            {/* More Section */}
            <div className="more-section-title">More</div>

            <div className="zomato-settings-list">
                {menuItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        className="zomato-menu-item"
                        whileTap={{ background: '#f0f0f0' }}
                    >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                        <i className="fas fa-chevron-right"></i>
                    </motion.div>
                ))}

                <motion.div
                    className="zomato-menu-item profile-logout"
                    whileTap={{ background: '#fff5f5' }}
                    onClick={handleAppLogout}
                >
                    <i className="fas fa-power-off"></i>
                    <span>Log out</span>
                    <i className="fas fa-chevron-right"></i>
                </motion.div>
            </div>

            <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ opacity: 0.3, fontWeight: 700, fontSize: '2rem', letterSpacing: '2px', color: '#000' }}>khaliya</div>
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '5px' }}>v1.0.0 (Synced)</p>
            </div>
        </div>
    );
}
