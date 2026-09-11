import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2';
import axios from 'axios';

const PROMO_CODES = {
    'KHALIYA20': { type: 'percent', value: 20, desc: '20% OFF on Royal Orders' },
    'ROYAL100': { type: 'flat', value: 100, desc: 'Flat ₹100 OFF' },
    'FIRST50': { type: 'flat', value: 50, desc: 'Flat ₹50 Welcome Offer' }
};

// Helper script loader for Razorpay Checkout
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const [diningMode, setDiningMode] = useState('dine-in'); // 'dine-in' | 'takeaway'
    const [tableNumber, setTableNumber] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'cash'

    // Live backend tables from DB
    const [liveTables, setLiveTables] = useState([]);
    
    // Promo Code State
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        try {
            const saved = localStorage.getItem('khaliya_applied_coupon');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [couponError, setCouponError] = useState('');

    // Store settings state (Admin configurable fees)
    const [storeSettings, setStoreSettings] = useState({
        isOpen: true,
        gstRate: 5,
        packagingFee: 25
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        // Pre-load Razorpay Checkout Script
        loadRazorpayScript();

        // Load saved user info
        try {
            const storedUser = localStorage.getItem('khaliya_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.name) setGuestName(parsed.name);
                if (parsed.phone) setGuestPhone(parsed.phone);
                if (parsed.email) setGuestEmail(parsed.email);
            }
        } catch (e) {}

        // Fetch admin settings & live database tables
        const fetchDataFromBackend = async () => {
            try {
                const [setRes, tabRes] = await Promise.all([
                    axios.get(`${API_URL}/settings?t=${Date.now()}`).catch(() => null),
                    axios.get(`${API_URL}/tables?t=${Date.now()}`).catch(() => null)
                ]);

                if (setRes?.data) {
                    setStoreSettings(prev => ({ ...prev, ...setRes.data }));
                }
                if (tabRes?.data && Array.isArray(tabRes.data)) {
                    setLiveTables(tabRes.data);
                }
            } catch (err) {
                console.warn('Backend fetch notice:', err.message);
            }
        };

        fetchDataFromBackend();
    }, [API_URL]);

    // Redirect to cart if empty
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    // Admin Configurable Fee Values
    const gstRate = Number(storeSettings?.gstRate ?? 5);
    const packagingFeeSetting = Number(storeSettings?.packagingFee ?? 25);

    // Financial Calculations
    const subtotal = getCartTotal();

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
        } else if (appliedCoupon.type === 'flat') {
            discountAmount = Math.min(subtotal, appliedCoupon.value);
        }
    }

    const netSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((netSubtotal * gstRate) / 100);
    const packagingFee = diningMode === 'takeaway' ? packagingFeeSetting : 0;

    const grandTotal = netSubtotal + taxAmount + packagingFee;

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        setCouponError('');

        if (!code) return;

        if (PROMO_CODES[code]) {
            setAppliedCoupon({ code, ...PROMO_CODES[code] });
            setCouponInput('');
            Swal.fire({
                title: 'Coupon Applied! 🎉',
                text: `${PROMO_CODES[code].desc} has been applied to your bill.`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500
            });
        } else {
            setCouponError('Invalid coupon code. Try KHALIYA20, ROYAL100, or FIRST50.');
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        if (storeSettings.isOpen === false) {
            Swal.fire({
                title: 'Ordering Temporarily Closed',
                text: 'We are not accepting online orders at the moment. Please contact our staff.',
                icon: 'warning',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

        if (diningMode === 'dine-in' && (!tableNumber || tableNumber.trim() === '')) {
            Swal.fire({
                title: 'Table Selection Required',
                text: 'Please select your table number from our live dining floor tables.',
                icon: 'warning',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

        const orderItems = cart.map(item => ({
            id: item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name),
            name: getLocalized(item.name),
            quantity: item.quantity,
            price: item.price
        }));

        let formattedAddress = `Dine-In Table: ${tableNumber}`;
        if (diningMode === 'takeaway') {
            formattedAddress = `Takeaway Pickup Order`;
        }
        if (specialNotes) {
            formattedAddress += ` | Instruction: ${specialNotes}`;
        }

        const orderData = {
            items: orderItems,
            total: grandTotal,
            tableNumber: diningMode === 'dine-in' ? tableNumber : null,
            orderType: diningMode === 'takeaway' ? 'pickup' : 'dine-in',
            paymentMethod: paymentMethod.toUpperCase(),
            user: {
                name: guestName.trim() || 'Royal Guest',
                email: guestEmail.trim() || 'guest@khaliya.web',
                phone: guestPhone.trim() || 'N/A',
                address: formattedAddress
            },
            source: `Web Checkout (${diningMode.toUpperCase()})`
        };

        // Save guest details locally for convenience
        if (guestName || guestPhone || guestEmail) {
            try {
                localStorage.setItem('khaliya_user', JSON.stringify({
                    name: guestName,
                    phone: guestPhone,
                    email: guestEmail
                }));
            } catch (err) {}
        }

        // --- RAZORPAY ONLINE PAYMENT FLOW (UPI / CARD) ---
        if (paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'razorpay') {
            setIsSubmitting(true);

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setIsSubmitting(false);
                Swal.fire({
                    title: 'Razorpay SDK Load Failed',
                    text: 'Unable to load payment gateway. Please check your internet connection.',
                    icon: 'error',
                    confirmButtonColor: '#D4AF37'
                });
                return;
            }

            Swal.fire({
                title: 'Initiating Secure Payment...',
                text: 'Generating Razorpay transaction credentials...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                // Step 1: Create Razorpay Order on Backend
                const orderRes = await axios.post(`${API_URL}/create-razorpay-order`, {
                    amount: grandTotal,
                    currency: 'INR',
                    receipt: `rcpt_${Date.now()}`
                });

                if (!orderRes.data || !orderRes.data.success || !orderRes.data.orderId) {
                    throw new Error(orderRes.data?.message || 'Failed to initialize Razorpay payment');
                }

                Swal.close();

                const { orderId, amount, currency, key } = orderRes.data;

                // Step 2: Configure & Open Razorpay Modal
                const options = {
                    key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TaosPGZhWQa5wH',
                    amount: amount,
                    currency: currency || 'INR',
                    name: 'Khaliya Sanctuary',
                    description: 'Royal Dining Bill Payment',
                    image: 'https://res.cloudinary.com/mbib5dog/image/upload/v1788443766/khaliya_restaurant/product_1780141133327.jpg',
                    order_id: orderId,
                    handler: async function (response) {
                        Swal.fire({
                            title: 'Verifying Payment with Bank...',
                            text: 'Please wait while we verify your transaction.',
                            allowOutsideClick: false,
                            didOpen: () => Swal.showLoading()
                        });

                        try {
                            const verifyRes = await axios.post(`${API_URL}/verify-razorpay-payment`, {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData
                            });

                            if (verifyRes.data?.success) {
                                Swal.fire({
                                    title: '🎉 Payment Successful & Order Sent to Kitchen!',
                                    html: `<div style="text-align:center; color:#CBD5E1; font-family:sans-serif">
                                            <div style="font-size:3.5rem; margin-bottom:10px">💳</div>
                                            <p style="font-size:1.15rem; color:#4ADE80; font-weight:800; margin-bottom:6px">
                                                Paid via Razorpay
                                            </p>
                                            <p style="font-size:0.85rem; color:#FFD700; margin-bottom:8px">Payment ID: <strong>${response.razorpay_payment_id}</strong></p>
                                            <p style="font-size:1.1rem; color:#FFF; font-weight:700">Total Amount: ₹${grandTotal}</p>
                                            ${appliedCoupon ? `<p style="color:#4ADE80; font-size:0.85rem; margin-top:6px">Saved ₹${discountAmount} with code ${appliedCoupon.code}!</p>` : ''}
                                            <p style="font-size:0.85rem; opacity:0.8; margin-top:14px">Our chef has received your order on the Kitchen KDS!</p>
                                           </div>`,
                                    icon: 'success',
                                    confirmButtonColor: '#D4AF37'
                                });

                                clearCart();
                                setIsSubmitting(false);
                                navigate('/menu');
                            } else {
                                throw new Error(verifyRes.data?.message || 'Payment verification failed');
                            }
                        } catch (verifyErr) {
                            console.error('Razorpay verification error:', verifyErr);
                            Swal.fire({
                                title: 'Payment Verification Error',
                                text: verifyErr.message || 'Verification failed. Please contact restaurant staff.',
                                icon: 'error',
                                confirmButtonColor: '#D4AF37'
                            });
                            setIsSubmitting(false);
                        }
                    },
                    prefill: {
                        name: guestName.trim() || 'Royal Guest',
                        email: guestEmail.trim() || 'guest@khaliya.web',
                        contact: guestPhone.trim() || '9999999999'
                    },
                    notes: {
                        diningMode: diningMode,
                        tableNumber: tableNumber || 'N/A'
                    },
                    theme: {
                        color: '#D4AF37'
                    },
                    modal: {
                        ondismiss: function () {
                            setIsSubmitting(false);
                            Swal.fire({
                                title: 'Payment Modal Closed',
                                text: 'Payment was not completed.',
                                icon: 'info',
                                toast: true, position: 'top-end', timer: 3000, showConfirmButton: false
                            });
                        }
                    }
                };

                const rzpWindow = new window.Razorpay(options);
                rzpWindow.on('payment.failed', function (response) {
                    setIsSubmitting(false);
                    Swal.fire({
                        title: 'Payment Failed',
                        text: response.error.description || 'Transaction was declined by bank or card issuer.',
                        icon: 'error',
                        confirmButtonColor: '#D4AF37'
                    });
                });

                rzpWindow.open();
            } catch (err) {
                console.error('Razorpay Initialization Error:', err);
                setIsSubmitting(false);
                Swal.fire({
                    title: 'Payment Gateway Error',
                    text: err.message || 'Failed to launch Razorpay window',
                    icon: 'error',
                    confirmButtonColor: '#D4AF37'
                });
            }
        } 
        // --- CASH ON TABLE / COUNTER FLOW ---
        else {
            setIsSubmitting(true);

            Swal.fire({
                title: 'Sending Order to Kitchen...',
                text: 'Please wait while your order is being synchronized.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await axios.post(`${API_URL}/orders`, orderData, { timeout: 10000 });

                Swal.fire({
                    title: '🎉 Order Received & Sent to Kitchen!',
                    html: `<div style="text-align:center; color:#CBD5E1; font-family:sans-serif">
                            <div style="font-size:3.5rem; margin-bottom:10px">👑</div>
                            <p style="font-size:1.2rem; color:#FFD700; font-weight:800; margin-bottom:8px">
                                ${diningMode === 'dine-in' ? `Table: ${tableNumber}` : 'Takeaway Pickup Order'}
                            </p>
                            <p style="font-size:1.1rem; color:#FFF; font-weight:700">Total Amount: ₹${grandTotal}</p>
                            <p style="font-size:0.85rem; color:#94A3B8; margin-top:4px">Payment Method: <strong>CASH ON TABLE / COUNTER</strong></p>
                            ${appliedCoupon ? `<p style="color:#4ADE80; font-size:0.85rem; margin-top:6px">Saved ₹${discountAmount} with code ${appliedCoupon.code}!</p>` : ''}
                            <p style="font-size:0.85rem; opacity:0.8; margin-top:14px">Our chef has started preparing your fresh royal meal.</p>
                           </div>`,
                    icon: 'success',
                    confirmButtonColor: '#D4AF37'
                });

                clearCart();
                setIsSubmitting(false);
                navigate('/menu');
            } catch (err) {
                console.error('Order submission error:', err);
                Swal.fire({
                    title: 'Order Recorded Locally',
                    text: 'We could not reach the server instantly, but your order is saved. Please inform our waiting staff.',
                    icon: 'info',
                    confirmButtonColor: '#D4AF37'
                });
                clearCart();
                setIsSubmitting(false);
                navigate('/menu');
            }
        }
    };

    return (
        <div className="checkout-page-container" style={{ minHeight: '100vh', background: '#070A0E', color: '#F8FAFC', paddingBottom: '90px' }}>
            {/* Header Hero Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(20, 24, 34, 0.95) 0%, rgba(7, 10, 14, 0.98) 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '45px 20px 30px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.35)', marginBottom: '12px' }}>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>💳</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            SECURE RAZORPAY PAYMENT GATEWAY
                        </span>
                    </div>
                    <h1 style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: 'clamp(2rem, 3.8vw, 3rem)', color: '#FFD700', margin: '0 0 8px 0', fontWeight: '800' }}>
                        Royal Checkout &amp; Order Dispatch
                    </h1>
                    <p style={{ color: '#CBD5E1', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
                        Confirm dining preferences, guest information, pay securely via Razorpay, and send order to kitchen.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ maxWidth: '1200px', margin: '36px auto 0 auto', padding: '0 20px' }}>
                <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
                    
                    {/* LEFT COLUMN: Order Details & Payment Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                        
                        {/* 1. Dining Mode & Table Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)',
                                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.7)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ background: '#D4AF37', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>1</span>
                                <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                                    Dining Mode &amp; Table
                                </h3>
                            </div>

                            {/* Dining Mode Toggle */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#070A0E', padding: '4px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '18px' }}>
                                <button
                                    type="button"
                                    onClick={() => setDiningMode('dine-in')}
                                    style={{
                                        background: diningMode === 'dine-in' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                        color: diningMode === 'dine-in' ? '#000' : '#CBD5E1',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <i className="fas fa-chair"></i> Table Dining
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDiningMode('takeaway')}
                                    style={{
                                        background: diningMode === 'takeaway' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                        color: diningMode === 'takeaway' ? '#000' : '#CBD5E1',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <i className="fas fa-shopping-bag"></i> Takeaway Pickup
                                </button>
                            </div>

                            {/* Table Selection Dropdown */}
                            {diningMode === 'dine-in' && (
                                <div>
                                    <label style={{ display: 'block', color: '#FFD700', fontWeight: '800', fontSize: '0.85rem', marginBottom: '8px' }}>
                                        Select Table Number from Live Floor *
                                    </label>
                                    <select
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        required={diningMode === 'dine-in'}
                                        style={{
                                            width: '100%',
                                            padding: '13px 16px',
                                            borderRadius: '12px',
                                            border: '1.5px solid rgba(212, 175, 55, 0.5)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.92rem',
                                            fontWeight: '700',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="">Select your table ({liveTables.length > 0 ? liveTables.length : 20} available)</option>
                                        {liveTables.length > 0 ? (
                                            liveTables.map(t => (
                                                <option key={t.id} value={t.name || `Table ${t.id}`}>
                                                    {t.name || `Table ${t.id}`} {t.section ? `(${t.section})` : ''} - {t.capacity || 4} Seats {t.status ? `[${t.status}]` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                                                <option key={num} value={num}>Table {num}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            )}
                        </motion.div>

                        {/* 2. Guest Info Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)',
                                border: '1.5px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.7)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ background: '#D4AF37', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>2</span>
                                <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                                    Guest Details
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>Guest Name (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Aarav Sharma"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.8rem', marginBottom: '4px' }}>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 Mobile"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.8rem', marginBottom: '4px' }}>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>Special Chef Instructions</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Less spicy, serve drinks first..."
                                        value={specialNotes}
                                        onChange={(e) => setSpecialNotes(e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#070A0E', color: '#FFF', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Payment Method Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.9) 0%, rgba(7, 10, 14, 0.95) 100%)',
                                border: '1.5px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 15px 40px rgba(0,0,0,0.7)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ background: '#D4AF37', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>3</span>
                                <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                                    Payment Gateway Option
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { id: 'upi', icon: '⚡', name: 'Razorpay Instant UPI / GPay / PhonePe / Paytm', desc: 'Fast, secure UPI QR code & app checkout via Razorpay' },
                                    { id: 'card', icon: '💳', name: 'Razorpay Credit / Debit Card & Netbanking', desc: 'All Visa, Mastercard, RuPay & 50+ Banks supported' },
                                    { id: 'cash', icon: '💵', name: 'Cash on Table / Pay at Counter', desc: 'Pay with cash directly to our waiting staff' }
                                ].map((method) => (
                                    <div
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            background: paymentMethod === method.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                            border: `1.5px solid ${paymentMethod === method.id ? '#D4AF37' : 'rgba(255, 255, 255, 0.1)'}`,
                                            borderRadius: '14px',
                                            padding: '14px 16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.5rem' }}>{method.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: paymentMethod === method.id ? '#FFD700' : '#FFF', fontWeight: '800', fontSize: '0.92rem' }}>
                                                {method.name}
                                            </div>
                                            <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
                                                {method.desc}
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: `2px solid ${paymentMethod === method.id ? '#FFD700' : '#64748B'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {paymentMethod === method.id && (
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD700' }}></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Order Summary & Confirm Button */}
                    <motion.div
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.95) 0%, rgba(7, 10, 14, 0.98) 100%)',
                            border: '1.5px solid #D4AF37',
                            borderRadius: '24px',
                            padding: '26px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(212, 175, 55, 0.18)',
                            position: 'sticky',
                            top: '100px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
                            <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                                Order Summary
                            </h3>
                            <Link to="/cart" style={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none' }}>
                                Edit Items ({cart.length})
                            </Link>
                        </div>

                        {/* Itemized List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                            {cart.map((item, idx) => {
                                const cartKey = item.cartItemId || item.id || item.slug || idx;
                                const unitPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
                                return (
                                    <div key={cartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div>
                                            <div style={{ color: '#FFF', fontWeight: '700', fontSize: '0.88rem' }}>{getLocalized(item.name)}</div>
                                            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Qty: {item.quantity} × {item.price}</div>
                                        </div>
                                        <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.92rem' }}>₹{unitPrice * item.quantity}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Promo Code Box */}
                        <div style={{ marginBottom: '20px' }}>
                            {appliedCoupon ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.4)', padding: '10px 14px', borderRadius: '10px', color: '#4ADE80', fontSize: '0.82rem', fontWeight: '700' }}>
                                    <span>✓ Promo Code <strong>{appliedCoupon.code}</strong> Applied</span>
                                    <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: '800' }}>✕</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Promo Code (e.g. KHALIYA20)"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)', color: '#FFF', fontSize: '0.82rem', textTransform: 'uppercase', outline: 'none' }}
                                    />
                                    <button type="button" onClick={handleApplyCoupon} style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', color: '#FFD700', padding: '10px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                                        Apply
                                    </button>
                                </div>
                            )}
                            {couponError && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{couponError}</div>}
                        </div>

                        {/* Detailed Financial Summary Breakdown */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>Items Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>

                            {appliedCoupon && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ADE80', fontSize: '0.9rem', marginBottom: '8px' }}>
                                    <span>Coupon Discount ({appliedCoupon.code})</span>
                                    <span>- ₹{discountAmount}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>Taxes &amp; GST ({gstRate}%)</span>
                                <span>₹{taxAmount}</span>
                            </div>

                            {packagingFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>
                                    <span>Packaging Fee</span>
                                    <span>₹{packagingFee}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFD700', fontSize: '1.35rem', fontWeight: '900', paddingTop: '10px', borderTop: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                <span>Grand Total</span>
                                <span>₹{grandTotal}</span>
                            </div>
                        </div>

                        {storeSettings.isOpen === false && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontWeight: '700', fontSize: '0.82rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i> Ordering temporarily paused right now.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={storeSettings.isOpen === false || isSubmitting}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                color: '#000',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '1.05rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                cursor: (storeSettings.isOpen === false || isSubmitting) ? 'not-allowed' : 'pointer',
                                opacity: (storeSettings.isOpen === false || isSubmitting) ? 0.6 : 1,
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {isSubmitting ? 'Processing Payment...' : (paymentMethod === 'cash' ? '👑 Place Order (Pay Cash)' : '💳 Pay via Razorpay Now')}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.75rem', marginTop: '12px' }}>
                            <i className="fas fa-lock" style={{ color: '#4ADE80' }}></i> 256-Bit SSL Encrypted Razorpay Gateway
                        </div>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
