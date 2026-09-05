import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Testimonials() {
    const { t } = useLanguage();

    const reviews = [
        {
            text: t('testimonials.text1', 'The Awadhi Dum Biryani and Lamb Rogan Josh were otherworldly! The richness of spices and the royal atmosphere made our anniversary truly unforgettable.'),
            author: t('testimonials.author1', 'Lord Alistair Sterling'),
            status: t('testimonials.status1', 'Gourmet Critic & Fine Dining Patron')
        },
        {
            text: t('testimonials.text2', 'Khaliya brings authentic Lucknow court dining to life. The Murgh Malai Tikka literally melts in your mouth. Hands down the finest Indian dining experience.'),
            author: t('testimonials.author2', 'Priya Sharma'),
            status: t('testimonials.status2', 'Culinary Enthusiast')
        },
        {
            text: t('testimonials.text3', 'From the warm sommelier greeting to the copper handi presentation, every detail at Khaliya screams royal perfection. A true culinary landmark.'),
            author: t('testimonials.author3', 'Marcus Vance'),
            status: t('testimonials.status3', 'Food & Wine Reviewer')
        }
    ];

    return (
        <section 
            id="testimonials" 
            className="accent-section" 
            style={{ 
                padding: '6rem 1.5rem', 
                background: 'transparent', 
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Ambient Lighting Backdrop */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '20%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '6px 20px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                    <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                    <span style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
                        PATRON TESTIMONIALS
                    </span>
                    <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                </div>

                <h2 style={{ 
                    color: '#FFFFFF', 
                    fontFamily: "'Cinzel', 'Playfair Display', serif", 
                    fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', 
                    fontWeight: '800',
                    letterSpacing: '1px',
                    marginBottom: '1rem' 
                }}>
                    Gourmet Diner <span style={{ background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reviews</span>
                </h2>

                <p style={{ color: '#CBD5E1', maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.75' }}>
                    {t('testimonials.sub', 'Discover what gourmet critics and esteemed guests say about their royal dining experiences at Khaliya.')}
                </p>
            </div>

            {/* Testimonial Cards Grid */}
            <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '1380px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {reviews.map((rev, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15, duration: 0.8 }}
                        whileHover={{ y: -8 }}
                        style={{
                            background: 'rgba(15, 20, 30, 0.85)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1.5px solid rgba(212, 175, 55, 0.32)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                            position: 'relative'
                        }}
                    >
                        {/* Quote Mark */}
                        <div style={{ position: 'absolute', top: '25px', right: '25px', fontSize: '3rem', color: 'rgba(212, 175, 55, 0.15)', fontFamily: 'serif' }}>“</div>

                        <div>
                            {/* Gold 5 Stars */}
                            <div style={{ color: '#FFD700', fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', gap: '4px' }}>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>

                            <p style={{ color: '#CBD5E1', fontSize: '1.02rem', lineHeight: '1.8', fontStyle: 'italic', marginBottom: '2rem' }}>
                                "{rev.text}"
                            </p>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.18)', paddingTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#070A0E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                                {rev.author.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: '1.15rem', margin: 0, fontWeight: '700' }}>{rev.author}</h4>
                                <span style={{ color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{rev.status}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
