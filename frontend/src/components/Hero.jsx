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
                minHeight: '85vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden', 
                padding: '110px 16px 60px 16px',
                background: 'transparent'
            }}
        >
            {/* Ambient Golden Light Flare */}
            <div style={{
                position: 'absolute',
                top: '20%',
                right: '10%',
                width: 'min(550px, 80vw)',
                height: 'min(550px, 80vw)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.14) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 80%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Main Content Layout Container (Responsive Grid) */}
            <div 
                style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    maxWidth: '1400px', 
                    width: '100%', 
                    margin: '0 auto',
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '32px', 
                    alignItems: 'center' 
                }}
            >
                {/* Left Column: Royal Indian Cuisine Typography */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Royal Tagline Pill */}
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '18px', 
                        padding: '6px 16px', 
                        borderRadius: '50px', 
                        background: 'rgba(212, 175, 55, 0.08)', 
                        border: '1px solid rgba(212, 175, 55, 0.3)', 
                        backdropFilter: 'blur(12px)',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <span style={{ color: '#FFD700', fontSize: '0.75rem' }}>✦</span>
                        <span style={{ 
                            color: '#D4AF37', 
                            fontSize: '0.75rem', 
                            fontWeight: '800', 
                            letterSpacing: '2px', 
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-body)',
                            whiteSpace: 'normal'
                        }}>
                            ROYAL INDIAN FINE DINING
                        </span>
                        <span style={{ color: '#FFD700', fontSize: '0.75rem' }}>✦</span>
                    </div>

                    {/* Royal Serif Headline */}
                    <h1 style={{ 
                        fontFamily: "'Cinzel', 'Playfair Display', serif", 
                        fontSize: 'clamp(2.1rem, 5.5vw, 4.8rem)', 
                        fontWeight: '800', 
                        lineHeight: '1.15', 
                        marginBottom: '20px', 
                        letterSpacing: '-0.5px' 
                    }}>
                        <span style={{ color: '#FFFFFF', display: 'block', textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>
                            A True Taste
                        </span>
                        <span style={{ 
                            background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 30%, #D4AF37 70%, #AA7C11 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent', 
                            display: 'block',
                            filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.35))'
                        }}>
                            Of India
                        </span>
                    </h1>

                    {/* Description Paragraph */}
                    <p style={{ 
                        color: '#CBD5E1', 
                        fontSize: 'clamp(0.95rem, 1.4vw, 1.2rem)', 
                        lineHeight: '1.7', 
                        marginBottom: '32px', 
                        maxWidth: '560px',
                        fontWeight: '400'
                    }}>
                        Experience the grandeur of Indian culinary heritage — handcrafted with royal court recipes, hand-ground heritage spices, and centuries-old dum pukht traditions.
                    </p>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: '0 12px 35px rgba(212, 175, 55, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/menu')}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                color: '#070A0E',
                                border: 'none',
                                padding: '16px 32px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '0.88rem',
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                flex: '1 1 auto',
                                justifyContent: 'center',
                                minWidth: '160px'
                            }}
                        >
                            Explore Menu <i className="fas fa-book-open" style={{ fontSize: '0.85rem' }}></i>
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
                                padding: '16px 28px',
                                borderRadius: '14px',
                                fontWeight: '800',
                                fontSize: '0.88rem',
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                flex: '1 1 auto',
                                justifyContent: 'center',
                                minWidth: '160px'
                            }}
                        >
                            Book A Table <i className="fas fa-calendar-alt" style={{ color: '#FFD700' }}></i>
                        </motion.button>
                    </div>

                    {/* Bottom Feature Badges */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                        gap: '12px', 
                        borderTop: '1px solid rgba(212, 175, 55, 0.25)', 
                        paddingTop: '24px',
                        maxWidth: '580px'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            background: 'rgba(18, 23, 34, 0.65)', 
                            padding: '10px 12px', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '0.9rem', flexShrink: 0 }}>
                                🌿
                            </div>
                            <div>
                                <div style={{ color: '#FFF', fontSize: '0.8rem', fontWeight: '800' }}>Authentic</div>
                                <div style={{ color: '#CBD5E1', fontSize: '0.68rem', letterSpacing: '0.3px' }}>Court Recipes</div>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            background: 'rgba(18, 23, 34, 0.65)', 
                            padding: '10px 12px', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '0.9rem', flexShrink: 0 }}>
                                ✨
                            </div>
                            <div>
                                <div style={{ color: '#FFF', fontSize: '0.8rem', fontWeight: '800' }}>Fresh</div>
                                <div style={{ color: '#CBD5E1', fontSize: '0.68rem', letterSpacing: '0.3px' }}>Heritage Spices</div>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            background: 'rgba(18, 23, 34, 0.65)', 
                            padding: '10px 12px', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '0.9rem', flexShrink: 0 }}>
                                🍲
                            </div>
                            <div>
                                <div style={{ color: '#FFF', fontSize: '0.8rem', fontWeight: '800' }}>Hygienic</div>
                                <div style={{ color: '#CBD5E1', fontSize: '0.68rem', letterSpacing: '0.3px' }}>Master Kitchen</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: 3D Gold Glassmorphic Signature Dish Showcase Card */}
                <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    style={{ 
                        position: 'relative', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%',
                        boxSizing: 'border-box'
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
                            borderRadius: '24px',
                            padding: '14px',
                            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.18)',
                            transition: 'all 0.4s ease',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Top Header with Badges Cleanly Aligned & Flex Wrapped */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: '12px',
                            paddingBottom: '8px',
                            paddingLeft: '4px',
                            paddingRight: '4px',
                            borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#FFD700', fontSize: '0.85rem' }}>👑</span>
                                <span style={{ color: '#FFD700', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    ROYAL SIGNATURE DISH
                                </span>
                            </div>
                            <span style={{ 
                                background: 'rgba(212, 175, 55, 0.15)', 
                                border: '1px solid rgba(212, 175, 55, 0.4)', 
                                color: '#FFF5C0', 
                                fontSize: '0.68rem', 
                                fontWeight: '700', 
                                padding: '3px 10px', 
                                borderRadius: '20px',
                                whiteSpace: 'nowrap'
                            }}>
                                24K Gold Leaf
                            </span>
                        </div>

                        {/* Dish Showcase Image Container - Flexible Height & High Aspect */}
                        <div style={{ 
                            position: 'relative', 
                            borderRadius: '16px', 
                            overflow: 'hidden', 
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.7)',
                            width: '100%',
                            maxHeight: '340px'
                        }}>
                            <motion.img 
                                whileHover={{ scale: 1.04 }}
                                transition={{ duration: 0.6 }}
                                src="/hero-royal-dish.jpg" 
                                alt="Awadhi Royal Dum Biryani" 
                                style={{ 
                                    width: '100%', 
                                    height: 'clamp(210px, 45vw, 340px)', 
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
                                height: '60%',
                                background: 'linear-gradient(to top, rgba(8, 11, 16, 0.95) 0%, transparent 100%)',
                                pointerEvents: 'none'
                            }} />

                            {/* Caption Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: '12px',
                                left: '16px',
                                right: '16px'
                            }}>
                                <h3 style={{ 
                                    color: '#FFFFFF', 
                                    fontFamily: "'Cinzel', serif", 
                                    fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', 
                                    fontWeight: '700',
                                    marginBottom: '2px',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.9)'
                                }}>
                                    Awadhi Royal Dum Biryani
                                </h3>
                                <p style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: '600' }}>
                                    Slow Handi Cooked • Heritage Spices
                                </p>
                            </div>
                        </div>

                        {/* Clean Bottom Stats Bar inside Card */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            marginTop: '12px',
                            gap: '8px'
                        }}>
                            {/* Rating Badge */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: 'rgba(212, 175, 55, 0.12)', 
                                border: '1px solid rgba(212, 175, 55, 0.35)', 
                                padding: '8px 12px', 
                                borderRadius: '12px',
                                flex: '1 1 130px',
                                minWidth: '0'
                            }}>
                                <span style={{ color: '#FFD700', fontSize: '1rem', flexShrink: 0 }}>★</span>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>4.9 / 5.0 Rating</div>
                                    <div style={{ color: '#CBD5E1', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>2,400+ Diners</div>
                                </div>
                            </div>

                            {/* Heritage Dum Badge */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: 'rgba(18, 23, 34, 0.8)', 
                                border: '1px solid rgba(212, 175, 55, 0.35)', 
                                padding: '8px 12px', 
                                borderRadius: '12px',
                                flex: '1 1 130px',
                                minWidth: '0'
                            }}>
                                <span style={{ color: '#FFD700', fontSize: '1rem', flexShrink: 0 }}>🍲</span>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Heritage Dum</div>
                                    <div style={{ color: '#FFD700', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Slow Handi Cooked</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
