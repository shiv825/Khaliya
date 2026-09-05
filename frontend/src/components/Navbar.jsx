import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const { getCartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 992);

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
        const handleResize = () => setIsDesktop(window.innerWidth > 992);
        window.addEventListener('resize', handleResize);
        
        // Initial check in case it already fired
        if (window.khaliya_pwa_prompt) setIsInstallable(true);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('khaliya-pwa-ready', handlePwaReady);
            window.removeEventListener('resize', handleResize);
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
                    padding: scrolled ? '0.8rem 2rem' : '1.2rem 2rem',
                    background: scrolled ? 'rgba(7, 10, 14, 0.92)' : 'rgba(7, 10, 14, 0.65)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                    boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.8)' : 'none',
                    transition: 'var(--transition)'
                }}
            >
                <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '100%', width: '100%', padding: '0 2vw' }}>
                    <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1.5px solid rgba(212, 175, 55, 0.6)',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)',
                            background: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img 
                                src="/khaliya-logo.jpg" 
                                alt="Khaliya Royal Logo" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div style={{ 
                                margin: 0, 
                                fontFamily: "'Cinzel', 'Playfair Display', serif",
                                background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '1.75rem',
                                fontWeight: '800',
                                letterSpacing: '2px',
                                lineHeight: '1.05'
                            }}>
                                KHALIYA
                            </div>
                            <div style={{
                                fontSize: '0.62rem',
                                fontWeight: '800',
                                color: '#D4AF37',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                marginTop: '3px',
                                opacity: 0.9
                            }}>
                                ROYAL INDIAN CUISINE
                            </div>
                        </div>
                    </Link>

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
                        
                        {!isDesktop && (
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
                        )}
                    </div>

                    <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} style={isDesktop ? {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem'
                    } : {
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
                        <NavLink 
                            to="/" 
                            end
                            onClick={() => setIsMenuOpen(false)}
                            style={({ isActive }) => isDesktop ? { color: isActive ? '#FFD700' : '#F8FAFC', fontWeight: '800', fontSize: '0.88rem', borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent', paddingBottom: '4px' } : { fontSize: '1.6rem', fontWeight: '800', color: isActive ? '#FFD700' : '#FFF' }}
                        >
                            {t('nav.home', 'Home')}
                        </NavLink>
                        
                        <NavLink 
                            to="/menu" 
                            onClick={() => setIsMenuOpen(false)}
                            style={({ isActive }) => isDesktop ? { color: isActive ? '#FFD700' : '#F8FAFC', fontWeight: '800', fontSize: '0.88rem', borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent', paddingBottom: '4px' } : { fontSize: '1.6rem', fontWeight: '800', color: isActive ? '#FFD700' : '#FFF' }}
                        >
                            {t('nav.menu', 'Menu')}
                        </NavLink>
                        
                        <NavLink 
                            to="/reserve" 
                            onClick={() => setIsMenuOpen(false)}
                            style={({ isActive }) => isDesktop ? { color: isActive ? '#FFD700' : '#F8FAFC', fontWeight: '800', fontSize: '0.88rem', borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent', paddingBottom: '4px' } : { fontSize: '1.6rem', fontWeight: '800', color: isActive ? '#FFD700' : '#FFF' }}
                        >
                            {t('nav.reservations', 'Reserve Table')}
                        </NavLink>

                        <NavLink 
                            to="/tables" 
                            onClick={() => setIsMenuOpen(false)}
                            style={({ isActive }) => isDesktop ? { color: isActive ? '#FFD700' : '#F8FAFC', fontWeight: '800', fontSize: '0.88rem', borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent', paddingBottom: '4px' } : { fontSize: '1.6rem', fontWeight: '800', color: isActive ? '#FFD700' : '#FFF' }}
                        >
                            Dining Spaces
                        </NavLink>

                        <NavLink 
                            to="/reviews" 
                            onClick={() => setIsMenuOpen(false)}
                            style={({ isActive }) => isDesktop ? { color: isActive ? '#FFD700' : '#F8FAFC', fontWeight: '800', fontSize: '0.88rem', borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent', paddingBottom: '4px' } : { fontSize: '1.6rem', fontWeight: '800', color: isActive ? '#FFD700' : '#FFF' }}
                        >
                            Reviews
                        </NavLink>

                        <NavLink 
                            to="/location" 
                            onClick={() => setIsMenuOpen(false)}
                            style={({ isActive }) => isDesktop ? { color: isActive ? '#FFD700' : '#F8FAFC', fontWeight: '800', fontSize: '0.88rem', borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent', paddingBottom: '4px' } : { fontSize: '1.6rem', fontWeight: '800', color: isActive ? '#FFD700' : '#FFF' }}
                        >
                            Hours &amp; Directions
                        </NavLink>
                        
                        {isInstallable && (
                            <button 
                                onClick={() => {
                                    if (window.promptInstall) window.promptInstall();
                                    toggleMenu();
                                }}
                                style={isDesktop ? {
                                    fontSize: '0.85rem', 
                                    fontWeight: '800', 
                                    color: '#FFF', 
                                    background: 'var(--gold-gradient)',
                                    border: 'none',
                                    padding: '8px 20px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                } : { 
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
                        {!isDesktop && (
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
                        )}
                    </div>
                </div>
            </motion.nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}

