import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! I'm Khali, your AI assistant. How can I help you today?" }
    ]);
    const [inputVal, setInputVal] = useState('');
    const chatEndRef = useRef(null);

    const KNOWLEDGE_BASE = {
        "hours": "We are open Monday-Friday: 11 AM - 10 PM, and Saturday-Sunday: 10 AM - 11 PM.",
        "menu": "Our popular dishes include Biryani, Butter Chicken, and Paneer Tikka. Would you like a recommendation?",
        "book": "You can book a table by scrolling to our Reservations section or clicking 'Reservations' in the top menu.",
        "vegan": "Yes! We have many vegan options including Chana Masala, Dal, and various vegetable curries.",
        "location": "We are located at 123 Spice Garden, Food City, 110001.",
        "contact": "You can call us at +91 123 456 7890 or email khaliya@example.com."
    };

    const getAIResponse = (input) => {
        const text = input.toLowerCase();

        if (text.includes("time") || text.includes("open") || text.includes("hours")) return KNOWLEDGE_BASE.hours;
        if (text.includes("menu") || text.includes("food") || text.includes("dish")) return KNOWLEDGE_BASE.menu;
        if (text.includes("book") || text.includes("reserve") || text.includes("table")) return KNOWLEDGE_BASE.book;
        if (text.includes("vegan") || text.includes("vegetarian")) return KNOWLEDGE_BASE.vegan;
        if (text.includes("where") || text.includes("location") || text.includes("address")) return KNOWLEDGE_BASE.location;
        if (text.includes("contact") || text.includes("phone") || text.includes("call")) return KNOWLEDGE_BASE.contact;

        return "I'm still learning! For specific inquiries, please feel free to call us at +91 123 456 7890. Can I help you with our menu or hours?";
    };

    const handleSend = () => {
        if (!inputVal.trim()) return;

        const userMsg = inputVal.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInputVal('');

        setTimeout(() => {
            setMessages(prev => [...prev, { type: 'bot', text: getAIResponse(userMsg) }]);
        }, 600);
    };

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    return (
        <div className="khali-assistant">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="khali-window futuristic-glass"
                        initial={{ scale: 0, opacity: 0, y: 100, x: -50 }}
                        animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 100, x: -50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="khali-header" style={{ background: 'linear-gradient(135deg, #E23744, #1c1c1c)', borderRadius: '20px 20px 0 0' }}>
                            <div className="title" style={{ fontWeight: 800 }}>
                                <i className="fas fa-robot" style={{ marginRight: '10px' }}></i>
                                KHALI AI
                            </div>
                            <button onClick={() => setIsOpen(false)} className="close-btn" title="Close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="khali-chat-area" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
                            <AnimatePresence initial={false}>
                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: m.type === 'bot' ? -20 : 20, y: 10 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`khali-msg ${m.type}`}
                                        style={m.type === 'bot' ?
                                            { background: 'rgba(255,255,255,0.08)', borderRadius: '15px 15px 15px 2px', border: '1px solid rgba(255,255,255,0.1)' } :
                                            { background: 'linear-gradient(135deg, #E23744, #8b1d26)', borderRadius: '15px 15px 2px 15px' }
                                        }
                                    >
                                        {m.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={chatEndRef} />
                        </div>

                        <div className="khali-input-area glass-panel" style={{ border: 'none', padding: '15px' }}>
                            <input
                                type="text"
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Khali anything..."
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSend}
                                className="btn-premium-scale"
                                style={{ background: '#E23744', color: '#fff' }}
                            >
                                <i className="fas fa-paper-plane"></i>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="khali-trigger btn-premium-scale"
                        title="Ask Khali!"
                        style={{
                            background: 'linear-gradient(135deg, #E23744, #1c1c1c)',
                            boxShadow: '0 8px 32px rgba(226, 55, 68, 0.4)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            inset: '-8px',
                            border: '2px solid rgba(226, 55, 68, 0.2)',
                            borderRadius: '50%',
                            animation: 'ripple 2s infinite ease-out'
                        }}></div>
                        ✨
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
