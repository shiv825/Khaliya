import React from 'react';
import { motion } from 'framer-motion';

export default function NativeProfile() {
    // Read from local storage exactly like the main app
    const loyaltyData = JSON.parse(localStorage.getItem('khaliya_loyalty_status')) || { points: 1500, tier: 'Silver' };

    const activeReservations = [
        { id: 1, date: "Oct 25, 2026", time: "19:30", guests: 2, status: "Confirmed" }
    ];

    const recentOrders = [
        { id: 101, items: "Butter Chicken, Garlic Naan", total: "₹530", status: "Delivered", date: "Oct 20, 2026" }
    ];

    return (
        <div className="native-profile-view" id="native-profile">
            <motion.div
                className="native-profile-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="profile-hero">
                    <img src="https://ui-avatars.com/api/?name=Guest+User&background=E63946&color=fff&size=120" alt="Avatar" className="profile-avatar" />
                    <h2>Guest User</h2>
                    <span className="profile-tier"><i className="fas fa-crown"></i> {loyaltyData.tier} Member</span>
                </div>
            </motion.div>

            <motion.div
                className="loyalty-card-native"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <h3>Spice Club Points</h3>
                <div className="points-display">
                    <span className="points-number">{loyaltyData.points}</span>
                    <span className="points-label">pts</span>
                </div>
                <div className="progress-bar-container mt-15">
                    <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <p className="points-subtitle">500 pts to Gold Tier</p>
            </motion.div>

            {/* Active Reservation */}
            <motion.div
                className="profile-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ marginBottom: '25px' }}
            >
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--text-color, #fff)' }}>Active Reservation</h3>
                {activeReservations.map(res => (
                    <div key={res.id} style={{ background: 'var(--card-bg, #1e1e1e)', borderRadius: '16px', padding: '15px', border: '1px solid var(--border-color, rgba(255,255,255,0.05))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-color, #fff)', marginBottom: '5px' }}><i className="far fa-calendar-alt" style={{ color: 'var(--primary-color)' }}></i> {res.date} at {res.time}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #aaa)' }}>{res.guests} Guests • Table Booking</span>
                        </div>
                        <div style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {res.status}
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                className="profile-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ marginBottom: '25px' }}
            >
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--text-color, #fff)' }}>Recent Order</h3>
                {recentOrders.map(order => (
                    <div key={order.id} style={{ background: 'var(--card-bg, #1e1e1e)', borderRadius: '16px', padding: '15px', border: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <strong style={{ color: 'var(--text-color, #fff)' }}>Order #{order.id}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #aaa)' }}>{order.date}</span>
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted, #aaa)' }}>{order.items}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: 'var(--primary-color)' }}>{order.total}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold' }}><i className="fas fa-check-circle"></i> {order.status}</span>
                        </div>
                    </div>
                ))}
            </motion.div>

            <motion.div
                className="settings-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="settings-item">
                    <div className="settings-icon"><i className="fas fa-history"></i></div>
                    <div className="settings-text">Order History</div>
                    <i className="fas fa-chevron-right arrow"></i>
                </div>
                <div className="settings-item">
                    <div className="settings-icon"><i className="fas fa-heart"></i></div>
                    <div className="settings-text">Saved Items</div>
                    <i className="fas fa-chevron-right arrow"></i>
                </div>
                <div className="settings-item">
                    <div className="settings-icon"><i className="fas fa-cog"></i></div>
                    <div className="settings-text">App Settings</div>
                    <i className="fas fa-chevron-right arrow"></i>
                </div>
            </motion.div>
        </div>
    );
}
