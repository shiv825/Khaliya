import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function StaffLoginPage() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    const handleKeyPress = (num) => {
        if (pin.length < 4) {
            const nextPin = pin + num;
            setPin(nextPin);
            if (nextPin.length === 4) {
                submitPin(nextPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPin('');
    };

    const submitPin = async (enteredPin) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/staff-login`, { pin: enteredPin });
            if (res.data.success) {
                localStorage.setItem('staffSessionToken', res.data.token);
                localStorage.setItem('staffUser', JSON.stringify(res.data.user));
                
                const role = res.data.user.role || 'WAITER';
                Swal.fire({
                    title: `Welcome, ${res.data.user.name}!`,
                    text: `Authenticated as ${role}. Redirecting to staff portal...`,
                    icon: 'success',
                    timer: 1200,
                    showConfirmButton: false,
                    background: '#121620',
                    color: '#FFF'
                });

                setTimeout(() => {
                    if (role === 'KITCHEN') navigate('/staff/kitchen');
                    else if (role === 'CASHIER') navigate('/admin/billing');
                    else navigate('/staff/waiter');
                }, 1300);
            }
        } catch (err) {
            Swal.fire({
                title: 'Invalid Staff PIN',
                text: 'Please check your 4-digit PIN or try demo PIN 1234.',
                icon: 'error',
                background: '#121620',
                color: '#FFF',
                confirmButtonColor: '#e74c3c'
            });
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#070A0E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Outfit, sans-serif' }}>
            <div style={{ maxWidth: '400px', width: '100%', background: 'linear-gradient(145deg, rgba(20, 24, 34, 0.95), rgba(8, 11, 16, 0.98))', border: '1.5px solid rgba(212, 175, 55, 0.45)', borderRadius: '28px', padding: '32px 24px', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(212, 175, 55, 0.2)', textAlign: 'center' }}>
                
                {/* Header Brand */}
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #AA7C11)', color: '#000', fontSize: '1.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    K
                </div>
                <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                    Khaliya Staff Portal
                </h1>
                <p style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 24px 0' }}>
                    ENTER YOUR 4-DIGIT PIN
                </p>

                {/* PIN Indicator Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '30px' }}>
                    {[0, 1, 2, 3].map(i => (
                        <div 
                            key={i}
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: '2px solid #D4AF37',
                                background: i < pin.length ? '#FFD700' : 'transparent',
                                boxShadow: i < pin.length ? '0 0 12px #FFD700' : 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    ))}
                </div>

                {/* Numeric Keypad Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num)}
                            disabled={loading}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                color: '#FFF',
                                border: '1px solid rgba(212, 175, 55, 0.25)',
                                borderRadius: '16px',
                                height: '60px',
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                            }}
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={handleClear} style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '16px', height: '60px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' }}>CLR</button>
                    <button onClick={() => handleKeyPress('0')} style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', height: '60px', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer' }}>0</button>
                    <button onClick={handleDelete} style={{ background: 'rgba(255,255,255,0.06)', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', height: '60px', fontSize: '1.2rem', cursor: 'pointer' }}>⌫</button>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#8A94A6', marginTop: '15px' }}>
                    Demo Waiter PIN: <strong style={{ color: '#FFD700' }}>1234</strong> | Cashier: <strong style={{ color: '#FFD700' }}>2345</strong>
                </div>
            </div>
        </div>
    );
}
