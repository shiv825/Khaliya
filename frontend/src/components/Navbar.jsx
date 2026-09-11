import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import AuthModal from './AuthModal';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const { getCartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
    const [isInstallable, setIsInstallable] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('khaliya_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const saved = localStorage.getItem('khaliya_user');
                setUser(saved ? JSON.parse(saved) : null);
            } catch (e) {}
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        const handlePwaReady = (e) => {
            setIsInstallable(e.detail);
        };

        const handleResize = () => {
            const desktopState = window.innerWidth >= 992;
            setIsDesktop(desktopState);
            if (desktopState) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('khaliya-pwa-ready', handlePwaReady);
        window.addEventListener('resize', handleResize);
        
        if (window.khaliya_pwa_prompt) setIsInstallable(true);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('khaliya-pwa-ready', handlePwaReady);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Prevent body scrolling when mobile menu drawer is open
    useEffect(() => {
        if (isMenuOpen && !isDesktop) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen, isDesktop]);

    const cartCount = getCartCount();

    const mainNavLinks = [
        { path: '/', label: t('nav.home', 'Home'), icon: 'fa-home' },
        { path: '/menu', label: t('nav.menu', 'Menu'), icon: 'fa-utensils' },
        { path: '/reserve', label: t('nav.reservations', 'Reserve Table'), icon: 'fa-chair' },
        { path: '/tables', label: 'Dining Spaces', icon: 'fa-gem' }
    ];

    const legalNavLinks = [
        { path: '/privacy-policy', label: 'Privacy Policy' },
        { path: '/terms-and-conditions', label: 'Terms & Conditions' },
        { path: '/refund-policy', label: 'Refund & Cancellation' },
        { path: '/contact', label: 'Contact Us' }
    ];

    return (
        <>
            <motion.nav
                className={`main-nav ${scrolled ? 'nav-scrolled' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1000,
                    padding: scrolled ? '0.7rem 1.2rem' : '1rem 1.5rem',
                    background: scrolled ? 'rgba(7, 10, 14, 0.95)' : 'rgba(7, 10, 14, 0.78)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.85)' : 'none',
                    transition: 'var(--transition)'
                }}
            >
                <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
                    {/* Brand Logo & Title */}
                    <Link to="/" className="nav-brand" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1.5px solid rgba(212, 175, 55, 0.7)',
                            boxShadow: '0 0 15px rgba(212, 175, 55, 0.35)',
                            background: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
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
                                fontSize: '1.55rem',
                                fontWeight: '800',
                                letterSpacing: '1.5px',
                                lineHeight: '1'
                            }}>
                                KHALIYA
                            </div>
                            <div className="brand-subtitle" style={{
                                fontSize: '0.58rem',
                                fontWeight: '800',
                                color: '#D4AF37',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                marginTop: '2px',
                                opacity: 0.9
                            }}>
                                ROYAL INDIAN CUISINE
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    {isDesktop && (
                        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
                            {mainNavLinks.map((link) => (
                                <NavLink 
                                    key={link.path}
                                    to={link.path} 
                                    end={link.path === '/'}
                                    style={({ isActive }) => ({
                                        color: isActive ? '#FFD700' : '#F8FAFC',
                                        fontWeight: '800',
                                        fontSize: '0.86rem',
                                        borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent',
                                        paddingBottom: '4px',
                                        textDecoration: 'none',
                                        transition: 'var(--transition)'
                                    })}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Right Side Header Controls */}
                    <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Cart Icon - Direct Link to /cart Page */}
                        <Link 
                            to="/cart"
                            className="nav-cart-btn" 
                            aria-label="View Shopping Cart Page"
                            style={{ 
                                position: 'relative', 
                                cursor: 'pointer', 
                                fontSize: '1.1rem', 
                                color: '#FFD700',
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                textDecoration: 'none'
                            }}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#E53E3E',
                                    color: '#FFF',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '0.68rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '900',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                                }}>{cartCount}</span>
                            )}
                        </Link>

                        {/* User Account / Profile Button */}
                        {user && user.isLoggedIn ? (
                            <Link 
                                to="/profile"
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    background: 'rgba(212, 175, 55, 0.15)', 
                                    border: '1.5px solid #D4AF37', 
                                    color: '#FFD700', 
                                    padding: '6px 14px', 
                                    borderRadius: '50px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: '800', 
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.2)'
                                }}
                            >
                                <span>👑</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                                    {user.name || 'Profile'}
                                </span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAuthModalOpen(true)}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', 
                                    color: '#000', 
                                    border: 'none', 
                                    padding: '7px 16px', 
                                    borderRadius: '50px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: '900', 
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <i className="fas fa-lock" style={{ fontSize: '0.75rem' }}></i>
                                <span>Sign In</span>
                            </button>
                        )}

                        {/* Language Switcher (Desktop Header Only) */}
                        {isDesktop && <LanguageSwitcher mode="dropdown" />}

                        {/* Mobile Menu Toggle Button (Icon Only) */}
                        {!isDesktop && (
                            <button 
                                onClick={toggleMenu}
                                aria-label="Toggle mobile menu"
                                style={{
                                    background: isMenuOpen ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.12)',
                                    border: '1.5px solid #D4AF37',
                                    color: '#FFD700',
                                    borderRadius: '10px',
                                    width: '38px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '1.1rem' }}></i>
                            </button>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Full-Screen Navigation Drawer Overlay */}
            <AnimatePresence>
                {!isDesktop && isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'linear-gradient(180deg, #070A0E 0%, #030508 100%)',
                            backdropFilter: 'blur(25px)',
                            WebkitBackdropFilter: 'blur(25px)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1.2rem 1.5rem 2rem 1.5rem',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Drawer Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="/khaliya-logo.jpg" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #D4AF37' }} />
                                <span style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '1.5px' }}>
                                    KHALIYA
                                </span>
                            </div>
                            <button
                                onClick={toggleMenu}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(212, 175, 55, 0.4)',
                                    color: '#FFD700',
                                    borderRadius: '50%',
                                    width: '38px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* User Profile Card Inside Drawer */}
                        <div style={{ marginBottom: '1.2rem', background: 'rgba(15, 20, 30, 0.75)', padding: '14px 16px', borderRadius: '16px', border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            {user && user.isLoggedIn ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #D4AF37)', color: '#000', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : '👑'}
                                        </div>
                                        <div>
                                            <div style={{ color: '#FFF', fontWeight: '800', fontSize: '0.9rem' }}>{user.name || 'Royal Member'}</div>
                                            <div style={{ color: '#FFD700', fontSize: '0.72rem', fontWeight: '700' }}>⭐️ {user.spicePoints || 750} Spice Points</div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', color: '#FFD700', padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none' }}
                                    >
                                        Profile
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.88rem' }}>Guest Account</div>
                                        <div style={{ color: '#CBD5E1', fontSize: '0.72rem' }}>Sign in to save orders &amp; earn rewards</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setIsMenuOpen(false); setIsAuthModalOpen(true); }}
                                        style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)', color: '#000', border: 'none', padding: '7px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '900', cursor: 'pointer' }}
                                    >
                                        🔐 Sign In
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Language Selector Inside Drawer (Segmented Theme) */}
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(15, 20, 30, 0.6)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Preferred Language / भाषा
                            </div>
                            <LanguageSwitcher mode="segmented" />
                        </div>

                        {/* Navigation Links Group */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Dining &amp; Exploration
                            </div>

                            {mainNavLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    end={link.path === '/'}
                                    onClick={() => setIsMenuOpen(false)}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '14px 18px',
                                        background: isActive ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)' : 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${isActive ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        borderRadius: '14px',
                                        color: isActive ? '#FFD700' : '#F8FAFC',
                                        fontWeight: '800',
                                        fontSize: '1.05rem',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease'
                                    })}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <i className={`fas ${link.icon}`} style={{ color: isActive ? '#FFD700' : '#D4AF37', fontSize: '1.1rem', width: '22px' }}></i>
                                            <span>{link.label}</span>
                                            <i className="fas fa-chevron-right" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: isActive ? '#FFD700' : 'rgba(255,255,255,0.2)' }}></i>
                                        </>
                                    )}
                                </NavLink>
                            ))}

                            {/* Prominent Small-Screen PWA Install Card under Menu */}
                            <div 
                                style={{
                                    marginTop: '8px',
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(15, 20, 30, 0.8) 100%)',
                                    border: '1.5px solid #D4AF37',
                                    borderRadius: '16px',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.2)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img 
                                        src="/khaliya-logo.jpg" 
                                        alt="Logo" 
                                        style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1.5px solid #D4AF37', objectFit: 'cover' }} 
                                    />
                                    <div>
                                        <div style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', fontWeight: '800', fontSize: '0.95rem', lineHeight: '1.2' }}>
                                            Khaliya App
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '2px', fontWeight: '500' }}>
                                            ⚡ Fast &amp; Offline Access
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        let prompted = false;
                                        if (window.promptInstall) prompted = window.promptInstall();
                                        if (!prompted && window.forceShowPwaBanner) window.forceShowPwaBanner();
                                        setIsMenuOpen(false);
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                                        color: '#000',
                                        border: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        fontWeight: '900',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <i className="fas fa-download"></i> Install
                                </button>
                            </div>
                        </div>

                        {/* Razorpay & Statutory Legal Section in Mobile Menu */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', background: 'rgba(15, 20, 30, 0.6)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Merchant Policies &amp; Legal
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {legalNavLinks.map(legal => (
                                    <Link
                                        key={legal.path}
                                        to={legal.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{
                                            color: '#CBD5E1',
                                            fontSize: '0.78rem',
                                            textDecoration: 'none',
                                            padding: '6px 8px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <i className="fas fa-shield-alt" style={{ fontSize: '0.65rem', color: '#D4AF37' }}></i>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{legal.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Drawer Bottom Info */}
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                Khaliya Hospitality Private Limited
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#D4AF37', marginTop: '2px', fontWeight: '700' }}>
                                FSSAI: 12723000000000 • GSTIN: 09AAAAA0000A1Z5
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Quick Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(userData) => setUser(userData)}
            />
        </>
    );
}

