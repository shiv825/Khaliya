import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../assets/admin-style.css';

export default function AdminLogin({ onLogin }) {
    const { t } = useLanguage();
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const navigate = useNavigate();

    const getApiUrl = () => {
        const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
        const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
        return cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';
    };

    const handleRequestOtp = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setInfoMsg('');
        if (!email.trim()) {
            setError('Please enter your Admin Email address.');
            return;
        }

        setIsLoading(true);
        const API_URL = getApiUrl();

        try {
            const res = await axios.post(`${API_URL}/auth/request-email-otp`, { email: email.trim().toLowerCase() }, { timeout: 15000 });
            if (res.data.success) {
                setStep('otp');
                setInfoMsg(`Verification code sent to ${email}`);
            } else {
                throw new Error(res.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to request OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        setError('');
        if (!otpCode.trim()) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        setIsLoading(true);
        const API_URL = getApiUrl();

        try {
            const res = await axios.post(`${API_URL}/auth/verify-email-otp`, { 
                email: email.trim().toLowerCase(), 
                code: otpCode.trim() 
            }, { timeout: 15000 });

            if (res.data.success && res.data.adminSessionToken) {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminSessionToken', res.data.adminSessionToken);
                onLogin(true);
                navigate('/admin/dashboard');
            } else if (res.data.success && !res.data.adminSessionToken) {
                setError('🔒 Access Denied: This email account does not have administrator privileges.');
            } else {
                throw new Error(res.data.message || 'Authentication failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || '🔒 Verification failed. Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
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

                {step === 'email' ? (
                    <form onSubmit={handleRequestOtp}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <div style={{ position: 'relative' }}>
                                <i className="fas fa-envelope" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)' }}></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Admin Email Address"
                                    required
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
                            disabled={isLoading}
                            style={{ 
                                width: '100%', 
                                padding: '18px', 
                                background: 'var(--admin-primary)', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontWeight: '900', 
                                fontSize: '1.1rem', 
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Sending OTP...' : 'Send Access OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <div style={{ position: 'relative' }}>
                                <i className="fas fa-key" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)' }}></i>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="Enter 6-Digit OTP"
                                    required
                                    autoFocus
                                    style={{ 
                                        width: '100%', 
                                        padding: '18px 18px 18px 48px', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid var(--admin-border)', 
                                        borderRadius: '12px', 
                                        color: '#fff', 
                                        fontSize: '1.2rem',
                                        letterSpacing: '4px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {infoMsg && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ color: '#2A9D8F', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '600' }}
                                >
                                    {infoMsg}
                                </motion.div>
                            )}
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
                            disabled={isLoading}
                            style={{ 
                                width: '100%', 
                                padding: '18px', 
                                background: 'var(--admin-primary)', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontWeight: '900', 
                                fontSize: '1.1rem', 
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Enter'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('email'); setError(''); setInfoMsg(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', marginTop: '1rem', fontSize: '0.85rem' }}
                        >
                            <i className="fas fa-redo"></i> Resend to different email
                        </button>
                    </form>
                )}

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
