import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const { getCartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [isInstallable, setIsInstallable] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        const handlePwaReady = (e) => {
            setIsInstallable(e.detail);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('khaliya-pwa-ready', handlePwaReady);
        
        // Initial check in case it already fired
        if (window.khaliya_pwa_prompt) setIsInstallable(true);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('khaliya-pwa-ready', handlePwaReady);
        };
    }, []);

    const cartCount = getCartCount();

    return (
        <>
            <motion.nav
                className={`main-nav ${scrolled ? 'nav-scrolled' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1000,
                    padding: scrolled ? '0.8rem 2rem' : '1.5rem 2rem',
                    background: scrolled ? 'var(--bg-glass)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(15px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--border-light)' : 'none',
                    transition: 'var(--transition)'
                }}
            >
                <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="nav-brand">
                        <h1 style={{ 
                            margin: 0, 
                            fontFamily: 'var(--font-heading)',
                            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.8rem',
                            letterSpacing: '1px'
                        }}>
                            {t('common.name')}
                        </h1>
                    </div>

                    <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Cart Icon */}
                        <div 
                            className="nav-cart-btn" 
                            onClick={() => setIsCartOpen(true)}
                            style={{ 
                                position: 'relative', 
                                cursor: 'pointer', 
                                fontSize: '1.3rem', 
                                color: 'var(--text-dark)',
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: scrolled ? 'rgba(142, 28, 28, 0.05)' : 'rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    background: 'var(--accent-color)',
                                    color: 'var(--secondary-color)',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}>{cartCount}</span>
                            )}
                        </div>

                        <LanguageSwitcher />
                        
                        <button 
                            className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
                            onClick={toggleMenu} 
                            aria-label="Toggle menu"
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}
                        >
                             <span style={{ width: '25px', height: '2.5px', background: 'var(--primary-color)', transition: 'var(--transition)', transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
                            <span style={{ width: '25px', height: '2.5px', background: 'var(--primary-color)', transition: 'var(--transition)', opacity: isMenuOpen ? 0 : 1 }}></span>
                            <span style={{ width: '25px', height: '2.5px', background: 'var(--primary-color)', transition: 'var(--transition)', transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
                        </button>
                    </div>

                    <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        height: '100vh',
                        width: isMenuOpen ? '100%' : '0',
                        background: 'var(--bg-body)',
                        backdropFilter: 'blur(20px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2.5rem',
                        transition: 'var(--transition)',
                        overflow: 'hidden',
                        zIndex: 999
                    }}>
                        <a href="#home" onClick={toggleMenu} style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)' }}>{t('nav.home')}</a>
                        <a href="#menu" onClick={toggleMenu} style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)' }}>{t('nav.menu')}</a>
                        <a href="#loyalty" onClick={toggleMenu} style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-color)' }}><i className="fas fa-gem" style={{ marginRight: '10px' }}></i> {t('nav.loyalty')}</a>
                        <a href="#reservations" onClick={toggleMenu} style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)' }}>{t('nav.reservations')}</a>
                        
                        <a href="#profile" onClick={() => {
                            // On the web version, #profile might not exist as a section, 
                            // but in PWA mode it's a view. 
                            // For now, let's just make it clear it's for the app.
                            toggleMenu();
                        }} style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                            <i className="fas fa-user-circle" style={{ marginRight: '10px' }}></i> {t('reviews.yourProfile') || 'My Account'}
                        </a>
                        
                        {isInstallable && (
                            <button 
                                onClick={() => {
                                    if (window.promptInstall) window.promptInstall();
                                    toggleMenu();
                                }}
                                style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '900', 
                                    color: '#FFF', 
                                    background: 'var(--gold-gradient)',
                                    border: 'none',
                                    padding: '15px 30px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <i className="fas fa-download"></i> {t('pwa.installBtn') || 'Download App'}
                            </button>
                        )}
                        <div style={{
                            marginTop: 'auto',
                            paddingBottom: '2rem',
                            opacity: 0.3,
                            fontSize: '0.8rem',
                            color: 'var(--primary-color)',
                            fontFamily: 'monospace'
                        }}>
                            v15.0.4-HARDENED
                        </div>
                    </div>
                </div>
            </motion.nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}

