import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Movements() {
    const { t } = useLanguage();

    const moments = [
        {
            title: t('movements.sizzle', '🔥 Royal Tandoor Sizzle'),
            desc: t('movements.sizzle_desc', 'Live charcoal action from our clay tandoor and copper handis.'),
            icon: 'fa-fire'
        },
        {
            title: t('movements.plating', '🎨 Artisanal Royal Plating'),
            desc: t('movements.plating_desc', 'Delicate garnishes of edible gold leaf, fresh herbs, and saffron infusions.'),
            icon: 'fa-utensils'
        },
        {
            title: t('movements.service', '👑 Courteous Royal Hospitality'),
            desc: t('movements.service_desc', 'Attentive sommelier guidance and memorable warmth for every guest.'),
            icon: 'fa-crown'
        }
    ];

    return (
        <section 
            className="accent-section movements" 
            style={{ 
                padding: '6rem 1.5rem', 
                background: 'transparent', 
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Ambient Lighting Backdrops */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '6px 20px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                    <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                    <span style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
                        THE KHALIYA EXPERIENCE
                    </span>
                    <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                </div>

                <h2 style={{ 
                    fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', 
                    fontFamily: "'Cinzel', 'Playfair Display', serif", 
                    color: '#FFFFFF', 
                    marginBottom: '1.2rem', 
                    fontWeight: '800',
                    letterSpacing: '1px'
                }}>
                    Moments In <span style={{ background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Motion</span>
                </h2>

                <p style={{ color: '#CBD5E1', maxWidth: '750px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    {t('movements.sub', 'Experience the motion of our kitchen and dining sanctuary — where ancient culinary traditions come alive in every flame.')}
                </p>
            </div>

            {/* Image Track Showcase */}
            <div className="movement-track" style={{ marginBottom: '4.5rem', position: 'relative', zIndex: 1 }}>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585937421612-70a008356f96?w=1400&q=80')", borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.3)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1588166524941-3bf61a7c4aeb?w=1400&q=80')", borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.3)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')", borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.3)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=80')", borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.3)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601050638917-3f9478f7e3ba?w=1400&q=80')", borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.3)' }}></div>
            </div>

            {/* Feature Cards Grid */}
            <div className="movement-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '100%', width: '100%', padding: '0 3vw', position: 'relative', zIndex: 1 }}>
                {moments.map((item, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -8 }}
                        style={{ 
                            background: 'rgba(15, 20, 30, 0.85)', 
                            border: '1.5px solid rgba(212, 175, 55, 0.3)', 
                            borderRadius: '24px', 
                            padding: '3rem 2rem', 
                            textAlign: 'center', 
                            backdropFilter: 'blur(16px)', 
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6)' 
                        }}
                    >
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.05) 100%)',
                            border: '1.5px solid #FFD700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFD700',
                            fontSize: '1.8rem',
                            margin: '0 auto 1.8rem auto',
                            boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)'
                        }}>
                            <i className={`fas ${item.icon}`}></i>
                        </div>

                        <h3 style={{ 
                            fontSize: '1.45rem', 
                            color: '#FFD700', 
                            marginBottom: '1rem', 
                            fontFamily: "'Cinzel', 'Playfair Display', serif",
                            fontWeight: '700'
                        }}>
                            {item.title}
                        </h3>

                        <p style={{ color: '#CBD5E1', fontSize: '0.96rem', lineHeight: '1.7' }}>
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
