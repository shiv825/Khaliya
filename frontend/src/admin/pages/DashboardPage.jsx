import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdmin } from '../AdminContext';
import StoreSettingsModal from '../../components/StoreSettingsModal';

export default function DashboardPage() {
    const { analytics, orders, menu, settings } = useAdmin();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const pieColors = ['#E63946', '#FF9F1C', '#2A9D8F', '#264653', '#E9C46A'];
    const categorySales = {};
    orders.forEach(o => {
        if (o.status !== 'cancelled') {
            o.items?.forEach(i => {
                const menuItem = menu.find(m => m.name === i.name || (m.name && m.name.en === i.name));
                const cat = menuItem?.category || 'Other';
                categorySales[cat] = (categorySales[cat] || 0) + i.quantity;
            });
        }
    });
    const pieData = Object.keys(categorySales).map(key => ({ name: key, value: categorySales[key] })).filter(d => d.value > 0);

    return (
        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Store & Delivery Settings Overview Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(20, 24, 34, 0.95) 0%, rgba(11, 14, 20, 0.98) 100%)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
            }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '8px' }}>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>⚙️</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            LIVE STORE &amp; DELIVERY SETTINGS
                        </span>
                    </div>
                    <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: '800' }}>
                        Configured Fees &amp; Radius
                    </h3>
                    <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: '#CBD5E1', fontSize: '0.88rem' }}>
                        <span>📊 <strong>GST:</strong> {settings?.gstRate ?? 5}%</span>
                        <span>📦 <strong>Packaging Fee:</strong> ₹{settings?.packagingFee ?? 25}</span>
                        <span>🛵 <strong>Delivery Fee:</strong> ₹{settings?.deliveryFee ?? 40}</span>
                        <span>📍 <strong>Delivery Radius:</strong> {settings?.deliveryRadiusKm ?? 15} km</span>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '6px' }}>
                        🏢 <strong>Address:</strong> {settings?.restaurantAddress || "Khaliya Sanctuary, Main Boulevard, New Delhi"} (Lat: {settings?.restaurantLat ?? 28.6139}, Lng: {settings?.restaurantLng ?? 77.2090})
                    </div>
                </div>

                <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                        color: '#000',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.88rem',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fas fa-sliders-h"></i> Configure Store Fees
                </button>
            </div>

            <div className="hero-grid">
                <div className="hero-card">
                    <div className="hero-card-title">Today's Revenue</div>
                    <div className="hero-card-value">₹{analytics?.revenue?.today?.toFixed(2) || '0.00'}</div>
                    <div className="hero-card-trend" style={{ color: 'var(--admin-success)' }}><i className="fas fa-arrow-up"></i> Live tracking</div>
                </div>
                <div className="hero-card">
                    <div className="hero-card-title">Active Orders</div>
                    <div className="hero-card-value">{analytics?.activeOrders || 0}</div>
                    <div className="hero-card-trend" style={{ color: 'var(--admin-accent)' }}>Kitchen is preparing</div>
                </div>
                <div className="hero-card">
                    <div className="hero-card-title">New Customers Today</div>
                    <div className="hero-card-value">{analytics?.visitors?.today || 0}</div>
                    <div className="hero-card-trend" style={{ color: 'var(--admin-success)' }}><i className="fas fa-chart-line"></i> App & Web Traffic</div>
                </div>
                <div className="hero-card">
                    <div className="hero-card-title">Top Selling Item</div>
                    <div className="hero-card-value" style={{ fontSize: '1.2rem', marginTop: '10px' }}>{typeof analytics?.topItem?.name === 'object' ? analytics.topItem.name.en : (analytics?.topItem?.name || 'Loading...')}</div>
                    <div className="hero-card-trend" style={{ color: 'var(--admin-primary)' }}>🔥 {analytics?.topItem?.sold || 0} sold today</div>
                </div>
            </div>

            <div className="admin-charts-grid">
                <div className="hero-card" style={{ height: '400px' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>Hourly Rush (Orders Today)</h3>
                    {analytics?.hourlyRush && analytics.hourlyRush.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.hourlyRush}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="orders" stroke="var(--admin-primary)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)' }}>Not enough data for chart</div>
                    )}
                </div>
                <div className="hero-card" style={{ height: '400px' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>Sales by Category</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)' }}>Not enough data for chart</div>
                    )}
                </div>
            </div>

            {/* Store Settings Modal */}
            <StoreSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </motion.div>
    );
}
