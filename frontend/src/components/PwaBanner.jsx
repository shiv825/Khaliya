import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PwaBanner() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(iosDevice);

        const checkPwaState = () => {
            const isDismissed = sessionStorage.getItem('pwa_dismissed');
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            
            if (!isDismissed && !isStandalone) {
                // Show banner after brief delay
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 2000);
                return () => clearTimeout(timer);
            }
        };

        checkPwaState();

        const handlePwaReady = (e) => {
            if (e.detail && !sessionStorage.getItem('pwa_dismissed')) {
                setIsVisible(true);
            }
        };

        window.addEventListener('khaliya-pwa-ready', handlePwaReady);
        return () => window.removeEventListener('khaliya-pwa-ready', handlePwaReady);
    }, []);

    const handleInstallClick = () => {
        if (window.promptInstall) {
            const prompted = window.promptInstall();
            if (!prompted) {
                setShowInstructions(true);
            }
        } else {
            setShowInstructions(true);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem('pwa_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible && !showInstructions) return null;

    return (
        <>
            {/* Main PWA Install Floating Banner */}
            <div 
                id="pwaInstallBanner" 
                className={`pwa-install-banner ${isVisible ? 'active' : ''}`}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120%)',
                    width: 'calc(100% - 32px)',
                    maxWidth: '540px',
                    zIndex: 9990,
                    background: 'linear-gradient(135deg, rgba(15, 20, 30, 0.98) 0%, rgba(7, 10, 14, 0.98) 100%)',
                    border: '1.5px solid rgba(212, 175, 55, 0.6)',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.25)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: isVisible ? 'flex' : 'none',
                    alignItems: 'center',
                    gap: '16px'
                }}
            >
                {/* Logo Badge */}
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1.5px solid #D4AF37',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
                    flexShrink: 0,
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src="/khaliya-logo.jpg" 
                        alt="Khaliya Sanctuary Logo" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div 
                        id="pwaInstallTitle"
                        style={{
                            fontFamily: "'Cinzel', 'Playfair Display', serif",
                            color: '#FFD700',
                            fontWeight: '800',
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            lineHeight: '1.2',
                            marginBottom: '3px'
                        }}
                    >
                        {t('pwa.installTitle', 'Install Khaliya Sanctuary')}
                    </div>
                    <div 
                        id="pwaInstallDesc"
                        style={{
                            color: '#CBD5E1',
                            fontSize: '0.78rem',
                            lineHeight: '1.3',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {t('pwa.installDesc', 'Experience royal dining with instant table bookings & mobile orders.')}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                        id="pwaInstallBtn"
                        onClick={handleInstallClick}
                        style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                            color: '#000',
                            border: 'none',
                            padding: '9px 16px',
                            borderRadius: '10px',
                            fontWeight: '900',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <i className="fas fa-download" style={{ marginRight: '6px' }}></i>
                        {t('pwa.installBtn', 'Install')}
                    </button>
                    <button
                        id="pwaLaterBtn"
                        onClick={handleDismiss}
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#94A3B8',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '9px 12px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {t('pwa.cancelBtn', 'Later')}
                    </button>
                </div>
            </div>

            {/* Manual Installation Steps Modal (For iOS or standard browsers without automated prompt) */}
            {showInstructions && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setShowInstructions(false)}
                >
                    <div 
                        style={{
                            background: 'linear-gradient(180deg, #0F141E 0%, #070A0E 100%)',
                            border: '1.5px solid #D4AF37',
                            borderRadius: '24px',
                            padding: '24px',
                            maxWidth: '420px',
                            width: '100%',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.2)',
                            color: '#FFF'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src="/khaliya-logo.jpg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #D4AF37' }} />
                                <div>
                                    <div style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', fontWeight: '800', fontSize: '1.1rem' }}>
                                        {t('pwa.manualTitle', 'How to Install')}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Khaliya Sanctuary App</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowInstructions(false)}
                                style={{ background: 'none', border: 'none', color: '#FFD700', fontSize: '1.2rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '20px' }}>
                            {isIOS ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ background: '#D4AF37', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>1</span>
                                        <span>Tap the <strong>Share</strong> button <i className="fas fa-share-square" style={{ color: '#FFD700', marginLeft: '4px' }}></i> in Safari.</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ background: '#D4AF37', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>2</span>
                                        <span>Scroll down & tap <strong>"Add to Home Screen"</strong> <i className="fas fa-plus-square" style={{ color: '#FFD700', marginLeft: '4px' }}></i>.</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ background: '#D4AF37', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>3</span>
                                        <span>Tap <strong>Add</strong> at top right to launch instantly!</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ background: '#D4AF37', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>1</span>
                                        <span>Tap the menu <strong>⋮</strong> at top right of your browser.</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ background: '#D4AF37', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>2</span>
                                        <span>Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowInstructions(false)}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                                color: '#000',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
