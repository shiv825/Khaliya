import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NativeHome from './NativeHome';
import NativeMenu from './NativeMenu';
import NativeBook from './NativeBook';
import NativeProfile from './NativeProfile';
import { useLanguage } from '../../context/LanguageContext';
import '../../assets/native-style.css';

export default function NativeAppShell() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('home');

    // Simple mapping of tab to component
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <NativeHome setActiveTab={setActiveTab} />;
            case 'menu':
                return <NativeMenu />;
            case 'book':
                return <NativeBook />;
            case 'profile':
                return <NativeProfile />;
            default:
                return <NativeHome setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="native-app-shell">
            {/* Main Content Area: Animate Presence for smooth tab switching */}
            <div className="native-content-area">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="native-scrollable"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="native-bottom-nav">
                <button
                    className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')}
                >
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                </button>
                <button
                    className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
                    onClick={() => setActiveTab('menu')}
                >
                    <i className="fas fa-utensils"></i>
                    <span>Menu</span>
                </button>
                <button
                    className={`nav-tab book-btn ${activeTab === 'book' ? 'active' : ''}`}
                    onClick={() => setActiveTab('book')}
                >
                    <div className="book-fab">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <span>Book</span>
                </button>
                <button
                    className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <i className="fas fa-user-circle"></i>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    );
}
