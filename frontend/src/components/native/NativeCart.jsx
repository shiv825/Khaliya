import React, { useState } from 'react';
import NativeOrder from './NativeOrder';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';

export default function NativeCart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { t, language } = useLanguage();

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const [isOrdered, setIsOrdered] = useState(false);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsOrdered(true);
        clearCart();
    };

    if (isOrdered) {
        return <NativeOrder onClose={() => setIsOrdered(false)} />;
    }

    return (
        <div className="native-cart" style={{ padding: '20px', paddingBottom: '100px' }}>
            <div className="section-header" style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>My Selection</h2>
                <p style={{ color: '#666', margin: '5px 0 0 0' }}>Review and finalize your items</p>
            </div>

            <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    >
                        <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <i className="fas fa-shopping-basket" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                        </div>
                        <h3>Your cart is empty</h3>
                        <p style={{ color: '#666' }}>Go to the menu to add some delicious items!</p>
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
                                    background: '#fff', 
                                    padding: '15px', 
                                    borderRadius: '20px', 
                                    marginBottom: '15px', 
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ width: '70px', height: '70px', borderRadius: '15px', overflow: 'hidden' }}>
                                    <img src={item.image || 'https://via.placeholder.com/150'} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: '700' }}>{getLocalized(item.name)}</h4>
                                    <div style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{item.price}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '5px 12px', borderRadius: '12px' }}>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '1rem', cursor: 'pointer' }}
                                    >-</button>
                                    <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '1rem', cursor: 'pointer' }}
                                    >+</button>
                                </div>

                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ border: 'none', background: 'rgba(230, 57, 70, 0.1)', color: '#E63946', width: '35px', height: '35px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <i className="far fa-trash-alt"></i>
                                </button>
                            </motion.div>
                        ))}

                        <motion.div 
                            layout
                            className="cart-summary" 
                            style={{ 
                                marginTop: '30px', 
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                                padding: '25px', 
                                borderRadius: '24px', 
                                color: '#fff',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ opacity: 0.7 }}>Subtotal</span>
                                <span style={{ fontWeight: '700' }}>₹{getCartTotal()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ opacity: 0.7 }}>Taxes & Charges</span>
                                <span style={{ color: '#10b981' }}>FREE</span>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Total</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#E63946' }}>₹{getCartTotal()}</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                style={{ 
                                    width: '100%', 
                                    padding: '18px', 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    background: 'var(--primary-color)', 
                                    color: '#fff', 
                                    fontSize: '1.1rem', 
                                    fontWeight: '800',
                                    boxShadow: '0 10px 20px rgba(230, 57, 70, 0.3)'
                                }}
                            >
                                Place Order
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
