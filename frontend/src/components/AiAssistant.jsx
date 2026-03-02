import React, { useState, useEffect, useRef } from 'react';

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

        // Add User message
        const userMsg = inputVal.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInputVal('');

        // Simulate typing delay
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
            <div className={`khali-window ${isOpen ? 'active' : ''}`} style={{ display: isOpen ? 'flex' : 'none' }}>
                <div className="khali-header">
                    <div className="title"><i className="fas fa-robot"></i> Khali AI</div>
                    <button onClick={() => setIsOpen(false)} className="close-btn" title="Close"><i className="fas fa-times"></i></button>
                </div>

                <div className="khali-chat-area">
                    {messages.map((m, i) => (
                        <div key={i} className={`khali-msg ${m.type}`}>
                            {m.text}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="khali-input-area">
                    <input
                        type="text"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Khali a question..."
                    />
                    <button onClick={handleSend} title="Send"><i className="fas fa-paper-plane"></i></button>
                </div>
            </div>

            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="khali-trigger" title="Ask Khali!">
                    ✨
                </button>
            )}
        </div>
    );
}
