import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer 
            style={{ 
                background: '#040608', 
                padding: '5rem 2rem 2.5rem 2rem', 
                textAlign: 'center', 
                borderTop: '1.5px solid rgba(212, 175, 55, 0.3)', 
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Logo Emblem */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(212, 175, 55, 0.6)',
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.35)',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src="/khaliya-logo.jpg" 
                        alt="Khaliya Logo" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ 
                        fontFamily: "'Cinzel', 'Playfair Display', serif",
                        background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.9rem',
                        fontWeight: '800',
                        letterSpacing: '2px',
                        lineHeight: '1'
                    }}>
                        KHALIYA
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '3px' }}>
                        ROYAL INDIAN CUISINE
                    </div>
                </div>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.7' }}>
                Experience the grandeur of royal Indian dining — where ancient dum-pukht recipes and heritage spices create unforgettable culinary memories.
            </p>

            <div className="social-links" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0' }}>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Facebook</a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Instagram</a>
                <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>WhatsApp</a>
            </div>

            <div className="pwa-footer-install" style={{ margin: '2rem 0' }}>
                <button 
                    onClick={() => {
                        if (window.promptInstall) window.promptInstall();
                        else if (window.forceShowPwaBanner) window.forceShowPwaBanner();
                    }}
                    style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1.5px solid #D4AF37',
                        color: '#FFD700',
                        padding: '14px 30px',
                        borderRadius: '50px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        boxShadow: '0 6px 20px rgba(212, 175, 55, 0.2)'
                    }}
                >
                    <i className="fas fa-mobile-alt" style={{ marginRight: '8px' }}></i> Install Official Khaliya App
                </button>
            </div>

            <div className="copyright" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', marginTop: '2rem' }}>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                    &copy; 2026 <span style={{ color: '#D4AF37', fontWeight: '800' }}>KHALIYA</span>. Royal Indian Fine Dining. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}
