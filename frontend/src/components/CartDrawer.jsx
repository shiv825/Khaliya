import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2';

export default function CartDrawer({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { t, language } = useLanguage();

    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        Swal.fire({
            title: 'Order Summary',
            text: 'Your selection has been finalized! (Demo)',
            icon: 'success',
            confirmButtonColor: '#E63946'
        });
        clearCart();
        onClose();
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
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
                            zIndex: 2001,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '40px',
                            borderLeft: '1px solid var(--border-color)',
                            color: '#fff'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--accent-color)' }}>
                                {t('cart.title', 'My Selection')}
                            </h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#fff' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '30px' }} className="custom-scrollbar-hide">
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
                                    <div style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        borderRadius: '50%', 
                                        background: 'rgba(218, 165, 32, 0.1)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        margin: '0 auto 20px auto'
                                    }}>
                                        <i className="fas fa-shopping-basket" style={{ fontSize: '2rem', color: 'var(--accent-color)', opacity: 0.5 }}></i>
                                    </div>
                                    <p style={{ fontSize: '1.1rem' }}>No treasures selected yet</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={item.image} style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover', border: '1px solid var(--border-color)' }} alt="" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600' }}>{getLocalized(item.name)}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '1.2rem' }}>{item.price}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff', fontSize: '1.2rem' }}>-</button>
                                                    <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff', fontSize: '1.2rem' }}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#ff4d4d'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                                            <i className="far fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '25px', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Total Amount</span>
                                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-color)' }}>₹{getCartTotal()}</span>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '18px', borderRadius: '15px', fontWeight: '800', letterSpacing: '1px' }}
                                >
                                    Finalize Selection
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
