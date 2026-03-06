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

        // Simulating API call to send OTP
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
            // Auto focus first OTP input
            setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return; // Only allow 1 char

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto advance
        if (value !== '' && index < 3) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Backspace to previous input
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 4) {
            setError('Please enter complete OTP');
            return;
        }

        setIsLoading(true);
        // Simulating verification (Mock OTP is 1234)
        setTimeout(() => {
            setIsLoading(false);
            if (enteredOtp === '1234') {
                // Success: Save user info and notify App Shell
                localStorage.setItem('khaliya_native_user', JSON.stringify({
                    ...formData,
                    isLoggedIn: true
                }));
                onLoginSuccess();
            } else {
                setError('Invalid OTP. Please use 1234 for testing.');
                setOtp(['', '', '', '']);
                document.getElementById('otp-0')?.focus();
            }
        }, 1500);
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
                    <img src="/pwa-icon-192.png" alt="Khaliya Logo" />
                </div>
                <h2>Khaliya</h2>
                <p>Authentic Indian Cuisine</p>
            </motion.div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
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
                            {isLoading ? <span className="auth-spinner"></span> : 'Continue'}
                        </button>
                    </motion.form>
                ) : (
                    <motion.form
                        key="step2"
                        className="auth-form-card glass-panel"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.4 }}
                        onSubmit={handleVerifyOTP}
                    >
                        <h3>Verify Phone</h3>
                        <p className="auth-subtitle">Enter the 4-digit code sent to<br /><strong>+91 {formData.phone}</strong></p>

                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="otp-input"
                                    autoComplete="off"
                                />
                            ))}
                        </div>

                        {/* Mock hint for testing */}
                        <div className="mock-otp-hint">Use <strong>1234</strong> for testing</div>

                        {error && <div className="auth-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

                        <button
                            type="submit"
                            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                            style={{ marginTop: '20px' }}
                        >
                            {isLoading ? <span className="auth-spinner"></span> : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            className="auth-back-btn"
                            onClick={() => setStep(1)}
                            disabled={isLoading}
                        >
                            Change Phone Number
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
