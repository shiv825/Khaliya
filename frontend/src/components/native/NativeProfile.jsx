import React from 'react';
import { motion } from 'framer-motion';

export default function NativeProfile() {
    // Read from local storage exactly like the main app
    const loyaltyData = JSON.parse(localStorage.getItem('khaliya_loyalty_status')) || { points: 1500, tier: 'Silver' };

    return (
        <div className="native-profile-view">
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
