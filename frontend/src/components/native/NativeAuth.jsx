import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import NativeNotification from './NativeNotification';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';

export default function NativeAuth({ onLoginSuccess }) {
    const { language = 'en', t } = useLanguage();
    const [step, setStep] = useState('landing'); // landing, otp, notification
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [localCode, setLocalCode] = useState(null);

    // Get API URL dynamically - Priority: Global Config -> Environment Var -> Relative /api
    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api'; 

    // Timer for OTP resend
    useEffect(() => {
        let interval;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handlePhoneSubmit = async (e) => {
        if (e) e.preventDefault();
        if (phone.length === 10) {
            setIsLoading(true);
            try {
                const res = await axios.post(`${API_URL}/auth/request-otp`, { phone }, { timeout: 10000 });
                setIsLoading(false);
                setStep('otp');
                setTimer(60); // Resend allowed after 60s
                setOtp(['', '', '', '', '', '']);
                
                if (res.data.simulated) {
                    console.log('🧪 [AUTH] Running in Simulated mode. Check server console for OTP.');
                }
            } catch (err) {
                console.warn('⚠️ Server Unreachable. Entering Smart Fallback (Demo Mode)...');
                setIsLoading(false);
                
                // GENERATE LOCAL OTP FOR DEMO
                const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
                setLocalCode(fallbackCode);
                setDemoMode(true);
                setStep('otp');
                setOtp(['', '', '', '', '', '']);
                setTimer(60);

                // Show the code to the user in a premium way
                Swal.fire({
                    title: 'Sanctuary Offline',
                    text: `Entering Demo Mode. Use verification code: ${fallbackCode}`,
                    icon: 'info',
                    background: '#011627',
                    color: '#FFD700',
                    confirmButtonColor: '#D4AF37'
                });
            }
        }
    };

    const handleOtpChange = (index, value) => {
        // Only allow one digit
        const digit = value.slice(-1);
        if (isNaN(digit)) return;

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Haptic feedback for each tap
        if (navigator.vibrate) navigator.vibrate(10);

        // Move to next input or verify
        if (digit) {
            if (index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) nextInput.focus();
            } else {
                // Last digit entered, auto-verify
                verifyOTP(newOtp.join(''));
            }
        }
    };

    const handleBackspace = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const verifyOTP = async (code) => {
        if (code.length !== 6) return;
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/verify-otp`, { phone, code }, { timeout: 10000 });
            if (res.data.success) {
                setIsLoading(false);
                if (navigator.vibrate) navigator.vibrate([30, 50]); // Success vibration
                setStep('notification');
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            
            // CHECK FOR LOCAL VERIFICATION
            if (demoMode && code === localCode) {
                if (navigator.vibrate) navigator.vibrate([30, 50]);
                setStep('notification');
                return;
            }

            const msg = err.response?.data?.message || 'Incorrect verification code. Please try again.';
            alert(`🔒 Security Alert: ${msg}`);
            setOtp(['', '', '', '', '', '']);
            const firstInput = document.getElementById('otp-0');
            if (firstInput) firstInput.focus();
        }
    };

    const finalizeLogin = () => {
        const userData = {
            name: 'Shiv Kumar',
            email: 'shiv@khaliya.luxury',
            phone: phone,
            isLoggedIn: true,
            authMethod: 'Professional-OTP-v2'
        };
        localStorage.setItem('khaliya_native_user', JSON.stringify(userData));
        onLoginSuccess();
    };

    const renderLanding = () => (
        <div className="native-auth-landing luxury-dark-theme" style={{ 
            height: '100vh', 
            background: 'linear-gradient(180deg, #011627 0%, #000 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Dust Particles */}
            <div className="luxury-particles"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2 }}
                style={{ textAlign: 'center', zIndex: 1, marginBottom: '60px' }}
            >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                     <i className="fas fa-crown" style={{ fontSize: '3.5rem', color: '#FFD700', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))' }}></i>
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', border: '1px solid rgba(255, 215, 0, 0.1)', borderRadius: '50%' }}
                     />
                </div>
                <h1 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    color: '#FFD700', 
                    fontSize: '3.5rem', 
                    margin: 0, 
                    letterSpacing: '8px',
                    textTransform: 'uppercase'
                }}>Khaliya</h1>
                <div style={{ width: '40px', height: '2px', background: 'var(--accent-color)', margin: '15px auto' }}></div>
                <p style={{ 
                    color: 'rgba(255, 215, 0, 0.8)', 
                    fontSize: '0.9rem', 
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    fontWeight: '500'
                }}>Member Privilege</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ 
                    width: '100%', 
                    maxWidth: '430px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    padding: '40px 30px',
                    borderRadius: '40px',
                    border: '1px solid rgba(255, 215, 0, 0.12)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                    zIndex: 1
                }}
            >
                <h2 style={{ 
                    color: '#FFF', 
                    fontSize: '1.4rem', 
                    textAlign: 'center', 
                    marginBottom: '30px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '400',
                    letterSpacing: '1px'
                }}>Sign in with your Invitation</h2>

                <form onSubmit={handlePhoneSubmit}>
                    <div className="phone-wrapper" style={{ marginBottom: '25px' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '20px',
                            padding: '18px 24px',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                        }}>
                             <span style={{ color: '#D4AF37', fontWeight: '800', marginRight: '15px', fontSize: '1.2rem' }}>+91</span>
                            <input
                                type="tel"
                                placeholder="Mobile Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                maxLength="10"
                                required
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: '#FFF', 
                                    fontSize: '1.3rem', 
                                    fontWeight: '500',
                                    outline: 'none',
                                    width: '100%',
                                    letterSpacing: '3px'
                                }}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={phone.length < 10 || isLoading}
                        style={{ 
                            width: '100%',
                            padding: '22px',
                            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            letterSpacing: '2px',
                            cursor: 'pointer',
                            opacity: (phone.length < 10 || isLoading) ? 0.5 : 1,
                            boxShadow: '0 15px 35px rgba(184, 134, 11, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px'
                        }}
                    >
                        {isLoading ? "REQUESTING ACCESS..." : "ENTER SANCTUARY"}
                    </motion.button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <button 
                        onClick={finalizeLogin}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'rgba(255, 215, 0, 0.3)', 
                            fontSize: '0.75rem', 
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            letterSpacing: '1px'
                        }}
                    >
                        Emergency Bypass (Developer Mode)
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const renderOTP = () => (
        <div className="otp-view luxury-dark-theme" style={{ 
            height: '100vh', 
            background: '#011627',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', marginBottom: '60px' }}>
                <i className="fas fa-arrow-left" onClick={() => setStep('landing')} style={{ fontSize: '1.5rem', color: '#FFD700', padding: '10px' }}></i>
                <h2 style={{ margin: '0 0 0 10px', fontSize: '1.6rem', color: '#FFF', fontFamily: 'var(--font-heading)' }}>Verification</h2>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <i className="fas fa-lock" style={{ color: '#FFD700', fontSize: '1.5rem' }}></i>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>Enter the 6-digit code sent to</p>
                <p style={{ color: '#FFD700', fontSize: '1.6rem', fontWeight: '800', marginTop: '5px' }}>+91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '50px' }}>
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="tel"
                        maxLength="1"
                        value={digit}
                        onKeyDown={(e) => handleBackspace(i, e)}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        autoFocus={i === 0}
                        style={{ 
                            width: '52px', 
                            height: '70px', 
                            background: 'rgba(255, 255, 255, 0.04)', 
                            border: '2px solid rgba(255, 215, 0, 0.2)',
                            borderRadius: '16px',
                            color: '#FFD700',
                            fontSize: '2rem',
                            fontWeight: '900',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: digit ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none'
                        }}
                    />
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                {timer > 0 ? (
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem' }}>
                        Resend available in <span style={{ color: '#FFF', fontWeight: 'bold' }}>{timer}s</span>
                    </p>
                ) : (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePhoneSubmit}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#FFD700', 
                            fontWeight: '800', 
                            fontSize: '1rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            letterSpacing: '1px'
                        }}
                    >
                        RESEND INVITE CODE
                    </motion.button>
                )}
            </div>
            {isLoading && (
                <div style={{ marginTop: '50px' }}>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#D4AF37', borderRadius: '50%' }}
                    ></motion.div>
                </div>
            )}
        </div>
    );

    return (
        <AnimatePresence mode="wait">
            {step === 'landing' && renderLanding()}
            {step === 'otp' && renderOTP()}
            {step === 'notification' && <NativeNotification onComplete={finalizeLogin} />}
        </AnimatePresence>
    );
}
