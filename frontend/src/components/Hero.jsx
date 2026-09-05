import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section 
            id="home" 
            className="hero-indian-cuisine" 
            style={{ 
                position: 'relative', 
                minHeight: '90vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden', 
                padding: '140px 24px 80px 24px',
                background: 'transparent'
            }}
        >
            {/* Ambient Golden Light Flare */}
            <div style={{
                position: 'absolute',
                top: '30%',
                right: '15%',
                width: '550px',
                height: '550px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.14) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 80%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Main Content Layout Container (100% Widescreen Responsive) */}
            <div 
                style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    maxWidth: '100%', 
                    width: '100%', 
                    padding: '0 3vw',
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
                    gap: '40px', 
                    alignItems: 'center' 
                }}
            >
                {/* Left Column: Royal Indian Cuisine Typography */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Royal Tagline Pill */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '22px', padding: '6px 22px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', backdropFilter: 'blur(12px)' }}>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                        <span style={{ 
                            color: '#D4AF37', 
                            fontSize: '0.8rem', 
                            fontWeight: '800', 
                            letterSpacing: '3px', 
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-body)'
                        }}>
                            ROYAL INDIAN FINE DINING
                        </span>
                        <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                    </div>

                    {/* Royal Serif Headline - Fixed nowrap so 'A True Taste' never breaks awkwardly */}
                    <h1 style={{ 
                        fontFamily: "'Cinzel', 'Playfair Display', serif", 
                        fontSize: 'clamp(2.8rem, 5.2vw, 5.2rem)', 
                        fontWeight: '800', 
                        lineHeight: '1.1', 
                        marginBottom: '26px', 
                        letterSpacing: '-0.5px' 
                    }}>
                        <span style={{ color: '#FFFFFF', display: 'block', whiteSpace: 'nowrap', textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>
                            A True Taste
                        </span>
                        <span style={{ 
                            background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 30%, #D4AF37 70%, #AA7C11 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent', 
                            display: 'block',
                            whiteSpace: 'nowrap',
                            filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.35))'
                        }}>
                            Of India
                        </span>
                    </h1>

                    {/* Description Paragraph */}
                    <p style={{ 
                        color: '#CBD5E1', 
                        fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)', 
                        lineHeight: '1.8', 
                        marginBottom: '40px', 
                        maxWidth: '560px',
                        fontWeight: '400'
                    }}>
                        Experience the grandeur of Indian culinary heritage — handcrafted with royal court recipes, hand-ground heritage spices, and centuries-old dum pukht traditions.
                    </p>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '50px' }}>
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: '0 12px 35px rgba(212, 175, 55, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/menu')}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                color: '#070A0E',
                                border: 'none',
                                padding: '18px 42px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '0.92rem',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            Explore Menu <i className="fas fa-book-open" style={{ fontSize: '0.9rem' }}></i>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.04, background: 'rgba(212, 175, 55, 0.15)', borderColor: '#FFD700' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/reserve')}
                            style={{
                                background: 'rgba(18, 23, 34, 0.65)',
                                backdropFilter: 'blur(12px)',
                                color: '#FFFFFF',
                                border: '1.5px solid rgba(212, 175, 55, 0.5)',
                                padding: '18px 38px',
                                borderRadius: '14px',
                                fontWeight: '800',
                                fontSize: '0.92rem',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Book A Table <i className="fas fa-calendar-alt" style={{ color: '#FFD700' }}></i>
                        </motion.button>
                    </div>

                    {/* Bottom Feature Badges */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                        gap: '16px', 
                        borderTop: '1px solid rgba(212, 175, 55, 0.25)', 
                        paddingTop: '30px',
                        maxWidth: '580px'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            background: 'rgba(18, 23, 34, 0.65)', 
                            padding: '12px 16px', 
                            borderRadius: '14px', 
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '1rem' }}>
                                🌿
                            </div>
                            <div>
                                <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '800' }}>Authentic</div>
                                <div style={{ color: '#CBD5E1', fontSize: '0.72rem', letterSpacing: '0.5px' }}>Court Recipes</div>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            background: 'rgba(18, 23, 34, 0.65)', 
                            padding: '12px 16px', 
                            borderRadius: '14px', 
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '1rem' }}>
                                ✨
                            </div>
                            <div>
                                <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '800' }}>Fresh</div>
                                <div style={{ color: '#CBD5E1', fontSize: '0.72rem', letterSpacing: '0.5px' }}>Heritage Spices</div>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            background: 'rgba(18, 23, 34, 0.65)', 
                            padding: '12px 16px', 
                            borderRadius: '14px', 
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '1rem' }}>
                                🍲
                            </div>
                            <div>
                                <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '800' }}>Hygienic</div>
                                <div style={{ color: '#CBD5E1', fontSize: '0.72rem', letterSpacing: '0.5px' }}>Master Kitchen</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: 3D Gold Glassmorphic Signature Dish Showcase Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    style={{ 
                        position: 'relative', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    {/* Main Showcase Gold Glassmorphic Frame */}
                    <div 
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '560px',
                            background: 'linear-gradient(145deg, rgba(20, 24, 34, 0.88) 0%, rgba(8, 11, 16, 0.94) 100%)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1.5px solid rgba(212, 175, 55, 0.45)',
                            borderRadius: '28px',
                            padding: '18px',
                            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(212, 175, 55, 0.2)',
                            transition: 'all 0.4s ease'
                        }}
                    >
                        {/* Top Header with Badges Cleanly Aligned */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '14px',
                            paddingBottom: '10px',
                            paddingLeft: '4px',
                            paddingRight: '4px',
                            borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#FFD700', fontSize: '0.9rem' }}>👑</span>
                                <span style={{ color: '#FFD700', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
                                    ROYAL SIGNATURE DISH
                                </span>
                            </div>
                            <span style={{ 
                                background: 'rgba(212, 175, 55, 0.15)', 
                                border: '1px solid rgba(212, 175, 55, 0.4)', 
                                color: '#FFF5C0', 
                                fontSize: '0.72rem', 
                                fontWeight: '700', 
                                padding: '4px 12px', 
                                borderRadius: '20px' 
                            }}>
                                24K Gold Leaf
                            </span>
                        </div>

                        {/* Dish Showcase Image Container - Full & High Impact */}
                        <div style={{ 
                            position: 'relative', 
                            borderRadius: '20px', 
                            overflow: 'hidden', 
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            boxShadow: '0 20px 45px rgba(0,0,0,0.7)'
                        }}>
                            <motion.img 
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6 }}
                                src="/hero-royal-dish.jpg" 
                                alt="Awadhi Royal Dum Biryani" 
                                style={{ 
                                    width: '100%', 
                                    height: '380px', 
                                    objectFit: 'cover', 
                                    display: 'block' 
                                }}
                            />

                            {/* Dark Gradient Bottom Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                background: 'linear-gradient(to top, rgba(8, 11, 16, 0.95) 0%, transparent 100%)',
                                pointerEvents: 'none'
                            }} />

                            {/* Caption Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: '16px',
                                left: '20px',
                                right: '20px'
                            }}>
                                <h3 style={{ 
                                    color: '#FFFFFF', 
                                    fontFamily: "'Cinzel', serif", 
                                    fontSize: '1.4rem', 
                                    fontWeight: '700',
                                    marginBottom: '3px',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.9)'
                                }}>
                                    Awadhi Royal Dum Biryani
                                </h3>
                                <p style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: '600' }}>
                                    Slow Handi Cooked • Heritage Spices
                                </p>
                            </div>
                        </div>

                        {/* Clean Bottom Stats Bar inside Card */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginTop: '14px',
                            gap: '12px'
                        }}>
                            {/* Rating Badge */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'rgba(212, 175, 55, 0.12)', 
                                border: '1px solid rgba(212, 175, 55, 0.35)', 
                                padding: '10px 16px', 
                                borderRadius: '14px',
                                flex: 1
                            }}>
                                <span style={{ color: '#FFD700', fontSize: '1.2rem' }}>★</span>
                                <div>
                                    <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.88rem' }}>4.9 / 5.0 Rating</div>
                                    <div style={{ color: '#CBD5E1', fontSize: '0.72rem' }}>2,400+ Gourmet Diners</div>
                                </div>
                            </div>

                            {/* Heritage Dum Badge */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'rgba(18, 23, 34, 0.8)', 
                                border: '1px solid rgba(212, 175, 55, 0.35)', 
                                padding: '10px 16px', 
                                borderRadius: '14px',
                                flex: 1
                            }}>
                                <span style={{ color: '#FFD700', fontSize: '1.2rem' }}>🍲</span>
                                <div>
                                    <div style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '0.88rem' }}>Heritage Dum</div>
                                    <div style={{ color: '#FFD700', fontSize: '0.72rem' }}>Slow Handi Cooked</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
