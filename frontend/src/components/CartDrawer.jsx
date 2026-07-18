import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function CartDrawer({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { t, language } = useLanguage();
    const [tableNumber, setTableNumber] = React.useState('');
    const [storeSettings, setStoreSettings] = React.useState({ isOpen: true });

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    React.useEffect(() => {
        let isMounted = true;
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_URL}/settings?t=${Date.now()}`);
                if (isMounted && res.data) {
                    setStoreSettings(res.data);
                }
            } catch (err) {
                console.warn('Failed to fetch settings in CartDrawer:', err.message);
            }
        };

        if (isOpen) {
            fetchSettings();
        }

        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        let evtSource = null;
        try {
            evtSource = new EventSource(sseUrl);
            evtSource.onmessage = (e) => {
                try {
                    const update = JSON.parse(e.data);
                    if (update.type === 'settings' && isMounted) {
                        setStoreSettings(update.data);
                    }
                } catch (err) {
                    console.error("SSE settings parsing error in CartDrawer:", err);
                }
            };
            evtSource.onerror = () => {
                if (evtSource) {
                    evtSource.close();
                }
            };
        } catch (err) {
            console.warn('SSE unavailable in CartDrawer:', err.message);
        }

        return () => {
            isMounted = false;
            if (evtSource) evtSource.close();
        };
    }, [isOpen, API_URL]);

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

        Swal.fire({
            title: 'Processing Order...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const storedUser = localStorage.getItem('khaliya_user');
            const user = storedUser ? JSON.parse(storedUser) : { name: 'Web Guest' };

            const orderData = {
                items: cart.map(item => ({
                    id: item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name),
                    name: getLocalized(item.name),
                    quantity: item.quantity,
                    price: item.price
                })),
                total: getCartTotal(),
                user: {
                    name: user.name || 'Web Guest',
                    email: user.email || 'guest@khaliya.web',
                    phone: user.phone || 'N/A',
                    address: `Table: ${tableNumber}`
                },
                source: 'Web App'
            };

            await axios.post(`${API_URL}/orders`, orderData, { timeout: 10000 });
            
            Swal.fire({
                title: t('cart.orderSummary') || 'Order Confirmed!',
                text: t('cart.orderConfirmed') || 'Your delicious meal is being prepared.',
                icon: 'success',
                confirmButtonColor: 'var(--primary-color)'
            });
            setTableNumber('');
            clearCart();
            onClose();
        } catch (err) {
            console.error('Checkout failed', err);
            Swal.fire({
                title: 'Offline Order',
                text: 'We could not reach the server, but your order was saved locally. Please show this to our staff.',
                icon: 'warning',
                confirmButtonColor: 'var(--primary-color)'
            });
            setTableNumber('');
            clearCart();
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2000
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            width: '450px',
                            maxWidth: '100%',
                            height: '100%',
                            background: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 2001,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '40px',
                            borderLeft: '1px solid var(--border-color)',
                            color: 'var(--text-dark)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ margin: 0, fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>
                                {t('cart.title')}
                            </h2>
                            <button onClick={onClose} style={{ background: 'var(--bg-body)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '30px', paddingRight: '10px' }} className="custom-scrollbar-hide">
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                                    <div style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        borderRadius: '50%', 
                                        background: 'rgba(142, 28, 28, 0.05)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        margin: '0 auto 25px auto',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <i className="fas fa-shopping-basket" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', opacity: 0.4 }}></i>
                                    </div>
                                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>{t('cart.empty')}</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name) || index} style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid var(--border-light)', paddingBottom: '25px', alignItems: 'center' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={item.image} style={{ width: '85px', height: '85px', borderRadius: '18px', objectFit: 'cover', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} alt="" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop'} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-color)' }}>{getLocalized(item.name)}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '1.3rem' }}>{item.price}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-body)', padding: '8px 16px', borderRadius: '25px', border: '1px solid var(--border-color)' }}>
                                                    <button onClick={() => updateQuantity(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name), item.quantity - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>-</button>
                                                    <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center', color: 'var(--primary-color)' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name), item.quantity + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartItemId || item.id || item.slug || (typeof item.name === 'object' ? item.name.en : item.name))} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)', fontSize: '1.1rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                            <i className="far fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ background: 'var(--bg-body)', padding: '30px', borderRadius: '25px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'baseline' }}>
                                    <span style={{ color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: '600' }}>{t('cart.total')}</span>
                                    <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>₹{getCartTotal()}</span>
                                </div>
                                
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', color: 'var(--text-dark)', fontWeight: '700', marginBottom: '8px', fontSize: '1.1rem' }}>Table Number (1 - 20) *</label>
                                    <select 
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
                                    >
                                        <option value="">Select your table (20 available)</option>
                                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>Table {num}</option>
                                        ))}
                                    </select>
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
                                <button 
                                    onClick={handleCheckout}
                                    className="btn btn-primary" 
                                    disabled={storeSettings.isOpen === false}
                                    style={{ 
                                        width: '100%', 
                                        padding: '20px', 
                                        borderRadius: '40px', 
                                        fontWeight: '800', 
                                        letterSpacing: '1.5px', 
                                        fontSize: '1.1rem',
                                        opacity: storeSettings.isOpen === false ? 0.5 : 1,
                                        cursor: storeSettings.isOpen === false ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {storeSettings.isOpen === false ? 'Ordering Closed' : t('cart.checkout')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
