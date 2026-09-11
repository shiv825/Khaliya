import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2';
import axios from 'axios';

// Popular Recommended Pairing Add-ons
const RECOMMENDED_ADDONS = [
    {
        id: 'addon-naan-1',
        name: { en: 'Garlic Butter Naan', hi: 'गार्लिक बटर नान' },
        price: '₹55',
        numericPrice: 55,
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&fit=crop',
        category: 'Bread'
    },
    {
        id: 'addon-lassi-2',
        name: { en: 'Kesari Mango Lassi', hi: 'केसरी आम लस्सी' },
        price: '₹110',
        numericPrice: 110,
        image: 'https://images.unsplash.com/photo-1571006682860-910408544d6c?w=400&fit=crop',
        category: 'Beverage'
    },
    {
        id: 'addon-sweet-3',
        name: { en: 'Awadhi Gulab Jamun (2 Pcs)', hi: 'अवधी गुलाब जामुन' },
        price: '₹95',
        numericPrice: 95,
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&fit=crop',
        category: 'Dessert'
    },
    {
        id: 'addon-raita-4',
        name: { en: 'Royal Boondi Raita', hi: 'रॉयल बूंदी रायता' },
        price: '₹75',
        numericPrice: 75,
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&fit=crop',
        category: 'Sides'
    }
];

// Available Promo Codes
const PROMO_CODES = {
    'KHALIYA20': { type: 'percent', value: 20, desc: '20% OFF on Royal Orders' },
    'ROYAL100': { type: 'flat', value: 100, desc: 'Flat ₹100 OFF' },
    'FIRST50': { type: 'flat', value: 50, desc: 'Flat ₹50 Welcome Offer' }
};

export default function CartPage() {
    const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const [diningMode, setDiningMode] = useState('dine-in'); // 'dine-in' | 'takeaway'
    const [tableNumber, setTableNumber] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    
    // Promo Code State
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    // Per-item cooking notes
    const [itemNotes, setItemNotes] = useState({});

    // Store state
    const [storeSettings, setStoreSettings] = useState({ isOpen: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
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

        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_URL}/settings?t=${Date.now()}`);
                if (res.data) setStoreSettings(res.data);
            } catch (err) {
                console.warn('Failed to fetch settings in CartPage:', err.message);
            }
        };

        fetchSettings();
    }, [API_URL]);

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
    const taxAmount = Math.round(netSubtotal * 0.05); // 5% GST
    const serviceFee = diningMode === 'takeaway' ? 25 : 0; // Packaging fee for takeaway
    const grandTotal = netSubtotal + taxAmount + serviceFee;

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

    const handleItemNoteChange = (cartKey, note) => {
        setItemNotes(prev => ({ ...prev, [cartKey]: note }));
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
                title: 'Table Number Required',
                text: 'Please select your table number (1 - 20) to proceed with your order.',
                icon: 'warning',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

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
            const orderItems = cart.map(item => {
                const cartKey = item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name);
                const note = itemNotes[cartKey];
                return {
                    id: cartKey,
                    name: getLocalized(item.name) + (note ? ` (${note})` : ''),
                    quantity: item.quantity,
                    price: item.price
                };
            });

            const orderData = {
                items: orderItems,
                total: grandTotal,
                user: {
                    name: guestName.trim() || 'Royal Guest',
                    email: guestEmail.trim() || 'guest@khaliya.web',
                    phone: guestPhone.trim() || 'N/A',
                    address: diningMode === 'dine-in' ? `Table: ${tableNumber}${specialNotes ? ` | Note: ${specialNotes}` : ''}` : `Takeaway Order${specialNotes ? ` | Note: ${specialNotes}` : ''}`
                },
                source: 'Web Full Checkout Page'
            };

            await axios.post(`${API_URL}/orders`, orderData, { timeout: 10000 });

            // Store guest info for convenience
            if (guestName || guestPhone || guestEmail) {
                localStorage.setItem('khaliya_user', JSON.stringify({
                    name: guestName,
                    phone: guestPhone,
                    email: guestEmail
                }));
            }

            Swal.fire({
                title: '🎉 Order Received & Sent to Kitchen!',
                html: `<div style="text-align:center; color:#CBD5E1; font-family:sans-serif">
                        <div style="font-size:3rem; margin-bottom:10px">👨‍🍳</div>
                        <p style="font-size:1.15rem; color:#FFD700; font-weight:800; margin-bottom:8px">
                            ${diningMode === 'dine-in' ? `Table ${tableNumber}` : 'Takeaway Pickup Order'}
                        </p>
                        <p style="font-size:1.1rem; color:#FFF; font-weight:700">Total Bill: ₹${grandTotal}</p>
                        ${appliedCoupon ? `<p style="color:#4ADE80; font-size:0.85rem">You saved ₹${discountAmount} with code ${appliedCoupon.code}!</p>` : ''}
                        <p style="font-size:0.85rem; opacity:0.8; margin-top:12px">Our chef has started preparing your fresh royal meal.</p>
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
    };

    return (
        <div className="cart-checkout-page" style={{ minHeight: '100vh', background: '#070A0E', color: '#F8FAFC', paddingBottom: '90px' }}>
            {/* Header Hero Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(20, 24, 34, 0.95) 0%, rgba(7, 10, 14, 0.98) 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '50px 20px 35px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.35)', marginBottom: '14px' }}>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>👑</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            ROYAL DINING EXPERIENCE
                        </span>
                    </div>
                    <h1 style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', color: '#FFD700', margin: '0 0 10px 0', fontWeight: '800' }}>
                        Your Selection &amp; Checkout
                    </h1>
                    <p style={{ color: '#CBD5E1', fontSize: '0.98rem', maxWidth: '620px', margin: '0 auto' }}>
                        Review dishes, customize chef instructions, select dining option, and place your order.
                    </p>
                </div>
            </div>

            {/* Main Container */}
            <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 20px' }}>
                {cart.length === 0 ? (
                    /* Empty Cart Placeholder */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: 'center',
                            background: 'rgba(15, 20, 30, 0.75)',
                            border: '1.5px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '24px',
                            padding: '70px 20px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                        }}
                    >
                        <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1.5px solid #D4AF37',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto',
                            fontSize: '2.5rem',
                            color: '#FFD700'
                        }}>
                            🍲
                        </div>
                        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', fontSize: '1.7rem', marginBottom: '10px' }}>
                            Your Selection Basket is Empty
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '460px', margin: '0 auto 28px auto' }}>
                            You haven't selected any dishes yet. Discover our signature biryanis, kebabs, and curries.
                        </p>
                        <Link
                            to="/menu"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                color: '#000',
                                padding: '15px 34px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '0.92rem',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)'
                            }}
                        >
                            <i className="fas fa-utensils"></i> Explore Menu Now
                        </Link>
                    </motion.div>
                ) : (
                    /* Active Checkout Grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
                        
                        {/* LEFT COLUMN: Rich Product Cards & Addon Recommendations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* Product Cards Container */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.88) 0%, rgba(7, 10, 14, 0.95) 100%)',
                                    border: '1.5px solid rgba(212, 175, 55, 0.4)',
                                    borderRadius: '24px',
                                    padding: '24px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                    <div>
                                        <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                                            Selected Dishes ({cart.length})
                                        </h3>
                                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)} total items in order
                                        </span>
                                    </div>
                                    <button
                                        onClick={clearCart}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#EF4444',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '0.78rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i className="fas fa-trash-alt"></i> Clear Cart
                                    </button>
                                </div>

                                {/* List of Product Cards */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {cart.map((item, index) => {
                                        const cartKey = item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name) || index;
                                        const unitPriceNumber = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
                                        const itemTotal = unitPriceNumber * item.quantity;

                                        return (
                                            <div
                                                key={cartKey}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1.5px solid rgba(212, 175, 55, 0.25)',
                                                    borderRadius: '18px',
                                                    padding: '18px',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    {/* Image Thumbnail */}
                                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                                        <img
                                                            src={item.image}
                                                            alt={getLocalized(item.name)}
                                                            style={{
                                                                width: '85px',
                                                                height: '85px',
                                                                borderRadius: '14px',
                                                                objectFit: 'cover',
                                                                border: '1.5px solid #D4AF37',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                                                            }}
                                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop'; }}
                                                        />
                                                    </div>

                                                    {/* Details & Controls */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                                            <div>
                                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '800', color: '#FFF' }}>
                                                                    {getLocalized(item.name)}
                                                                </h4>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                                    <span style={{ fontSize: '0.7rem', color: '#D4AF37', background: 'rgba(212, 175, 55, 0.15)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.3)', fontWeight: '700' }}>
                                                                        {item.category || 'Specialty'}
                                                                    </span>
                                                                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                                                                        {item.price} each
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => removeFromCart(cartKey)}
                                                                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', fontSize: '1rem', transition: 'color 0.2s' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                                                                title="Remove dish"
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </div>

                                                        {/* Quantity & Item Total Row */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                                            {/* Stepper */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#070A0E', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.35)' }}>
                                                                <button
                                                                    onClick={() => updateQuantity(cartKey, item.quantity - 1)}
                                                                    style={{ background: 'none', border: 'none', color: '#FFD700', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '900', width: '22px' }}
                                                                >
                                                                    -
                                                                </button>
                                                                <span style={{ color: '#FFF', fontWeight: '800', fontSize: '0.95rem', minWidth: '20px', textAlign: 'center' }}>
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(cartKey, item.quantity + 1)}
                                                                    style={{ background: 'none', border: 'none', color: '#FFD700', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '900', width: '22px' }}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>

                                                            {/* Item Total Price */}
                                                            <div style={{ color: '#FFD700', fontWeight: '900', fontSize: '1.2rem' }}>
                                                                ₹{itemTotal}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Optional Per-Item Note Input */}
                                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Custom instructions (e.g. extra spicy, no onion)..."
                                                        value={itemNotes[cartKey] || ''}
                                                        onChange={(e) => handleItemNoteChange(cartKey, e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            background: 'rgba(0,0,0,0.3)',
                                                            color: '#CBD5E1',
                                                            fontSize: '0.8rem',
                                                            outline: 'none',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Link to="/menu" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="fas fa-plus"></i> Add More Delicacies
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Recommended Add-Ons Showcase */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 20, 30, 0.75) 0%, rgba(7, 10, 14, 0.9) 100%)',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '24px',
                                    padding: '24px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <span style={{ color: '#FFD700', fontSize: '1rem' }}>✨</span>
                                    <h4 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                        Recommended Royal Pairings
                                    </h4>
                                </div>
                                <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '-8px', marginBottom: '18px' }}>
                                    Enhance your dining experience with authentic breads, beverages, and desserts.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                                    {RECOMMENDED_ADDONS.map(addon => (
                                        <div
                                            key={addon.id}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                                borderRadius: '14px',
                                                padding: '12px',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <img
                                                src={addon.image}
                                                alt={getLocalized(addon.name)}
                                                style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #D4AF37', marginBottom: '8px' }}
                                            />
                                            <div style={{ color: '#FFF', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px', lineHeight: '1.2' }}>
                                                {getLocalized(addon.name)}
                                            </div>
                                            <div style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px' }}>
                                                {addon.price}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    addToCart({
                                                        id: addon.id,
                                                        name: addon.name,
                                                        price: addon.price,
                                                        image: addon.image,
                                                        category: addon.category
                                                    });
                                                    Swal.fire({
                                                        title: 'Added!',
                                                        text: `${getLocalized(addon.name)} added to selection.`,
                                                        icon: 'success',
                                                        toast: true,
                                                        position: 'top-end',
                                                        showConfirmButton: false,
                                                        timer: 1800
                                                    });
                                                }}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(212, 175, 55, 0.15)',
                                                    border: '1px solid #D4AF37',
                                                    color: '#FFD700',
                                                    borderRadius: '8px',
                                                    padding: '6px 10px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '800',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: Dining Option, Promo Code & Final Checkout Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
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
                            <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: '0 0 18px 0', fontSize: '1.4rem', fontWeight: '800', paddingBottom: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
                                Order Checkout
                            </h3>

                            {/* Dining Mode Toggle (Dine-in vs Takeaway) */}
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ display: 'block', color: '#D4AF37', fontWeight: '800', fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Dining Mode Option
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#070A0E', padding: '4px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setDiningMode('dine-in')}
                                        style={{
                                            background: diningMode === 'dine-in' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                            color: diningMode === 'dine-in' ? '#000' : '#CBD5E1',
                                            border: 'none',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '0.85rem',
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
                                            padding: '10px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i className="fas fa-shopping-bag"></i> Takeaway
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handlePlaceOrder}>
                                {/* Table Selection (Visible for Dine-In) */}
                                {diningMode === 'dine-in' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#FFD700', fontWeight: '800', fontSize: '0.88rem', marginBottom: '8px' }}>
                                            Select Table Number (1 - 20) *
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
                                            <option value="">Select your table (20 available)</option>
                                            {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                                                <option key={num} value={num}>Table {num}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Promo Code Box */}
                                <div style={{ marginBottom: '22px' }}>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '700', fontSize: '0.82rem', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                        Have a Promo Code?
                                    </label>
                                    {appliedCoupon ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.4)', padding: '10px 14px', borderRadius: '10px', color: '#4ADE80', fontSize: '0.85rem', fontWeight: '700' }}>
                                            <span>✓ Code <strong>{appliedCoupon.code}</strong> ({appliedCoupon.desc})</span>
                                            <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: '800' }}>✕</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="e.g. KHALIYA20"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    background: 'rgba(0,0,0,0.4)',
                                                    color: '#FFF',
                                                    fontSize: '0.85rem',
                                                    textTransform: 'uppercase',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                style={{
                                                    background: 'rgba(212, 175, 55, 0.2)',
                                                    border: '1px solid #D4AF37',
                                                    color: '#FFD700',
                                                    padding: '10px 16px',
                                                    borderRadius: '10px',
                                                    fontWeight: '800',
                                                    fontSize: '0.82rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                    {couponError && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{couponError}</div>}
                                </div>

                                {/* Guest Info Inputs */}
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>
                                        Guest Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Aarav Sharma"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#FFF', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.8rem', marginBottom: '4px' }}>Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 Phone"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#FFF', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.8rem', marginBottom: '4px' }}>Email</label>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#FFF', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontWeight: '600', fontSize: '0.82rem', marginBottom: '4px' }}>General Order Instructions</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Serve desserts together..."
                                        value={specialNotes}
                                        onChange={(e) => setSpecialNotes(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#FFF', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Detailed Financial Summary Breakdown */}
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '20px' }}>
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
                                        <span>Taxes &amp; GST (5%)</span>
                                        <span>₹{taxAmount}</span>
                                    </div>

                                    {serviceFee > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <span>Packaging Fee</span>
                                            <span>₹{serviceFee}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFD700', fontSize: '1.35rem', fontWeight: '900', paddingTop: '10px', borderTop: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                        <span>Total Amount</span>
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
                                        fontSize: '1rem',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        cursor: storeSettings.isOpen === false || isSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: storeSettings.isOpen === false || isSubmitting ? 0.6 : 1,
                                        boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {isSubmitting ? 'Submitting Order...' : 'Place Order Now'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
