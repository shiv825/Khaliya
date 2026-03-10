import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeHome({ setActiveTab }) {
    const scrollRef = useRef(null);
    const { scrollY } = useScroll();

    // Parallax transforms
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

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

    // Animation Variants for Stagger
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div
            className="native-home"
            id="native-home"
            style={{ overflowX: 'hidden' }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Parallax Hero Image Background */}
            <motion.div
                variants={itemVariants}
                style={{ position: 'relative', height: '350px', overflow: 'hidden', margin: '0 -20px 20px -20px' }}
            >
                <motion.img
                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1000&fit=crop"
                    style={{
                        width: '100%',
                        height: '140%',
                        objectFit: 'cover',
                        y: heroY,
                        scale: scale,
                        opacity: heroOpacity
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '20px'
                }}>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                    >
                        Authentic Taste
                    </motion.h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: '5px 0 15px 0', fontSize: '1.1rem' }}>Discover the true flavors of India</p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="native-btn-primary btn-premium-scale"
                        style={{ width: 'fit-content', padding: '12px 30px' }}
                        onClick={() => setActiveTab('menu')}
                    >
                        Explore Menu
                    </motion.button>
                </div>
            </motion.div>

            {/* Header Section */}
            <motion.div
                className="native-header"
                variants={itemVariants}
                style={{ marginBottom: '25px' }}
            >
                <div className="header-top">
                    <div className="greeting">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className="live-pulse-indicator"></span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Now</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem' }}>Hi, {firstName} 👋</h2>
                        <p className="subtitle">Ready for your next meal?</p>
                    </div>
                    <motion.div
                        className="user-avatar"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab('profile')}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Guest User')}&background=E63946&color=fff`} alt="User" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Daily Delight / Surprise Element */}
            <motion.div
                variants={itemVariants}
                style={{ padding: '0 20px', marginBottom: '25px', marginTop: '-10px' }}
            >
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    style={{
                        background: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 30px rgba(38, 208, 206, 0.2)',
                        cursor: 'pointer',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onClick={() => setActiveTab('menu')}
                >
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.8 }}>Daily Delight</div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Free Dessert Today 🍰</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Claim with your next order</p>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(5px)',
                        padding: '10px',
                        borderRadius: '12px',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fas fa-arrow-right" style={{ color: 'white' }}></i>
                    </div>
                    {/* Decorative backdrop */}
                    <i className="fas fa-gift" style={{ position: 'absolute', right: '-15px', bottom: '-20px', fontSize: '100px', opacity: 0.1, zIndex: 1, transform: 'rotate(-15deg)' }}></i>
                </motion.div>
            </motion.div>



            {/* Active Offers Section */}
            <motion.div
                variants={itemVariants}
                className="native-offers"
                style={{ marginBottom: '10px' }}
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
                variants={itemVariants}
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
                <motion.div className="action-circle" whileTap={{ scale: 0.9 }} onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=22.6108,88.3370', '_blank')}>
                    <div className="icon-wrapper map-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <span>Location</span>
                </motion.div>
            </motion.div>

            {/* Horizontal Carousel: Chef's Recommendations */}
            <motion.div
                className="native-section"
                variants={itemVariants}
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
                variants={itemVariants}
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
        </motion.div>
    );
}
