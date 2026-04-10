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
                                {t('cart.title', 'My Selection')}
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
                                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>No treasures selected yet</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid var(--border-light)', paddingBottom: '25px', alignItems: 'center' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={item.image} style={{ width: '85px', height: '85px', borderRadius: '18px', objectFit: 'cover', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} alt="" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-color)' }}>{getLocalized(item.name)}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '1.3rem' }}>{item.price}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-body)', padding: '8px 16px', borderRadius: '25px', border: '1px solid var(--border-color)' }}>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>-</button>
                                                    <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center', color: 'var(--primary-color)' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)', fontSize: '1.1rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                            <i className="far fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ background: 'var(--bg-body)', padding: '30px', borderRadius: '25px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'baseline' }}>
                                    <span style={{ color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: '600' }}>Total Amount</span>
                                    <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>₹{getCartTotal()}</span>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '20px', borderRadius: '40px', fontWeight: '800', letterSpacing: '1.5px', fontSize: '1.1rem' }}
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
