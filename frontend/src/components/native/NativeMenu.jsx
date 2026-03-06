import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeMenu() {
    const { t, language } = useLanguage();
    const getFallbackMenu = () => [
        { "category": "Appetizer", "name": { "en": "Samosa (4 pcs)", "hi": "समोसा (4 पीसी)", "ar": "سمبوسة (4 قطع)" }, "description": { "en": "Crispy fried pastry with spiced potato and pea filling.", "hi": "मसालेदार आलू और मटर भराव के साथ कुरकुरा तला हुआ पेस्ट्री।", "ar": "فطيرة مقرمشة محشوة بالبطاطس" }, "price": "₹150", "tags": ["veg", "spicy-1"], "image": "https://images.unsplash.com/photo-1601050633647-8f8f2f3ee079?w=500&h=400&fit=crop" },
        { "category": "Appetizer", "name": { "en": "Paneer Tikka", "hi": "पनीर टिक्का" }, "description": { "en": "Cubed cottage cheese marinated in yogurt and spices" }, "price": "₹320", "tags": ["veg", "spicy-1"], "image": "https://images.unsplash.com/photo-1599487405702-3e28faced4e3?w=500&h=400&fit=crop" },
        { "category": "Main Course", "name": { "en": "Butter Chicken", "hi": "बटर चिकन" }, "description": { "en": "Succulent chicken in rich, buttery tomato cream sauce." }, "price": "₹400", "tags": ["non-veg", "spicy-1"], "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=400&fit=crop" },
        { "category": "Main Course", "name": { "en": "Palak Paneer", "hi": "पालक पनीर" }, "description": { "en": "Cottage cheese cubes in a thick, spiced spinach puree." }, "price": "₹310", "tags": ["veg", "spicy-1"], "image": "https://images.unsplash.com/photo-1601050633647-8f8f2f3ee079?w=500&h=400&fit=crop" },
        { "category": "Bread", "name": { "en": "Garlic Naan", "hi": "गार्लिक नान" }, "description": { "en": "Traditional Indian bread baked in clay oven with fresh garlic." }, "price": "₹80", "tags": ["veg"], "image": "https://images.unsplash.com/photo-1626082896492-766af4eb6501?w=500&h=400&fit=crop" },
        { "category": "Rice", "name": { "en": "Chicken Biryani", "hi": "चिकन बिरयानी" }, "description": { "en": "Fragrant basmati rice cooked with marinated chicken and whole spices." }, "price": "₹280", "tags": ["non-veg", "spicy-2"], "image": "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=500&h=400&fit=crop" },
        { "category": "Dessert", "name": { "en": "Gulab Jamun (2 pcs)", "hi": "गुलाब जामुन" }, "description": { "en": "Soft milk solids in warm sugar syrup." }, "price": "₹120", "tags": ["veg"], "image": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&h=400&fit=crop" },
        { "category": "Beverage", "name": { "en": "Mango Lassi", "hi": "मैंगो लस्सी" }, "description": { "en": "Refreshing yogurt-based drink with fresh mango puree." }, "price": "₹100", "tags": ["veg"], "image": "https://images.unsplash.com/photo-1549128247-37e905ebdb3f?w=500&h=400&fit=crop" }
    ];

    const [activeCategory, setActiveCategory] = useState('All');
    const [menuItems, setMenuItems] = useState(getFallbackMenu());
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        axios.get(`${API_URL}/api/menu`)
            .then(res => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMenuItems(res.data);
                } else {
                    console.warn("API returned invalid data format, keeping fallback menu.");
                }
            })
            .catch(err => console.error('Error fetching native menu, using fallback:', err))
            .finally(() => setLoading(false));
    }, [API_URL]);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') {
            return field[language] || field.en || '';
        }
        return field || '';
    };

    // Dynamically generate categories from the available items
    const backendCategories = [...new Set(menuItems.map(item => getLocalized(item.category)).filter(Boolean))];
    const categories = ['All', ...backendCategories];

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => {
            const cat = getLocalized(item.category);
            return cat === activeCategory;
        });

    if (loading) {
        return (
            <div className="native-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--accent-color)' }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
        );
    }

    return (
        <div className="native-menu-view" id="native-menu">
            {/* Header */}
            <div className="native-menu-header">
                <h2>{t('menu.title')}</h2>
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder={t('menu.searchPlaceholder')} />
                </div>
            </div>

            {/* Swipeable Category Tabs */}
            <div className="native-categories">
                {categories.map(cat => {
                    let localizedCat = cat;
                    if (cat === 'All') localizedCat = t('menu.catAll') || 'All';
                    else if (cat === 'Appetizer') localizedCat = t('menu.catAppetizer') || 'Appetizer';
                    else if (cat === 'Main Course') localizedCat = t('menu.catMain') || 'Main Course';
                    else if (cat === 'Bread') localizedCat = t('menu.catBread') || 'Bread';
                    else if (cat === 'Dessert') localizedCat = t('menu.catDessert') || 'Dessert';
                    else if (cat.includes('Beverage')) localizedCat = t('menu.catBeverage') || 'Beverage';

                    return (
                        <button
                            key={cat}
                            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {localizedCat}
                        </button>
                    );
                })}
            </div>

            {/* Menu Items Grid */}
            <motion.div layout className="native-menu-grid">
                <AnimatePresence>
                    {filteredItems.map((item, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={item.id || index}
                            className="native-menu-card"
                        >
                            <div className="card-image">
                                <img
                                    src={
                                        item.image
                                            ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`)
                                            : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop"
                                    }
                                    alt={getLocalized(item.name)}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop"; }}
                                />
                                <div className="card-price">₹{item.price}</div>
                            </div>
                            <div className="card-content">
                                <h3>{getLocalized(item.name)}</h3>
                                <p>{getLocalized(item.description)}</p>
                                <button className="add-to-cart-btn">
                                    <i className="fas fa-plus"></i> {t('menu.addBtn', 'Add')}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <div style={{ height: '30px' }}></div>
        </div>
    );
}
