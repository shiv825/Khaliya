import React, { useEffect, useState } from 'react';
import Tables from '../components/Tables';
import { useNavigate } from 'react-router-dom';

export default function TablesExplorePage() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSelectTable = (type) => {
        setSelectedType(type);
        navigate(`/reserve?tableType=${type}`);
    };

    return (
        <div className="page-tables" style={{ paddingBottom: '4rem' }}>
            <div style={{
                background: 'linear-gradient(180deg, #1A2130 0%, #0B0E14 100%)',
                padding: '60px 20px 40px 20px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
                <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    ✦ VISUAL FLOORPLAN ✦
                </span>
                <h1 style={{ fontSize: '3rem', color: '#FFF', fontFamily: 'var(--font-heading)', margin: '0 0 10px 0' }}>
                    Explore Dining Spaces
                </h1>
                <p style={{ color: '#94A3B8', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
                    Choose between our intimate window seats, VIP booths, family tables, and sky lounge party zones.
                </p>
            </div>
            <Tables onSelectTable={handleSelectTable} />
        </div>
    );
}
