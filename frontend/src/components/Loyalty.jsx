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

    return (
        <section id="loyalty" style={{ background: '#111', padding: '5rem 0' }} data-aos="fade-up">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--accent-light)' }}>{t('loyalty.title') || 'Spice Club Rewards'}</h2>
                    <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
                        {t('loyalty.sub') || 'Join our exclusive loyalty program. Earn points, tier up, and unlock secret menu items!'}
                    </p>
                </div>

                <div className="loyalty-container" style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '2rem',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Welcome Back!</h3>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#aaa', fontSize: '0.9rem' }}>Member since 2024</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-color)', lineHeight: 1 }}>{points}</div>
                            <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Points</div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: tier.color, fontSize: '1.2rem' }}>{tier.icon} {tier.name} Tier</span>
                            {tier.next && <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{tier.next - points} pts to next tier</span>}
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, var(--accent-color), ${tier.color})`,
                                borderRadius: '4px',
                                transition: 'width 1s ease-in-out'
                            }}></div>
                        </div>
                    </div>

                    <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Available Rewards</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>☕ Free Masala Chai</div>
                                <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Redeem for a hot beverage</div>
                            </div>
                            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: points >= 100 ? 'var(--accent-color)' : '#444', pointerEvents: points >= 100 ? 'auto' : 'none' }}>
                                100 pts
                            </button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>🥟 Free Samosa Plate</div>
                                <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Classic Indian Starter</div>
                            </div>
                            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: points >= 300 ? 'var(--accent-color)' : '#444', pointerEvents: points >= 300 ? 'auto' : 'none' }}>
                                300 pts
                            </button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>🍛 20% Off Bill</div>
                                <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Discount on grand total</div>
                            </div>
                            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: points >= 800 ? 'var(--accent-color)' : '#444', pointerEvents: points >= 800 ? 'auto' : 'none' }}>
                                800 pts
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
