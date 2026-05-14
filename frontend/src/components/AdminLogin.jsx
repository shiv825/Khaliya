import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../assets/admin-style.css';

export default function AdminLogin({ onLogin }) {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        
        // Secure Admin Credentials
        if (email === 'shivkumarrdn7@gmail.com' && password === 'shiv2006') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            onLogin(true);
            navigate('/admin/dashboard');
        } else {
            setError('❌ Access Denied. Invalid credentials.');
            setPassword('');
        }
    };

    return (
        <div className="admin-portal-wrapper" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(230, 57, 70, 0.03)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(69, 123, 157, 0.05)', borderRadius: '50%' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="admin-glass-card"
                style={{ 
                    padding: '3rem', 
                    maxWidth: '480px', 
                    width: '100%', 
                    background: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <motion.div 
                        initial={{ rotate: -15 }}
                        animate={{ rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        style={{ 
                            width: '90px', 
                            height: '90px', 
                            background: 'linear-gradient(135deg, var(--admin-primary) 0%, #c1121f 100%)', 
                            borderRadius: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 1.5rem', 
                            color: 'white', 
                            fontSize: '2.5rem', 
                            boxShadow: '0 15px 30px rgba(230, 57, 70, 0.25)' 
                        }}
                    >
                        <i className="fas fa-shield-alt"></i>
                    </motion.div>
                    <h1 style={{ marginTop: 0, color: '#0f172a', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Command Center</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Authenticated Personnel Only</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: '#334155', fontWeight: '700', fontSize: '0.9rem' }}>Admin Email</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-envelope" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="shivkumarrdn7@gmail.com"
                                style={{ 
                                    width: '100%', 
                                    padding: '16px 16px 16px 48px', 
                                    boxSizing: 'border-box', 
                                    border: '2px solid #e2e8f0', 
                                    borderRadius: '16px', 
                                    fontSize: '1.1rem', 
                                    transition: 'all 0.3s ease', 
                                    outline: 'none',
                                    background: 'rgba(255,255,255,0.5)'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'var(--admin-primary)';
                                    e.target.style.background = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(230, 57, 70, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.background = 'rgba(255,255,255,0.5)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.8rem' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: '#334155', fontWeight: '700', fontSize: '0.9rem' }}>Passcode</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-lock" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter secure passcode"
                                style={{ 
                                    width: '100%', 
                                    padding: '16px 16px 16px 48px', 
                                    boxSizing: 'border-box', 
                                    border: '2px solid #e2e8f0', 
                                    borderRadius: '16px', 
                                    fontSize: '1.1rem', 
                                    transition: 'all 0.3s ease', 
                                    outline: 'none',
                                    background: 'rgba(255,255,255,0.5)'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'var(--admin-primary)';
                                    e.target.style.background = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(230, 57, 70, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.background = 'rgba(255,255,255,0.5)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ 
                                    color: '#b91c1c', 
                                    fontSize: '0.9rem', 
                                    marginBottom: '1.8rem', 
                                    padding: '12px', 
                                    background: '#fef2f2', 
                                    borderRadius: '12px', 
                                    textAlign: 'center', 
                                    border: '1px solid #fee2e2',
                                    fontWeight: '600'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ filter: 'brightness(1.1)', boxShadow: '0 20px 25px -5px rgba(230, 57, 70, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={{ 
                            width: '100%', 
                            padding: '18px', 
                            borderRadius: '16px', 
                            fontSize: '1.1rem', 
                            fontWeight: '800', 
                            background: 'var(--admin-primary)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginBottom: '1rem'
                        }}
                    >
                        Access Dashboard
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#64748b', 
                            cursor: 'pointer', 
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            margin: '0 auto',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseOver={e => e.target.style.color = 'var(--admin-primary)'}
                        onMouseOut={e => e.target.style.color = '#64748b'}
                    >
                        <i className="fas fa-arrow-left"></i> Back to Khaliya Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
