import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function AiMatchmaker({ onClose, onMatch }) {
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
                position: 'fixed', inset: 0, background: 'rgba(253, 252, 240, 0.8)',
                zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', backdropFilter: 'blur(12px)'
            }}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                style={{
                    background: 'var(--bg-surface)', width: '100%', maxWidth: '500px',
                    borderRadius: '35px', overflow: 'hidden', position: 'relative',
                    border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)'
                }}
            >
                <div style={{ padding: '30px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-body)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: 'var(--shadow-sm)' }}>
                            <i className="fas fa-magic" style={{ fontSize: '1.4rem' }}></i>
                        </div>
                        <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.8rem' }}>Culinary Matchmaker</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '50%', color: 'var(--primary-color)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>&times;</button>
                </div>

                <div style={{ padding: '40px', minHeight: '420px', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
                                <h3 style={{ color: 'var(--primary-color)', marginBottom: '35px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>What's your flavor today?</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {moods.map(m => (
                                        <motion.button 
                                            key={m.id}
                                            whileHover={{ scale: 1.05, borderColor: m.color }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSelections({ ...selections, mood: m.id }); setStep(2); }}
                                            style={{
                                                background: 'var(--bg-body)', border: '1.5px solid var(--border-color)',
                                                borderRadius: '25px', padding: '30px 15px', cursor: 'pointer', textAlign: 'center', color: 'var(--text-dark)',
                                                transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            <div style={{ fontSize: '3.2rem', marginBottom: '15px' }}>{m.icon}</div>
                                            <div style={{ fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dark)' }}>{m.label}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
                                <h3 style={{ color: 'var(--primary-color)', marginBottom: '35px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>Pair it with a beverage:</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {drinks.map(d => (
                                        <motion.button 
                                            key={d.id}
                                            whileHover={{ scale: 1.05, borderColor: 'var(--primary-color)' }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSelections({ ...selections, drink: d.id }); setStep(3); }}
                                            style={{
                                                background: 'var(--bg-body)', border: '1.5px solid var(--border-color)',
                                                borderRadius: '25px', padding: '30px 15px', cursor: 'pointer', textAlign: 'center', color: 'var(--text-dark)',
                                                transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            <div style={{ fontSize: '3.2rem', marginBottom: '15px' }}>{d.icon}</div>
                                            <div style={{ fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dark)' }}>{d.label}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ marginBottom: '25px' }}>
                                    <i className="fas fa-crown" style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}></i>
                                </div>
                                <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontSize: '2.2rem', margin: '0 0 12px 0' }}>{match.name}</h3>
                                <p style={{ color: 'var(--text-light)', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '30px', fontWeight: '600' }}>{match.desc}</p>
                                <div style={{ width: '100%', height: '240px', borderRadius: '30px', overflow: 'hidden', marginBottom: '35px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                                    <img src={match.image} alt="Combo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStep(1)} 
                                        style={{ flex: 1, padding: '18px', background: 'var(--bg-body)', border: '1.5px solid var(--border-color)', color: 'var(--primary-color)', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s' }}
                                    >Restart</motion.button>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            sessionStorage.setItem('khaliya_ai_match', match.name);
                                            onClose();
                                            
                                            // If onMatch callback exists (Native App), use it to switch tabs
                                            if (typeof onMatch === 'function') {
                                                onMatch('book');
                                            } else {
                                                // Web fallback: Smooth scroll to reservations section
                                                const resSection = document.getElementById('reservations');
                                                if (resSection) {
                                                    resSection.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }} 
                                        style={{ flex: 2, padding: '18px', background: 'var(--primary-color)', border: 'none', color: '#FFF', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
                                    >Reserve with Match</motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
