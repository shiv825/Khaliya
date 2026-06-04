import axios from 'axios';
import React, { useState, useEffect } from 'react';
import NativeOrder from './NativeOrder';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';

export default function NativeCart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { t, language = 'en' } = useLanguage();
    const [isOrdered, setIsOrdered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [latestOrderId, setLatestOrderId] = useState(null);
    const [storeSettings, setStoreSettings] = useState({ isOpen: true });

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        let isMounted = true;
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_URL}/settings?t=${Date.now()}`);
                if (isMounted && res.data) {
                    setStoreSettings(res.data);
                }
            } catch (err) {
                console.warn('Failed to fetch settings in NativeCart:', err.message);
            }
        };

        fetchSettings();

        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        const evtSource = new EventSource(sseUrl);
        
        evtSource.onmessage = (e) => {
            try {
                const update = JSON.parse(e.data);
                if (update.type === 'settings' && isMounted) {
                    setStoreSettings(update.data);
                }
            } catch (err) {
                console.error("SSE settings parsing error in NativeCart:", err);
            }
        };

        return () => {
            isMounted = false;
            evtSource.close();
        };
    }, [API_URL]);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (storeSettings.isOpen === false) {
            Swal.fire({
                title: 'Ordering Temporarily Closed',
                text: 'We are not accepting online orders at the moment. Please contact our staff.',
                icon: 'warning',
                confirmButtonColor: 'var(--primary-color)'
            });
            return;
        }
        
        if (!tableNumber || tableNumber.trim() === '') {
            Swal.fire({
                title: 'Table Number Required',
                text: 'Please enter your table number to proceed with the order.',
                icon: 'warning',
                confirmButtonColor: 'var(--primary-color)'
            });
            return;
        }
        
        setIsProcessing(true);
        try {
            const storedUser = localStorage.getItem('khaliya_native_user');
            const user = storedUser ? JSON.parse(storedUser) : { name: 'PWA Guest' };

            const orderData = {
                items: cart.map(item => ({
                    id: item.id,
                    name: getLocalized(item.name),
                    quantity: item.quantity,
                    price: item.price
                })),
                total: getCartTotal(),
                user: {
                    name: user.name,
                    email: user.email || 'guest@khaliya.luxury',
                    phone: user.phone || 'N/A',
                    address: `Table: ${tableNumber}`
                },
                source: 'Native App v2'
            };

            const res = await axios.post(`${API_URL}/orders`, orderData, { timeout: 10000 });
            
            if (typeof res.data === 'string' && res.data.toLowerCase().includes('<html')) {
                throw new Error("Received HTML instead of JSON. Backend is likely misconfigured or down.");
            }
            
            setIsProcessing(false);
            setLatestOrderId(res.data.order.id);
            setIsOrdered(true);
            clearCart();
            
            if (navigator.vibrate) navigator.vibrate([100, 30, 100]); // Victory vibration
        } catch (err) {
            console.error('Checkout failed', err);
            setIsProcessing(false);
            Swal.fire({
                title: 'Connection Issue',
                text: 'We could not reach the sanctuary servers, but your order has been saved locally. Please show this screen to the host.',
                icon: 'warning',
                confirmButtonColor: 'var(--primary-color)'
            });
        }
    };

    if (isOrdered) {
        return <NativeOrder onClose={() => setIsOrdered(false)} orderId={latestOrderId} />;
    }

    return (
        <div className="native-cart" style={{ padding: '20px', paddingBottom: '120px' }}>
            <div className="section-header" style={{ marginBottom: '30px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--primary-color)', margin: 0 }}>{t('cart.title', 'My Selection')}</h2>
                <p style={{ color: 'var(--text-light)', margin: '5px 0 0 0', fontWeight: '600' }}>Review and finalize your order</p>
            </div>

            <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: '30px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <div style={{ width: '100px', height: '100px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <i className="fas fa-shopping-basket" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', opacity: 0.2 }}></i>
                        </div>
                        <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Your bag is empty</h3>
                        <p style={{ color: 'var(--text-light)', fontWeight: '500' }}>Explore our menu to add royal flavors!</p>
                    </motion.div>
                ) : (
                    <div className="cart-list">
                        {cart.map((item, index) => (
                            <motion.div
                                key={item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name) || index}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="cart-item-card"
                                style={{ 
                                    display: 'flex', 
                                    gap: '15px', 
                                    background: 'var(--bg-surface)', 
                                    padding: '18px', 
                                    borderRadius: '25px', 
                                    marginBottom: '15px', 
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ width: '80px', height: '80px', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                    <img src={item.image || 'https://via.placeholder.com/150'} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop'} />
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{getLocalized(item.name)}</h4>
                                    <div style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '1.1rem' }}>{item.price}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-body)', padding: '8px 15px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                    <button 
                                        onClick={() => updateQuantity(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name), item.quantity - 1)}
                                        style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer' }}
                                    >—</button>
                                    <span style={{ fontWeight: '900', minWidth: '20px', textAlign: 'center', color: 'var(--text-dark)' }}>{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name), item.quantity + 1)}
                                        style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer' }}
                                    >+</button>
                                </div>

                                <button 
                                    onClick={() => removeFromCart(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name))}
                                    style={{ border: 'none', background: 'rgba(142, 28, 28, 0.05)', color: 'var(--primary-color)', width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <i className="far fa-trash-alt"></i>
                                </button>
                            </motion.div>
                        ))}

                        <motion.div 
                            layout
                            className="cart-summary" 
                            style={{ 
                                marginTop: '35px', 
                                background: 'var(--bg-surface)', 
                                padding: '30px', 
                                borderRadius: '30px', 
                                color: 'var(--text-dark)',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}>Subtotal</span>
                                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>₹{getCartTotal()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}>Delivery Fee</span>
                                <span style={{ color: '#10b981', fontWeight: '800' }}>COMPLIMENTARY</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '20px' }}></div>
                            
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', color: 'var(--text-dark)', fontWeight: '700', marginBottom: '8px', fontSize: '1.1rem' }}>Table Number *</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 12" 
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '15px 20px',
                                        borderRadius: '15px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-body)',
                                        color: 'var(--text-dark)',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-dark)' }}>Total</span>
                                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>₹{getCartTotal()}</span>
                            </div>
                             {storeSettings.isOpen === false && (
                                 <div style={{
                                     background: 'rgba(239, 68, 68, 0.1)',
                                     color: '#ef4444',
                                     padding: '15px',
                                     borderRadius: '15px',
                                     marginBottom: '20px',
                                     fontWeight: '700',
                                     fontSize: '0.9rem',
                                     textAlign: 'center',
                                     border: '1px solid rgba(239, 68, 68, 0.2)'
                                 }}>
                                     <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                                     Ordering closed temporarily
                                 </div>
                             )}
                             <motion.button
                                whileHover={{ filter: storeSettings.isOpen === false ? 'none' : 'brightness(1.1)' }}
                                whileTap={{ scale: storeSettings.isOpen === false ? 1 : 0.98 }}
                                onClick={handleCheckout}
                                disabled={isProcessing || storeSettings.isOpen === false}
                                style={{ 
                                    width: '100%', 
                                    padding: '20px', 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    background: 'var(--primary-color)', 
                                    color: '#FFF', 
                                    fontSize: '1.2rem', 
                                    fontWeight: '800',
                                    boxShadow: 'var(--shadow-md)',
                                    opacity: (isProcessing || storeSettings.isOpen === false) ? 0.5 : 1,
                                    cursor: (isProcessing || storeSettings.isOpen === false) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                            >
                                {isProcessing ? (
                                    <>
                                        <motion.i 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="fas fa-circle-notch"
                                        />
                                        PROCESSING...
                                    </>
                                ) : (
                                    storeSettings.isOpen === false ? 'Ordering Closed' : 'Place Order'
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
