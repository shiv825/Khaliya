import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function NativeOrder({ onClose }) {
    const [step, setStep] = useState(1);
    
    useEffect(() => {
        // Simulate order progression
        const t1 = setTimeout(() => setStep(2), 3000); // Kitchen prepping
        const t2 = setTimeout(() => setStep(3), 7000); // Out for delivery
        const t3 = setTimeout(() => setStep(4), 12000); // Delivered
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    const steps = [
        { id: 1, title: 'Order Confirmed', icon: 'fa-check-circle', color: '#10B981' },
        { id: 2, title: 'Preparing in Kitchen', icon: 'fa-fire-burner', color: 'var(--primary-color, #DAA520)' },
        { id: 3, title: 'Out for Delivery', icon: 'fa-motorcycle', color: '#3B82F6' },
        { id: 4, title: 'Delivered', icon: 'fa-box-open', color: '#8B5CF6' }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="native-order-tracking"
            style={{ 
                position: 'fixed', inset: 0, background: 'var(--bg-dark, #0a0a0a)', 
                zIndex: 9999, padding: '20px', display: 'flex', flexDirection: 'column', color: '#fff',
                overflowY: 'auto'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingTop: 'env(safe-area-inset-top, 20px)' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>Live Tracking</h2>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px 20px', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Estimated Arrival</div>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: steps[step-1].color, marginTop: '10px', textShadow: `0 0 20px ${steps[step-1].color}44` }}>
                            {step === 4 ? 'Arrived!' : '25-35 min'}
                        </div>
                    </div>

                    <div style={{ position: 'relative', marginLeft: '25px', paddingBottom: '20px' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', left: '22px', top: '25px', bottom: '60px', width: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>

                        {steps.map((s, idx) => {
                            const isActive = s.id === step;
                            const isPast = s.id <= step;
                            const color = isPast ? s.color : 'rgba(255,255,255,0.15)';
                            
                            return (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: idx !== steps.length - 1 ? '45px' : '0', position: 'relative', zIndex: 1, opacity: isPast ? 1 : 0.4 }}>
                                    <div style={{ 
                                        width: '46px', height: '46px', borderRadius: '50%', 
                                        background: isPast ? color : 'var(--bg-dark)', 
                                        border: `2px solid ${color}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isActive ? `0 0 20px ${color}88` : 'none',
                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        <i className={`fas ${s.icon}`} style={{ color: isPast ? '#000' : '#fff', fontSize: '1.2rem' }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: isPast ? '#fff' : 'var(--text-muted)', transition: 'color 0.3s ease' }}>{s.title}</div>
                                        {isActive && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ fontSize: '0.85rem', color: color, marginTop: '6px', fontWeight: '600' }}>Updating in real-time...</motion.div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', borderRadius: '20px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '55px', height: '55px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(218, 165, 32, 0.3)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                        <i className="fas fa-phone-alt" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>Need Help?</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Contact Restaurant Support</div>
                    </div>
                </div>
            </div>
            <div style={{ height: '40px' }}></div>
        </motion.div>
    );
}
