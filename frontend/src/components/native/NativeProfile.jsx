import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function NativeProfile() {
    const [adminPhone, setAdminPhone] = useState('');
    const [adminError, setAdminError] = useState('');

    const loyaltyData = JSON.parse(localStorage.getItem('khaliya_loyalty_status')) || { points: 1500, tier: 'Silver' };
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    const user = storedUserStr ? JSON.parse(storedUserStr) : { name: 'Guest User', phone: '' };

    const handleAppLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('khaliya_native_user');
            window.location.reload();
        }
    };

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
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=E63946&color=fff&size=120`} alt="Avatar" className="profile-avatar" />
                    <h2>{user.name}</h2>
                    <span className="profile-tier" style={{ marginTop: '5px', display: 'inline-block' }}>{user.phone ? `+91 ${user.phone}` : ''}</span>
                    <span className="profile-tier" style={{ display: 'block', marginTop: '10px' }}><i className="fas fa-crown"></i> {loyaltyData.tier} Member</span>
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
                <div className="settings-item" onClick={handleAppLogout} style={{ border: '2px dashed rgba(230, 57, 70, 0.4)', background: 'transparent' }}>
                    <div className="settings-icon" style={{ color: '#E63946' }}><i className="fas fa-sign-out-alt"></i></div>
                    <div className="settings-text" style={{ color: '#E63946', fontWeight: 'bold' }}>Log Out</div>
                </div>
            </motion.div>

            {/* Admin Access by Phone Number */}
            <motion.div
                className="profile-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ marginTop: '35px', marginBottom: '25px', padding: '20px', background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.05), rgba(0,0,0,0.2))', border: '1px solid rgba(230, 57, 70, 0.15)', borderRadius: '16px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(230, 57, 70, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Admin Panel Access</h3>
                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Authorized personnel only</span>
                    </div>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPhone === '8252731784') {
                        sessionStorage.setItem('adminLoggedIn', 'true');
                        // Use window.location to force full reload to admin router due to HashRouter context
                        window.location.hash = '#/admin/dashboard';
                    } else {
                        setAdminError('Invalid authorization number.');
                        setTimeout(() => setAdminError(''), 3000);
                    }
                }}>
                    <div style={{ position: 'relative' }}>
                        <i className="fas fa-mobile-alt" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#888' }}></i>
                        <input
                            type="tel"
                            placeholder="Enter Authorized Phone"
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                            style={{ width: '100%', padding: '12px 15px 12px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', boxSizing: 'border-box' }}
                        />
                    </div>
                    {adminError && <div style={{ color: '#E63946', fontSize: '0.8rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> {adminError}</div>}
                    <button type="submit" style={{ width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', marginTop: '15px' }}>
                        Access Admin Dashboard
                    </button>
                </form>
            </motion.div>

        </div>
    );
}
