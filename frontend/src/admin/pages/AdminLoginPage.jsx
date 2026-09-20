import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../assets/admin-style.css';

export default function AdminLoginPage({ onLoginSuccess }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [infoMsg, setInfoMsg] = useState('');
    const navigate = useNavigate();

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsLoading(true);
        setInfoMsg('');
        try {
            const res = await axios.post(`${API_URL}/auth/request-email-otp`, { email });
            if (res.data.success) {
                setInfoMsg(res.data.message || 'OTP Sent to Email.');
                setStep(2);
            }
        } catch (err) {
            const errDetail = err.response?.data?.message || err.message;
            Swal.fire({
                title: 'Access Error',
                text: errDetail,
                icon: 'error',
                confirmButtonColor: '#8E1C1C'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const cleanCode = String(otp || '').trim();
            const res = await axios.post(`${API_URL}/auth/verify-email-otp`, { email, code: cleanCode, otp: cleanCode });
            const token = res.data?.token || res.data?.adminSessionToken;
            if (res.data?.success && token) {
                localStorage.setItem('adminSessionToken', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                if (onLoginSuccess) onLoginSuccess();
                navigate('/admin/dashboard');
            } else {
                setIsLoading(false);
                Swal.fire('Error', res.data?.message || 'Authentication failed', 'error');
            }
        } catch (err) {
            setIsLoading(false);
            Swal.fire({
                title: 'Verification Failed',
                text: err.response?.data?.message || 'Invalid or expired OTP code.',
                icon: 'error',
                confirmButtonColor: '#8E1C1C'
            });
        }
    };

    return (
        <div className="admin-login-body">
            <div className="login-card">
                <div className="login-card-brand" style={{ marginBottom: '24px' }}>
                    <img 
                        src="/pwa-icon-192.png" 
                        alt="Khaliya Restaurant Logo" 
                        style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)', border: '1px solid rgba(212, 175, 55, 0.3)' }} 
                    />
                    <div style={{ textAlign: 'left' }}>
                        <span className="gold-text" style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '2px', display: 'block' }}>KHALIYA</span>
                        <span style={{ fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '700' }}>RESTAURANT</span>
                    </div>
                </div>

                <h2 className="login-card-title" style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.65rem', fontWeight: '800' }}>
                    {step === 1 ? 'Administrator Access' : 'Enter Security OTP'}
                </h2>
                <p className="login-card-subtitle" style={{ margin: '0 0 28px 0', color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.4' }}>
                    {step === 1 ? 'Authorized personnel & sanctuary command center' : `Enter the 6-digit security code sent to ${email}`}
                </p>

                {infoMsg && (
                    <div style={{ padding: '12px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid #D4AF37', color: '#FFF3B0', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '22px', textAlign: 'center', fontWeight: '600' }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i> {infoMsg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                        <div className="admin-form-group" style={{ marginBottom: '22px' }}>
                            <label style={{ display: 'block', textAlign: 'left', marginBottom: '8px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: '#94A3B8' }}>
                                Admin Email Address
                            </label>
                            <input
                                type="email"
                                className="admin-input"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@khaliyahospitality.com"
                            />
                        </div>
                        <button type="submit" className="action-btn btn-primary" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}>
                            {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Sending Security OTP...</> : 'Send One-Time OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="admin-form-group" style={{ marginBottom: '22px' }}>
                            <label style={{ display: 'block', textAlign: 'left', marginBottom: '8px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: '#94A3B8' }}>
                                Enter 6-Digit Security OTP
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="• • • • • •"
                                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem', fontWeight: 'bold' }}
                            />
                        </div>
                        <button type="submit" className="action-btn btn-primary" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}>
                            {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Verifying Passcode...</> : 'Verify & Launch Dashboard'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginTop: '18px', fontSize: '0.82rem', fontWeight: '600' }}>
                            ← Change Email Address
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
