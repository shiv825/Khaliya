import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2';
import axios from 'axios';

// Authentic Original Products Catalog Fallback
const ORIGINAL_PRODUCTS = [
    {
        id: 1780141133327,
        category: "Appetizer",
        name: { en: "Samosa (4 pcs)", hi: "समोसा (4 पीसी)" },
        description: { en: "Crispy golden pastry stuffed with royal spiced potato & pea filling." },
        price: "₹150",
        tags: ["veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443766/khaliya_restaurant/product_1780141133327.jpg"
    },
    {
        id: 1780141131494,
        category: "Appetizer",
        name: { en: "Paneer Tikka", hi: "पनीर टिक्का" },
        description: { en: "Char-grilled artisan cottage cheese marinated in hung curd & royal spices." },
        price: "₹320",
        tags: ["veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443767/khaliya_restaurant/product_1780141131494.jpg"
    },
    {
        id: 1780141134688,
        category: "Appetizer",
        name: { en: "Tandoori Chicken (Half)", hi: "तंदूरी चिकन (आधा)" },
        description: { en: "Signature tandoori chicken marinated in secret Mughlai spices." },
        price: "₹420",
        tags: ["non-veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443768/khaliya_restaurant/product_1780141134688.jpg"
    },
    {
        id: 1780141127512,
        category: "Main Course",
        name: { en: "Chicken Biryani", hi: "चिकन बिरयानी" },
        description: { en: "Dum-cooked aged Basmati rice layered with saffron chicken." },
        price: "₹450",
        tags: ["non-veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443774/khaliya_restaurant/product_1780141127512.jpg"
    },
    {
        id: 1780141132061,
        category: "Main Course",
        name: { en: "Butter Chicken", hi: "बटर चिकन" },
        description: { en: "Tandoori chicken simmered in rich velvet tomato-butter gravy." },
        price: "₹400",
        tags: ["non-veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443776/khaliya_restaurant/product_1780141132061.jpg"
    },
    {
        id: 1780141131257,
        category: "Main Course",
        name: { en: "Dal Makhani", hi: "दाल मखनी" },
        description: { en: "Overnight slow-cooked black lentils enriched with butter & cream." },
        price: "₹280",
        tags: ["veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443781/khaliya_restaurant/product_1780141131257.jpg"
    },
    {
        id: 1780141135395,
        category: "Main Course",
        name: { en: "Paneer Butter Masala", hi: "पनीर बटर मसाला" },
        description: { en: "Melt-in-mouth malai paneer cubes in rich butter-tomato sauce." },
        price: "₹320",
        tags: ["veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443780/khaliya_restaurant/product_1780141135395.jpg"
    },
    {
        id: 1780141136038,
        category: "Main Course",
        name: { en: "Lamb Rogan Josh", hi: "लैम्ब रोगन जोश" },
        description: { en: "Kashmiri tender lamb braised in fennel & cardamom gravy." },
        price: "₹450",
        tags: ["non-veg"],
        image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443783/khaliya_restaurant/product_1780141136038.jpg"
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

    // Live original products list
    const [catalogProducts, setCatalogProducts] = useState(ORIGINAL_PRODUCTS);

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

    // Per-item cooking notes
    const [itemNotes, setItemNotes] = useState({});

    // Store settings state
    const [storeSettings, setStoreSettings] = useState({
        isOpen: true,
        gstRate: 5,
        packagingFee: 25
    });

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        // Fetch live catalog and admin settings
        const fetchDataFromBackend = async () => {
            try {
                const [prodRes, setRes] = await Promise.all([
                    axios.get(`${API_URL}/products?t=${Date.now()}`).catch(() => null),
                    axios.get(`${API_URL}/settings?t=${Date.now()}`).catch(() => null)
                ]);

                if (prodRes?.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
                    setCatalogProducts(prodRes.data);
                }
                if (setRes?.data) {
                    setStoreSettings(prev => ({ ...prev, ...setRes.data }));
                }
            } catch (err) {
                console.warn('Backend fetch notice:', err.message);
            }
        };

        fetchDataFromBackend();
    }, [API_URL]);

    // Financial Calculations
    const gstRate = Number(storeSettings?.gstRate ?? 5);
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
    const grandTotal = netSubtotal + taxAmount;

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        setCouponError('');

        if (!code) return;

        if (PROMO_CODES[code]) {
            const couponObj = { code, ...PROMO_CODES[code] };
            setAppliedCoupon(couponObj);
            try { localStorage.setItem('khaliya_applied_coupon', JSON.stringify(couponObj)); } catch (e) {}
            setCouponInput('');
            Swal.fire({
                title: 'Coupon Applied! 🎉',
                text: `${PROMO_CODES[code].desc} has been applied to your order.`,
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
        try { localStorage.removeItem('khaliya_applied_coupon'); } catch (e) {}
    };

    const handleItemNoteChange = (cartKey, note) => {
        setItemNotes(prev => ({ ...prev, [cartKey]: note }));
    };

    const handleProceedToCheckout = () => {
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
        navigate('/checkout');
    };

    // Filter out items already in the cart for recommended original products
    const cartItemIds = cart.map(item => String(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name)));
    const recommendedOriginalProducts = catalogProducts.filter(prod => {
        const prodId = String(prod.id || prod.slug || (typeof prod.name === 'object' ? prod.name.en : prod.name));
        return !cartItemIds.includes(prodId);
    }).slice(0, 6);

    return (
        <div className="cart-checkout-page" style={{ minHeight: '100vh', background: '#070A0E', color: '#F8FAFC', paddingBottom: '90px' }}>
            {/* Header Hero Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(20, 24, 34, 0.95) 0%, rgba(7, 10, 14, 0.98) 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '50px 20px 35px 20px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.35)', marginBottom: '14px' }}>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>👑</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            ROYAL DINING BASKET
                        </span>
                    </div>
                    <h1 style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', color: '#FFD700', margin: '0 0 10px 0', fontWeight: '800' }}>
                        Your Selected Dishes
                    </h1>
                    <p style={{ color: '#CBD5E1', fontSize: '0.98rem', maxWidth: '620px', margin: '0 auto' }}>
                        Review your chosen delicacies, add custom chef notes, and proceed to checkout.
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
                    /* Active Cart Grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
                        
                        {/* LEFT COLUMN: Rich Product Cards & Original Products Showcase */}
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
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)} total items in basket
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
                                                            onError={(e) => { e.target.src = 'https://res.cloudinary.com/mbib5dog/image/upload/v1788443766/khaliya_restaurant/product_1780141133327.jpg'; }}
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

                            {/* ORIGINAL PRODUCTS RECOMMENDATION SHOWCASE */}
                            {recommendedOriginalProducts.length > 0 && (
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
                                            RECOMMENDED ROYAL PAIRINGS
                                        </h4>
                                    </div>
                                    <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '-8px', marginBottom: '18px' }}>
                                        Enhance your dining experience with authentic dishes from our royal kitchen.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                        {recommendedOriginalProducts.map(prod => {
                                            const prodName = getLocalized(prod.name);
                                            return (
                                                <div
                                                    key={prod.id || prod.slug || prodName}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1.5px solid rgba(212, 175, 55, 0.25)',
                                                        borderRadius: '16px',
                                                        padding: '14px',
                                                        textAlign: 'center',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                                    }}
                                                >
                                                    <img
                                                        src={prod.image}
                                                        alt={prodName}
                                                        style={{ width: '75px', height: '75px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid #D4AF37', marginBottom: '10px' }}
                                                        onError={(e) => { e.target.src = 'https://res.cloudinary.com/mbib5dog/image/upload/v1788443766/khaliya_restaurant/product_1780141133327.jpg'; }}
                                                    />
                                                    <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px', lineHeight: '1.2' }}>
                                                        {prodName}
                                                    </div>
                                                    <div style={{ fontSize: '0.68rem', color: '#D4AF37', marginBottom: '6px', fontWeight: '600' }}>
                                                        {prod.category || 'Specialty'}
                                                    </div>
                                                    <div style={{ color: '#FFD700', fontSize: '0.95rem', fontWeight: '900', marginBottom: '12px' }}>
                                                        {prod.price}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            addToCart(prod);
                                                            Swal.fire({
                                                                title: 'Added!',
                                                                text: `${prodName} added to your selection.`,
                                                                icon: 'success',
                                                                toast: true,
                                                                position: 'top-end',
                                                                showConfirmButton: false,
                                                                timer: 1800
                                                            });
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
                                                            border: '1.5px solid #D4AF37',
                                                            color: '#FFD700',
                                                            borderRadius: '10px',
                                                            padding: '8px 12px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        + Add
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Clean Order Summary & Proceed to Checkout */}
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
                                Basket Summary
                            </h3>

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
                                    <span>Estimated Taxes &amp; GST ({gstRate}%)</span>
                                    <span>₹{taxAmount}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFD700', fontSize: '1.35rem', fontWeight: '900', paddingTop: '10px', borderTop: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                    <span>Estimated Total</span>
                                    <span>₹{grandTotal}</span>
                                </div>
                            </div>

                            {storeSettings.isOpen === false && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontWeight: '700', fontSize: '0.82rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i> Ordering temporarily paused right now.
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleProceedToCheckout}
                                disabled={storeSettings.isOpen === false}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '16px',
                                    borderRadius: '14px',
                                    fontWeight: '900',
                                    fontSize: '1.02rem',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    cursor: storeSettings.isOpen === false ? 'not-allowed' : 'pointer',
                                    opacity: storeSettings.isOpen === false ? 0.6 : 1,
                                    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                PROCEED TO CHECKOUT <i className="fas fa-arrow-right"></i>
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
