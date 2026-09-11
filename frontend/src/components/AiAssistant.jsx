import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

export default function AiAssistant() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            type: 'bot', 
            text: "Welcome to Khaliya Sanctuary! I am your personal Sommelier & Culinary Concierge. How may I guide your dining experience today?" 
        }
    ]);
    const [inputVal, setInputVal] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
    
    const [suggestions, setSuggestions] = useState([
        { label: '🔥 Chef Specials', query: 'today specials' },
        { label: '🌱 Pure Veg', query: 'show pure veg options' },
        { label: '🍖 Non-Veg Delights', query: 'show non veg dishes' },
        { label: '📅 Book Table', query: 'how to book a table' },
        { label: '🕒 Operating Hours', query: 'what are your hours' }
    ]);
    
    const chatEndRef = useRef(null);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '';
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    // Speak response if Speech Synthesis (TTS) is enabled
    const speakText = (text) => {
        if (!isSpeechEnabled || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[•*]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis notice:', e.message);
        }
    };

    const toggleListen = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            Swal.fire({
                title: 'Speech Recognition',
                text: 'Voice input is not supported in this browser. Please try Google Chrome or MS Edge.',
                icon: 'info',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputVal(transcript);
            handleSend(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const handleSend = async (query = null) => {
        const userMsg = (query || inputVal).trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInputVal('');
        setIsTyping(true);

        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { message: userMsg }, { timeout: 8000 });
            setIsTyping(false);
            
            const rawReply = res.data?.reply;
            const botReply = (rawReply && typeof rawReply === 'string' && rawReply.trim().length > 0)
                ? rawReply.trim()
                : "Here are our recommendations based on your request:";
            const dishes = res.data?.dishes || [];
            const action = res.data?.action;
            const newSuggestions = res.data?.suggestions || suggestions;

            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: botReply, 
                dishes, 
                action 
            }]);

            if (res.data?.suggestions) {
                setSuggestions(newSuggestions.map(s => typeof s === 'string' ? { label: s, query: s } : s));
            }

            speakText(botReply);

            if (action === 'RESERVE_TABLE') {
                setTimeout(() => navigate('/reserve'), 1500);
            }
        } catch (err) {
            console.warn('AI API fallback to local engine:', err.message);
            setIsTyping(false);
            
            // Intelligent local fallback response generator
            let fallbackText = "Here are our recommendations based on your request:";
            let fallbackDishes = [];

            const lower = userMsg.toLowerCase();
            if (lower.includes('special') || lower.includes('today') || lower.includes('chef')) {
                fallbackText = "Here are today's featured chef specialities:";
            } else if (lower.includes('veg') && !lower.includes('non-veg')) {
                fallbackText = "Here are our signature 100% Pure Vegetarian gourmet creations:";
            } else if (lower.includes('non-veg') || lower.includes('chicken') || lower.includes('mutton') || lower.includes('biryani')) {
                fallbackText = "Here are our succulent non-vegetarian specialties:";
            } else if (lower.includes('menu') || lower.includes('food')) {
                fallbackText = "Our menu features royal North Indian delicacies, rich gravies, tandoori starters, and saffron biryanis.";
            } else if (lower.includes('book') || lower.includes('table') || lower.includes('reserve')) {
                fallbackText = "You can easily reserve a table by clicking 'Reserve Table' in our navigation menu!";
            } else if (lower.includes('hour') || lower.includes('time') || lower.includes('open')) {
                fallbackText = "Khaliya Sanctuary Hours: Mon-Fri: 11 AM - 10 PM | Sat-Sun: 10 AM - 11 PM.";
            } else if (lower.includes('location') || lower.includes('where') || lower.includes('address')) {
                fallbackText = "We are located at 123 Spice Garden, Luxury Culinary Haven, Food City (110001).";
            }

            setMessages(prev => [...prev, { type: 'bot', text: fallbackText, dishes: fallbackDishes }]);
            speakText(fallbackText);
        }
    };

    const handleAddToCart = (dish) => {
        addToCart(dish);
        Swal.fire({
            title: 'Added to Order!',
            text: `${typeof dish.name === 'object' ? dish.name.en : dish.name} added to your cart.`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false
        });
    };

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isTyping]);

    return (
        <div className="khali-assistant">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="khali-window active" 
                        style={{ 
                            position: 'fixed',
                            bottom: '100px',
                            right: '30px',
                            left: 'auto',
                            transformOrigin: 'bottom right',
                            width: '400px',
                            height: '600px',
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#121722',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            borderRadius: '28px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
                            zIndex: 10000,
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Concierge Header */}
                        <div className="khali-header" style={{ 
                            padding: '18px 22px', 
                            background: 'linear-gradient(180deg, #1A2130 0%, #121722 100%)', 
                            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div className="title" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Cinzel', serif" }}>
                                <div style={{ width: '10px', height: '10px', background: '#FFD700', borderRadius: '50%', boxShadow: '0 0 12px rgba(255, 215, 0, 0.8)' }}></div>
                                Khaliya AI Concierge
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* TTS Voice Speaker Toggle */}
                                <button 
                                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                                    title={isSpeechEnabled ? "Disable Voice Feedback" : "Enable Voice Feedback"}
                                    style={{
                                        background: isSpeechEnabled ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        color: isSpeechEnabled ? '#FFD700' : '#8A94A6',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <i className={`fas ${isSpeechEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
                                </button>

                                {/* Close Window Button */}
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    style={{ 
                                        background: 'rgba(255,255,255,0.08)', 
                                        border: 'none', 
                                        width: '32px', 
                                        height: '32px', 
                                        borderRadius: '50%', 
                                        color: '#8A94A6', 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages Body */}
                        <div className="khali-chat-area" style={{ flex: 1, padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#0B0E14' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.type === 'bot' ? 'flex-start' : 'flex-end', width: '100%' }}>
                                    <div className={`khali-msg ${m.type}`} style={{ 
                                        alignSelf: m.type === 'bot' ? 'flex-start' : 'flex-end',
                                        background: m.type === 'bot' ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                                        color: m.type === 'bot' ? '#E2E8F0' : '#000',
                                        padding: '12px 18px',
                                        borderRadius: m.type === 'bot' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                                        fontSize: '0.9rem',
                                        maxWidth: '88%',
                                        lineHeight: '1.6',
                                        fontWeight: '500',
                                        border: m.type === 'bot' ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
                                        boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                                        whiteSpace: 'pre-line'
                                    }}>
                                        {m.text}
                                    </div>

                                    {/* Render Dish Recommendation Cards inside Chat Bubble */}
                                    {m.dishes && m.dishes.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' }}>
                                            {m.dishes.map((dish, dIdx) => {
                                                const dishName = typeof dish.name === 'object' ? dish.name.en : dish.name;
                                                const isVeg = Array.isArray(dish.tags) ? dish.tags.includes('veg') : true;
                                                return (
                                                    <div key={dIdx} style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '12px', 
                                                        background: 'rgba(255, 255, 255, 0.03)', 
                                                        border: '1px solid rgba(212, 175, 55, 0.25)', 
                                                        borderRadius: '14px', 
                                                        padding: '10px 12px' 
                                                    }}>
                                                        {dish.image ? (
                                                            <img src={dish.image} alt={dishName} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                                                                <i className="fas fa-utensils"></i>
                                                            </div>
                                                        )}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: isVeg ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isVeg ? '#4ADE80' : '#F87171', border: `1px solid ${isVeg ? '#22C55E' : '#EF4444'}` }}>
                                                                    {isVeg ? 'VEG' : 'NON-VEG'}
                                                                </span>
                                                                <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {dishName}
                                                                </div>
                                                            </div>
                                                            <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.85rem', marginTop: '2px' }}>
                                                                ₹{dish.price}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleAddToCart(dish)} 
                                                            style={{ 
                                                                background: 'linear-gradient(135deg, #FFD700, #D4AF37)', 
                                                                border: 'none', 
                                                                color: '#000', 
                                                                padding: '6px 12px', 
                                                                borderRadius: '8px', 
                                                                fontWeight: '800', 
                                                                fontSize: '0.75rem', 
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <i className="fas fa-plus"></i> Add
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Action Trigger Buttons */}
                                    {m.action === 'RESERVE_TABLE' && (
                                        <button 
                                            onClick={() => navigate('/reserve')} 
                                            style={{ 
                                                marginTop: '8px', 
                                                padding: '8px 16px', 
                                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', 
                                                color: '#000', 
                                                border: 'none', 
                                                borderRadius: '20px', 
                                                fontWeight: '800', 
                                                fontSize: '0.82rem', 
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                            }}
                                        >
                                            📅 Reserve Table Now
                                        </button>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="khali-msg bot typing" style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '12px 18px', borderRadius: '20px 20px 20px 4px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                    <div className="typing-dots" style={{ display: 'flex', gap: '6px' }}>
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%' }}></motion.span>
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%' }}></motion.span>
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%' }}></motion.span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Suggestion Chips */}
                        <div className="khali-suggestions" style={{ display: 'flex', gap: '8px', padding: '12px 18px', overflowX: 'auto', whiteSpace: 'nowrap', background: '#0E121B', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {suggestions.map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSend(typeof s === 'object' ? s.query : s)} 
                                    style={{ 
                                        padding: '7px 14px', 
                                        background: 'rgba(212, 175, 55, 0.1)', 
                                        border: '1px solid rgba(212, 175, 55, 0.3)', 
                                        borderRadius: '20px', 
                                        color: '#FFD700', 
                                        fontSize: '0.78rem', 
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0
                                    }}
                                >
                                    {typeof s === 'object' ? s.label : s}
                                </button>
                            ))}
                        </div>

                        {/* Message Input Bar */}
                        <div className="khali-input-area" style={{ padding: '14px 18px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', gap: '10px', background: '#121722', alignItems: 'center' }}>
                            <button 
                                onClick={toggleListen}
                                title={isListening ? "Listening..." : "Speak via Microphone"}
                                style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    background: isListening ? '#E53E3E' : 'rgba(255,255,255,0.06)', 
                                    color: isListening ? '#FFF' : '#D4AF37', 
                                    border: '1px solid rgba(212, 175, 55, 0.3)', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                            </button>
                            <input
                                type="text"
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? "Listening..." : "Ask Sommelier or type message..."}
                                style={{ 
                                    flex: 1, 
                                    background: 'rgba(255, 255, 255, 0.05)', 
                                    border: '1px solid rgba(212, 175, 55, 0.25)', 
                                    borderRadius: '25px', 
                                    padding: '10px 18px', 
                                    color: '#FFF', 
                                    outline: 'none', 
                                    fontWeight: '500',
                                    fontSize: '0.88rem'
                                }}
                            />
                            <button 
                                onClick={() => handleSend()} 
                                style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', 
                                    color: '#000', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                <i className="fas fa-paper-plane" style={{ fontSize: '0.9rem' }}></i>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <button 
                  onClick={() => setIsOpen(true)} 
                  className="khali-trigger pulsate" 
                  title="Speak with Luxury Concierge"
                  style={{
                    position: 'fixed',
                    bottom: 'calc(30px + var(--pwa-offset, 0px))',
                    right: '30px',
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#000',
                    fontSize: '1.7rem',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                    <i className="fas fa-concierge-bell"></i>
                    <style>{`
                        @media (max-width: 768px) {
                            .khali-trigger { 
                                --pwa-offset: 85px; 
                                width: 55px !important; 
                                height: 55px !important; 
                                font-size: 1.3rem !important;
                                right: 15px !important;
                                bottom: calc(15px + var(--pwa-offset)) !important;
                            }
                            .khali-window { bottom: 150px !important; width: 92% !important; left: 4% !important; right: 4% !important; height: 520px !important; }
                        }
                    `}</style>
                </button>
            )}
        </div>
    );
}
