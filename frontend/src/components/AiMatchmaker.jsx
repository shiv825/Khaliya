import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function AiMatchmaker({ onClose }) {
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState({ mood: '', drink: '' });
    const { addToCart } = useCart();
    
    const moods = [
        { id: 'spicy', label: 'Fiery & Bold', icon: '🌶️', color: '#ff4444' },
        { id: 'comfort', label: 'Rich Comfort', icon: '🍲', color: '#DAA520' },
        { id: 'light', label: 'Fresh & Light', icon: '🥗', color: '#4caf50' },
        { id: 'indulgent', label: 'Royal Feast', icon: '👑', color: '#9c27b0' }
    ];

    const drinks = [
        { id: 'wine', label: 'Fine Wine', icon: '🍷' },
        { id: 'cocktail', label: 'Craft Cocktail', icon: '🍸' },
        { id: 'mocktail', label: 'Fresh Mocktail', icon: '🍹' },
        { id: 'chai', label: 'Masala Chai', icon: '☕' }
    ];

    const generateMatch = () => {
        // Simplified dynamic matching logic
        if (selections.mood === 'spicy' || selections.mood === 'indulgent') {
            return {
                name: "The Royal Spice Combo",
                desc: "Spicy Mutton Curry, Garlic Naan, and Fragrant Jeera Rice paired with your selected drink.",
                price: "₹850",
                image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&fit=crop"
            };
        } else {
            return {
                name: "The Light & Fresh Medley",
                desc: "Tandoori Paneer Tikka, Mint Chutney, and Rumali Roti tailored to your taste.",
                price: "₹650",
                image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&fit=crop"
            };
        }
    };

    const match = generateMatch();

    const handleAdd = () => {
        addToCart({
            id: `combo-${Date.now()}`,
            name: match.name,
            price: match.price.replace('₹', ''),
            image: match.image
        });
        alert(`${match.name} added to cart!`);
        onClose();
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', backdropFilter: 'blur(10px)'
            }}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                style={{
                    background: 'var(--bg-dark, #111)', width: '100%', maxWidth: '500px',
                    borderRadius: '24px', overflow: 'hidden', position: 'relative',
                    border: '1px solid rgba(218, 165, 32, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                            <i className="fas fa-magic"></i>
                        </div>
                        <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.4rem' }}>Culinary Matchmaker</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ padding: '30px', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
                                <h3 style={{ color: '#fff', marginBottom: '25px', textAlign: 'center', fontSize: '1.3rem' }}>What is your craving tonight?</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {moods.map(m => (
                                        <motion.button 
                                            key={m.id}
                                            whileHover={{ scale: 1.05, borderColor: m.color }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSelections({ ...selections, mood: m.id }); setStep(2); }}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px', padding: '20px', cursor: 'pointer', textAlign: 'center', color: '#fff',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{m.icon}</div>
                                            <div style={{ fontWeight: '600' }}>{m.label}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
                                <h3 style={{ color: '#fff', marginBottom: '25px', textAlign: 'center', fontSize: '1.3rem' }}>Select your beverage pairing:</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {drinks.map(d => (
                                        <motion.button 
                                            key={d.id}
                                            whileHover={{ scale: 1.05, borderColor: 'var(--primary-color)' }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSelections({ ...selections, drink: d.id }); setStep(3); }}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px', padding: '20px', cursor: 'pointer', textAlign: 'center', color: '#fff',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{d.icon}</div>
                                            <div style={{ fontWeight: '600' }}>{d.label}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <i className="fas fa-crown" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '15px' }}></i>
                                <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: '0 0 10px 0' }}>{match.name}</h3>
                                <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>{match.desc}</p>
                                <div style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={match.image} alt="Combo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>Restart</button>
                                    <button onClick={handleAdd} style={{ flex: 2, padding: '15px', background: 'var(--primary-color)', border: 'none', color: '#000', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(218, 165, 32, 0.4)' }}>Add for {match.price}</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
