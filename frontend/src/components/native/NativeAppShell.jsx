import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NativeHome from './NativeHome';
import NativeMenu from './NativeMenu';
import NativeBook from './NativeBook';
import NativeProfile from './NativeProfile';
import NativeAuth from './NativeAuth';
import NativeCart from './NativeCart';
import OfferPopup from '../OfferPopup';
import { useCart } from '../../context/CartContext';
import '../../assets/native-style.css';

export default function NativeAppShell() {
    const [activeTab, setActiveTab] = useState('home');
    const { getCartCount } = useCart();
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
        setActiveTab(id);
        window.scrollTo(0, 0);
    };

    // Component map for easy rendering
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'home':
                return <NativeHome key="home" setActiveTab={handleTabChange} />;
            case 'menu':
                return <NativeMenu key="menu" />;
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
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    <NativeAuth onLoginSuccess={handleLoginSuccess} />
                </motion.div>
            ) : (
                <motion.div
                    key="app"
                    className="native-app-shell"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Main Content Area: Renders only the active tab with smooth transition */}
                    <div className="native-content-area custom-scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                style={{ minHeight: '100%' }}
                            >
                                {renderActiveTab()}
                            </motion.div>
                        </AnimatePresence>
                        <div style={{ height: '80px' }}></div> {/* Safe area for bottom nav */}
                    </div>

                    {/* Bottom Navigation Bar */}
                    <div className="native-bottom-nav">
                        <button
                            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
                            onClick={() => handleTabChange('home')}
                        >
                            <i className="fas fa-home"></i>
                            <span>Home</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
                            onClick={() => handleTabChange('menu')}
                        >
                            <i className="fas fa-utensils"></i>
                            <span>Menu</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'cart' ? 'active' : ''}`}
                            onClick={() => handleTabChange('cart')}
                            style={{ position: 'relative' }}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '15px',
                                    background: 'var(--primary-color, #DAA520)',
                                    color: '#0a0a0a',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '0.65rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    border: '2px solid #0a0a0a'
                                }}>{cartCount}</span>
                            )}
                        </button>
                        <button
                            className={`nav-tab book-btn ${activeTab === 'book' ? 'active' : ''}`}
                            onClick={() => handleTabChange('book')}
                        >
                            <div className="book-fab" style={{ 
                                background: 'linear-gradient(135deg, var(--primary-color, #DAA520), var(--accent-color, #FFD700))',
                                color: '#0a0a0a',
                                boxShadow: '0 8px 15px rgba(218, 165, 32, 0.4)'
                            }}>
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <span style={{ color: activeTab === 'book' ? 'var(--primary-color, #DAA520)' : '#888' }}>Book</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => handleTabChange('profile')}
                        >
                            <i className="fas fa-user-circle"></i>
                            <span>Profile</span>
                        </button>
                    </div>
                    <OfferPopup />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

