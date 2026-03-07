import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

import { motion, AnimatePresence } from 'framer-motion';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%', border: '1px solid rgba(0,0,0,0.05)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--primary-color, #E63946)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white', fontSize: '2rem', boxShadow: '0 8px 16px rgba(230, 57, 70, 0.2)' }}>
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <h3 style={{ marginTop: 0, color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800' }}>Admin Portal</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem' }}>Secure access for authorized personnel only</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#444', fontWeight: '600', fontSize: '0.9rem' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter authorized number"
                            style={{ width: '100%', padding: '14px 16px', boxSizing: 'border-box', border: '2px solid #eee', borderRadius: '12px', fontSize: '1rem', transition: 'border-color 0.3s ease', outline: 'none' }}
                            onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={e => e.target.style.borderColor = '#eee'}
                            autoFocus
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ color: '#E63946', fontSize: '0.9rem', marginBottom: '1.5rem', padding: '10px', background: 'rgba(230, 57, 70, 0.05)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(230, 57, 70, 0.1)' }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(230, 57, 70, 0.2)' }}
                    >
                        Login to Dashboard
                    </motion.button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                        Return to Website
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
