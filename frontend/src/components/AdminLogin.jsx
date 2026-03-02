import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLogin({ onLogin }) {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // The original hardcoded password from admin-portal.js
        if (password === 'khaliya2024') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            onLogin(true);
            navigate('/admin/dashboard');
        } else {
            setError('❌ Incorrect password. Try again.');
            setPassword('');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
                <h3 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>{t('msg.loginTitle')}</h3>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>{t('msg.loginPrompt')}</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '1rem', fontSize: '1rem' }}
                        autoFocus
                    />
                    {error && <div style={{ color: '#E63946', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                        {t('msg.loginBtn')}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                        Return to Website
                    </button>
                </div>
            </div>
        </div>
    );
}
