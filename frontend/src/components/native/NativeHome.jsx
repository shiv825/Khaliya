import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import FeaturedSpecials from '../FeaturedSpecials';

/**
 * NativeHome Component
 * Redesigned with "Gold & Charcoal" Luxury Theme for a premium PWA experience.
 */
export default function NativeHome({ setActiveTab }) {
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    const user = storedUserStr ? JSON.parse(storedUserStr) : { name: 'Guest' };
    const firstName = user.name ? user.name.split(' ')[0] : 'Guest';
    const { t } = useLanguage();
    const { addToCart } = useCart();

    const popularItems = [
        { id: 'p1', name: "Butter Chicken", price: "450", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&fit=crop", tag: "Bestseller" },
        { id: 'p2', name: "Garlic Naan", price: "80", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&fit=crop", tag: "Must Try" },
        { id: 'p3', name: "Mutton Biryani", price: "550", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&fit=crop", tag: "Chef's Special" },
        { id: 'p4', name: "Crispy Samosa", price: "60", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&fit=crop", tag: "Snack" },
    ];

    const offers = [
        { id: 1, title: "20% OFF", desc: "First Order", code: "WELCOME20", bg: "rgba(218, 165, 32, 0.15)", color: "#DAA520" },
        { id: 2, title: "FREE DESSERT", desc: "Above ₹1000", code: "SWEET", bg: "rgba(255, 215, 0, 0.1)", color: "#FFD700" }
    ];

    const reviews = [
        { id: 1, name: "Rahul S.", rating: 5, text: "Best Butter Chicken in town! Totally recommend it." },
        { id: 2, name: "Priya M.", rating: 5, text: "The booking process was so smooth. Loved the ambiance!" }
    ];

    return (
        <div className="native-home">
            {/* Header Section */}
            <motion.div
                className="native-header"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ padding: '30px 0 20px 0' }}
            >
                <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="greeting">
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', margin: 0, color: 'var(--primary-color)' }}>
                            Dhanyavad, {firstName}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: 'var(--text-light)', fontWeight: '600' }}>Welcome back to Khaliya</p>
                    </div>
                    <motion.div
                        className="user-avatar"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab('profile')}
                        style={{ background: 'var(--bg-surface)', padding: '4px', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Guest')}&background=8E1C1C&color=ffffff`} 
                            alt="User" 
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions - Light Glassmorphism */}
            <div className="native-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '25px 0' }}>
                {[
                    { id: 'menu', icon: 'fa-utensils', label: 'Menu' },
                    { id: 'book', icon: 'fa-calendar-alt', label: 'Reserve' },
                    { id: 'profile', icon: 'fa-crown', label: 'Loyalty' },
                    { id: 'location', icon: 'fa-map-pin', label: 'Visit' }
                ].map((action) => (
                    <motion.div 
                        key={action.id}
                        className="action-circle" 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => action.id !== 'location' && setActiveTab(action.id)}
                        style={{ textAlign: 'center' }}
                    >
                        <div className="icon-wrapper futuristic-glass" style={{ 
                            width: '65px', height: '65px', borderRadius: '20px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px', color: 'var(--primary-color)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <i className={`fas ${action.icon}`} style={{ fontSize: '1.4rem' }}></i>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase' }}>{action.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Hero Card - Refined Light Aesthetic */}
            <motion.div
                className="native-hero-card"
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('book')}
                style={{ 
                    borderRadius: '30px', padding: '30px', marginBottom: '35px', 
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)'
                }}
            >
                <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>Curated Dining</h3>
                    <p style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '20px', fontWeight: '500' }}>Host your moments in our royal sanctuary.</p>
                    <button className="native-btn-primary" style={{ 
                        backgroundColor: 'var(--primary-color)', 
                        color: '#FFF', border: 'none', padding: '12px 24px', 
                        borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}>Reserve Now</button>
                </div>
                <i className="fas fa-gem" style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', opacity: 0.05, fontSize: '6rem', color: 'var(--primary-color)' }}></i>
            </motion.div>

            {/* Synced Specials */}
            <div className="native-section synced-specials" style={{ marginBottom: '40px' }}>
                <div className="section-header" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)' }}>Chef's Recommendations</h3>
                </div>
                <FeaturedSpecials isNative={true} />
            </div>

            {/* Offers Slider */}
            <div className="native-section" style={{ marginBottom: '40px' }}>
                <div className="horizontal-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                    {offers.map(offer => (
                        <div key={offer.id} style={{ 
                            minWidth: '280px', padding: '25px', borderRadius: '25px', 
                            backgroundColor: 'var(--bg-surface)', border: `2px dashed ${offer.color}`,
                            position: 'relative', boxShadow: 'var(--shadow-sm)'
                        }}>
                            <h3 style={{ margin: 0, color: offer.color, fontSize: '1.4rem', fontWeight: '900' }}>{offer.title}</h3>
                            <p style={{ margin: '8px 0 15px 0', fontSize: '1rem', color: 'var(--text-light)', fontWeight: '600' }}>{offer.desc}</p>
                            <div style={{ padding: '8px 15px', background: 'var(--bg-body)', borderRadius: '12px', fontSize: '0.9rem', display: 'inline-block', fontWeight: '800', border: '1px solid var(--border-color)' }}>
                                Code: <span style={{ color: offer.color }}>{offer.code}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Items */}
            <div className="native-section" style={{ marginBottom: '40px' }}>
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)' }}>Must Try</h3>
                    <span style={{ fontSize: '1rem', color: 'var(--primary-color)', fontWeight: '800', borderBottom: '2px solid' }} onClick={() => setActiveTab('menu')}>See All</span>
                </div>
                <div className="horizontal-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {popularItems.map(item => (
                        <div key={item.id} className="food-card-mini futuristic-glass" style={{ 
                            minWidth: '180px', borderRadius: '24px', overflow: 'hidden', 
                            border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ height: '140px', position: 'relative' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="add-btn" onClick={() => {
                                    addToCart({ ...item, price: `₹${item.price}` });
                                    Swal.fire({ title: 'Added!', text: `${item.name} added`, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                }} style={{ 
                                    position: 'absolute', bottom: '-18px', right: '15px', 
                                    width: '38px', height: '38px', borderRadius: '50%',
                                    backgroundColor: 'var(--primary-color)', color: '#FFF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(142, 28, 28, 0.3)',
                                    cursor: 'pointer'
                                }}>
                                    <i className="fas fa-plus"></i>
                                </div>
                            </div>
                            <div style={{ padding: '25px 15px 15px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                <span style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '1.1rem' }}>₹{item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '100px' }}></div>
        </div>
    );
}
