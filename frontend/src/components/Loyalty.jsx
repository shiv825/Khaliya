import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Loyalty() {
    const { t } = useLanguage();
    const [points, setPoints] = useState(0);

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>Welcome, Member</h3>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '1rem', letterSpacing: '1px' }}>ESTABLISHED 2024</p>
                        </div>
                        <div style={{ textAlign: 'right', background: 'rgba(218, 165, 32, 0.1)', padding: '1.5rem 2.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-color)', lineHeight: 1, textShadow: '0 0 15px rgba(218, 165, 32, 0.3)' }}>{points}</div>
                            <div style={{ color: 'var(--accent-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', marginTop: '5px' }}>Total Points</div>
                        </div>
                    </div>

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
