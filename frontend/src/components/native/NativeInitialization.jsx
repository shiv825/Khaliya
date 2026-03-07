import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NativeInitialization({ onComplete }) {
    const [step, setStep] = useState(0);
    const [deviceInfo, setDeviceInfo] = useState({
        name: 'Device',
        type: 'Mobile',
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        optimization: 'Standard'
    });

    const steps = [
        { id: 'boot', label: 'Initializing Khaliya...', icon: 'fas fa-power-off' },
        { id: 'verify', label: 'Verifying Integrity...', icon: 'fas fa-shield-alt' },
        { id: 'detect', label: 'Detecting Hardware...', icon: 'fas fa-microchip' },
        { id: 'optimize', label: 'Optimizing for Device...', icon: 'fas fa-bolt' },
        { id: 'finalize', label: 'System Ready', icon: 'fas fa-check-circle' }
    ];

    useEffect(() => {
        // Mock device detection
        const ua = navigator.userAgent;
        let name = 'Smart Device';
        if (/iPhone/.test(ua)) name = 'iPhone';
        else if (/Android/.test(ua)) name = 'Android Device';

        const perf = window.deviceMemory > 4 ? 'High Performance' : 'Balanced';

        setDeviceInfo(prev => ({
            ...prev,
            name: name,
            optimization: perf
        }));

        // Progression sequence
        const timers = [
            setTimeout(() => setStep(1), 1200),
            setTimeout(() => setStep(2), 2500),
            setTimeout(() => setStep(3), 3800),
            setTimeout(() => setStep(4), 5200),
            setTimeout(() => onComplete(), 6500)
        ];

        return () => timers.forEach(t => clearTimeout(t));
    }, [onComplete]);

    return (
        <div className="native-initialization-screen" style={{
            background: '#0a0a0a',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Scanner Pulse */}
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #E23744 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '80%' }}>
                {/* Logo Pulse */}
                <motion.div
                    animate={{ scale: [0.95, 1, 0.95] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: '#E23744',
                        letterSpacing: '5px',
                        marginBottom: '40px',
                        fontFamily: "'Playfair Display', serif"
                    }}
                >
                    KHALIYA
                </motion.div>

                {/* Status List */}
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {steps.map((s, idx) => (
                        <div key={s.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: idx === steps.length - 1 ? 0 : '15px',
                            opacity: step >= idx ? 1 : 0.3,
                            transition: 'all 0.5s ease'
                        }}>
                            <div style={{ width: '24px', textAlign: 'center' }}>
                                {step > idx ? (
                                    <i className="fas fa-check" style={{ color: '#4CAF50' }}></i>
                                ) : step === idx ? (
                                    <i className={`${s.icon} fa-spin`} style={{ color: '#E23744' }}></i>
                                ) : (
                                    <i className={s.icon}></i>
                                )}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: step === idx ? 600 : 400 }}>
                                {step === 3 && idx === 3 ? `Optimizing for ${deviceInfo.name}` : s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Device Info Tag */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    style={{
                        marginTop: '30px',
                        fontSize: '0.7rem',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    System Protocol: {deviceInfo.optimization} Mode // {deviceInfo.resolution}
                </motion.div>

                {/* Scanning Bar */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: 0,
                    right: 0,
                    height: '110%',
                    pointerEvents: 'none',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{
                            height: '2px',
                            width: '100%',
                            background: 'linear-gradient(90deg, transparent, #E23744, transparent)',
                            boxShadow: '0 0 15px #E23744',
                            position: 'absolute'
                        }}
                    />
                </div>
            </div>

            {/* Version Footer */}
            <div style={{ position: 'absolute', bottom: '40px', fontSize: '0.8rem', color: '#444' }}>
                v1.0.4-STABLE // BUILD 2026.03.08
            </div>
        </div>
    );
}
