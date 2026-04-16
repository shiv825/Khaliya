import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * NativeSplash Component
 * A luxury launching screen to give the PWA a true "Native App" feel.
 */
export default function NativeSplash({ onAnimationComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onAnimationComplete();
        }, 2500); // 2.5 seconds total
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <div className="native-splash" style={{
            height: '100vh',
            width: '100vw',
            background: 'var(--primary-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10000,
            overflow: 'hidden'
        }}>
            {/* Vibrant Background Saffron Glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '20%', left: '10%', width: '180px', height: '180px', background: '#F4A261', borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '220px', height: '220px', background: '#F4A261', borderRadius: '50%', filter: 'blur(100px)' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ textAlign: 'center', position: 'relative' }}
            >
                {/* Crown Logo Animation */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ marginBottom: '20px' }}
                >
                    <i className="fas fa-crown" style={{ fontSize: '4.5rem', color: '#FFD700', textShadow: '0 0 30px rgba(255, 215, 0, 0.4)' }}></i>
                </motion.div>

                {/* Brand Name Animation */}
                <motion.h1
                    initial={{ opacity: 0, letterSpacing: '15px' }}
                    animate={{ opacity: 1, letterSpacing: '6px' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    style={{
                        fontFamily: 'var(--font-heading)',
                        color: '#FFFFFF',
                        fontSize: '3.5rem',
                        margin: 0,
                        textTransform: 'uppercase',
                        fontWeight: '800',
                        textShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                >
                    Khaliya
                </motion.h1>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 1 }}
                    style={{
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
                        margin: '15px auto',
                        maxWidth: '200px'
                    }}
                ></motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    style={{
                        color: 'rgba(255, 255, 255, 0.85)',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                    }}
                >
                    Taste of Sanctuary
                </motion.p>
            </motion.div>

            {/* Premium Loading Bar at bottom */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '10%',
                    right: '10%',
                    height: '1px',
                    background: 'rgba(255, 215, 0, 0.2)',
                    transformOrigin: 'left'
                }}
            >
                <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        height: '100%',
                        width: '30%',
                        background: '#FFFFFF',
                        boxShadow: '0 0 10px #FFFFFF'
                    }}
                ></motion.div>
            </motion.div>
        </div>
    );
}
