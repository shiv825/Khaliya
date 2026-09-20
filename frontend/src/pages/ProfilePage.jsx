import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import AuthModal from '../components/AuthModal';

export default function ProfilePage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('khaliya_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'details' | 'rewards'
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Editable Profile Form State
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);

    // Orders History State
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        if (!user || !user.isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        setName(user.name || '');
        setPhone(user.phone || '');
        setEmail(user.email || '');

        // Fetch User Orders
        const fetchUserOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const queryParams = new URLSearchParams();
                if (user.phone) queryParams.append('phone', user.phone);
                if (user.email) queryParams.append('email', user.email);
                if (user.id) queryParams.append('userId', user.id);

                const res = await axios.get(`${API_URL}/orders?${queryParams.toString()}`);
                if (Array.isArray(res.data)) {
                    // Sort latest orders first
                    const sorted = res.data.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
                    setOrders(sorted);
                }
            } catch (err) {
                console.warn('Failed to fetch user order history:', err.message);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        fetchUserOrders();
    }, [user, API_URL]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                id: user?.id,
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim()
            };

            const res = await axios.post(`${API_URL}/users/profile`, payload);
            
            if (res.data?.success && res.data?.user) {
                const updatedUser = {
                    ...user,
                    ...res.data.user,
                    isLoggedIn: true
                };

                setUser(updatedUser);
                localStorage.setItem('khaliya_user', JSON.stringify(updatedUser));

                Swal.fire({
                    title: 'Profile Updated! ✨',
                    text: 'Your royal guest details have been saved successfully.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2500
                });
            }
        } catch (err) {
            console.error('Profile update error:', err);
            Swal.fire('Update Failed', err.response?.data?.message || 'Unable to update profile. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Sign Out?',
            text: 'Are you sure you want to sign out of your Khaliya account?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Yes, Sign Out'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('khaliya_user');
                localStorage.removeItem('khaliya_user_token');
                setUser(null);
                Swal.fire({
                    title: 'Signed Out',
                    text: 'You have been signed out.',
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                navigate('/menu');
            }
        });
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'received') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: 'rgba(59, 130, 246, 0.4)', text: 'ORDER RECEIVED' };
        if (s === 'preparing') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: 'rgba(245, 158, 11, 0.4)', text: 'PREPARING IN KITCHEN 👨‍🍳' };
        if (s === 'ready') return { bg: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', border: 'rgba(74, 222, 128, 0.4)', text: 'READY FOR SERVING / PICKUP 🎉' };
        if (s === 'completed') return { bg: 'rgba(212, 175, 55, 0.15)', color: '#FFD700', border: 'rgba(212, 175, 55, 0.4)', text: 'COMPLETED 👑' };
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#CBD5E1', border: 'rgba(148, 163, 184, 0.4)', text: (status || 'PROCESSING').toUpperCase() };
    };

    if (!user || !user.isLoggedIn) {
        return (
            <div style={{ minHeight: '100vh', background: '#070A0E', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '420px', background: 'linear-gradient(145deg, #141822 0%, #0B0E14 100%)', border: '1.5px solid #D4AF37', borderRadius: '24px', padding: '40px 24px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🔐</div>
                    <h2 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', fontSize: '1.6rem', marginBottom: '10px' }}>
                        Royal Account Portal
                    </h2>
                    <p style={{ color: '#94A3B8', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.5' }}>
                        Please sign in with your mobile number or email to view your profile, track past orders, and redeem spice rewards.
                    </p>
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                            color: '#000',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '0.95rem',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 25px rgba(212, 175, 55, 0.35)'
                        }}
                    >
                        ⚡ Sign In / Register Now
                    </button>
                    <div style={{ marginTop: '16px' }}>
                        <Link to="/menu" style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>
                            ← Back to Menu
                        </Link>
                    </div>
                </div>

                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    onSuccess={(userData) => setUser(userData)}
                />
            </div>
        );
    }

    const spicePoints = user.spicePoints || 750;

    return (
        <div style={{ minHeight: '100vh', background: '#070A0E', color: '#F8FAFC', paddingBottom: '90px' }}>
            {/* Header Hero Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(20, 24, 34, 0.95) 0%, rgba(7, 10, 14, 0.98) 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '45px 20px 30px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/menu')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            color: '#FFD700',
                            padding: '7px 18px',
                            borderRadius: '50px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            marginBottom: '16px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fas fa-arrow-left"></i> Back to Menu
                    </button>

                    {/* Member Profile Avatar Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(15, 20, 30, 0.85)', border: '1.5px solid #D4AF37', borderRadius: '24px', padding: '20px 28px', maxWidth: '720px', width: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.7)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '900', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)' }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : '👑'}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', color: '#FFD700', fontWeight: '800', marginBottom: '4px' }}>
                                    <span>👑 ROYAL GOLD TIER</span>
                                </div>
                                <h2 style={{ fontFamily: "'Cinzel', serif", color: '#FFF', margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>
                                    {user.name || 'Royal Guest'}
                                </h2>
                                <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '2px' }}>
                                    {user.phone || user.email || 'Khaliya Sanctuary Member'}
                                </div>
                            </div>
                        </div>

                        {/* Right Actions: Spice Rewards & Logout Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.35)', borderRadius: '16px', padding: '10px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.68rem', color: '#D4AF37', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    SPICE REWARDS
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFD700' }}>
                                    ⭐️ {spicePoints} <span style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: '600' }}>Pts</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1.5px solid rgba(239, 68, 68, 0.45)',
                                    color: '#F87171',
                                    padding: '10px 16px',
                                    borderRadius: '16px',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.15)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                                    e.currentTarget.style.borderColor = '#EF4444';
                                    e.currentTarget.style.color = '#FFF';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                                    e.currentTarget.style.color = '#F87171';
                                }}
                            >
                                <i className="fas fa-sign-out-alt"></i> Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div style={{ maxWidth: '1000px', margin: '30px auto 0 auto', padding: '0 20px' }}>
                
                {/* Navigation Tabs */}
                <div style={{ display: 'flex', gap: '10px', background: '#0F141E', padding: '6px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        style={{
                            flex: 1,
                            minWidth: '160px',
                            background: activeTab === 'orders' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                            color: activeTab === 'orders' ? '#000' : '#CBD5E1',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="fas fa-receipt"></i> Order History ({orders.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        style={{
                            flex: 1,
                            minWidth: '160px',
                            background: activeTab === 'details' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                            color: activeTab === 'details' ? '#000' : '#CBD5E1',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="fas fa-user-edit"></i> Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('rewards')}
                        style={{
                            flex: 1,
                            minWidth: '160px',
                            background: activeTab === 'rewards' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                            color: activeTab === 'rewards' ? '#000' : '#CBD5E1',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="fas fa-gift"></i> Rewards &amp; Vouchers
                    </button>
                </div>

                {/* TAB 1: ORDER HISTORY & LIVE TRACKING */}
                {activeTab === 'orders' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        {isLoadingOrders ? (
                            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94A3B8' }}>
                                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#FFD700', marginBottom: '12px' }}></i>
                                <div>Loading your order history...</div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', background: 'rgba(15, 20, 30, 0.75)', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '24px', padding: '60px 20px' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍲</div>
                                <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', fontSize: '1.4rem', marginBottom: '8px' }}>
                                    No Past Orders Found
                                </h3>
                                <p style={{ color: '#94A3B8', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                                    You haven't placed any orders with this account yet. Discover our master chef's delicacies!
                                </p>
                                <Link
                                    to="/menu"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', textDecoration: 'none', fontSize: '0.88rem' }}
                                >
                                    <i className="fas fa-utensils"></i> Explore Royal Menu
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {orders.map((ord) => {
                                    const badge = getStatusBadge(ord.status);
                                    const itemsList = Array.isArray(ord.items) ? ord.items : [];
                                    const formattedDate = ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ord.timestamp || 'N/A';

                                    return (
                                        <div
                                            key={ord.id || ord.invoiceNo}
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)',
                                                border: '1.5px solid rgba(212, 175, 55, 0.3)',
                                                borderRadius: '20px',
                                                padding: '22px',
                                                boxShadow: '0 12px 35px rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            {/* Order Card Top Bar */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                                                <div>
                                                    <div style={{ color: '#FFD700', fontWeight: '900', fontSize: '1.1rem', fontFamily: "'Cinzel', serif" }}>
                                                        Invoice #{ord.invoiceNo || ord.orderNo || ord.id}
                                                    </div>
                                                    <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '2px' }}>
                                                        📅 {formattedDate} • {ord.orderType === 'pickup' ? '🛍️ Takeaway Pickup' : `🪑 Dine-In (Table: ${ord.tableNumber || 'N/A'})`}
                                                    </div>
                                                </div>

                                                {/* Live Status Badge */}
                                                <div style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '6px 14px', borderRadius: '50px', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                    {badge.text}
                                                </div>
                                            </div>

                                            {/* Itemized Dishes List */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                                {itemsList.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <div>
                                                            <div style={{ color: '#FFF', fontWeight: '700', fontSize: '0.88rem' }}>
                                                                {typeof item.name === 'object' ? item.name.en : item.name}
                                                            </div>
                                                            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                                                                Qty: {item.quantity} × {item.price}
                                                            </div>
                                                            {(item.specialInstructions || item.notes) && (
                                                                <div style={{ color: '#FFD700', fontSize: '0.73rem', marginTop: '2px', fontStyle: 'italic' }}>
                                                                    📝 Note: {item.specialInstructions || item.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.9rem' }}>
                                                            ₹{(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0) * item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Footer Summary */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.85rem' }}>
                                                <div style={{ color: '#CBD5E1' }}>
                                                    Payment: <strong style={{ color: ord.paymentStatus === 'PAID' ? '#4ADE80' : '#FFD700' }}>{ord.paymentMethod || 'CASH ON TABLE'} ({ord.paymentStatus || 'COMPLETED'})</strong>
                                                </div>
                                                <div style={{ color: '#FFD700', fontSize: '1.25rem', fontWeight: '900' }}>
                                                    Total: ₹{ord.total}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 2: EDIT PERSONAL DETAILS */}
                {activeTab === 'details' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '24px', padding: '28px', boxShadow: '0 15px 40px rgba(0,0,0,0.7)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
                                <span style={{ color: '#FFD700', fontSize: '1.2rem' }}>👤</span>
                                <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                                    Personal Profile &amp; Contact Details
                                </h3>
                            </div>

                            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Aarav Sharma"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.4)', background: '#070A0E', color: '#FFF', fontSize: '0.95rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                                            Mobile Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+91 Mobile Number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.95rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="yourname@domain.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.95rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                            color: '#000',
                                            border: 'none',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            fontWeight: '900',
                                            fontSize: '0.95rem',
                                            letterSpacing: '1px',
                                            cursor: isSaving ? 'not-allowed' : 'pointer',
                                            opacity: isSaving ? 0.6 : 1,
                                            boxShadow: '0 8px 25px rgba(212, 175, 55, 0.35)'
                                        }}
                                    >
                                        {isSaving ? 'Saving Changes...' : '💾 Save Profile Changes'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.12)',
                                            border: '1px solid rgba(239, 68, 68, 0.4)',
                                            color: '#EF4444',
                                            padding: '14px 20px',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            fontSize: '0.88rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🚪 Log Out
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: REWARDS & VOUCHERS */}
                {activeTab === 'rewards' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {/* Points Summary Card */}
                            <div style={{ background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)', border: '1.5px solid #D4AF37', borderRadius: '24px', padding: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.7)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>👑</span>
                                    <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                        Royal Spice Points
                                    </h4>
                                </div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFD700', margin: '10px 0' }}>
                                    {spicePoints} <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '600' }}>Points</span>
                                </div>
                                <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                                    Earn <strong>10 Spice Points</strong> for every ₹100 spent on royal dining orders. Points can be redeemed for complimentary desserts &amp; drinks.
                                </p>
                                <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.8rem', color: '#FFD700', fontWeight: '700' }}>
                                    ✓ Next Reward Unlock at 1,000 Points!
                                </div>
                            </div>

                            {/* Active Vouchers Card */}
                            <div style={{ background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)', border: '1.5px solid rgba(212, 175, 55, 0.3)', borderRadius: '24px', padding: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.7)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🎟️</span>
                                    <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                        Available Vouchers
                                    </h4>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { code: 'KHALIYA20', desc: '20% OFF on Royal Orders' },
                                        { code: 'ROYAL100', desc: 'Flat ₹100 OFF on Orders > ₹500' },
                                        { code: 'FIRST50', desc: 'Flat ₹50 Welcome Bonus Offer' }
                                    ].map((v) => (
                                        <div key={v.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed rgba(212, 175, 55, 0.4)', padding: '10px 14px', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ color: '#FFD700', fontWeight: '900', fontSize: '0.9rem' }}>{v.code}</div>
                                                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{v.desc}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(v.code);
                                                    Swal.fire({ title: 'Copied!', text: `Code ${v.code} copied to clipboard`, icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                                                }}
                                                style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', color: '#FFD700', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
