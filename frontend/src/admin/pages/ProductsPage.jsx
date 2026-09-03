import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin, CULINARY_CATEGORIES } from '../AdminContext';

export default function ProductsPage() {
    const {
        menu,
        searchQuery,
        selectedCategory,
        setSelectedCategory,
        setEditingItem,
        setModalLang,
        setIsModalOpen,
        toggleStockStatus,
        handleDeleteMenu
    } = useAdmin();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    const isCategoryMatch = (itemCategory, selCat, item) => {
        if (!selCat || selCat === 'All Categories') return true;
        const cat = String(itemCategory || '').toLowerCase().trim();
        const sel = String(selCat || '').toLowerCase().trim();

        if (cat === sel) return true;

        if (sel.includes('starter') || sel.includes('appetizer')) {
            return cat.includes('appetizer') || cat.includes('starter');
        }
        if (sel.includes('tandoor') || sel.includes('kebab')) {
            return cat.includes('tandoor') || cat.includes('kebab');
        }
        if (sel.includes('main course') || cat.includes('main course') || cat.includes('main')) {
            if (sel.includes('non-veg') || sel.includes('non-vegetarian')) {
                return cat.includes('non-veg') || cat.includes('non-vegetarian') || item?.isVeg === false;
            }
            if (sel.includes('veg') || sel.includes('vegetarian')) {
                return cat.includes('veg') || cat.includes('vegetarian') || item?.isVeg !== false;
            }
            return true;
        }
        if (sel.includes('rice') || sel.includes('biryani')) {
            return cat.includes('rice') || cat.includes('biryani');
        }
        if (sel.includes('bread')) {
            return cat.includes('bread');
        }
        if (sel.includes('dessert')) {
            return cat.includes('dessert');
        }
        if (sel.includes('beverage')) {
            return cat.includes('beverage');
        }
        return cat.includes(sel) || sel.includes(cat);
    };

    // Filter menu based on category & search
    const filteredMenu = menu.filter(item => {
        const matchesCat = isCategoryMatch(item.category, selectedCategory, item);
        const itemNameStr = (typeof item.name === 'object' ? item.name.en : item.name) || '';
        const matchesSearch = itemNameStr.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    // Reset to Page 1 on filter/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery, itemsPerPage]);

    // Pagination Slicing
    const totalItems = filteredMenu.length;
    const isAll = itemsPerPage === 'All';
    const effectiveLimit = isAll ? totalItems : Number(itemsPerPage);
    const totalPages = isAll ? 1 : (Math.ceil(totalItems / effectiveLimit) || 1);
    
    const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit;
    const endIndex = isAll ? totalItems : Math.min(startIndex + effectiveLimit, totalItems);
    const paginatedMenu = filteredMenu.slice(startIndex, endIndex);

    // Smart Pagination Windowing (Prevents UI Overflow on Many Pages)
    const getPageNumbers = (current, total) => {
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 3) {
            return [1, 2, 3, 4, '...', total];
        }
        if (current >= total - 2) {
            return [1, '...', total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    return (
        <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Product Catalog Creator</h2>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Manage multilingual dishes, dietary tags, and imagery across 8 culinary categories.</p>
                </div>
                <button onClick={() => { 
                    setEditingItem({ 
                        name: { en: '', hi: '', ar: '' }, 
                        description: { en: '', hi: '', ar: '' }, 
                        price: '', 
                        category: 'Appetizers & Starters', 
                        available: true, 
                        image: '' 
                    }); 
                    setModalLang('en');
                    setIsModalOpen(true); 
                }} className="action-btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                    + Create New Product
                </button>
            </div>

            {/* Culinary Category Filter Pills */}
            <div className="category-filter-bar">
                {CULINARY_CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Pagination Controls Bar - Top Compact Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, background: 'var(--admin-surface)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--admin-border)', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                    Showing <span style={{ color: 'var(--admin-primary)', fontWeight: 800 }}>{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</span> of <span style={{ color: 'var(--admin-text)', fontWeight: 800 }}>{totalItems}</span> products
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                        <span>Items per page:</span>
                        <select 
                            value={itemsPerPage} 
                            onChange={e => setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value={6} style={{ background: '#121620' }}>6</option>
                            <option value={8} style={{ background: '#121620' }}>8</option>
                            <option value={12} style={{ background: '#121620' }}>12</option>
                            <option value={20} style={{ background: '#121620' }}>20</option>
                            <option value="All" style={{ background: '#121620' }}>All</option>
                        </select>
                    </div>

                    {!isAll && totalPages > 1 && (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                disabled={currentPage === 1}
                                style={{ background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', color: currentPage === 1 ? '#555' : 'var(--admin-text)', padding: '5px 12px', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>

                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--admin-text-muted)', padding: '0 4px' }}>
                                Page <span style={{ color: 'var(--admin-primary)', fontWeight: '800' }}>{currentPage}</span> of {totalPages}
                            </span>

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                disabled={currentPage === totalPages}
                                style={{ background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', color: currentPage === totalPages ? '#555' : 'var(--admin-text)', padding: '5px 12px', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="menu-list-view">
                {paginatedMenu.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                        No products found in this category. Click "+ Create New Product" to add one.
                    </div>
                ) : (
                    paginatedMenu.map(item => {
                        const isAvailable = item.available !== false && item.inStock !== false;
                        const nameEn = typeof item.name === 'object' ? item.name.en : item.name;
                        return (
                            <div key={item.id} className="menu-list-row" style={{ opacity: isAvailable ? 1 : 0.65 }}>
                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                    {item.image ? (
                                        <img src={item.image} className="menu-list-image" alt={nameEn} />
                                    ) : (
                                        <div className="menu-list-image" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-utensils" style={{ color: 'var(--admin-text-muted)' }}></i>
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--admin-text)' }}>{nameEn}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                            <span style={{ color: 'var(--admin-primary)', fontWeight: '800', fontSize: '1rem' }}>₹{String(item.price || '0').replace(/[^\d.]/g, '')}</span>
                                            <span style={{ padding: '2px 10px', fontSize: '0.72rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)' }}>{item.category || 'Appetizers'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                    <button 
                                        className={`stock-toggle-btn ${isAvailable ? 'in-stock' : 'sold-out'}`}
                                        onClick={() => toggleStockStatus(item)}
                                    >
                                        <i className={`fas ${isAvailable ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                        {isAvailable ? 'In Stock' : 'Sold Out'}
                                    </button>

                                    <button onClick={() => { 
                                        const priceClean = item.price ? String(item.price).replace(/[^\d]/g, '') : '';
                                        setEditingItem({
                                            ...item,
                                            price: priceClean,
                                            name: typeof item.name === 'string' ? { en: item.name, hi: '', ar: '' } : { en: '', hi: '', ar: '', ...(item.name || {}) },
                                            description: typeof item.description === 'string' ? { en: item.description, hi: '', ar: '' } : { en: '', hi: '', ar: '', ...(item.description || {}) }
                                        }); 
                                        setModalLang('en');
                                        setIsModalOpen(true); 
                                    }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--admin-border)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', color: 'var(--admin-primary)' }} title="Edit Product">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDeleteMenu(item.id)} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', color: 'var(--admin-danger)' }} title="Delete Product">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls Bar - Bottom Windowed Controls with Ellipses */}
            {!isAll && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 25, flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        style={{ background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', color: currentPage === 1 ? '#555' : 'var(--admin-text)', padding: '8px 14px', borderRadius: '10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: '700' }}
                    >
                        <i className="fas fa-chevron-left"></i> Previous
                    </button>

                    {getPageNumbers(currentPage, totalPages).map((page, idx) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${idx}`} style={{ color: 'var(--admin-text-muted)', padding: '0 6px', fontWeight: 'bold' }}>
                                    ...
                                </span>
                            );
                        }
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                style={{
                                    background: currentPage === page ? 'linear-gradient(135deg, var(--admin-primary) 0%, #B8860B 100%)' : 'rgba(255,255,255,0.05)',
                                    color: currentPage === page ? '#111' : 'var(--admin-text-muted)',
                                    border: currentPage === page ? 'none' : '1px solid var(--admin-border)',
                                    fontWeight: currentPage === page ? '800' : '600',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '0.88rem',
                                    boxShadow: currentPage === page ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none'
                                }}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                        style={{ background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', color: currentPage === totalPages ? '#555' : 'var(--admin-text)', padding: '8px 14px', borderRadius: '10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: '700' }}
                    >
                        Next <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </motion.div>
    );
}

