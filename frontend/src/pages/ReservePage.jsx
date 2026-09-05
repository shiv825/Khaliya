import React, { useEffect } from 'react';
import Reservations from '../components/Reservations';

export default function ReservePage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-reserve" style={{ paddingBottom: '4rem' }}>
            <div style={{
                background: 'linear-gradient(180deg, #1A2130 0%, #0B0E14 100%)',
                padding: '60px 20px 40px 20px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
                <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    ✦ BESPOKE HOSPITALITY ✦
                </span>
                <h1 style={{ fontSize: '3rem', color: '#FFF', fontFamily: 'var(--font-heading)', margin: '0 0 10px 0' }}>
                    Table Reservation
                </h1>
                <p style={{ color: '#94A3B8', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
                    Reserve your dining slot for intimate dates, family gatherings, or royal celebrations.
                </p>
            </div>
            <Reservations />
        </div>
    );
}
