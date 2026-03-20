import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function Loyalty() {
    const { t } = useLanguage();
    const [points, setPoints] = useState(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-150, 150], [15, -15]);
    const rotateY = useTransform(x, [-150, 150], [-15, 15]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    useEffect(() => {
        // Ported from loyalty.js local storage logic
        const storedStatus = localStorage.getItem('khaliya_loyalty_status');
        if (storedStatus) {
            setPoints(JSON.parse(storedStatus).points || 0);
        } else {
            setPoints(150); // Give 150 points for signing up
            localStorage.setItem('khaliya_loyalty_status', JSON.stringify({ points: 150, tier: 'Silver' }));
        }
    }, []);

    const getTierInfo = (pts) => {
        if (pts >= 1000) return { name: 'Gold', icon: '👑', color: '#ffd700', next: null };
        if (pts >= 500) return { name: 'Silver', icon: '🥈', color: '#c0c0c0', next: 1000 };
        return { name: 'Bronze', icon: '🥉', color: '#cd7f32', next: 500 };
    };

    const tier = getTierInfo(points);
    const progressPercent = tier.next ? (points / tier.next) * 100 : 100;

    const handleRedeem = (cost, itemName) => {
        if (points >= cost) {
            import('sweetalert2').then(({ default: Swal }) => {
                Swal.fire({
                    title: 'Redeem Reward?',
                    text: `Use ${cost} points for ${itemName}?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--accent-color)',
                    cancelButtonColor: '#444',
                    confirmButtonText: 'Yes, redeem it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const newPoints = points - cost;
                        setPoints(newPoints);

                        // Keep tier logic updated manually for now since it doesn't auto-recalc tier on save
                        const currentTier = getTierInfo(newPoints).name;
                        localStorage.setItem('khaliya_loyalty_status', JSON.stringify({ points: newPoints, tier: currentTier }));

                        Swal.fire({
                            title: 'Redeemed!',
                            text: `You have successfully claimed: ${itemName}. Show this to your waiter.`,
                            icon: 'success',
                            confirmButtonColor: 'var(--accent-color)'
                        });
                    }
                });
            }).catch(() => {
                // Fallback in case sweetalert2 fails to load dynamically
                if (window.confirm(`Use ${cost} points for ${itemName}?`)) {
                    const newPoints = points - cost;
                    setPoints(newPoints);
                    const currentTier = getTierInfo(newPoints).name;
                    localStorage.setItem('khaliya_loyalty_status', JSON.stringify({ points: newPoints, tier: currentTier }));
                    alert(`Redeemed! You claimed: ${itemName}. Show this to your waiter.`);
                }
            });
        }
    };

    return (
        <section id="loyalty" style={{ background: 'var(--secondary-color)', padding: '8rem 0', position: 'relative', overflow: 'hidden' }} data-aos="fade-up">
            <div className="section-bg-accent" style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(218, 165, 32, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{ color: 'var(--accent-color)', letterSpacing: '4px', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Elite Membership</span>
                    <h2 style={{ color: '#FFF', fontSize: '3rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>{t('loyalty.title') || 'Spice Club Rewards'}</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        {t('loyalty.sub') || 'An exclusive circle for the culinary connoisseur. Earn, ascend, and indulge.'}
                    </p>
                </div>

                <div className="loyalty-container futuristic-glass" style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '30px',
                    padding: '3.5rem',
                    color: 'white',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <motion.div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ 
                            perspective: 1500, 
                            marginBottom: '3.5rem', 
                            display: 'flex', 
                            justifyContent: 'center',
                            cursor: 'grab'
                        }}
                    >
                        <motion.div
                            style={{
                                rotateX,
                                rotateY,
                                width: '100%',
                                maxWidth: '450px',
                                height: '260px',
                                background: tier.name === 'Gold' ? 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #B8860B 100%)' :
                                            tier.name === 'Silver' ? 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #808080 100%)' :
                                            'linear-gradient(135deg, #CD7F32 0%, #A0522D 50%, #8B4513 100%)',
                                borderRadius: '20px',
                                padding: '30px',
                                color: '#000',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.4)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-25deg)', animation: 'shimmer 4s infinite' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(40px)' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', letterSpacing: '3px', fontWeight: '800' }}>KHALIYA ROYALTY</div>
                                    <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginTop: '5px' }}>{tier.name} Elite</div>
                                </div>
                                <i className="fas fa-crown" style={{ fontSize: '2rem', opacity: 0.8 }}></i>
                            </div>

                            <div style={{ transform: 'translateZ(60px)' }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>{points}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', opacity: 0.8 }}>Available Spice Points</div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', transform: 'translateZ(30px)' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', letterSpacing: '1px' }}>VALUED MEMBER</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>EST 2024</div>
                            </div>
                        </motion.div>
                    </motion.div>
                    <style>{`@keyframes shimmer { 0% { left: -100% } 50% { left: 200% } 100% { left: 200% } }`}</style>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '25px', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-end' }}>
                            <div>
                                <span style={{ fontWeight: 800, color: tier.color, fontSize: '1.8rem', display: 'block' }}>{tier.icon} {tier.name} Tier</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Exclusive Privileges Active</span>
                            </div>
                            {tier.next && <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '700' }}>{tier.next - points} XP TO NEXT TIER</span>}
                        </div>
                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, #DAA520, #FFD700)`,
                                borderRadius: '10px',
                                transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: '0 0 15px var(--accent-color)'
                            }}></div>
                        </div>
                    </div>

                    <h4 style={{ color: '#fff', marginBottom: '2rem', fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>Curated Rewards</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { name: 'Free Masala Chai', icon: '☕', cost: 100, desc: 'House special brewed with secret spices' },
                            { name: 'Samosa Plate', icon: '🥟', cost: 300, desc: 'Classic golden pastry with savory filling' },
                            { name: '20% Dining Credit', icon: '🍛', cost: 800, desc: 'Valid for your next grand feast' }
                        ].map((reward, idx) => (
                            <div key={idx} className="reward-card" style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                padding: '2rem', 
                                borderRadius: '20px', 
                                border: '1px solid var(--border-color)',
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '1.5rem',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '2.5rem' }}>{reward.icon}</span>
                                    <span style={{ background: points >= reward.cost ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', color: points >= reward.cost ? '#10B981' : '#666', padding: '4px 12px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: '800' }}>
                                        {points >= reward.cost ? 'AVAILABLE' : 'LOCKED'}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '5px', color: '#fff' }}>{reward.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>{reward.desc}</div>
                                </div>
                                <button 
                                    onClick={() => handleRedeem(reward.cost, reward.name)} 
                                    className="btn btn-primary" 
                                    disabled={points < reward.cost}
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        fontSize: '0.9rem', 
                                        background: points >= reward.cost ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', 
                                        color: points >= reward.cost ? '#000' : '#444',
                                        border: 'none',
                                        opacity: points >= reward.cost ? 1 : 0.5
                                    }}
                                >
                                    {reward.cost} SPICE POINTS
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
