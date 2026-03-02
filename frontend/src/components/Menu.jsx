import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Menu() {
    const { t, language } = useLanguage();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        console.log("Khaliya Debug: Menu.jsx is trying to fetch from ->", API_URL);
        axios.get(`${API_URL}/api/menu`)
            .then(res => {
                setMenuItems(res.data && res.data.length > 0 ? res.data : getFallbackMenu());
            })
            .catch(err => {
                console.error('Error fetching menu, using fallback:', err);
                setMenuItems(getFallbackMenu());
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const getFallbackMenu = () => [
        { id: 1, category: "Appetizer", name: { en: "Samosa", hi: "समोसा", ar: "سمبوسك" }, description: { en: "Crispy pastry", hi: "कुरकुरा पेस्ट्री", ar: "معجنات مقرمشة" }, price: "₹80" },
        { id: 2, category: "Main Course", name: { en: "Butter Chicken", hi: "बटर चिकन", ar: "دجاج بالزبدة" }, description: { en: "Creamy tomato gravy", hi: "क्रीमी टमाटर की ग्रेवी", ar: "مرق طماطم كريمي" }, price: "₹380" },
        { id: 3, category: "Bread", name: { en: "Garlic Naan", hi: "गार्लिक नान", ar: "خبز النان بالثوم" }, description: { en: "Freshly baked", hi: "ताजा पकाया हुआ", ar: "مخبوز طازجاً" }, price: "₹60" }
    ];

    const getLocalized = (field) => {
        if (field && typeof field === 'object') {
            return field[language] || field.en || '';
        }
        return field;
    };

    let displayedMenu = [...menuItems];

    if (filter !== 'All') {
        if (filter === 'Bread') {
            displayedMenu = displayedMenu.filter(item => item.category === 'Bread' || item.category === 'Rice');
        } else {
            displayedMenu = displayedMenu.filter(item => item.category === filter);
        }
    }

    if (search) {
        displayedMenu = displayedMenu.filter(item => {
            const name = getLocalized(item.name).toLowerCase();
            const desc = getLocalized(item.description).toLowerCase();
            return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
        });
    }

    if (sort === 'price-low') {
        displayedMenu.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    } else if (sort === 'price-high') {
        displayedMenu.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
    } else if (sort === 'popular') {
        displayedMenu.sort((a, b) => getLocalized(b.description).length - getLocalized(a.description).length);
    }

    return (
        <section id="menu" data-aos="fade-up">
            <h2>{t('menu.title')}</h2>

            <div className="menu-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-box" style={{ position: 'relative', minWidth: '300px' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('menu.searchPlaceholder')} style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)' }} />
                    <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                </div>
                <div className="sort-box">
                    <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)', cursor: 'pointer' }}>
                        <option value="default">{t('menu.sortDefault')}</option>
                        <option value="price-low">{t('menu.sortLow')}</option>
                        <option value="price-high">{t('menu.sortHigh')}</option>
                        <option value="popular">{t('menu.sortPopular')}</option>
                    </select>
                </div>
            </div>

            <div className="menu-filters" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {['All', 'Appetizer', 'Main Course', 'Bread', 'Dessert', 'Beverage'].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`btn menu-filter-btn ${filter === cat ? 'active' : ''}`}>
                        {t(cat === 'All' ? 'menu.catAll' : cat === 'Appetizer' ? 'menu.catAppetizer' : cat === 'Main Course' ? 'menu.catMain' : cat === 'Bread' ? 'menu.catBread' : cat === 'Dessert' ? 'menu.catDessert' : 'menu.catBeverage')}
                    </button>
                ))}
            </div>

            <div id="menu-container" className="menu">
                {loading ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '2rem', color: '#666' }}>
                        <i className="fas fa-spinner fa-spin"></i> <span>{t('menu.loading')}</span>
                    </div>
                ) : (
                    displayedMenu.map((item, index) => (
                        <div key={index} className="menu-item" data-aos="fade-up" data-aos-delay={(index % 5) * 100}>
                            {item.image && (
                                <div className="menu-item-image" style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                    <img src={item.image} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </div>
                            )}
                            <div className="menu-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <span className="category">{getLocalized(item.category)}</span>
                                <div className="menu-item-tags">
                                    {item.tags && item.tags.map(tag => {
                                        if (tag === 'veg') return <span key={tag} className="tag tag-veg" title="Vegetarian">🌱</span>;
                                        if (tag === 'non-veg') return <span key={tag} className="tag tag-nonveg" title="Non-Vegetarian">🍖</span>;
                                        if (tag === 'spicy-1') return <span key={tag} className="tag tag-spicy" title="Mild Spicy">🌶️</span>;
                                        if (tag === 'spicy-2') return <span key={tag} className="tag tag-spicy" title="Medium Spicy">🌶️🌶️</span>;
                                        if (tag === 'spicy-3') return <span key={tag} className="tag tag-spicy" title="Extra Spicy">🌶️🌶️🌶️</span>;
                                        return null;
                                    })}
                                </div>
                            </div>
                            <h3>{getLocalized(item.name)}</h3>
                            <p>{getLocalized(item.description)}</p>
                            <div className="price" style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.1rem', marginTop: '1rem' }}>{item.price}</div>
                        </div>
                    ))
                )}
            </div>
            <p style={{ marginTop: '2rem', color: '#666', textAlign: 'center' }}>{t('menu.note')}</p>
        </section>
    );
}
