import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';

export default function InventoryPage() {
    const { menu, settings, toggleSurgePricing, toggleStockStatus, searchQuery, setSearchQuery } = useAdmin();
    const [stockFilter, setStockFilter] = useState('ALL');

    // Filter menu based on search query and stock filter
    const filteredMenu = menu.filter(item => {
        const nameEn = (typeof item.name === 'object' ? item.name.en : item.name) || '';
        const category = item.category || '';
        const matchesSearch = nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              category.toLowerCase().includes(searchQuery.toLowerCase());

        const isAvailable = item.available !== false && item.inStock !== false;
        const matchesStock = stockFilter === 'ALL' ? true :
                             stockFilter === 'IN_STOCK' ? isAvailable :
                             !isAvailable;

        return matchesSearch && matchesStock;
    });

    const totalCount = menu.length;
    const inStockCount = menu.filter(i => i.available !== false && i.inStock !== false).length;
    const outOfStockCount = totalCount - inStockCount;

    return (
        <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Surge Pricing Controller Banner */}
            <div className="surge-controller-card">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-text)' }}>⚡ Peak Demand Surge Pricing Controller</h2>
                        <span className={`surge-status-badge ${settings.isSurgeActive ? 'active' : 'inactive'}`}>
                            {settings.isSurgeActive ? `Surge Active (${settings.surgeMultiplier || 1.2}x)` : 'Standard Pricing'}
                        </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '0.9rem', maxWidth: '650px' }}>
                        Dynamically adjust menu prices during high peak demand (e.g. weekend dinner rush). Out of stock items are instantly hidden from customer ordering apps.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[1.1, 1.2, 1.3, 1.5].map(m => (
                        <button 
                            key={m} 
                            className={`surge-multiplier-btn ${settings.isSurgeActive && settings.surgeMultiplier === m ? 'active' : ''}`}
                            onClick={() => toggleSurgePricing(true, m)}
                        >
                            {m}x (+{Math.round((m - 1) * 100)}%)
                        </button>
                    ))}
                    <button 
                        className={`action-btn ${settings.isSurgeActive ? 'btn-cancel' : 'btn-primary'}`}
                        onClick={() => toggleSurgePricing(!settings.isSurgeActive, settings.surgeMultiplier || 1.2)}
                        style={{ padding: '10px 18px' }}
                    >
                        {settings.isSurgeActive ? 'Deactivate Surge' : 'Activate Peak Surge'}
                    </button>
                </div>
            </div>

            {/* Instant Search & Stock Filter Header Bar */}
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--admin-text)' }}>
                            <i className="fas fa-boxes-stacked" style={{ color: 'var(--admin-primary)', marginRight: '10px' }}></i>
                            Stock & Surge Price Control Hub
                        </h3>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                            Search dishes instantly by name or category to toggle stock availability.
                        </p>
                    </div>

                    {/* Stock Status Pills */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setStockFilter('ALL')}
                            style={{
                                background: stockFilter === 'ALL' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.04)',
                                color: stockFilter === 'ALL' ? '#000' : 'var(--admin-text)',
                                border: '1px solid var(--admin-border)',
                                padding: '6px 14px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            onClick={() => setStockFilter('IN_STOCK')}
                            style={{
                                background: stockFilter === 'IN_STOCK' ? '#2ecc71' : 'rgba(255,255,255,0.04)',
                                color: stockFilter === 'IN_STOCK' ? '#000' : '#2ecc71',
                                border: '1px solid rgba(46, 204, 113, 0.3)',
                                padding: '6px 14px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            In Stock ({inStockCount})
                        </button>
                        <button
                            onClick={() => setStockFilter('OUT_OF_STOCK')}
                            style={{
                                background: stockFilter === 'OUT_OF_STOCK' ? '#e74c3c' : 'rgba(255,255,255,0.04)',
                                color: stockFilter === 'OUT_OF_STOCK' ? '#fff' : '#e74c3c',
                                border: '1px solid rgba(231, 76, 60, 0.3)',
                                padding: '6px 14px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            Out of Stock ({outOfStockCount})
                        </button>
                    </div>
                </div>

                {/* Instant Search Bar */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)', fontSize: '1rem' }}></i>
                    <input 
                        type="text"
                        placeholder="Search product by name or category (e.g. Biryani, Kabab, Appetizers)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1.5px solid var(--admin-border)',
                            borderRadius: '14px',
                            padding: '12px 42px 12px 46px',
                            color: 'var(--admin-text)',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            outline: 'none',
                            transition: 'var(--transition)'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Inventory List */}
            <div className="menu-list-view">
                {filteredMenu.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                        <i className="fas fa-search-minus" style={{ fontSize: '2rem', color: 'var(--admin-primary)', marginBottom: '10px', display: 'block' }}></i>
                        No products match your search query "{searchQuery}".
                    </div>
                ) : (
                    filteredMenu.map(item => {
                        const isAvailable = item.available !== false && item.inStock !== false;
                        const nameEn = typeof item.name === 'object' ? item.name.en : item.name;
                        const basePrice = item.price ? String(item.price).replace(/[^\d.]/g, '') : '0';
                        const surgePrice = item.effectivePriceNum || Math.round(Number(basePrice) * (settings.surgeMultiplier || 1.2));
                        return (
                            <div key={item.id} className="menu-list-row" style={{ opacity: isAvailable ? 1 : 0.6 }}>
                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                    {item.image ? <img src={item.image} className="menu-list-image" alt={nameEn} /> : <div className="menu-list-image" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-box" style={{ color: 'var(--admin-text-muted)' }}></i></div>}
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--admin-text)' }}>{nameEn}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Category: {item.category || 'Main Course'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Base: ₹{basePrice}</div>
                                        {settings.isSurgeActive && (
                                            <div style={{ fontWeight: '800', color: 'var(--admin-accent)', fontSize: '0.95rem' }}>
                                                Surge: ₹{surgePrice}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        className={`stock-toggle-btn ${isAvailable ? 'in-stock' : 'sold-out'}`}
                                        onClick={() => toggleStockStatus(item)}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        <i className={`fas ${isAvailable ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                        {isAvailable ? 'In Stock' : 'Mark Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
