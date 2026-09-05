import React from 'react';
import Hero from '../components/Hero';
import FeaturedSpecials from '../components/FeaturedSpecials';
import Movements from '../components/Movements';
import Testimonials from '../components/Testimonials';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="page-home" style={{ background: 'transparent' }}>
            <Hero />
            <FeaturedSpecials />
            <Movements />

            {/* Teaser CTA Banner to Reserve or View Menu */}
            <section 
                style={{ 
                    padding: '6rem 2rem', 
                    background: 'transparent', 
                    textAlign: 'center', 
                    borderTop: '1.5px solid rgba(212, 175, 55, 0.25)', 
                    borderBottom: '1.5px solid rgba(212, 175, 55, 0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Golden Glow Backdrop */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    pointerEvents: 'none'
                }} />

                <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
                        ✦ EXPERIENCE ROYAL DINING AT KHALIYA ✦
                    </span>

                    <h2 style={{ 
                        fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', 
                        color: '#FFF', 
                        fontFamily: "'Cinzel', 'Playfair Display', serif", 
                        marginBottom: '1.5rem',
                        fontWeight: '800'
                    }}>
                        Ready For An Unforgettable <span style={{ background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evening?</span>
                    </h2>

                    <p style={{ color: '#CBD5E1', fontSize: '1.15rem', marginBottom: '2.8rem', lineHeight: '1.8' }}>
                        Reserve your private dining space or explore our full authentic Indian menu curated by master chefs.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/reserve')}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                color: '#070A0E',
                                border: 'none',
                                padding: '18px 40px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '0.92rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <i className="fas fa-calendar-check" style={{ color: '#070A0E' }}></i> Book A Table
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.04, background: 'rgba(212, 175, 55, 0.12)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/menu')}
                            style={{
                                background: 'rgba(18, 23, 34, 0.7)',
                                backdropFilter: 'blur(12px)',
                                color: '#FFF',
                                border: '1.5px solid rgba(212, 175, 55, 0.5)',
                                padding: '18px 36px',
                                borderRadius: '14px',
                                fontWeight: '800',
                                fontSize: '0.92rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <i className="fas fa-utensils" style={{ color: '#FFD700' }}></i> Explore Full Menu
                        </motion.button>
                    </div>
                </div>
            </section>

            <Testimonials />
        </div>
    );
}
