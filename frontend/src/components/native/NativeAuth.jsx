import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NativeNotification from './NativeNotification';

export default function NativeAuth({ onLoginSuccess }) {
    const [step, setStep] = useState('landing'); // landing, otp, notification
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);

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
            setTimeout(() => {
                setIsLoading(false);
                setStep('otp');
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
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('notification');
        }, 1200);
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
                    <h1>Savor. Celebrate.<br/>Every Moment.</h1>
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
                <p className="login-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.4rem' }}>Log in to your sanctuary</p>

                <form onSubmit={handlePhoneSubmit}>
                    <div className="phone-input-container" style={{ marginBottom: '25px' }}>
                        <div className="country-selector" style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '15px' }}>
                            <img src="https://flagcdn.com/w40/in.png" alt="IN" />
                            <i className="fas fa-caret-down" style={{ color: 'var(--text-muted)' }}></i>
                        </div>
                        <div className="phone-field" style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '15px', padding: '15px' }}>
                            <span style={{ fontWeight: '800', color: 'var(--primary-color)', marginRight: '10px' }}>+91</span>
                            <input
                                type="tel"
                                placeholder={language === 'hi' ? 'मोबाइल नंबर' : "Mobile Number"}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                maxLength="10"
                                required
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', fontWeight: '700', fontSize: '1.1rem', outline: 'none', width: '100%' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="zomato-btn-main"
                        disabled={phone.length < 10 || isLoading}
                        style={{ opacity: (phone.length < 10 || isLoading) ? 0.6 : 1 }}
                    >
                        {isLoading ? "Please wait..." : "Next Step"}
                    </button>
                </form>

                <div className="social-login-grid" style={{ marginTop: '10px' }}>
                    <div className="social-circle futuristic-glass" style={{ color: '#DB4437' }}>
                        <i className="fab fa-google"></i>
                    </div>
                    <div className="social-circle futuristic-glass" style={{ color: 'var(--primary-color)' }}>
                        <i className="fas fa-envelope"></i>
                    </div>
                    <div className="social-circle futuristic-glass" style={{ color: 'var(--text-muted)' }}>
                        <i className="fas fa-ellipsis-h"></i>
                    </div>
                </div>

                <p className="terms-text" style={{ marginTop: '30px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    By continuing, you agree to our<br />
                    <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Terms</span> & <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Privacy Policy</span>
                </p>
            </motion.div>
        </div>
    );

    const renderOTP = () => (
        <motion.div
            className="otp-container"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ background: 'var(--bg-body)', padding: '40px 20px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <i className="fas fa-arrow-left" onClick={() => setStep('landing')} style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                <h2 style={{ margin: '0 0 0 20px', fontSize: '1.6rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>Verification Code</h2>
            </div>

            <p style={{ color: 'var(--text-light)', marginBottom: '10px', textAlign: 'center', fontWeight: '600' }}>
                We have sent an authentication code to
            </p>
            <p style={{ fontWeight: '900', textAlign: 'center', marginBottom: '40px', fontSize: '1.4rem', color: 'var(--text-dark)' }}>
                +91-{phone}
            </p>

            <div className="otp-inputs" style={{ marginBottom: '40px' }}>
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
                        style={{ border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--primary-color)', width: '50px', height: '60px', fontSize: '1.8rem', fontWeight: '900', borderRadius: '15px', shadow: 'var(--shadow-sm)' }}
                    />
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-light)', fontWeight: '600' }}>
                    Didn't get the code? {timer > 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>Wait {timer}s</span>
                    ) : (
                        <span style={{ color: 'var(--primary-color)', fontWeight: '800', borderBottom: '1.5px solid' }}>Resend</span>
                    )}
                </p>
                <motion.p 
                    whileTap={{ scale: 0.95 }}
                    style={{ color: 'var(--text-muted)', marginTop: '40px', fontWeight: '700', fontSize: '0.9rem' }} 
                    onClick={() => setStep('landing')}
                >
                    Change phone number?
                </motion.p>
            </div>

            {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }}
                    ></motion.div>
                </div>
            )}
        </motion.div>
    );

    return (
        <AnimatePresence mode="wait">
            {step === 'landing' && renderLanding()}
            {step === 'otp' && renderOTP()}
            {step === 'notification' && <NativeNotification onComplete={finalizeLogin} />}
        </AnimatePresence>
    );
}
