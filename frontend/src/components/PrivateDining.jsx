import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PrivateDining() {
    const { t } = useLanguage();

    return (
        <section id="private-events" style={{ background: 'var(--bg-dark)', padding: '6rem 0' }} data-aos="fade-up">
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'center', '@media (max-width: 900px)': { gridTemplateColumns: '1fr' } }}>
                    
                    <div className="pd-image" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minHeight: '400px' }}>
                        <img src="https://images.unsplash.com/photo-1519671482749-fd098f39dfa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Private Dining" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)' }}></div>
                        <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', color: '#fff' }}>
                            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)' }}>The Royal Hall</div>
                            <div style={{ color: 'var(--accent-color)', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Up to 50 Guests</div>
                        </div>
                    </div>

                    <div className="pd-content">
                        <span style={{ color: 'var(--accent-color)', letterSpacing: '4px', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Exclusive Events</span>
                        <h2 style={{ color: '#fff', fontSize: '3.5rem', fontFamily: 'var(--font-heading)', margin: '1rem 0 1.5rem 0', lineHeight: 1.1 }}>Private Dining & Celebration</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            Elevate your special moments. Whether it's an intimate family gathering or a grand corporate event, our curated spaces and bespoke menus ensure your celebration is exquisite. Experience unmatched luxury and personalized service tailored just for you.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {[
                                { title: 'Bespoke Menus', icon: '🍷' },
                                { title: 'Dedicated Staff', icon: '👨‍🍳' },
                                { title: 'Event Planning', icon: '✨' }
                            ].map((feature, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem 1rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{feature.icon}</div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700' }}>{feature.title}</div>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-primary" style={{ padding: '16px 35px', fontSize: '1rem', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '30px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(218, 165, 32, 0.3)' }}>
                            Inquire Now <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 900px) {
                    #private-events .container > div {
                        grid-template-columns: 1fr !important;
                    }
                    #private-events .pd-image {
                        height: 350px;
                    }
                    #private-events h2 {
                        fontSize: '2.5rem' !important;
                    }
                }
            `}</style>
        </section>
    );
}
