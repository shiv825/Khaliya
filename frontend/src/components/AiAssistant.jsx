import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! I'm Khali, your AI assistant. How can I help you today?" }
    ]);
    const [inputVal, setInputVal] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [suggestions] = useState([
        { label: '📖 Menu', query: 'show menu' },
        { label: '📅 Book Table', query: 'how to book' },
        { label: '🌟 Specials', query: 'today specials' },
        { label: '📍 Location', query: 'where are you' }
    ]);
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

        // Specific Pairings Logic
        if (text.includes("biryani")) return "Our Chicken Biryani is legendary. I highly recommend pairing it with our cool Cucumber Raita and a fresh Garlic Naan to balance the spices.";
        if (text.includes("butter chicken")) return "Ah, the Butter Chicken! It's best enjoyed with a Roomali Roti or Butter Naan. Would you like to see our bread selection?";
        if (text.includes("paneer")) return "Our Paneer dishes are rich and creamy. They pair beautifully with a crisp Mango Lassi to cleanse the palate.";
        if (text.includes("kebab") || text.includes("kabab")) return "Succulent Kebabs deserve a zesty companion. Try them with our Mint Chutney and a side of pickled onions.";

        if (text.includes("time") || text.includes("open") || text.includes("hours")) return KNOWLEDGE_BASE.hours;
        if (text.includes("menu") || text.includes("food") || text.includes("dish")) return KNOWLEDGE_BASE.menu;
        if (text.includes("book") || text.includes("reserve") || text.includes("table")) return KNOWLEDGE_BASE.book;
        if (text.includes("vegan") || text.includes("vegetarian")) return KNOWLEDGE_BASE.vegan;
        if (text.includes("where") || text.includes("location") || text.includes("address")) return KNOWLEDGE_BASE.location;
        if (text.includes("contact") || text.includes("phone") || text.includes("call")) return KNOWLEDGE_BASE.contact;
        if (text.includes("special") || text.includes("today")) return "Today's signatures include Truffle Dal Makhani and Saffron Chicken Tikka. Check the Featured Specials section for more!";

        return "I'm your luxury culinary guide. Ask me about our signature pairings, vegan options, or how to reserve the best table!";
    };

    const toggleListen = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
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

    const handleSend = (query = null) => {
        const userMsg = (query || inputVal).trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInputVal('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'bot', text: getAIResponse(userMsg) }]);
        }, 1200);
    };

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isTyping]);

    return (
        <div className="khali-assistant">
            <div className={`khali-window ${isOpen ? 'active' : ''}`} style={{ 
                display: isOpen ? 'flex' : 'none',
                position: 'fixed',
                bottom: '100px',
                right: '30px',
                width: '395px',
                height: '580px',
                flexDirection: 'column',
                background: '#121722',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                zIndex: 10000,
                overflow: 'hidden'
            }}>
                <div className="khali-header" style={{ 
                    padding: '22px 25px', 
                    background: 'linear-gradient(180deg, #1A2130 0%, #121722 100%)', 
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div className="title" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)' }}>
                        <div style={{ width: '10px', height: '10px', background: '#FFD700', borderRadius: '50%', boxShadow: '0 0 12px rgba(255, 215, 0, 0.8)' }}></div>
                        Khaliya Concierge &amp; Sommelier
                    </div>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#8A94A6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-times"></i></button>
                </div>

                <div className="khali-chat-area" style={{ flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#0B0E14' }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`khali-msg ${m.type}`} style={{ 
                            alignSelf: m.type === 'bot' ? 'flex-start' : 'flex-end',
                            background: m.type === 'bot' ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                            color: m.type === 'bot' ? '#E2E8F0' : '#000',
                            padding: '14px 20px',
                            borderRadius: m.type === 'bot' ? '22px 22px 22px 4px' : '22px 22px 4px 22px',
                            fontSize: '0.95rem',
                            maxWidth: '85%',
                            lineHeight: '1.6',
                            fontWeight: '500',
                            border: m.type === 'bot' ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
                        }}>
                            {m.text}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="khali-msg bot typing" style={{ alignSelf: 'flex-start', background: 'var(--bg-body)', padding: '15px 20px', borderRadius: '20px 20px 20px 4px', border: '1px solid var(--border-color)' }}>
                            <div className="typing-dots" style={{ display: 'flex', gap: '8px' }}>
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%' }}></motion.span>
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%' }}></motion.span>
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%' }}></motion.span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="khali-suggestions" style={{ display: 'flex', gap: '10px', padding: '0 25px 20px 25px', overflowX: 'auto', whiteSpace: 'nowrap', background: 'var(--bg-surface)' }}>
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleSend(s.query)} style={{ 
                            padding: '10px 18px', 
                            background: 'var(--bg-body)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '30px', 
                            color: 'var(--primary-color)', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer',
                            fontWeight: '800',
                            transition: 'var(--transition)'
                        }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="khali-input-area" style={{ padding: '20px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: 'var(--bg-body)', alignItems: 'center' }}>
                    <button 
                        onClick={toggleListen}
                        style={{ 
                            width: '45px', 
                            height: '45px', 
                            borderRadius: '50%', 
                            background: isListening ? 'var(--primary-color)' : 'rgba(0,0,0,0.05)', 
                            color: isListening ? '#FFF' : 'var(--text-dark)', 
                            border: 'none', 
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            animation: isListening ? 'voicePulse 1.5s infinite' : 'none'
                        }}
                    >
                        <i className={`fas fa-${isListening ? 'microphone' : 'microphone-alt'}`}></i>
                    </button>
                    <input
                        type="text"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? "Listening..." : "Type your message..."}
                        style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '12px 25px', color: 'var(--text-dark)', outline: 'none', fontWeight: '500' }}
                    />
                    <button onClick={() => handleSend()} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-color)', color: '#FFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                    <style>{`
                        @keyframes voicePulse {
                            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4); }
                            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
                            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
                        }
                    `}</style>
                </div>
            </div>

            {!isOpen && (
                <button 
                  onClick={() => setIsOpen(true)} 
                  className="khali-trigger pulsate" 
                  title="Speak with Luxury Concierge"
                  style={{
                    position: 'fixed',
                    bottom: 'calc(30px + var(--pwa-offset, 0px))',
                    right: '30px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    boxShadow: 'var(--shadow-md)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '1.8rem',
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
                                font-size: 1.4rem !important;
                                right: 15px !important;
                                bottom: calc(15px + var(--pwa-offset)) !important;
                            }
                            .khali-window { bottom: 160px !important; width: 92% !important; left: 4% !important; right: 4% !important; }
                        }
                    `}</style>
                </button>
            )}
        </div>
    );
}
