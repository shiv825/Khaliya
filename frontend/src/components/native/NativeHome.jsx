import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeHome({ setActiveTab }) {
    const { t } = useLanguage();

    // Quick mock data for popular items
    const popularItems = [
        { id: 1, name: "Butter Chicken", price: "₹450", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&fit=crop" },
        { id: 2, name: "Garlic Naan", price: "₹80", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&fit=crop" },
        { id: 3, name: "Mutton Biryani", price: "₹550", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&fit=crop" },
    ];

    return (
        <div className="native-home">
            {/* Header Section */}
            <motion.div
                className="native-header"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="header-top">
                    <div className="greeting">
                        <h2>{t('hero.title') || 'Welcome to Khaliya'}</h2>
                        <p className="subtitle">{t('header.sub') || 'Authentic Indian Cuisine'}</p>
                    </div>
                    <div className="user-avatar" onClick={() => setActiveTab('profile')}>
                        <img src="https://ui-avatars.com/api/?name=Guest+User&background=E63946&color=fff" alt="User" />
                    </div>
                </div>
            </motion.div>

            {/* Hero Card */}
            <motion.div
                className="native-hero-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={() => setActiveTab('book')}
            >
                <div className="hero-content">
                    <h3>Reserve Your Table</h3>
                    <p>Skip the wait. Book your dining experience now.</p>
                    <button className="native-btn-primary">Book Now</button>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="native-quick-actions"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="action-circle" onClick={() => setActiveTab('menu')}>
                    <div className="icon-wrapper menu-icon"><i className="fas fa-book-open"></i></div>
                    <span>Menu</span>
                </div>
                <div className="action-circle" onClick={() => setActiveTab('book')}>
                    <div className="icon-wrapper book-icon"><i className="fas fa-chair"></i></div>
                    <span>Tables</span>
                </div>
                <div className="action-circle" onClick={() => setActiveTab('profile')}>
                    <div className="icon-wrapper loyalty-icon"><i className="fas fa-gift"></i></div>
                    <span>Rewards</span>
                </div>
                <div className="action-circle">
                    <div className="icon-wrapper map-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <span>Location</span>
                </div>
            </motion.div>

            {/* Horizontal Carousel: Popular Items */}
            <motion.div
                className="native-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="section-header">
                    <h3>Popular Right Now</h3>
                    <span className="see-all" onClick={() => setActiveTab('menu')}>See All</span>
                </div>

                <div className="horizontal-scroll">
                    {popularItems.map((item, index) => (
                        <div className="food-card-mini" key={item.id}>
                            <div className="food-img">
                                <img src={item.image} alt={item.name} />
                                <div className="add-btn"><i className="fas fa-plus"></i></div>
                            </div>
                            <div className="food-info">
                                <h4>{item.name}</h4>
                                <span className="price">{item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Spacer for bottom nav */}
            <div style={{ height: '30px' }}></div>
        </div>
    );
}
