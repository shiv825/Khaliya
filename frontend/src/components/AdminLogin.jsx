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
            localStorage.setItem('adminLoggedIn', 'true');
            onLogin(true);
            navigate('/admin/dashboard');
        } else {
            setError('🔒 Access Denied. Secure authentication failed.');
            setPassword('');
        }
    };

    return (
        <div className="admin-portal-wrapper" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            minHeight: '100vh'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-glass-card"
                style={{ 
                    padding: '3.5rem', 
                    maxWidth: '450px', 
                    width: '100%', 
                    textAlign: 'center',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
            >
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ 
                        fontFamily: 'Playfair Display', 
                        color: 'var(--admin-primary)', 
                        fontSize: '2.5rem', 
                        margin: '0 0 10px 0',
                        letterSpacing: '2px'
                    }}>KHALIYA</h1>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Command Center</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-envelope" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)' }}></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Admin ID"
                                style={{ 
                                    width: '100%', 
                                    padding: '18px 18px 18px 48px', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid var(--admin-border)', 
                                    borderRadius: '12px', 
                                    color: '#fff', 
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-lock" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)' }}></i>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Secure Passcode"
                                style={{ 
                                    width: '100%', 
                                    padding: '18px 18px 18px 48px', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid var(--admin-border)', 
                                    borderRadius: '12px', 
                                    color: '#fff', 
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ color: '#E63946', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '600' }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        style={{ 
                            width: '100%', 
                            padding: '18px', 
                            background: 'var(--admin-primary)', 
                            color: '#000', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontWeight: '900', 
                            fontSize: '1.1rem', 
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        Enter Sanctuary
                    </button>
                </form>

                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', marginTop: '2rem', fontSize: '0.85rem' }}
                >
                    <i className="fas fa-arrow-left"></i> Return to Front
                </button>
            </motion.div>
        </div>
    );
}
