import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import AiMatchmaker from '../AiMatchmaker';
import masterMenu from '../../data/menu.json';

/**
 * NativeMenu Component
 * Optimized for mobile with Luxury "Gold & Charcoal" styling.
 */
export default function NativeMenu() {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();
    
    // Luxury Fallback Menu
    const getFallbackMenu = () => [
        {
            "category": "Appetizer",
            "name": { "en": "Samosa (4 pcs)", "hi": "समोसा (4 पीसी)", "ar": "سمبوسة (4 قطع)" },
            "description": { "en": "Crispy fried pastry with spiced potato and pea filling.", "hi": "मसालेदार आलू और मटर के साथ कुरकुरा पास्ट्री।", "ar": "فطيرة مقرمشة محشوة بالبطاطس والبازلاء." },
            "price": "150",
            "tags": ["veg", "spicy-1"],
            "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&fit=crop"
        },
        {
            "category": "Main Course",
            "name": { "en": "Butter Chicken", "hi": "बटर चिकन", "ar": "دجاج بالزبدة" },
            "description": { "en": "Succulent chicken in rich, buttery tomato cream sauce.", "hi": "समृद्ध मलाईदार टमाटर क्रीम सॉस में रसीला चिकन।", "ar": "دجاج طري في صلصة طماطم بالزبدة والقشطة." },
            "price": "450",
            "tags": ["non-veg", "spicy-1"],
            "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&fit=crop"
        },
        {
            "category": "Bread",
            "name": { "en": "Garlic Naan", "hi": "गार्लिक नान", "ar": "خبز النان بالثوم" },
            "description": { "en": "Indian bread baked in clay oven with fresh garlic.", "hi": "ताजा लहसुन के साथ मिट्टी के ओवन में पकी रोटी।", "ar": "خبز هندي مخبوز في فرن الطين مع الثوم." },
            "price": "80",
            "tags": ["veg"],
            "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&fit=crop"
        }
    ];

    const [activeCategory, setActiveCategory] = useState('All');
    const [menuItems, setMenuItems] = useState(masterMenu);
    
    // Reset visible count when category changes for speed
    useEffect(() => {
        setVisibleCount(20);
    }, [activeCategory]);

    const [loading, setLoading] = useState(true);
    const [showMatchmaker, setShowMatchmaker] = useState(false);
    const [visibleCount, setVisibleCount] = useState(24); // Optimization: slightly more for better scroll filling
    const [isRenderReady, setIsRenderReady] = useState(false); // New: Delay list render for "Instant" feel

    // Initial mount delay to let the UI thread breathe
    useEffect(() => {
        const timer = setTimeout(() => setIsRenderReady(true), 150);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        axios.get(`${API_URL}/menu`, { timeout: 5000 })
            .then(res => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => console.error('API Error, using fallback:', err))
            .finally(() => setLoading(false));
    }, [API_URL]);

    const categories = useMemo(() => {
        const backendCategories = [...new Set(menuItems.map(item => getLocalized(item.category)).filter(Boolean))];
        return ['All', ...backendCategories];
    }, [menuItems, language]);

    const filteredItems = useMemo(() => {
        return activeCategory === 'All'
            ? menuItems
            : menuItems.filter(item => getLocalized(item.category) === activeCategory);
    }, [menuItems, activeCategory, language]);

    const visibleItems = useMemo(() => {
        return filteredItems.slice(0, visibleCount);
    }, [filteredItems, visibleCount]);

    if (loading) {
        return (
            <div className="native-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--primary-color)' }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
        );
    }

    return (
        <div className="native-menu-view">
            <div className="native-menu-header" style={{ 
                padding: '40px 20px 30px', 
                background: 'linear-gradient(135deg, var(--primary-color) 0%, #D32F2F 100%)',
                color: '#FFF',
                borderRadius: '0 0 35px 35px',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="menu-title-block">
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#FFFFFF', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>{t('menu.title', 'Our Menu')}</h2>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600' }}>Flavor Sanctuary</p>
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMatchmaker(true)}
                        style={{ padding: '10px 18px', borderRadius: '30px', background: 'rgba(255,255,255,0.2)', color: '#FFF', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                    >
                        <i className="fas fa-magic"></i> Matchmaker
                    </motion.button>
                </div>
                {showMatchmaker && <AiMatchmaker onClose={() => setShowMatchmaker(false)} />}
                <div className="search-bar futuristic-glass" style={{ 
                    display: 'flex', alignItems: 'center', padding: '15px 20px', 
                    borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)'
                }}>
                    <i className="fas fa-search" style={{ color: 'var(--text-muted)', marginRight: '12px' }}></i>
                    <input 
                        type="text" 
                        placeholder={t('menu.searchPlaceholder', 'Find your flavor...')} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', width: '100%', outline: 'none', fontWeight: '500' }}
                    />
                </div>
            </div>

            <div className="native-categories" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '10px 25px', borderRadius: '30px', border: '1px solid var(--border-color)',
                            backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'var(--bg-surface)',
                            color: activeCategory === cat ? '#FFF' : 'var(--text-muted)',
                            fontWeight: '800', whiteSpace: 'nowrap', transition: 'var(--transition)',
                            fontSize: '0.9rem', boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        {cat === 'All' ? 'All' : cat}
                    </button>
                ))}
            </div>

            <div className="native-menu-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {isRenderReady && visibleItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="native-menu-card"
                            style={{ 
                                background: '#FFFFFF', borderRadius: '25px', 
                                border: '1px solid var(--border-color)', overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div style={{ height: '150px', position: 'relative' }}>
                                <img 
                                    src={item.image?.startsWith('/') ? `.${item.image}` : (item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop')} 
                                    alt={getLocalized(item.name)} 
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop' }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div style={{ 
                                    position: 'absolute', top: '12px', right: '12px',
                                    backgroundColor: 'var(--primary-color)', color: '#FFFFFF',
                                    padding: '5px 12px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}>₹{item.price}</div>
                            </div>
                            <div style={{ padding: '15px 12px 12px' }}>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontWeight: '800' }}>{getLocalized(item.name)}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4', marginBottom: '15px', height: '4.2em', overflow: 'hidden', fontWeight: '500' }}>
                                    {getLocalized(item.description)}
                                </p>
                                <button
                                    onClick={() => {
                                        addToCart(item);
                                        Swal.fire({ title: 'Added!', text: `${getLocalized(item.name)} added`, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                    }}
                                    style={{ 
                                        width: '100%', backgroundColor: 'var(--bg-body)', 
                                        color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '10px', borderRadius: '15px',
                                        fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)'
                                    }}
                                >
                                    <i className="fas fa-shopping-bag" style={{ marginRight: '6px' }}></i> {t('common.add', 'Order Now')}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* PERFORMANCE: Load More Button */}
            {filteredItems.length > visibleCount && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button 
                        onClick={() => setVisibleCount(prev => prev + 20)}
                        style={{ 
                            padding: '12px 30px', 
                            borderRadius: '25px', 
                            background: 'var(--primary-color)', 
                            color: '#FFF', 
                            border: 'none', 
                            fontWeight: '800',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        See More ({filteredItems.length - visibleCount} items left)
                    </button>
                </div>
            )}
            <div style={{ height: '120px' }}></div>
        </div>
    );
}
