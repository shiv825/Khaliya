import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import FeaturedSpecials from '../FeaturedSpecials';
import masterMenu from '../../data/menu.json';
import axios from 'axios';

/**
 * NativeHome Component
 * Redesigned with "Gold & Charcoal" Luxury Theme for a premium PWA experience.
 */
export default function NativeHome({ setActiveTab }) {
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    let user = { name: 'Guest' };
    try {
        if (storedUserStr) user = JSON.parse(storedUserStr);
    } catch (e) {
        console.warn('⚠️ [NativeHome] User data corrupted, resetting to guest');
    }
    const firstName = (user && user.name) ? user.name.split(' ')[0] : 'Guest';
    const { t, language = 'en' } = useLanguage();
    const { addToCart } = useCart();

    const [liveMenu, setLiveMenu] = useState(masterMenu);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        let isMounted = true;
        
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${API_URL}/menu?t=${Date.now()}`);
                if (isMounted && Array.isArray(res.data)) {
                    setLiveMenu(res.data);
                }
            } catch (err) {
                console.warn('Failed to fetch native home menu:', err.message);
            }
        };

        fetchMenu();

        // Listen to SSE
        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        let evtSource = null;
        try {
            evtSource = new EventSource(sseUrl);
            evtSource.onmessage = (e) => {
                try {
                    const update = JSON.parse(e.data);
                    if (update.type === 'menu' && isMounted) {
                        setLiveMenu(update.data);
                    }
                } catch (err) {
                    console.error("SSE menu parsing error in native home:", err);
                }
            };
            evtSource.onerror = () => {
                if (evtSource) {
                    evtSource.close();
                }
            };
        } catch (err) {
            console.warn('SSE unavailable in NativeHome:', err.message);
        }

        return () => {
            isMounted = false;
            if (evtSource) evtSource.close();
        };
    }, [API_URL]);

    // Get popular items from Master Menu (Bestsellers / Featured)
    const popularItems = Array.isArray(liveMenu) ? liveMenu.slice(0, 8).map(item => ({
        id: item.id || item.name?.en || Math.random().toString(),
        name: typeof item.name === 'object' ? item.name.en : item.name || 'Menu Item',
        price: item.price ? String(item.price).replace('₹', '') : '150',
        image: item.image,
        tag: item.tags?.includes('spicy-2') ? "Bestseller" : "Must Try",
        originalItem: item
    })) : [];



    const reviews = [
        { id: 1, name: "Rahul S.", rating: 5, text: "Best Butter Chicken in town! Totally recommend it." },
        { id: 2, name: "Priya M.", rating: 5, text: "The booking process was so smooth. Loved the ambiance!" }
    ];

    return (
        <div className="native-home" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Floating Spices */}
            <div className="ambient-particles" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                <span className="particle" style={{ left: '10%', animationDelay: '0s', animationDuration: '25s', fontSize: '1.2rem' }}>🌿</span>
                <span className="particle" style={{ left: '30%', animationDelay: '4s', animationDuration: '32s', fontSize: '1.4rem' }}>🌶️</span>
                <span className="particle" style={{ left: '50%', animationDelay: '8s', animationDuration: '28s', fontSize: '1rem' }}>✨</span>
                <span className="particle" style={{ left: '75%', animationDelay: '2s', animationDuration: '35s', fontSize: '1.3rem' }}>🍃</span>
                <span className="particle" style={{ left: '20%', animationDelay: '12s', animationDuration: '38s', fontSize: '0.9rem' }}>✨</span>
                <span className="particle" style={{ left: '65%', animationDelay: '6s', animationDuration: '26s', fontSize: '1.1rem' }}>🌿</span>
                <span className="particle" style={{ left: '85%', animationDelay: '15s', animationDuration: '30s', fontSize: '1.2rem' }}>🌶️</span>
            </div>
            
            <style>{`
                .particle {
                    position: absolute;
                    bottom: -50px;
                    opacity: 0;
                    animation: floatParticle linear infinite;
                    filter: blur(0.5px);
                }
                @keyframes floatParticle {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.12;
                    }
                    90% {
                        opacity: 0.12;
                    }
                    100% {
                        transform: translateY(-110vh) translateX(60px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>

            {/* Header Section */}
            <motion.div
                className="native-header"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ 
                    padding: '40px 20px 30px', 
                    background: 'var(--indigo-gradient)',
                    borderRadius: '0 0 35px 35px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                    marginBottom: '20px'
                }}
            >
                <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="greeting">
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', margin: 0, color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            Dhanyavad, {firstName}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Explore Khaliya Sanctuary</p>
                    </div>
                    <motion.div
                        className="user-avatar"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab('profile')}
                        style={{ 
                            background: 'var(--bg-surface)', 
                            padding: '4px', 
                            borderRadius: '50%', 
                            boxShadow: 'var(--shadow-sm)',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Guest')}&background=8E1C1C&color=ffffff`} 
                            alt="User" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions - Light Glassmorphism */}
            <div className="native-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '25px 0' }}>
                {[
                    { id: 'menu', icon: 'fa-utensils', label: 'Menu' },
                    { id: 'book', icon: 'fa-calendar-alt', label: 'Reserve' },
                    { id: 'profile', icon: 'fa-user', label: 'Profile' },
                    { id: 'location', icon: 'fa-map-pin', label: 'Visit' }
                ].map((action) => (
                    <motion.div 
                        key={action.id}
                        className="action-circle" 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => {
                            if (action.id === 'location') {
                                setActiveTab('visit');
                            } else {
                                setActiveTab(action.id);
                            }
                        }}
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
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop' }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div className="add-btn" onClick={() => {
                                    addToCart(item.originalItem || { ...item, price: `₹${item.price}` });
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
