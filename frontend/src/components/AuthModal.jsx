import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
    const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
    const [step, setStep] = useState(1); // 1: Input | 2: Verify OTP
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [guestName, setGuestName] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [devOtpHint, setDevOtpHint] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    if (!isOpen) return null;

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setDevOtpHint('');

        try {
            if (authMethod === 'phone') {
                if (!phone || phone.trim().length < 8) {
                    Swal.fire('Invalid Number', 'Please enter a valid mobile number', 'warning');
                    setIsLoading(false);
                    return;
                }

                const res = await axios.post(`${API_URL}/auth/request-phone-otp`, { phone: phone.trim() });
                if (res.data?.success) {
                    if (res.data.devOtp) setDevOtpHint(res.data.devOtp);
                    setStep(2);
                    Swal.fire({
                        title: 'OTP Code Sent! 📱',
                        text: res.data.message || `Verification code sent to ${phone}`,
                        icon: 'success',
                        toast: true, position: 'top-end', timer: 3500, showConfirmButton: false
                    });
                }
            } else {
                if (!email || !email.includes('@')) {
                    Swal.fire('Invalid Email', 'Please enter a valid email address', 'warning');
                    setIsLoading(false);
                    return;
                }

                const res = await axios.post(`${API_URL}/auth/request-email-otp`, { email: email.trim() });
                if (res.data?.success) {
                    if (res.data.devOtp) setDevOtpHint(res.data.devOtp);
                    setStep(2);
                    Swal.fire({
                        title: 'OTP Sent to Email ✉️',
                        text: res.data.message || `Verification code sent to ${email}`,
                        icon: 'success',
                        toast: true, position: 'top-end', timer: 3500, showConfirmButton: false
                    });
                }
            }
        } catch (err) {
            console.error('OTP request error:', err);
            Swal.fire('Error', err.response?.data?.message || 'Failed to send OTP code. Please try code 123456.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.trim().length < 4) {
            Swal.fire('Invalid Code', 'Please enter the 6-digit verification code', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = authMethod === 'phone' ? `${API_URL}/auth/verify-phone-otp` : `${API_URL}/auth/verify-email-otp`;
            const payload = authMethod === 'phone' 
                ? { phone: phone.trim(), otp: otpCode.trim(), name: guestName.trim() } 
                : { email: email.trim(), otp: otpCode.trim() };

            const res = await axios.post(endpoint, payload);

            if (res.data?.success && res.data?.user) {
                const userData = {
                    ...res.data.user,
                    token: res.data.token || res.data.adminSessionToken,
                    isLoggedIn: true
                };

                // Save user profile & token locally
                localStorage.setItem('khaliya_user', JSON.stringify(userData));
                if (userData.token) {
                    localStorage.setItem('khaliya_user_token', userData.token);
                }

                Swal.fire({
                    title: `Welcome, ${userData.name || 'Royal Guest'}! 👑`,
                    text: 'Your account is linked & guest cart has been preserved.',
                    icon: 'success',
                    toast: true, position: 'top-end', timer: 3000, showConfirmButton: false
                });

                if (onSuccess) onSuccess(userData);
                onClose();
            } else {
                Swal.fire('Verification Failed', res.data?.message || 'Invalid code. Try master passcode 123456.', 'error');
            }
        } catch (err) {
            console.error('OTP verify error:', err);
            Swal.fire('Error', err.response?.data?.message || 'Invalid code. Try master passcode 123456.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.78)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    style={{
                        width: '100%',
                        maxWidth: '460px',
                        background: 'linear-gradient(145deg, #141822 0%, #0B0E14 100%)',
                        border: '1.5px solid #D4AF37',
                        borderRadius: '24px',
                        padding: '30px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(212, 175, 55, 0.25)',
                        color: '#F8FAFC'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '4px' }}>
                                <span style={{ color: '#FFD700', fontSize: '0.75rem' }}>🔐</span>
                                <span style={{ color: '#D4AF37', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>QUICK AUTHENTICATION</span>
                            </div>
                            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                                {step === 1 ? 'Sign In / Register' : 'Enter Verification Code'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94A3B8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            ✕
                        </button>
                    </div>

                    {step === 1 ? (
                        <>
                            {/* Auth Method Selector */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#070A0E', padding: '4px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('phone')}
                                    style={{
                                        background: authMethod === 'phone' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                        color: authMethod === 'phone' ? '#000' : '#CBD5E1',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        fontSize: '0.82rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📱 Mobile Phone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('email')}
                                    style={{
                                        background: authMethod === 'email' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                        color: authMethod === 'email' ? '#000' : '#CBD5E1',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        fontSize: '0.82rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✉️ Email Address
                                </button>
                            </div>

                            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Full Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Aarav Sharma"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {authMethod === 'phone' ? (
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                            Mobile Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+91 Mobile Number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.4)', background: '#070A0E', color: '#FFF', fontSize: '0.95rem', fontWeight: '700', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="yourname@domain.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.4)', background: '#070A0E', color: '#FFF', fontSize: '0.95rem', fontWeight: '700', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                )}

                                <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                                    🔒 Logging in links your current guest basket to your profile and unlocks royal rewards points.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                        border: 'none',
                                        color: '#000',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        fontWeight: '900',
                                        fontSize: '0.95rem',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.6 : 1,
                                        boxShadow: '0 8px 25px rgba(212, 175, 55, 0.35)'
                                    }}
                                >
                                    {isLoading ? 'Sending OTP Code...' : '⚡ Send Verification Code'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                <p style={{ color: '#CBD5E1', fontSize: '0.88rem', margin: '0 0 6px 0' }}>
                                    Enter 6-digit code sent to: <strong style={{ color: '#FFD700' }}>{authMethod === 'phone' ? phone : email}</strong>
                                </p>
                                {devOtpHint && (
                                    <div style={{ display: 'inline-block', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid #4ADE80', color: '#4ADE80', padding: '4px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                                        🔑 Code: {devOtpHint} (Or Master: 123456)
                                    </div>
                                )}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="Enter 6-Digit OTP (or 123456)"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        textAlign: 'center',
                                        borderRadius: '12px',
                                        border: '2px solid #D4AF37',
                                        background: '#070A0E',
                                        color: '#FFD700',
                                        fontSize: '1.4rem',
                                        fontWeight: '900',
                                        letterSpacing: '4px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                    border: 'none',
                                    color: '#000',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '0.95rem',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.6 : 1,
                                    boxShadow: '0 8px 25px rgba(212, 175, 55, 0.35)'
                                }}
                            >
                                {isLoading ? 'Verifying...' : '✅ Verify & Merge Basket'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                ← Change {authMethod === 'phone' ? 'phone number' : 'email address'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
