import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NativeHome from './NativeHome';
import NativeMenu from './NativeMenu';
import NativeBook from './NativeBook';
import NativeProfile from './NativeProfile';
import NativeAuth from './NativeAuth';
import NativeCart from './NativeCart';
import OfferPopup from '../OfferPopup';
import AiAssistant from '../AiAssistant';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import '../../assets/native-style.css';

export default function NativeAppShell() {
    const [activeTab, setActiveTab] = useState('home');
    const langContext = useLanguage();
    const cartContext = useCart();
    
    const t = langContext ? langContext.t : (k, f) => f || k;
    const getCartCount = cartContext ? cartContext.getCartCount : () => 0;
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedUser = localStorage.getItem('khaliya_native_user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser).isLoggedIn;
            } catch (e) { return false; }
        }
        return false;
    });

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    // Smooth scroll to top when changing tabs
    const handleTabChange = (id) => {
        // Haptic feedback for tab change
        if ("vibrate" in navigator) {
            navigator.vibrate(10);
        }
        setActiveTab(id);
        window.scrollTo(0, 0);
    };

    // Component map for easy rendering
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'home':
                return <NativeHome key="home" setActiveTab={handleTabChange} />;
            case 'menu':
                return <NativeMenu key="menu" setActiveTab={handleTabChange} />;
            case 'cart':
                return <NativeCart key="cart" />;
            case 'book':
                return <NativeBook key="book" />;
            case 'profile':
                return <NativeProfile key="profile" />;
            default:
                return <NativeHome key="home" setActiveTab={handleTabChange} />;
        }
    };

    const cartCount = getCartCount();

    return (
        <AnimatePresence mode="wait">
            {!isAuthenticated ? (
                <motion.div
                    key="auth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                >
                    <NativeAuth onLoginSuccess={handleLoginSuccess} />
                </motion.div>
            ) : (
                <motion.div
                    key="app"
                    className="native-app-shell"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                    {/* Main Content Area */}
                    <div className="native-content-area custom-scrollbar-hide" style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        WebkitOverflowScrolling: 'touch',
                        paddingTop: 'env(safe-area-inset-top, 20px)' 
                    }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                style={{ minHeight: '100%' }}
                            >
                                {renderActiveTab()}
                            </motion.div>
                        </AnimatePresence>
                        <div style={{ height: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}></div>
                    </div>

                    {/* Bottom Navigation Bar */}
                    <div className="native-bottom-nav">
                        <button
                            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
                            onClick={() => handleTabChange('home')}
                        >
                            <i className="fas fa-home"></i>
                            <span>{t('nav.home')}</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
                            onClick={() => handleTabChange('menu')}
                        >
                            <i className="fas fa-utensils"></i>
                            <span>{t('nav.menu')}</span>
                        </button>
                        <button
                            className={`nav-tab book-btn ${activeTab === 'book' ? 'active' : ''}`}
                            onClick={() => handleTabChange('book')}
                        >
                            <div className="book-fab">
                                <i className="fas fa-calendar-alt"></i>
                            </div>
                            <span>{t('nav.reservations')}</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'cart' ? 'active' : ''}`}
                            onClick={() => handleTabChange('cart')}
                            style={{ position: 'relative' }}
                        >
                            <i className="fas fa-shopping-bag"></i>
                            <span>{t('nav.bag')}</span>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '15px',
                                    background: 'var(--primary-color)',
                                    color: '#FFFFFF',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '0.65rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>{cartCount}</span>
                            )}
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => handleTabChange('profile')}
                        >
                            <i className="fas fa-user-circle"></i>
                            <span>{t('nav.profile')}</span>
                        </button>
                    </div>
                    <AiAssistant />
                    <OfferPopup />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
