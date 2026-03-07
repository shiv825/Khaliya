import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NativeInitialization from './NativeInitialization';
import NativeNotification from './NativeNotification';

export default function NativeAuth({ onLoginSuccess }) {
    const [step, setStep] = useState('landing'); // landing, otp, notification
    const [isInitialized, setIsInitialized] = useState(localStorage.getItem('khaliya_initialized') === 'true');
    const [showInitialization, setShowInitialization] = useState(!isInitialized);

    // Auth State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);

    // Demo OTP State
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [showSystemNotification, setShowSystemNotification] = useState(false);

    // Timer for OTP resend
    useEffect(() => {
        let interval;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (phone.length === 10) {
            setIsLoading(true);

            // Generate a random 6-digit OTP for demo
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);

            setTimeout(() => {
                setIsLoading(false);
                setStep('otp');
                // Show simulated push notification after a small delay
                setTimeout(() => {
                    setShowSystemNotification(true);
                }, 800);
            }, 1000);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        // Auto-verify if all 6 digits are entered
        if (newOtp.join('').length === 6) {
            verifyOTP(newOtp.join(''));
        }
    };

    const verifyOTP = (code) => {
        if (code === generatedOtp) {
            setIsLoading(true);
            setShowSystemNotification(false);
            setTimeout(() => {
                setIsLoading(false);
                setStep('notification');
            }, 1200);
        } else {
            // Incorrect code feedback
            const inputs = document.querySelectorAll('.otp-box');
            inputs.forEach(input => {
                input.style.borderColor = '#ff0000';
                input.animate([
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 200, iterations: 2 });
            });
            setTimeout(() => {
                inputs.forEach(input => input.style.borderColor = '#ddd');
            }, 1000);
        }
    };

    const finalizeLogin = () => {
        const userData = {
            name: 'shiv',
            email: 'shivkumarrdn7@gmail.com',
            phone: phone,
            isLoggedIn: true
        };
        localStorage.setItem('khaliya_native_user', JSON.stringify(userData));
        onLoginSuccess();
    };

    const renderLanding = () => (
        <div className="zomato-landing">
            <div className="landing-hero">
                <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop"
                    alt="Authentic Dining"
                />
                <div className="landing-overlay">
                    <h1>India's #1 Authentic Cuisine Restaurant</h1>
                    <div>
                        <span className="zomato-logo-stripe">khaliya</span>
                    </div>
                </div>
            </div>

            <motion.div
                className="auth-bottom-sheet"
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                <p className="login-title">Log in or sign up</p>

                <form onSubmit={handlePhoneSubmit}>
                    <div className="phone-input-container">
                        <div className="country-selector">
                            <img src="https://flagcdn.com/w40/in.png" alt="IN" />
                            <i className="fas fa-caret-down"></i>
                        </div>
                        <div className="phone-field">
                            <span>+91</span>
                            <input
                                type="tel"
                                placeholder="Enter Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                maxLength="10"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="zomato-btn-main"
                        disabled={phone.length < 10 || isLoading}
                    >
                        {isLoading ? "Please wait..." : "Continue"}
                    </button>
                </form>

                <div className="social-login-grid">
                    <div className="social-circle google-icon">
                        <i className="fab fa-google"></i>
                    </div>
                    <div className="social-circle mail-icon">
                        <i className="fas fa-envelope"></i>
                    </div>
                    <div className="social-circle">
                        <i className="fas fa-ellipsis-h"></i>
                    </div>
                </div>

                <p className="terms-text">
                    By continuing, you agree to our<br />
                    <span style={{ textDecoration: 'underline' }}>Terms of Service</span> <span style={{ textDecoration: 'underline' }}>Privacy Policy</span> <span style={{ textDecoration: 'underline' }}>Content Policy</span>
                </p>
            </motion.div>
        </div>
    );

    const renderOTP = () => (
        <motion.div
            className="otp-container"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <i className="fas fa-arrow-left" onClick={() => setStep('landing')} style={{ fontSize: '1.2rem' }}></i>
                <h2 style={{ margin: '0 0 0 15px', fontSize: '1.2rem' }}>OTP Verification</h2>
            </div>

            <p style={{ color: '#4f4f4f', marginBottom: '10px', textAlign: 'center' }}>
                We have sent a verification code to
            </p>
            <p style={{ fontWeight: 700, textAlign: 'center', marginBottom: '30px' }}>
                +91-{phone}
            </p>

            <div className="otp-inputs">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="tel"
                        maxLength="1"
                        className="otp-box"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        autoFocus={i === 0}
                    />
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#4f4f4f' }}>
                    Didn't get the OTP? {timer > 0 ? (
                        <span style={{ color: '#aaa' }}>Resend SMS in {timer}s</span>
                    ) : (
                        <span style={{ color: '#E23744', fontWeight: 600 }}>Resend SMS</span>
                    )}
                </p>
                <p style={{ color: '#E23744', marginTop: '20px', fontWeight: 500 }} onClick={() => setStep('landing')}>
                    Go back to login methods
                </p>
            </div>

            {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <div className="auth-spinner" style={{ borderTopColor: '#E23744' }}></div>
                </div>
            )}
        </motion.div>
    );

    const renderSystemNotification = () => (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '15px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                border: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            <div style={{ background: '#4CAF50', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <i className="fas fa-comment-dots"></i>
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1c1c1c' }}>MESSAGES</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                    Khaliya: Your OTP is <strong style={{ color: '#E23744' }}>{generatedOtp}</strong>
                </p>
            </div>
            <button
                onClick={() => setShowSystemNotification(false)}
                style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '1.2rem' }}
            >
                <i className="fas fa-times"></i>
            </button>
        </motion.div>
    );

    if (showInitialization) {
        return (
            <NativeInitialization
                onComplete={() => {
                    localStorage.setItem('khaliya_initialized', 'true');
                    setShowInitialization(false);
                }}
            />
        );
    }

    return (
        <div className="native-auth-screen">
            <AnimatePresence>
                {showSystemNotification && renderSystemNotification()}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 'landing' && renderLanding()}
                {step === 'otp' && renderOTP()}
                {step === 'notification' && <NativeNotification onComplete={finalizeLogin} />}
            </AnimatePresence>
        </div>
    );
}
