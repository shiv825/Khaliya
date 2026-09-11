import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Movements() {
    const { t } = useLanguage();

    const moments = [
        {
            step: '01',
            emoji: '🔥',
            title: t('movements.sizzle', 'SIZZLE'),
            badge: 'LIVE TANDOOR & STOVE',
            desc: t('movements.sizzle_desc', 'Live action from our clay tandoor and stove — coal-fired kebabs, sizzling signature platters, and authentic tandoori perfection.'),
            icon: 'fa-fire-flame-curved',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        },
        {
            step: '02',
            emoji: '🎨',
            title: t('movements.plating', 'PLATING'),
            badge: 'ARTISANAL ROYAL FINISH',
            desc: t('movements.plating_desc', 'Delicate finishes, color and texture — vibrant saffron infusions, fresh micro-herbs, and 24K edible gold leaf touches.'),
            icon: 'fa-utensils',
            glowColor: 'rgba(212, 175, 55, 0.4)'
        },
        {
            step: '03',
            emoji: '🤝',
            title: t('movements.service', 'SERVICE'),
            badge: 'COURTEOUS HOSPITALITY',
            desc: t('movements.service_desc', 'Warm smiles and attentive hands — royal hospitality, personalized sommelier guidance, and memorable warmth for every guest.'),
            icon: 'fa-crown',
            glowColor: 'rgba(255, 215, 0, 0.4)'
        }
    ];

    return (
        <section 
            id="movements"
            className="accent-section movements" 
            style={{ 
                padding: '6.5rem 1.5rem 7rem 1.5rem', 
                background: 'transparent', 
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Top Metallic Gold Filigree Divider */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.15) 15%, #FFD700 50%, rgba(212, 175, 55, 0.15) 85%, transparent 100%)',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)'
            }} />

            {/* Ambient Lighting Backdrops */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '700px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, rgba(15, 23, 42, 0) 70%)',
                pointerEvents: 'none',
                filter: 'blur(40px)'
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4.5rem', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '14px', padding: '6px 24px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                    <span style={{ color: '#FFD700', fontSize: '0.9rem' }}>✦</span>
                    <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '3.5px', textTransform: 'uppercase' }}>
                        THE KHALIYA EXPERIENCE
                    </span>
                    <span style={{ color: '#FFD700', fontSize: '0.9rem' }}>✦</span>
                </div>

                <h2 style={{ 
                    fontSize: 'clamp(2.5rem, 4.8vw, 4rem)', 
                    fontFamily: "'Cinzel', 'Playfair Display', serif", 
                    color: '#FFFFFF', 
                    marginBottom: '1.2rem', 
                    fontWeight: '800',
                    letterSpacing: '1px',
                    lineHeight: '1.25'
                }}>
                    Moments In <span style={{ background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 75%, #AA7C11 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.2))' }}>Motion</span>
                </h2>

                <p style={{ color: '#CBD5E1', maxWidth: '780px', margin: '0 auto', fontSize: '1.12rem', lineHeight: '1.8', fontWeight: '300' }}>
                    {t('movements.sub', 'Experience the motion of our kitchen and dining sanctuary — where ancient culinary traditions come alive in every flame, flourish, and smile.')}
                </p>
            </div>

            {/* Image Track Showcase */}
            <div className="movement-track" style={{ marginBottom: '5rem', position: 'relative', zIndex: 2 }}>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585937421612-70a008356f96?w=1400&q=80')", borderRadius: '22px', border: '1.5px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1588166524941-3bf61a7c4aeb?w=1400&q=80')", borderRadius: '22px', border: '1.5px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')", borderRadius: '22px', border: '1.5px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=80')", borderRadius: '22px', border: '1.5px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}></div>
                <div className="movement-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601050638917-3f9478f7e3ba?w=1400&q=80')", borderRadius: '22px', border: '1.5px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}></div>
            </div>

            {/* Feature Cards Grid */}
            <div className="movement-info" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '32px', 
                maxWidth: '1280px', 
                margin: '0 auto', 
                width: '100%', 
                padding: '0 1.5rem', 
                position: 'relative', 
                zIndex: 2 
            }}>
                {moments.map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                        style={{ 
                            background: 'linear-gradient(160deg, rgba(20, 26, 38, 0.88) 0%, rgba(10, 14, 22, 0.95) 100%)', 
                            border: '1px solid rgba(212, 175, 55, 0.35)', 
                            borderRadius: '26px', 
                            padding: '3.2rem 2.2rem 2.8rem 2.2rem', 
                            textAlign: 'center', 
                            backdropFilter: 'blur(20px)', 
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Top Ambient Golden Light Glow */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '20%',
                            right: '20%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                            boxShadow: '0 0 15px #FFD700'
                        }} />

                        {/* Background Step Watermark */}
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '22px',
                            fontSize: '4.5rem',
                            fontFamily: "'Cinzel', serif",
                            fontWeight: '900',
                            color: 'rgba(212, 175, 55, 0.06)',
                            userSelect: 'none',
                            lineHeight: 1,
                            pointerEvents: 'none'
                        }}>
                            {item.step}
                        </div>

                        {/* Glowing Dual Concentric Icon Ring */}
                        <div style={{
                            width: '82px',
                            height: '82px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.04) 100%)',
                            border: '2px solid #FFD700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2.2rem auto',
                            boxShadow: `0 0 35px ${item.glowColor}, inset 0 0 15px rgba(212, 175, 55, 0.2)`,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Inner Accent Ring */}
                            <div style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255, 215, 0, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(11, 15, 25, 0.6)'
                            }}>
                                <i className={`fas ${item.icon}`} style={{ fontSize: '2rem', color: '#FFD700', filter: 'drop-shadow(0 2px 6px rgba(212,175,55,0.5))' }}></i>
                            </div>
                        </div>

                        {/* Title with Emoji & Gradient */}
                        <h3 style={{ 
                            fontSize: '1.6rem', 
                            marginBottom: '1rem', 
                            fontFamily: "'Cinzel', 'Playfair Display', serif",
                            fontWeight: '800',
                            letterSpacing: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                            <span style={{ 
                                background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 45%, #D4AF37 85%, #AA7C11 100%)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                {item.title}
                            </span>
                        </h3>

                        {/* Description */}
                        <p style={{ 
                            color: '#CBD5E1', 
                            fontSize: '0.98rem', 
                            lineHeight: '1.75', 
                            margin: 0,
                            fontWeight: '400',
                            letterSpacing: '0.2px'
                        }}>
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Metallic Gold Filigree Divider */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.15) 15%, #FFD700 50%, rgba(212, 175, 55, 0.15) 85%, transparent 100%)',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)'
            }} />
        </section>
    );
}

