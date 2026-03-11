import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

import { motion, AnimatePresence } from 'framer-motion';
import '../assets/admin-portal.css';

export default function AdminLogin({ onLogin }) {
    const { t } = useLanguage();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Authorized Admin Number
        if (phone === '8252731784') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            onLogin(true);
            navigate('/admin/dashboard');
        } else {
            setError('❌ Access Denied. Unauthorized phone number.');
            setPhone('');
        }
    };

    return (
        <div className="admin-login-wrapper">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="admin-login-container"
            >
                <div className="admin-login-header">
                    <div className="admin-login-icon">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <h3>Admin Portal</h3>
                    <p>Secure access for authorized personnel only</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter authorized number"
                            className="form-input"
                            autoFocus
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="admin-login-error"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn btn-primary admin-login-btn"
                    >
                        Login to Dashboard
                    </motion.button>
                </form>
                <div className="admin-login-footer">
                    <button onClick={() => navigate('/')} className="admin-return-btn">
                        Return to Website
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
