import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';

export default function InventoryPage() {
    const { menu, settings, toggleSurgePricing, toggleStockStatus } = useAdmin();

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

            {/* Inventory List */}
            <div className="menu-list-view">
                <h3 style={{ marginTop: 0, marginBottom: 15 }}>Live Inventory & Price Overrides</h3>
                {menu.map(item => {
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
                })}
            </div>
        </motion.div>
    );
}
