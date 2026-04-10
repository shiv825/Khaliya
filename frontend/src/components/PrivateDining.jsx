import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PrivateDining() {
    const { t } = useLanguage();

    return (
        <section id="private-events" style={{ background: 'var(--bg-body)', padding: '8rem 0' }} data-aos="fade-up">
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div className="pd-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '5rem', alignItems: 'center' }}>
                    
                    <div className="pd-image" style={{ position: 'relative', borderRadius: '30px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', height: '500px' }}>
                        <img src="https://images.unsplash.com/photo-1519671482749-fd098f39dfa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Private Dining" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(142, 28, 28, 0.8), transparent)' }}></div>
                        <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', color: '#fff' }}>
                            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>The Royal Hall</div>
                            <div style={{ color: 'var(--accent-light)', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Up to 50 Guests</div>
                        </div>
                    </div>

                    <div className="pd-content">
                        <span style={{ color: 'var(--primary-color)', letterSpacing: '4px', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Exclusive Events</span>
                        <h2 style={{ color: 'var(--primary-color)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontFamily: 'var(--font-heading)', margin: '0 0 2rem 0', lineHeight: 1.1 }}>Private Dining & Celebration</h2>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.15rem', marginBottom: '3rem', lineHeight: 1.7, fontWeight: '500' }}>
                            Elevate your special moments. Whether it's an intimate family gathering or a grand corporate event, our curated spaces and bespoke menus ensure your celebration is exquisite. Experience unmatched luxury and personalized service tailored just for you.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
                            {[
                                { title: 'Bespoke Menus', icon: '🍷' },
                                { title: 'Dedicated Staff', icon: '👨‍🍳' },
                                { title: 'Event Planning', icon: '✨' }
                            ].map((feature, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-surface)', padding: '1.8rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                                    <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{feature.icon}</div>
                                    <div style={{ color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{feature.title}</div>
                                </div>
                            ))}
                        </div>
 
                        <button className="btn btn-primary" style={{ padding: '20px 45px', fontSize: '1rem', borderRadius: '40px' }}>
                            Inquire Now <i className="fas fa-arrow-right" style={{ marginLeft: '12px' }}></i>
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 900px) {
                    .pd-image { height: 400px !important; }
                    .pd-content { text-align: center; }
                    .pd-content h2 { margin: 1rem auto 2rem auto !important; }
                }
            `}</style>
        </section>
    );
}
