import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdmin } from '../AdminContext';

export default function DashboardPage() {
    const { analytics, orders, menu } = useAdmin();

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
        </motion.div>
    );
}
