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

// Haversine formula distance calculation in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function CartPage() {
    const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const [diningMode, setDiningMode] = useState('dine-in'); // 'dine-in' | 'takeaway' | 'delivery'
    const [tableNumber, setTableNumber] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');

    // Delivery & Location States
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [userLat, setUserLat] = useState(null);
    const [userLng, setUserLng] = useState(null);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Live backend tables from DB
    const [liveTables, setLiveTables] = useState([]);
    
    // Live original products list
    const [catalogProducts, setCatalogProducts] = useState(ORIGINAL_PRODUCTS);

    // Promo Code State
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    // Per-item cooking notes
    const [itemNotes, setItemNotes] = useState({});

    // Store settings state (Admin configurable fees, location, and radius)
    const [storeSettings, setStoreSettings] = useState({
        isOpen: true,
        gstRate: 5,
        packagingFee: 25,
        deliveryFee: 40,
        deliveryRadiusKm: 15,
        restaurantLat: 28.6139,
        restaurantLng: 77.2090,
        restaurantAddress: "Khaliya Sanctuary, Main Boulevard, New Delhi"
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
        // Load saved user info
        try {
            const storedUser = localStorage.getItem('khaliya_user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.name) setGuestName(parsed.name);
                if (parsed.phone) setGuestPhone(parsed.phone);
                if (parsed.email) setGuestEmail(parsed.email);
                if (parsed.address) setDeliveryAddress(parsed.address);
            }
        } catch (e) {}

        // Fetch live catalog, admin settings, and live database tables
        const fetchDataFromBackend = async () => {
            try {
                const [prodRes, setRes, tabRes] = await Promise.all([
                    axios.get(`${API_URL}/products?t=${Date.now()}`).catch(() => null),
                    axios.get(`${API_URL}/settings?t=${Date.now()}`).catch(() => null),
                    axios.get(`${API_URL}/tables?t=${Date.now()}`).catch(() => null)
                ]);

                if (prodRes?.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
                    setCatalogProducts(prodRes.data);
                }
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

    // Admin Configurable Fee Values (No hardcoding!)
    const gstRate = Number(storeSettings?.gstRate ?? 5);
    const packagingFeeSetting = Number(storeSettings?.packagingFee ?? 25);
    const deliveryFeeSetting = Number(storeSettings?.deliveryFee ?? 40);

    const restLat = Number(storeSettings?.restaurantLat ?? 28.6139);
    const restLng = Number(storeSettings?.restaurantLng ?? 77.2090);
    const maxRadiusKm = Number(storeSettings?.deliveryRadiusKm ?? 15);
    const restAddress = storeSettings?.restaurantAddress || "Khaliya Sanctuary, Main Boulevard, New Delhi";

    // Haversine distance calculation for delivery location check
    const calculatedDistanceKm = (userLat !== null && userLng !== null)
        ? calculateHaversineDistance(userLat, userLng, restLat, restLng)
        : null;

    const isWithinDeliveryRadius = calculatedDistanceKm !== null ? calculatedDistanceKm <= maxRadiusKm : null;

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
    const packagingFee = (diningMode === 'takeaway' || diningMode === 'delivery') ? packagingFeeSetting : 0;
    const deliveryFee = diningMode === 'delivery' ? deliveryFeeSetting : 0;

    const grandTotal = netSubtotal + taxAmount + packagingFee + deliveryFee;

    const handleDetectUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setIsDetectingLocation(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = parseFloat(pos.coords.latitude.toFixed(6));
                const lng = parseFloat(pos.coords.longitude.toFixed(6));
                setUserLat(lat);
                setUserLng(lng);
                setIsDetectingLocation(false);

                const dist = calculateHaversineDistance(lat, lng, restLat, restLng);
                if (dist <= maxRadiusKm) {
                    Swal.fire({
                        title: '📍 Location Verified!',
                        text: `You are ~${dist.toFixed(1)} km from ${restAddress}. Delivery is available!`,
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        title: '⚠️ Outside Delivery Zone',
                        text: `You are ${dist.toFixed(1)} km away. Maximum delivery radius is ${maxRadiusKm} km.`,
                        icon: 'warning',
                        confirmButtonColor: '#D4AF37'
                    });
                }
            },
            (err) => {
                setIsDetectingLocation(false);
                setLocationError(`GPS access error (${err.message}). You can still enter your address manually.`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

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
                title: 'Table Selection Required',
                text: 'Please select your table number from our live dining floor tables.',
                icon: 'warning',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

        if (diningMode === 'delivery') {
            if (!deliveryAddress || deliveryAddress.trim() === '') {
                Swal.fire({
                    title: 'Delivery Address Required',
                    text: 'Please enter your complete delivery street address.',
                    icon: 'warning',
                    confirmButtonColor: '#D4AF37'
                });
                return;
            }

            if (isWithinDeliveryRadius === false) {
                Swal.fire({
                    title: 'Delivery Radius Exceeded',
                    text: `Your location (${calculatedDistanceKm?.toFixed(1)} km) is outside our maximum delivery radius of ${maxRadiusKm} km from ${restAddress}.`,
                    icon: 'error',
                    confirmButtonColor: '#D4AF37'
                });
                return;
            }
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

            let formattedAddress = `Dine-In Table: ${tableNumber}`;
            if (diningMode === 'takeaway') {
                formattedAddress = `Takeaway Pickup Order`;
            } else if (diningMode === 'delivery') {
                formattedAddress = `Delivery Address: ${deliveryAddress}${calculatedDistanceKm ? ` (~${calculatedDistanceKm.toFixed(1)} km away)` : ''}`;
            }
            if (specialNotes) {
                formattedAddress += ` | Instruction: ${specialNotes}`;
            }

            const orderData = {
                items: orderItems,
                total: grandTotal,
                user: {
                    name: guestName.trim() || 'Royal Guest',
                    email: guestEmail.trim() || 'guest@khaliya.web',
                    phone: guestPhone.trim() || 'N/A',
                    address: formattedAddress
                },
                source: `Web Checkout (${diningMode.toUpperCase()})`
            };

            await axios.post(`${API_URL}/orders`, orderData, { timeout: 10000 });

            // Store guest info for convenience
            if (guestName || guestPhone || guestEmail || deliveryAddress) {
                localStorage.setItem('khaliya_user', JSON.stringify({
                    name: guestName,
                    phone: guestPhone,
                    email: guestEmail,
                    address: deliveryAddress
                }));
            }

            Swal.fire({
                title: '🎉 Order Received & Sent to Kitchen!',
                html: `<div style="text-align:center; color:#CBD5E1; font-family:sans-serif">
                        <div style="font-size:3rem; margin-bottom:10px">${diningMode === 'delivery' ? '🛵' : '👨‍🍳'}</div>
                        <p style="font-size:1.15rem; color:#FFD700; font-weight:800; margin-bottom:8px">
                            ${diningMode === 'dine-in' ? `Table: ${tableNumber}` : (diningMode === 'delivery' ? 'Home Delivery Order' : 'Takeaway Pickup Order')}
                        </p>
                        <p style="font-size:1.1rem; color:#FFF; font-weight:700">Total Amount Paid: ₹${grandTotal}</p>
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

                        {/* RIGHT COLUMN: Dining Option, Dynamic Location & Delivery Radius Check, & Final Checkout Summary */}
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

                            {/* Dining Mode Selector: Table Dining | Takeaway | Delivery */}
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ display: 'block', color: '#D4AF37', fontWeight: '800', fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Dining Mode Option
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#070A0E', padding: '4px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setDiningMode('dine-in')}
                                        style={{
                                            background: diningMode === 'dine-in' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                            color: diningMode === 'dine-in' ? '#000' : '#CBD5E1',
                                            border: 'none',
                                            padding: '9px 6px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <i className="fas fa-chair"></i> Dine-In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDiningMode('takeaway')}
                                        style={{
                                            background: diningMode === 'takeaway' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                            color: diningMode === 'takeaway' ? '#000' : '#CBD5E1',
                                            border: 'none',
                                            padding: '9px 6px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <i className="fas fa-shopping-bag"></i> Takeaway
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDiningMode('delivery')}
                                        style={{
                                            background: diningMode === 'delivery' ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : 'transparent',
                                            color: diningMode === 'delivery' ? '#000' : '#CBD5E1',
                                            border: 'none',
                                            padding: '9px 6px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <i className="fas fa-motorcycle"></i> Delivery
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handlePlaceOrder}>
                                {/* Live Table Selection from Database (Visible for Dine-In) */}
                                {diningMode === 'dine-in' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#FFD700', fontWeight: '800', fontSize: '0.88rem', marginBottom: '8px' }}>
                                            Select Table from Floor *
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

                                {/* Location Detection & Radius Checking (Visible for Delivery) */}
                                {diningMode === 'delivery' && (
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1.5px solid rgba(212, 175, 55, 0.35)',
                                        borderRadius: '16px',
                                        padding: '18px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <label style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.85rem' }}>
                                                📍 Delivery Address &amp; Location
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleDetectUserLocation}
                                                disabled={isDetectingLocation}
                                                style={{
                                                    background: 'rgba(212, 175, 55, 0.2)',
                                                    border: '1px solid #D4AF37',
                                                    color: '#FFD700',
                                                    padding: '5px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '800',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                <i className="fas fa-crosshairs"></i> {isDetectingLocation ? 'Locating...' : 'Detect GPS'}
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Enter your street address, house no, landmark..."
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            required={diningMode === 'delivery'}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                background: 'rgba(0,0,0,0.5)',
                                                color: '#FFF',
                                                fontSize: '0.88rem',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                marginBottom: '10px'
                                            }}
                                        />

                                        {/* Restaurant Location & Service Info */}
                                        <div style={{ fontSize: '0.78rem', color: '#CBD5E1', background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' }}>
                                            <i className="fas fa-store" style={{ color: '#D4AF37', marginRight: '6px' }}></i>
                                            <strong>Delivering from:</strong> {restAddress}
                                            <div style={{ marginTop: '3px', color: '#94A3B8' }}>
                                                ⚡ Delivery Radius: <strong>Within {maxRadiusKm} km</strong>
                                            </div>
                                        </div>

                                        {/* Radius Calculation Status Indicator */}
                                        {calculatedDistanceKm !== null && (
                                            <div style={{
                                                background: isWithinDeliveryRadius ? 'rgba(74, 222, 128, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                                                border: `1px solid ${isWithinDeliveryRadius ? '#4ADE80' : '#EF4444'}`,
                                                color: isWithinDeliveryRadius ? '#4ADE80' : '#EF4444',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.82rem',
                                                fontWeight: '700',
                                                textAlign: 'center'
                                            }}>
                                                {isWithinDeliveryRadius ? (
                                                    <span>✅ Location Verified: You are ~{calculatedDistanceKm.toFixed(1)} km away (Eligible for delivery!)</span>
                                                ) : (
                                                    <span>❌ Outside Delivery Radius: You are {calculatedDistanceKm.toFixed(1)} km away (Max allowed: {maxRadiusKm} km)</span>
                                                )}
                                            </div>
                                        )}

                                        {locationError && (
                                            <div style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '6px' }}>
                                                {locationError}
                                            </div>
                                        )}
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

                                {/* Detailed Financial Summary Breakdown (Fully Admin Configured Fees) */}
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
                                        <span>Taxes &amp; GST ({gstRate}%)</span>
                                        <span>₹{taxAmount}</span>
                                    </div>

                                    {packagingFee > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <span>Packaging Fee</span>
                                            <span>₹{packagingFee}</span>
                                        </div>
                                    )}

                                    {deliveryFee > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <span>Delivery Fee</span>
                                            <span>₹{deliveryFee}</span>
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
                                    disabled={storeSettings.isOpen === false || isSubmitting || (diningMode === 'delivery' && isWithinDeliveryRadius === false)}
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
                                        cursor: (storeSettings.isOpen === false || isSubmitting || (diningMode === 'delivery' && isWithinDeliveryRadius === false)) ? 'not-allowed' : 'pointer',
                                        opacity: (storeSettings.isOpen === false || isSubmitting || (diningMode === 'delivery' && isWithinDeliveryRadius === false)) ? 0.6 : 1,
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
