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
        <div className="native-home" style={{ backgroundColor: 'var(--bg-dark, #0a0a0a)', color: 'white' }}>
            {/* Header Section */}
            <motion.div
                className="native-header"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ padding: '20px 0' }}
            >
                <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="greeting">
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: 'var(--primary-color, #DAA520)' }}>
                            Hi, {firstName}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Welcome to Khaliya Luxury</p>
                    </div>
                    <motion.div
                        className="user-avatar"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab('profile')}
                        style={{ border: '2px solid var(--primary-color, #DAA520)', borderRadius: '50%', padding: '2px' }}
                    >
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Guest')}&background=DAA520&color=0a0a0a`} 
                            alt="User" 
                            style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions - Glassmorphism */}
            <div className="native-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '20px 0' }}>
                {[
                    { id: 'menu', icon: 'fa-book-open', label: 'Menu' },
                    { id: 'book', icon: 'fa-chair', label: 'Reserve' },
                    { id: 'profile', icon: 'fa-gift', label: 'Rewards' },
                    { id: 'location', icon: 'fa-map-marker-alt', label: 'Find Us' }
                ].map((action) => (
                    <motion.div 
                        key={action.id}
                        className="action-circle" 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => action.id !== 'location' && setActiveTab(action.id)}
                        style={{ textAlign: 'center' }}
                    >
                        <div className="icon-wrapper futuristic-glass" style={{ 
                            width: '60px', height: '60px', borderRadius: '15px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 8px', color: 'var(--primary-color, #DAA520)',
                            border: '1px solid rgba(218, 165, 32, 0.3)'
                        }}>
                            <i className={`fas ${action.icon}`}></i>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#ccc' }}>{action.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Hero Card */}
            <motion.div
                className="native-hero-card futuristic-glass"
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('book')}
                style={{ 
                    borderRadius: '20px', padding: '25px', marginBottom: '30px', 
                    background: 'linear-gradient(135deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9))',
                    border: '1px solid rgba(218, 165, 32, 0.2)',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                <div className="hero-content">
                    <h3 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 5px 0' }}>The Royal Table</h3>
                    <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '15px' }}>Reserve your curated dining experience.</p>
                    <button className="native-btn-primary" style={{ 
                        backgroundColor: 'var(--primary-color, #DAA520)', 
                        color: '#0a0a0a', border: 'none', padding: '8px 18px', 
                        borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem'
                    }}>Book Now</button>
                </div>
                <i className="fas fa-crown" style={{ position: 'absolute', right: '20px', top: '20px', opacity: 0.1, fontSize: '3rem', color: '#DAA520' }}></i>
            </motion.div>

            {/* Synced Specials */}
            <div className="native-section synced-specials" style={{ marginBottom: '30px' }}>
                <div className="section-header" style={{ marginBottom: '15px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>Chef's Recommendations</h3>
                </div>
                <FeaturedSpecials isNative={true} />
            </div>

            {/* Offers Slider */}
            <div className="native-section" style={{ marginBottom: '30px' }}>
                <div className="horizontal-scroll" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {offers.map(offer => (
                        <div key={offer.id} style={{ 
                            minWidth: '240px', padding: '20px', borderRadius: '16px', 
                            backgroundColor: offer.bg, border: `1px solid ${offer.color}33`,
                            position: 'relative'
                        }}>
                            <h3 style={{ margin: 0, color: offer.color, fontSize: '1.2rem', fontWeight: '800' }}>{offer.title}</h3>
                            <p style={{ margin: '4px 0 10px 0', fontSize: '0.8rem', color: '#ccc' }}>{offer.desc}</p>
                            <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', display: 'inline-block' }}>
                                Code: <span style={{ color: offer.color }}>{offer.code}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Items */}
            <div className="native-section" style={{ marginBottom: '30px' }}>
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>Must Try</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color, #DAA520)' }} onClick={() => setActiveTab('menu')}>Explore Menu</span>
                </div>
                <div className="horizontal-scroll" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px' }}>
                    {popularItems.map(item => (
                        <div key={item.id} className="food-card-mini futuristic-glass" style={{ 
                            minWidth: '160px', borderRadius: '16px', overflow: 'hidden', 
                            border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(20,20,20,0.6)'
                        }}>
                            <div style={{ height: '110px', position: 'relative' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="add-btn" onClick={() => {
                                    addToCart({ ...item, price: `₹${item.price}` });
                                    Swal.fire({ title: 'Added!', text: `${item.name} added`, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                }} style={{ 
                                    position: 'absolute', bottom: '-15px', right: '10px', 
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    backgroundColor: 'var(--primary-color, #DAA520)', color: '#0a0a0a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                }}>
                                    <i className="fas fa-plus"></i>
                                </div>
                            </div>
                            <div style={{ padding: '20px 12px 12px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                <span style={{ color: 'var(--primary-color, #DAA520)', fontWeight: '700', fontSize: '0.85rem' }}>₹{item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '80px' }}></div>
        </div>
    );
}
