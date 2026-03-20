import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function InteractiveFloorplan({ onSelectTable }) {
    const [selectedId, setSelectedId] = useState(null);

    const tables = [
        { id: 'T1', type: 'Window 2-Seater', x: 15, y: 15, isAvailable: true },
        { id: 'T2', type: 'Main Dining 4-Seater', x: 45, y: 35, isAvailable: true },
        { id: 'T3', type: 'VIP Booth', x: 75, y: 15, isAvailable: true },
        { id: 'T4', type: 'Large Family Table', x: 65, y: 65, isAvailable: false },
        { id: 'T5', type: 'Outdoor Patio', x: 15, y: 65, isAvailable: true }
    ];

    const handleSelect = (table) => {
        if (!table.isAvailable) return;
        setSelectedId(table.id);
        if (onSelectTable) onSelectTable(table.type);
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '700px', margin: '0 auto', background: 'var(--bg-glass, rgba(20,20,20,0.8))', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color, rgba(255,255,255,0.05))', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '25px', textAlign: 'center', fontSize: '1.8rem' }}>Interactive Floorplan</h3>
            
            <div style={{ position: 'relative', width: '100%', paddingBottom: '70%', background: '#0a0a0a', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(218,165,32,0.1)' }}>
                {/* SVG Blueprint */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Walls / Layout paths */}
                    <rect x="2%" y="2%" width="96%" height="96%" fill="none" rx="10" stroke="rgba(218,165,32,0.1)" strokeWidth="2" strokeDasharray="10 5" />
                    <text x="50%" y="10%" fill="rgba(255,255,255,0.15)" fontSize="16" fontWeight="bold" textAnchor="middle" style={{ letterSpacing: '6px' }}>OPEN KITCHEN</text>
                    <text x="92%" y="50%" fill="rgba(255,255,255,0.15)" fontSize="16" fontWeight="bold" transform="rotate(90, 92%, 50%)" style={{ letterSpacing: '4px' }}>COCKTAIL BAR</text>
                    <text x="8%" y="50%" fill="rgba(255,255,255,0.15)" fontSize="14" transform="rotate(-90, 8%, 50%)" style={{ letterSpacing: '2px' }}>GARDEN VIEW</text>
                </svg>

                {/* Render Interactive Tables */}
                {tables.map((table) => {
                    const isFamily = table.type.includes('Family') || table.type.includes('Dining');
                    const isSelected = selectedId === table.id;
                    return (
                        <motion.div
                            key={table.id}
                            onClick={() => handleSelect(table)}
                            whileHover={table.isAvailable ? { scale: 1.05 } : {}}
                            whileTap={table.isAvailable ? { scale: 0.95 } : {}}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: parseInt(table.id.replace('T', '')) * 0.1 }}
                            style={{
                                position: 'absolute',
                                left: `${table.x}%`,
                                top: `${table.y}%`,
                                width: isFamily ? '90px' : '55px',
                                height: isFamily ? '60px' : '55px',
                                background: isSelected 
                                            ? 'var(--primary-color, #DAA520)' 
                                            : (table.isAvailable ? 'rgba(218, 165, 32, 0.15)' : 'rgba(255,50,50,0.15)'),
                                border: `2px solid ${table.isAvailable ? 'max(var(--primary-color), #DAA520)' : '#ff3333'}`,
                                borderRadius: isFamily ? '20px' : '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: table.isAvailable ? 'pointer' : 'not-allowed',
                                boxShadow: isSelected ? '0 0 25px rgba(218,165,32,0.6)' : 'none',
                                transition: 'background 0.3s ease, box-shadow 0.3s ease'
                            }}
                        >
                            <span style={{ fontSize: '0.85rem', color: isSelected ? '#000' : '#fff', fontWeight: '800' }}>{table.id}</span>
                            {!table.isAvailable && <i className="fas fa-lock" style={{ position: 'absolute', color: '#ff3333', opacity: 0.7, fontSize: '1rem', bottom: '-20px' }}></i>}
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginTop: '25px', fontSize: '0.9rem', fontWeight: '600' }}>
                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', background: 'rgba(218, 165, 32, 0.15)', border: '2px solid #DAA520', borderRadius: '50%' }}></span> Available
                </span>
                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', background: '#DAA520', border: '2px solid #DAA520', borderRadius: '50%', boxShadow: '0 0 10px #DAA520' }}></span> Selected
                </span>
                <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', background: 'rgba(255,50,50,0.15)', border: '2px solid #ff3333', borderRadius: '50%' }}></span> Reserved
                </span>
            </div>
        </div>
    );
}
