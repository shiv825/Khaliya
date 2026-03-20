import React, { useState, useEffect, useRef } from 'react';

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! I'm Khali, your AI assistant. How can I help you today?" }
    ]);
    const [inputVal, setInputVal] = useState('');
    const [isTyping, setIsTyping] = useState(false);
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

        if (text.includes("time") || text.includes("open") || text.includes("hours")) return KNOWLEDGE_BASE.hours;
        if (text.includes("menu") || text.includes("food") || text.includes("dish")) return KNOWLEDGE_BASE.menu;
        if (text.includes("book") || text.includes("reserve") || text.includes("table")) return KNOWLEDGE_BASE.book;
        if (text.includes("vegan") || text.includes("vegetarian")) return KNOWLEDGE_BASE.vegan;
        if (text.includes("where") || text.includes("location") || text.includes("address")) return KNOWLEDGE_BASE.location;
        if (text.includes("contact") || text.includes("phone") || text.includes("call")) return KNOWLEDGE_BASE.contact;
        if (text.includes("special") || text.includes("today")) return "Today's signatures include Truffle Dal Makhani and Saffron Chicken Tikka. Check the Featured Specials section for more!";

        return "I'm still learning! For specific inquiries, please feel free to call us at +91 123 456 7890. Can I help you with our menu or hours?";
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
            <div className={`khali-window futuristic-glass ${isOpen ? 'active' : ''}`} style={{ 
                display: isOpen ? 'flex' : 'none',
                position: 'fixed',
                bottom: '90px',
                right: '30px',
                width: '380px',
                height: '550px',
                flexDirection: 'column',
                background: 'rgba(18, 18, 18, 0.95)',
                backdropFilter: 'blur(15px)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                zIndex: 1000,
                overflow: 'hidden'
            }}>
                <div className="khali-header" style={{ 
                    padding: '20px 25px', 
                    background: 'linear-gradient(90deg, #1A1A1A, #121212)', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div className="title" style={{ color: 'var(--accent-color)', fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
                        Khali AI
                    </div>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                </div>

                <div className="khali-chat-area" style={{ flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`khali-msg ${m.type}`} style={{ 
                            alignSelf: m.type === 'bot' ? 'flex-start' : 'flex-end',
                            background: m.type === 'bot' ? 'rgba(255,255,255,0.05)' : 'var(--primary-color)',
                            color: m.type === 'bot' ? '#FFF' : '#000',
                            padding: '12px 18px',
                            borderRadius: m.type === 'bot' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                            fontSize: '0.95rem',
                            maxWidth: '85%',
                            lineHeight: '1.5',
                            border: m.type === 'bot' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                            {m.text}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="khali-msg bot typing" style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px 18px', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="typing-dots" style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', background: 'var(--accent-color)', borderRadius: '50%', opacity: 0.6 }}></span>
                                <span style={{ width: '6px', height: '6px', background: 'var(--accent-color)', borderRadius: '50%', opacity: 0.8 }}></span>
                                <span style={{ width: '6px', height: '6px', background: 'var(--accent-color)', borderRadius: '50%' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="khali-suggestions" style={{ display: 'flex', gap: '8px', padding: '0 25px 15px 25px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleSend(s.query)} style={{ 
                            padding: '8px 15px', 
                            background: 'rgba(218, 165, 32, 0.1)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '30px', 
                            color: 'var(--accent-color)', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer',
                            fontWeight: '700'
                        }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="khali-input-area" style={{ padding: '20px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Inquire here..."
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '12px 20px', color: '#FFF', outline: 'none' }}
                    />
                    <button onClick={() => handleSend()} style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary-color)', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            {!isOpen && (
                <button 
                  onClick={() => setIsOpen(true)} 
                  className="khali-trigger pulsate" 
                  title="Speak with Luxury Concierge"
                  style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '65px',
                    height: '65px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    boxShadow: '0 10px 30px rgba(218, 165, 32, 0.4)',
                    border: 'none',
                    color: '#000',
                    fontSize: '1.6rem',
                    cursor: 'pointer',
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                    <i className="fas fa-concierge-bell"></i>
                </button>
            )}
        </div>
    );
}
