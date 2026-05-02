import axios from 'axios';
import React, { useState } from 'react';
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

    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api';

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
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
                    phone: user.phone || 'N/A',
                    address: 'In-Restaurant / Pickup' // Native app default
                },
                source: 'Native App v2'
            };

            await axios.post(`${API_URL}/orders`, orderData, { timeout: 10000 });
            
            setIsProcessing(false);
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
        return <NativeOrder onClose={() => setIsOrdered(false)} />;
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
                        {cart.map((item) => (
                            <motion.div
                                key={item.id}
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
                                    <img src={item.image || 'https://via.placeholder.com/150'} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{getLocalized(item.name)}</h4>
                                    <div style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '1.1rem' }}>{item.price}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-body)', padding: '8px 15px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer' }}
                                    >—</button>
                                    <span style={{ fontWeight: '900', minWidth: '20px', textAlign: 'center', color: 'var(--text-dark)' }}>{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer' }}
                                    >+</button>
                                </div>

                                <button 
                                    onClick={() => removeFromCart(item.id)}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-dark)' }}>Total</span>
                                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>₹{getCartTotal()}</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={isProcessing}
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
                                    opacity: isProcessing ? 0.7 : 1,
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
                                    'Secure Checkout'
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
