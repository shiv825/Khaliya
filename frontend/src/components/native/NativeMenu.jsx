import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeMenu() {
    const { t, language } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('All');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        axios.get(`${API_URL}/api/menu`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => console.error('Error fetching native menu:', err))
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
