import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NativeMenu() {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Starters', 'Mains', 'Breads', 'Desserts', 'Drinks'];

    const menuItems = [
        { id: 1, name: "Paneer Tikka", category: "Starters", price: "₹320", desc: "Charcoal grilled cottage cheese", image: "https://images.unsplash.com/photo-1599487405702-3e28faced4e3?w=500&fit=crop" },
        { id: 2, name: "Butter Chicken", category: "Mains", price: "₹450", desc: "Rich tomato gravy & tender chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&fit=crop" },
        { id: 3, name: "Garlic Naan", category: "Breads", price: "₹80", desc: "Fresh baked flatbread with garlic", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&fit=crop" },
        { id: 4, name: "Dal Makhani", category: "Mains", price: "₹350", desc: "Slow cooked black lentils", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop" },
        { id: 5, name: "Gulab Jamun", category: "Desserts", price: "₹150", desc: "Sweet dumplings in rose syrup", image: "https://images.unsplash.com/photo-1588673756288-4cb22c0199e1?w=500&fit=crop" },
    ];

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    return (
        <div className="native-menu-view">
            {/* Header */}
            <div className="native-menu-header">
                <h2>Our Menu</h2>
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search dishes..." />
                </div>
            </div>

            {/* Swipeable Category Tabs */}
            <div className="native-categories">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            <motion.div layout className="native-menu-grid">
                <AnimatePresence>
                    {filteredItems.map(item => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={item.id}
                            className="native-menu-card"
                        >
                            <div className="card-image">
                                <img src={item.image} alt={item.name} />
                                <div className="card-price">{item.price}</div>
                            </div>
                            <div className="card-content">
                                <h3>{item.name}</h3>
                                <p>{item.desc}</p>
                                <button className="add-to-cart-btn">
                                    <i className="fas fa-plus"></i> Add
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
