import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NativeAuth({ onLoginSuccess }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || formData.phone.length < 10) {
            setError('Please fill all fields correctly.');
            return;
        }
        setError('');
        setIsLoading(true);

        // Logging user in directly as requested
        setTimeout(() => {
            setIsLoading(false);
            localStorage.setItem('khaliya_native_user', JSON.stringify({
                ...formData,
                isLoggedIn: true
            }));
            onLoginSuccess();
        }, 800);
    };

    return (
        <div className="native-auth-container">
            <div className="auth-background-shape"></div>
            <div className="auth-background-shape-2"></div>

            <motion.div
                className="auth-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="auth-logo">
                    <img src="./pwa-icon-192.png" alt="Khaliya Logo" />
                </div>
                <h2>Khaliya</h2>
                <p>Authentic Indian Cuisine</p>
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.form
                    key="step1"
                    className="auth-form-card glass-panel"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleSendOTP}
                >
                    <h3>Welcome</h3>
                    <p className="auth-subtitle">Log in or sign up to begin</p>

                    <div className="auth-input-group">
                        <i className="far fa-user"></i>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <i className="far fa-envelope"></i>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <i className="fas fa-phone-alt"></i>
                        <div className="phone-prefix">+91</div>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength="10"
                            required
                            style={{ paddingLeft: '50px' }}
                        />
                    </div>

                    {error && <div className="auth-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

                    <button
                        type="submit"
                        className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="auth-spinner"></span> : 'Login securely'}
                    </button>
                </motion.form>
            </AnimatePresence>
        </div>
    );
}
