import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingWidget() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 9999,
                        background: 'rgba(25, 25, 25, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                        borderRadius: '50px',
                        padding: '14px 28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    className="floating-widget-btn"
                    onClick={() => {
                        document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <i className="fas fa-calendar-check" style={{ color: '#E63946', fontSize: '1.2rem' }}></i>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Book Table</span>
                </motion.div>
            )}
            <style>{`
                .floating-widget-btn:hover {
                    box-shadow: 0 15px 45px rgba(230, 57, 70, 0.4) !important;
                    border-color: rgba(255,255,255,0.3) !important;
                }
            `}</style>
        </AnimatePresence>
    );
}
