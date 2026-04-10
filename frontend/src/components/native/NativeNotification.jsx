import React from 'react';
import { motion } from 'framer-motion';

export default function NativeNotification({ onComplete }) {
    return (
        <div className="notification-screen" style={{ background: 'var(--bg-body)', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '40px' }}
            >
                <div style={{ width: '120px', height: '120px', background: 'rgba(142, 28, 28, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-bell" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
                </div>
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '15px', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}
            >
                Stay Connected
            </motion.h2>
            
            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '40px', lineHeight: '1.5', fontWeight: '600' }}
            >
                Enable notifications to receive royal updates, exclusive offers, and real-time order status.
            </motion.p>

            <motion.div
                className="notif-actions"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
                <button
                    className="zomato-btn-main"
                    onClick={onComplete}
                    style={{ margin: 0 }}
                >
                    Enable Notifications
                </button>
                <button
                    className="native-btn-secondary"
                    onClick={onComplete}
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-light)', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '15px', fontWeight: '800' }}
                >
                    Maybe Later
                </button>
            </motion.div>
        </div>
    );
}
