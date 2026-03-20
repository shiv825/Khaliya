import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';

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
    const [menuItems, setMenuItems] = useState(getFallbackMenu());
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        axios.get(`${API_URL}/api/menu`, { timeout: 5000 })
            .then(res => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => console.error('API Error, using fallback:', err))
            .finally(() => setLoading(false));
    }, [API_URL]);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const backendCategories = [...new Set(menuItems.map(item => getLocalized(item.category)).filter(Boolean))];
    const categories = ['All', ...backendCategories];

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => getLocalized(item.category) === activeCategory);

    if (loading) {
        return (
            <div className="native-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--primary-color, #DAA520)' }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
        );
    }

    return (
        <div className="native-menu-view" style={{ padding: '20px', backgroundColor: 'var(--bg-dark, #0a0a0a)' }}>
            <div className="native-menu-header" style={{ marginBottom: '25px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: 'white', margin: '0 0 15px 0' }}>{t('menu.title', 'Our Menu')}</h2>
                <div className="search-bar futuristic-glass" style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px 15px', 
                    borderRadius: '12px', border: '1px solid rgba(218, 165, 32, 0.2)'
                }}>
                    <i className="fas fa-search" style={{ color: '#888', marginRight: '10px' }}></i>
                    <input 
                        type="text" 
                        placeholder={t('menu.searchPlaceholder', 'Find your flavor...')} 
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="native-categories" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '8px 20px', borderRadius: '20px', border: '1px solid rgba(218, 165, 32, 0.3)',
                            backgroundColor: activeCategory === cat ? 'var(--primary-color, #DAA520)' : 'rgba(255,255,255,0.05)',
                            color: activeCategory === cat ? '#0a0a0a' : '#aaa',
                            fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.3s'
                        }}
                    >
                        {cat === 'All' ? 'All' : cat}
                    </button>
                ))}
            </div>

            <div className="native-menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
                <AnimatePresence>
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id || index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="native-menu-card futuristic-glass"
                            style={{ 
                                background: 'rgba(20, 20, 20, 0.7)', borderRadius: '18px', 
                                border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden'
                            }}
                        >
                            <div style={{ height: '160px', position: 'relative' }}>
                                <img src={item.image} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ 
                                    position: 'absolute', bottom: '10px', left: '10px',
                                    backgroundColor: 'rgba(10,10,10,0.8)', color: 'var(--primary-color, #DAA520)',
                                    padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem'
                                }}>₹{item.price}</div>
                            </div>
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontFamily: "'Playfair Display', serif" }}>{getLocalized(item.name)}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: '1.3', marginBottom: '15px', height: '3.9em', overflow: 'hidden' }}>
                                    {getLocalized(item.description)}
                                </p>
                                <button
                                    onClick={() => {
                                        addToCart(item);
                                        Swal.fire({ title: 'Added!', text: `${getLocalized(item.name)} added`, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                    }}
                                    style={{ 
                                        width: '100%', backgroundColor: 'var(--primary-color, #DAA520)', 
                                        color: '#0a0a0a', border: 'none', padding: '8px', borderRadius: '10px',
                                        fontWeight: 'bold', fontSize: '0.85rem'
                                    }}
                                >
                                    <i className="fas fa-plus"></i> Add
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div style={{ height: '100px' }}></div>
        </div>
    );
}
