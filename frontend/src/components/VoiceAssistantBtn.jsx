import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

export default function VoiceAssistantBtn() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showBubble, setShowBubble] = useState(false);
    const { addToCart } = useCart();

    let recognition = null;
    
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRec();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const result = event.results[current][0].transcript;
                setTranscript(result);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // Effect to process commands after listening stops
    useEffect(() => {
        if (!isListening && transcript) {
            const lower = transcript.toLowerCase();
            if (lower.includes('add') && lower.includes('chicken')) {
                addToCart({
                    id: 'p1', name: "Butter Chicken", price: "450", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&fit=crop"
                });
                Swal.fire({ title: 'Voice Command', text: 'Added Butter Chicken!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                setTranscript('Added Butter Chicken!');
            } else if (lower.includes('book') || lower.includes('table')) {
                setTranscript('Navigating to Reservations...');
                document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
            }
            
            setTimeout(() => {
                setShowBubble(false);
                setTranscript('');
            }, 3000);
        }
    }, [isListening, transcript, addToCart]);

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Swal.fire('Not Supported', 'Voice recognition is not supported in this browser.', 'warning');
            return;
        }
        
        // Have to recreate instance occasionally if it drops
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        
        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current][0].transcript;
            setTranscript(result);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setTranscript('Listening...');
            setShowBubble(true);
            recognition.start();
            setIsListening(true);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '110px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
            <AnimatePresence>
                {showBubble && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        style={{
                            background: 'var(--bg-glass, rgba(10,10,10,0.95))',
                            padding: '15px 20px',
                            borderRadius: '20px 20px 0 20px',
                            border: '1px solid var(--primary-color, #DAA520)',
                            color: '#fff',
                            maxWidth: '220px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.6), 0 0 15px rgba(218,165,32,0.2)',
                            backdropFilter: 'blur(10px)',
                            textAlign: 'right'
                        }}
                    >
                        {transcript}
                        {isListening && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '8px', height: '8px', background: 'var(--primary-color, #DAA520)', borderRadius: '50%', display: 'inline-block', marginLeft: '8px', boxShadow: '0 0 5px #DAA520' }}></motion.div>}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListen}
                style={{
                    width: '65px', height: '65px', borderRadius: '50%',
                    background: isListening ? '#E63946' : 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
                    border: 'none', color: isListening ? '#fff' : '#000',
                    fontSize: '1.6rem', cursor: 'pointer',
                    boxShadow: isListening ? '0 0 30px rgba(230,57,70,0.8)' : '0 10px 25px rgba(218,165,32,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                }}
            >
                {isListening && (
                    <motion.div 
                        animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }} 
                        style={{ position: 'absolute', inset: 0, border: '2px solid #E63946', borderRadius: '50%' }}
                    ></motion.div>
                )}
                <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
            </motion.button>
        </div>
    );
}
