import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeHome({ setActiveTab }) {
    // Standard mock user in case localStorage is empty, though Auth intercepts this
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    const user = storedUserStr ? JSON.parse(storedUserStr) : { name: 'Guest' };
    const firstName = user.name ? user.name.split(' ')[0] : 'Guest';
    const { t } = useLanguage();

    // High-quality mock data for popular items
    const popularItems = [
        { id: 1, name: "Butter Chicken", price: "₹450", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&fit=crop", tag: "Bestseller" },
        { id: 2, name: "Garlic Naan", price: "₹80", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&fit=crop", tag: "Must Try" },
        { id: 3, name: "Mutton Biryani", price: "₹550", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&fit=crop", tag: "Chef's Special" },
        { id: 4, name: "Crispy Samosa", price: "₹60", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&fit=crop", tag: "Snack" },
    ];

    const offers = [
        { id: 1, title: "20% OFF", desc: "On your first order", code: "WELCOME20", bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)", color: "#d32f2f" },
        { id: 2, title: "Free Dessert", desc: "On orders above ₹1000", code: "SWEET", bg: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)", color: "#4a148c" }
    ];

    const reviews = [
        { id: 1, name: "Rahul S.", rating: 5, text: "Best Butter Chicken in town! Totally recommend it to everyone." },
        { id: 2, name: "Priya M.", rating: 5, text: "The booking process was so smooth. Loved the ambiance!" },
        { id: 3, name: "Amit K.", rating: 4, text: "Authentic taste, reminds me of classic Indian street food." }
    ];

    return (
        <div className="native-home" id="native-home">
            {/* Header Section */}
            <motion.div
                className="native-header"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ marginBottom: '25px' }}
            >
                <div className="header-top">
                    <div className="greeting">
                        <h2>Hi, {firstName} 👋</h2>
                        <p className="subtitle">Ready for your next meal?</p>
                    </div>
                    <motion.div
                        className="user-avatar"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab('profile')}
                    >
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Guest User')}&background=E63946&color=fff`} alt="User" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Live Order Tracking Mock */}
            <motion.div
                className="native-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="section-header">
                    <h3>Current Order</h3>
                    <motion.span whileTap={{ scale: 0.95 }} className="see-all">Track <i className="fas fa-chevron-right"></i></motion.span>
                </div>
                <motion.div
                    className="table-card"
                    whileTap={{ scale: 0.98 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: 'var(--bg-card, #fff)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(230, 57, 70, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E63946', fontSize: '1.2rem' }}>
                            <i className="fas fa-motorcycle"></i>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--text-main, #222)' }}>On the way!</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>Arriving in 15 mins</span>
                        </div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#E63946', fontSize: '0.9rem' }}>
                        Preparing
                    </div>
                </motion.div>
            </motion.div>

            {/* Hero Card (Moved up) */}
            <motion.div
                className="native-hero-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onClick={() => setActiveTab('book')}
                style={{ marginBottom: '35px', cursor: 'pointer' }}
            >
                <div className="hero-content">
                    <h3>Reserve Your Table</h3>
                    <p>Skip the wait by booking in advance.</p>
                    <motion.button whileTap={{ scale: 0.9 }} className="native-btn-primary">Book Now</motion.button>
                </div>
            </motion.div>

            {/* Active Offers Section */}
            <motion.div
                className="native-offers"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <div className="horizontal-scroll" style={{ paddingBottom: '20px', margin: '0 -20px', padding: '0 20px', scrollPadding: '20px' }}>
                    {offers.map(offer => (
                        <motion.div
                            key={offer.id}
                            className="offer-card"
                            whileTap={{ scale: 0.96 }}
                            style={{ background: offer.bg, minWidth: '260px', padding: '20px', borderRadius: '16px', color: offer.color, position: 'relative', overflow: 'hidden', scrollSnapAlign: 'start', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                        >
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: '800' }}>{offer.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{offer.desc}</p>
                            <div style={{ marginTop: '15px', background: 'rgba(255,255,255,0.4)', display: 'inline-block', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                Code: {offer.code}
                            </div>
                            <i className="fas fa-gift" style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '5rem', opacity: 0.15 }}></i>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="native-quick-actions"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ marginTop: '10px', marginBottom: '35px' }}
            >
                <motion.div className="action-circle" whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('menu')}>
                    <div className="icon-wrapper menu-icon"><i className="fas fa-book-open"></i></div>
                    <span>Menu</span>
                </motion.div>
                <motion.div className="action-circle" whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('book')}>
                    <div className="icon-wrapper book-icon"><i className="fas fa-chair"></i></div>
                    <span>Tables</span>
                </motion.div>
                <motion.div className="action-circle" whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('profile')}>
                    <div className="icon-wrapper loyalty-icon"><i className="fas fa-gift"></i></div>
                    <span>Rewards</span>
                </motion.div>
                <motion.div className="action-circle" whileTap={{ scale: 0.9 }}>
                    <div className="icon-wrapper map-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <span>Location</span>
                </motion.div>
            </motion.div>

            {/* Horizontal Carousel: Chef's Recommendations */}
            <motion.div
                className="native-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="section-header">
                    <h3 style={{ color: 'var(--text-color, #fff)' }}>Chef's Picks</h3>
                    <motion.span whileTap={{ scale: 0.95 }} className="see-all" onClick={() => setActiveTab('menu')}>See All</motion.span>
                </div>

                <div className="horizontal-scroll" style={{ margin: '0 -20px', padding: '0 20px', scrollPadding: '20px' }}>
                    {popularItems.map((item) => (
                        <motion.div
                            className="food-card-mini"
                            key={item.id}
                            onClick={() => setActiveTab('menu')}
                            whileTap={{ scale: 0.95 }}
                            style={{ cursor: 'pointer', border: '1px solid var(--border-soft, rgba(0,0,0,0.05))', boxShadow: 'var(--shadow-soft, 0 4px 10px rgba(0,0,0,0.05))' }}
                        >
                            <div className="food-img">
                                <img src={item.image} alt={item.name} />
                                <div className="food-tag" style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--primary-color, #E63946)', color: 'white', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>{item.tag}</div>
                                <motion.div whileTap={{ scale: 0.8 }} className="add-btn"><i className="fas fa-plus"></i></motion.div>
                            </div>
                            <div className="food-info">
                                <h4 style={{ color: 'var(--text-color, #fff)' }}>{item.name}</h4>
                                <span className="price">{item.price}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Customer Reviews */}
            <motion.div
                className="native-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <div className="section-header">
                    <h3 style={{ color: 'var(--text-color, #fff)' }}>What People Say</h3>
                </div>
                <div className="horizontal-scroll" style={{ margin: '0 -20px', padding: '0 20px', scrollPadding: '20px' }}>
                    {reviews.map(review => (
                        <motion.div
                            key={review.id}
                            className="review-card"
                            whileTap={{ scale: 0.98 }}
                            style={{ background: 'var(--card-bg, #1e1e1e)', minWidth: '220px', padding: '15px', borderRadius: '16px', border: '1px solid var(--border-color, rgba(255,255,255,0.05))', scrollSnapAlign: 'start', boxShadow: 'var(--shadow-soft)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <strong style={{ color: 'var(--text-color, #fff)', fontSize: '0.9rem' }}>{review.name}</strong>
                                <div style={{ color: '#FFD700', fontSize: '0.8rem' }}>
                                    {[...Array(review.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #aaa)', fontStyle: 'italic', lineHeight: '1.4' }}>"{review.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Spacer for bottom nav */}
            <div style={{ height: '50px' }}></div>
        </div>
    );
}
