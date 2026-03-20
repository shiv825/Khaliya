import React from 'react';
import { motion } from 'framer-motion';

export default function NativeNotification({ onComplete }) {
    return (
        <div className="notification-screen">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
                    alt="Notification Illustration"
                    className="notif-illustration"
                />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '15px' }}
            >
                Enable notifications to get updates about offers, order status and more
            </motion.h2>

            <motion.div
                className="notif-actions"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ width: '100%', marginTop: 'auto' }}
            >
                <button
                    className="zomato-btn-main"
                    onClick={onComplete}
                >
                    Enable Notifications
                </button>
                <button
                    className="native-btn-secondary"
                    onClick={onComplete}
                    style={{ background: 'transparent', color: '#696969', border: '1px solid #ddd' }}
                >
                    Not now
                </button>
            </motion.div>
        </div>
    );
}
