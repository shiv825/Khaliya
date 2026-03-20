import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const { getCartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                            background: 'linear-gradient(135deg, #FFF 0%, var(--accent-light) 100%)',
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
                                color: '#fff',
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: scrolled ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)'
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

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="language-selector"
                            title="Select language"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                outline: 'none',
                                fontSize: '0.8rem'
                            }}
                        >
                            <option value="en" style={{ background: '#121212' }}>EN</option>
                            <option value="hi" style={{ background: '#121212' }}>हिंदी</option>
                            <option value="ar" style={{ background: '#121212' }}>عربي</option>
                        </select>
                        
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
                            <span style={{ width: '25px', height: '2px', background: '#fff', transition: 'var(--transition)', transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
                            <span style={{ width: '25px', height: '2px', background: '#fff', transition: 'var(--transition)', opacity: isMenuOpen ? 0 : 1 }}></span>
                            <span style={{ width: '25px', height: '2px', background: '#fff', transition: 'var(--transition)', transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
                        </button>
                    </div>

                    <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        height: '100vh',
                        width: isMenuOpen ? '100%' : '0',
                        background: 'rgba(8, 8, 12, 0.98)',
                        backdropFilter: 'blur(15px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2rem',
                        transition: 'var(--transition)',
                        overflow: 'hidden',
                        zIndex: 999
                    }}>
                        <a href="#home" onClick={toggleMenu} style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{t('nav.home')}</a>
                        <a href="#menu" onClick={toggleMenu} style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{t('nav.menu')}</a>
                        <a href="#loyalty" onClick={toggleMenu} style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-color)' }}><i className="fas fa-gem" style={{ marginRight: '10px' }}></i> {t('nav.loyalty')}</a>
                        <a href="#reservations" onClick={toggleMenu} style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{t('nav.reservations')}</a>
                        <a href="#contact" onClick={toggleMenu} style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{t('nav.contact')}</a>
                        
                        <button 
                            onClick={toggleMenu} 
                            style={{ 
                                position: 'absolute', 
                                top: '2rem', 
                                right: '2rem', 
                                background: 'none', 
                                border: 'none', 
                                color: '#fff', 
                                fontSize: '2rem', 
                                cursor: 'pointer' 
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </motion.nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}

