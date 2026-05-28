import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function NativeProfile() {
    const navigate = useNavigate();
    const { t, language = 'en' } = useLanguage();
     const [showLangSelector, setShowLangSelector] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'membership', 'feedback', 'about', 'settings'
    const [feedbackText, setFeedbackText] = useState('');
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // Dynamic states for Push Notifications and Offline Mode
    const [pushEnabled, setPushEnabled] = useState(() => {
        if ('Notification' in window) {
            return Notification.permission === 'granted';
        }
        return localStorage.getItem('khaliya_push_notifications') === 'true';
    });

    const [offlineMode, setOfflineMode] = useState(() => {
        return localStorage.getItem('khaliya_offline_mode') === 'true' || !navigator.onLine;
    });

    // Monitor browser online/offline status
    useEffect(() => {
        const handleOnline = () => {
            if (localStorage.getItem('khaliya_offline_mode') !== 'true') {
                setOfflineMode(false);
            }
        };
        const handleOffline = () => {
            setOfflineMode(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Toggle Push Notifications
    const handleTogglePush = async () => {
        if (!('Notification' in window)) {
            Swal.fire({
                title: 'Not Supported',
                text: 'Push notifications are not supported on this browser/device.',
                icon: 'info',
                confirmButtonColor: 'var(--primary-color)'
            });
            return;
        }

        if (pushEnabled) {
            setPushEnabled(false);
            localStorage.setItem('khaliya_push_notifications', 'false');
            Swal.fire({
                title: 'Notifications Disabled',
                text: 'You have disabled push notifications for this session.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setPushEnabled(true);
                localStorage.setItem('khaliya_push_notifications', 'true');
                
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification("Khaliya Restaurant", {
                            body: "Notifications enabled! You will now receive royal updates. 🔔",
                            icon: "/pwa-icon-192.png",
                            badge: "/pwa-icon-192.png"
                        });
                    }).catch(() => {
                        new Notification("Khaliya Restaurant", {
                            body: "Notifications enabled! You will now receive royal updates. 🔔",
                            icon: "/pwa-icon-192.png"
                        });
                    });
                } else {
                    new Notification("Khaliya Restaurant", {
                        body: "Notifications enabled! You will now receive royal updates. 🔔"
                    });
                }
            } else {
                Swal.fire({
                    title: 'Permission Denied',
                    text: 'Please enable notification permissions in your browser settings to receive updates.',
                    icon: 'warning',
                    confirmButtonColor: 'var(--primary-color)'
                });
            }
        }
    };

    // Toggle Offline Mode
    const handleToggleOffline = () => {
        const nextState = !offlineMode;
        setOfflineMode(nextState);
        localStorage.setItem('khaliya_offline_mode', String(nextState));

        if (nextState) {
            Swal.fire({
                title: 'Offline Mode Activated',
                text: 'The app will now operate in offline mode, prioritizing cached data.',
                icon: 'info',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            window.dispatchEvent(new CustomEvent('khaliya-offline-change', { detail: { offline: true } }));
        } else {
            Swal.fire({
                title: 'Online Mode Restored',
                text: 'The app is now synced with the live servers.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            window.dispatchEvent(new CustomEvent('khaliya-offline-change', { detail: { offline: false } }));
        }
    };
    
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    let user = { name: 'Guest', email: '', phone: '', spicePoints: 0 };
    try {
        if (storedUserStr) user = JSON.parse(storedUserStr);
    } catch (e) {
        console.warn('⚠️ [NativeProfile] User data corrupted');
    }

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        if (!user || !user.email) return;

        const fetchOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const res = await axios.get(`${API_URL}/orders`);
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        fetchOrders();

        // Establish real-time SSE listener
        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        const eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
            try {
                const update = JSON.parse(event.data);
                if (update.type === 'orders') {
                    setOrders(update.data);
                }
            } catch (err) {
                console.error('Error parsing SSE orders update:', err);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [user.email]);


    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    const activeOrders = orders.filter(o => {
        const orderEmail = o.user?.email || o.email;
        return orderEmail?.toLowerCase() === user.email?.toLowerCase() &&
               o.status !== 'delivered' &&
               o.status !== 'cancelled';
    });

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(touch.clientX - centerX);
        y.set(touch.clientY - centerY);
    };

    const handleTouchEnd = () => {
        x.set(0);
        y.set(0);
    };

    const handleAppLogout = () => {
        Swal.fire({
            title: t('reviews.signOut', 'Sign Out'),
            text: t('reviews.signOutConfirm', 'Are you sure you want to sign out?'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--primary-color)',
            cancelButtonColor: 'var(--text-light)',
            confirmButtonText: 'Yes, Sign Out',
            background: 'var(--bg-surface)',
            color: 'var(--text-dark)'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('khaliya_native_user');
                localStorage.removeItem('adminLoggedIn');
                window.location.reload();
            }
        });
    };

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;



    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        try {
            await axios.post(`${API_URL}/reviews`, {
                name: user.name,
                rating: 5,
                text: feedbackText,
                date: new Date().toISOString()
            });
            Swal.fire({ title: 'Thank you!', text: 'Your feedback matters.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            setActiveModal(null);
            setFeedbackText('');
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Could not submit feedback.', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    };

    const baseMenuItems = [
        { icon: 'fas fa-globe', label: t('reviews.selectLanguage'), action: () => setShowLangSelector(true) },
        { icon: 'fas fa-thumbs-up', label: 'Your feedback', action: () => setActiveModal('feedback') },
        { icon: 'fas fa-info-circle', label: 'About', action: () => setActiveModal('about') },
        { icon: 'fas fa-cog', label: 'Settings', action: () => setActiveModal('settings') }
    ];

    // Only add download option if NOT in standalone mode
    const menuItems = isStandalone ? baseMenuItems : [
        { icon: 'fas fa-arrow-alt-circle-down', label: 'Download Khaliya App', action: () => {
            if (window.promptInstall) {
                window.promptInstall();
            } else {
                alert('App download is currently unavailable. Please refresh and try again.');
            }
        }},
        ...baseMenuItems
    ];

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '120px' }}>
            {/* Header / Back Arrow */}
            <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center' }}>
                <i onClick={() => navigate(-1)} className="fas fa-arrow-left" style={{ fontSize: '1.4rem', color: 'var(--primary-color)', cursor: 'pointer', padding: '10px' }}></i>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)', margin: '0 0 0 10px' }}>{t('reviews.yourProfile')}</h2>
            </div>

            {/* Profile Card */}
            <div className="zomato-profile-card" style={{ marginBottom: '15px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="zomato-avatar" style={{ 
                    backgroundColor: 'var(--primary-color)', 
                    color: '#FFF', 
                    fontWeight: '900',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    aspectRatio: '1/1'
                }}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'G'}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-dark)', margin: 0 }}>{user?.name || 'Guest User'}</h2>
                    <p style={{ color: 'var(--text-light)', margin: '2px 0 5px 0', fontSize: '0.95rem', fontWeight: '600' }}>{user?.email || user?.phone || 'Welcome to Khaliya'}</p>
                    <span onClick={() => setActiveModal('membership')} style={{ color: 'var(--primary-color)', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>{t('reviews.memberSettings')} <i className="fas fa-caret-right"></i></span>
                </div>
            </div>

            {/* 3D Digital Membership Card - Gold Saffron High-Res Edition */}
            <motion.div 
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ 
                    perspective: 1200, 
                    padding: '10px 15px',
                    marginBottom: '20px'
                }}
            >
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        width: '100%',
                        height: '240px',
                        background: 'linear-gradient(135deg, #FF8F00 0%, #FFB300 30%, #FFD54F 100%)',
                        borderRadius: '30px',
                        padding: '30px',
                        color: '#FFF',
                        boxShadow: '0 40px 80px rgba(255, 143, 0, 0.25), inset 0 0 20px rgba(255,255,255,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        transformStyle: 'preserve-3d',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-25deg)', animation: 'shimmer 2.5s infinite ease-out' }}></div>
                    
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', pointerEvents: 'none' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(40px)' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', letterSpacing: '2.5px', fontWeight: '900', color: '#FFF', opacity: 0.8 }}>PREMIUM CLUB</div>
                            <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginTop: '4px', color: '#FFF', fontWeight: '900' }}>Saffron Select</div>
                        </div>
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-crown" style={{ fontSize: '1.6rem', color: '#FFF' }}></i>
                        </div>
                    </div>

                    <div style={{ transform: 'translateZ(60px)' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '2px', color: '#FFF' }}>{user?.spicePoints || 0}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#FFF', opacity: 0.9 }}>Available Spice Points</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', transform: 'translateZ(30px)' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '1.5px', color: '#FFF' }}>{user?.name ? user.name.toUpperCase() : 'GUEST'}</div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Rewards Progress Wallet */}
            {user?.email && (
                <div style={{ padding: '0 20px 25px 20px' }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '25px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>Next Reward Progress</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                                {user?.spicePoints || 0} / {
                                    (user?.spicePoints || 0) < 1000 ? 1000 : (user?.spicePoints || 0) < 2500 ? 2500 : 5000
                                } PTS
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div style={{ height: '10px', background: 'var(--bg-body)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', marginBottom: '12px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                    width: `${Math.min(100, ((user?.spicePoints || 0) / ((user?.spicePoints || 0) < 1000 ? 1000 : (user?.spicePoints || 0) < 2500 ? 2500 : 5000)) * 100)}%` 
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #FF8F00 0%, #FFD54F 100%)', borderRadius: '10px' }}
                            />
                        </div>

                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-gift" style={{ color: 'var(--primary-color)' }}></i>
                            {(user?.spicePoints || 0) < 1000 ? (
                                `Earn ${1000 - (user?.spicePoints || 0)} more points to unlock a Complimentary Saffron Dessert! 🍧`
                            ) : (user?.spicePoints || 0) < 2500 ? (
                                `Earn ${2500 - (user?.spicePoints || 0)} more points to unlock a VIP Gold Member Tasting! 🥂`
                            ) : (
                                `Earn ${5000 - (user?.spicePoints || 0)} more points to unlock a Royal Feast Box! 🎁`
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Active Orders Tracker */}
            {activeOrders.length > 0 && (
                <div style={{ padding: '0 20px 25px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                        <div className="pulse-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.2rem' }}>Live Order Status</h3>
                    </div>

                    {activeOrders.map(order => {
                        const steps = ['received', 'preparing', 'ready', 'delivered'];
                        const currentStepIndex = steps.indexOf(order.status);
                        
                        return (
                            <div key={order.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '25px', padding: '20px', marginBottom: '15px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-light)' }}>ORDER ID</span>
                                        <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)' }}>{order.id}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-light)' }}>TOTAL</span>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary-color)' }}>₹{order.total}</div>
                                    </div>
                                </div>

                                {/* Order Stepper */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '10px 0' }}>
                                    {/* Connecting Line */}
                                    <div style={{ position: 'absolute', left: '20px', right: '20px', top: '50%', height: '4px', background: 'var(--border-color)', zIndex: 1, transform: 'translateY(-50%)' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, 
                                            background: 'var(--primary-color)', 
                                            transition: 'width 0.5s ease-in-out' 
                                        }}></div>
                                    </div>

                                    {/* Step Dots */}
                                    {steps.map((step, idx) => {
                                        const isCompleted = idx <= currentStepIndex;
                                        const isActive = idx === currentStepIndex;
                                        
                                        let icon = 'fa-check';
                                        let label = 'Received';
                                        if (step === 'preparing') {
                                            icon = 'fa-fire';
                                            label = 'Cooking';
                                        } else if (step === 'ready') {
                                            icon = 'fa-bell';
                                            label = 'Ready';
                                        } else if (step === 'delivered') {
                                            icon = 'fa-motorcycle';
                                            label = 'Done';
                                        }

                                        return (
                                            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '60px' }}>
                                                <div 
                                                    className={isActive ? 'pulsing-step' : ''}
                                                    style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        borderRadius: '50%', 
                                                        background: isCompleted ? 'var(--primary-color)' : 'var(--bg-body)', 
                                                        border: `2px solid ${isCompleted ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                                        color: isCompleted ? '#FFF' : 'var(--text-light)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1rem',
                                                        boxShadow: isCompleted ? '0 4px 10px rgba(142, 28, 28, 0.25)' : 'none',
                                                        transition: 'all 0.4s ease'
                                                    }}
                                                >
                                                    {isActive && step === 'preparing' ? (
                                                        <i className="fas fa-cookie-bite chef-pulse" style={{ fontSize: '1.1rem' }}></i>
                                                    ) : (
                                                        <i className={`fas ${icon}`}></i>
                                                    )}
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '800', 
                                                    color: isCompleted ? 'var(--text-dark)' : 'var(--text-muted)', 
                                                    marginTop: '8px', 
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px' 
                                                }}>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes shimmer { 0% { left: -100% } 50% { left: 200% } 100% { left: 200% } }
                @keyframes chefPulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.25); opacity: 1; color: #F4A261; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                .chef-pulse {
                    animation: chefPulse 1.5s infinite ease-in-out;
                }
                @keyframes stepPulse {
                    0% { box-shadow: 0 0 0 0 rgba(142, 28, 28, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(142, 28, 28, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(142, 28, 28, 0); }
                }
                .pulsing-step {
                    animation: stepPulse 1.8s infinite ease-in-out;
                }
                @keyframes dotPulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .pulse-dot {
                    animation: dotPulse 2s infinite ease-in-out;
                }
            `}</style>

            {/* More Section */}
            <div className="more-section-title" style={{ background: 'var(--bg-body)', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 20px 10px' }}>Account Settings</div>

            <div className="zomato-settings-list">
                {menuItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        className="zomato-menu-item"
                        whileTap={{ background: 'var(--bg-body)' }}
                        onClick={item.action}
                        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}
                    >
                        <i className={item.icon} style={{ color: 'var(--primary-color)', fontSize: '1.2rem', width: '25px' }}></i>
                        <span style={{ color: 'var(--text-dark)', fontWeight: '600', flex: 1 }}>{item.label}</span>
                        <i className="fas fa-chevron-right" style={{ color: 'var(--border-color)', fontSize: '0.9rem' }}></i>
                    </motion.div>
                ))}

                <div style={{ padding: '20px', marginTop: '10px' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAppLogout}
                        style={{ 
                            width: '100%', 
                            padding: '18px', 
                            background: 'var(--bg-surface)', 
                            border: '2px solid var(--primary-color)', 
                            borderRadius: '15px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-sign-out-alt" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
                        <span style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>{t('reviews.signOut')}</span>
                    </motion.button>
                </div>

                {/* Admin Command Center removed as per request */}
            </div>

            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ opacity: 0.1, fontWeight: 900, fontSize: '2.5rem', letterSpacing: '4px', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>KHALIYA</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px', fontWeight: '700' }}>v1.2.0 • Light Saffron Edition</p>
            </div>

            {/* Language Selection Modal */}
            <AnimatePresence>
                {showLangSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'flex-end'
                        }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                width: '100%',
                                background: 'var(--bg-body)',
                                borderTopLeftRadius: '30px',
                                borderTopRightRadius: '30px',
                                padding: '30px 20px 100px', // Increased bottom padding to 100px
                                position: 'relative'
                            }}
                        >
                            <div style={{ width: '50px', height: '5px', background: 'var(--border-color)', borderRadius: '10px', margin: '0 auto 20px' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--primary-color)' }}>{t('reviews.selectLanguage')}</h3>
                                <button 
                                    onClick={() => setShowLangSelector(false)}
                                    style={{ background: 'var(--bg-surface)', border: 'none', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', boxShadow: 'var(--shadow-sm)' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <LanguageSwitcher mode="list" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Detail Modals */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'var(--bg-body)',
                            zIndex: 3000,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', padding: '10px', marginRight: '10px' }}>
                                <i className="fas fa-arrow-left" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                            </button>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)', margin: 0, textTransform: 'capitalize' }}>
                                {activeModal === 'membership' ? 'Saffron Membership' : activeModal}
                            </h2>
                        </div>

                        <div style={{ flex: 1, padding: '30px 20px', overflowY: 'auto' }}>
                            {activeModal === 'membership' && (
                                <div style={{ textAlign: 'center' }}>
                                    <i className="fas fa-crown" style={{ fontSize: '4rem', color: 'var(--primary-color)', marginBottom: '20px' }}></i>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)' }}>Saffron Select</h3>
                                    <p style={{ color: 'var(--text-light)', fontWeight: '600' }}>You have {user?.spicePoints || 0} Spice Points</p>
                                    <div style={{ marginTop: '30px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ color: 'var(--primary-color)', fontWeight: '800' }}>Member Perks</h4>
                                        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                            <li style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}><i className="fas fa-star" style={{ color: '#F4A261' }}></i> Priority Seating</li>
                                            <li style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}><i className="fas fa-star" style={{ color: '#F4A261' }}></i> Complimentary Dessert</li>
                                            <li style={{ display: 'flex', gap: '10px' }}><i className="fas fa-star" style={{ color: '#F4A261' }}></i> Exclusive Tasting Events</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'feedback' && (
                                <div>
                                    <textarea 
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        placeholder="How was your experience at Khaliya?"
                                        style={{ width: '100%', height: '150px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '15px', outline: 'none', color: 'var(--text-dark)', fontWeight: '500' }}
                                    ></textarea>
                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        style={{ width: '100%', background: 'var(--primary-color)', color: '#FFF', border: 'none', padding: '15px', borderRadius: '20px', fontWeight: '800', marginTop: '20px' }}
                                    >Submit Feedback</button>
                                </div>
                            )}

                            {activeModal === 'about' && (
                                <div style={{ color: 'var(--text-dark)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>Our Legacy</h3>
                                    <p style={{ fontWeight: '500', lineHeight: '1.6' }}>Khaliya Sanctuary is more than just a restaurant; it is a celebration of the legendary saffron heritage, blending authentic Indian flavors with modern culinary artistry.</p>
                                    <div style={{ marginTop: '20px' }}>
                                        <p><strong>Address:</strong> High Street, Flavor Town</p>
                                        <p><strong>Hours:</strong> 11:00 AM - 11:00 PM</p>
                                        <p><strong>Contact:</strong> +91 82527 31784</p>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'settings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {/* Push Notifications Toggle */}
                                    <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Push Notifications</span>
                                        <div 
                                            onClick={handleTogglePush}
                                            style={{ 
                                                width: '45px', 
                                                height: '24px', 
                                                background: pushEnabled ? 'var(--primary-color)' : '#D1D5DB', 
                                                borderRadius: '12px', 
                                                padding: '2px', 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: pushEnabled ? 'flex-end' : 'flex-start',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        >
                                            <motion.div 
                                                layout 
                                                style={{ 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    background: '#FFFFFF', 
                                                    borderRadius: '50%',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }} 
                                            />
                                        </div>
                                    </div>

                                    {/* Offline Mode Toggle */}
                                    <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Offline Mode</span>
                                        <div 
                                            onClick={handleToggleOffline}
                                            style={{ 
                                                width: '45px', 
                                                height: '24px', 
                                                background: offlineMode ? 'var(--primary-color)' : '#D1D5DB', 
                                                borderRadius: '12px', 
                                                padding: '2px', 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: offlineMode ? 'flex-end' : 'flex-start',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        >
                                            <motion.div 
                                                layout 
                                                style={{ 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    background: '#FFFFFF', 
                                                    borderRadius: '50%',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }} 
                                            />
                                        </div>
                                    </div>

                                    <div 
                                        onClick={handleAppLogout}
                                        style={{ padding: '20px', background: 'rgba(142, 28, 28, 0.05)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', border: '1px solid var(--primary-color)', cursor: 'pointer' }}
                                    >
                                        <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>Sign Out of Account</span>
                                        <i className="fas fa-power-off" style={{ color: 'var(--primary-color)' }}></i>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
