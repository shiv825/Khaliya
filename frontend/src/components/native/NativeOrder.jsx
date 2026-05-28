import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function NativeOrder({ onClose, orderId }) {
    const [step, setStep] = useState(1);
    const [estimatedTime, setEstimatedTime] = useState(null);
    
    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        if (!orderId) return;

        const fetchStatus = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders`);
                const order = res.data.find(o => o.id === orderId);
                if (order) {
                    if (order.status === 'received') setStep(1);
                    else if (order.status === 'preparing') setStep(2);
                    else if (order.status === 'ready') setStep(3);
                    else if (order.status === 'delivered') setStep(4);
                    
                    if (order.estimatedTime) {
                        setEstimatedTime(order.estimatedTime);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch live order status");
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [orderId, API_URL]);

    const steps = [
        { id: 1, title: 'Order Confirmed', icon: 'fa-check-circle', color: 'var(--spice-emerald)' },
        { id: 2, title: 'Preparing in Kitchen', icon: 'fa-fire-burner', color: 'var(--spice-saffron)' },
        { id: 3, title: 'Dish has arrived at your table', icon: 'fa-concierge-bell', color: '#3F51B5' },
        { id: 4, title: 'Delivered', icon: 'fa-check-double', color: 'var(--primary-color)' }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="native-order-tracking"
            style={{ 
                position: 'fixed', inset: 0, background: 'var(--bg-body)', 
                zIndex: 9999, padding: '20px', display: 'flex', flexDirection: 'column', color: 'var(--text-dark)',
                overflowY: 'auto'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', paddingTop: 'env(safe-area-inset-top, 20px)' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--primary-color)' }}>Live Order</h2>
                <button onClick={onClose} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 5px' }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '35px 25px', marginBottom: '30px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '45px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>{step === 4 ? 'DELIVERY COMPLETED' : 'EXPECTED ARRIVAL'}</div>
                        <div style={{ fontSize: '3.4rem', fontWeight: '900', color: steps[step-1].color, marginTop: '12px', fontFamily: 'var(--font-heading)' }}>
                            {step === 4 ? 'Arrived!' : (estimatedTime ? `${estimatedTime} min` : 'Pending...')}
                        </div>
                    </div>

                    <div style={{ position: 'relative', marginLeft: '30px', paddingBottom: '10px' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', left: '22px', top: '30px', bottom: '65px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>

                        {steps.map((s, idx) => {
                            const isActive = s.id === step;
                            const isPast = s.id <= step;
                            const color = isPast ? s.color : 'var(--text-muted)';
                            
                            return (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: idx !== steps.length - 1 ? '50px' : '0', position: 'relative', zIndex: 1, opacity: isPast ? 1 : 0.4 }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '18px', 
                                        background: isPast ? color : 'var(--bg-body)', 
                                        border: `2.5px solid ${color}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isActive ? `0 10px 25px ${color}44` : 'none',
                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        <i className={`fas ${s.icon}`} style={{ color: isPast ? '#FFF' : 'var(--text-muted)', fontSize: '1.2rem' }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: isPast ? 'var(--text-dark)' : 'var(--text-muted)', transition: 'color 0.3s ease' }}>{s.title}</div>
                                        {isActive && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ fontSize: '0.9rem', color: 'var(--primary-color)', marginTop: '8px', fontWeight: '700' }}>Updating in real-time...</motion.div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', borderRadius: '25px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                        <i className="fas fa-phone-alt" style={{ color: '#FFF', fontSize: '1.3rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Need Assistance?</div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '4px', fontWeight: '600' }}>Contact Restaurant Concierge</div>
                    </div>
                </div>
            </div>
            <div style={{ height: '60px' }}></div>
        </motion.div>
    );
}
