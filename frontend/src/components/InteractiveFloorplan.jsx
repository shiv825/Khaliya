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
        if (onSelectTable) onSelectTable(table.type, table.id);
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', background: 'var(--bg-surface)', padding: '35px', borderRadius: '30px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '30px', textAlign: 'center', fontSize: '2rem' }}>Interactive Floorplan</h3>
            
            <div style={{ position: 'relative', width: '100%', paddingBottom: '70%', background: 'var(--bg-body)', borderRadius: '25px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                {/* SVG Blueprint */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Walls / Layout paths */}
                    <rect x="2%" y="2%" width="96%" height="96%" fill="none" rx="20" stroke="var(--primary-color)" strokeWidth="1" strokeDasharray="15 10" opacity="0.1" />
                    <text x="50%" y="12%" fill="var(--text-muted)" fontSize="14" fontWeight="800" textAnchor="middle" style={{ letterSpacing: '8px', opacity: 0.3, textTransform: 'uppercase' }}>Royal Kitchen</text>
                    <text x="94%" y="50%" fill="var(--text-muted)" fontSize="14" fontWeight="800" transform="rotate(90, 94%, 50%)" style={{ letterSpacing: '6px', opacity: 0.3, textTransform: 'uppercase' }}>The Bar</text>
                    <text x="6%" y="50%" fill="var(--text-muted)" fontSize="12" fontWeight="800" transform="rotate(-90, 6%, 50%)" style={{ letterSpacing: '2px', opacity: 0.3, textTransform: 'uppercase' }}>Garden View</text>
                </svg>

                {/* Render Interactive Tables */}
                {tables.map((table) => {
                    const isFamily = table.type.includes('Family') || table.type.includes('Dining');
                    const isSelected = selectedId === table.id;
                    const availableColor = 'var(--primary-color)';
                    return (
                        <motion.div
                            key={table.id}
                            onClick={() => handleSelect(table)}
                            whileHover={table.isAvailable ? { filter: 'brightness(1.1)' } : {}}
                            whileTap={table.isAvailable ? { scale: 0.95 } : {}}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: parseInt(table.id.replace('T', '')) * 0.1 }}
                            style={{
                                position: 'absolute',
                                left: `${table.x}%`,
                                top: `${table.y}%`,
                                width: isFamily ? '100px' : '65px',
                                height: isFamily ? '65px' : '65px',
                                background: isSelected 
                                            ? 'var(--primary-color)' 
                                            : (table.isAvailable ? 'rgba(142, 28, 28, 0.05)' : 'rgba(0,0,0,0.03)'),
                                border: `2px solid ${isSelected ? 'var(--primary-color)' : (table.isAvailable ? 'rgba(142, 28, 28, 0.4)' : 'var(--border-color)')}`,
                                borderRadius: isFamily ? '20px' : '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: table.isAvailable ? 'pointer' : 'not-allowed',
                                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                transition: 'var(--transition)',
                                opacity: table.isAvailable ? 1 : 0.4
                            }}
                        >
                            <span style={{ fontSize: '1rem', color: isSelected ? '#fff' : 'var(--text-dark)', fontWeight: '800' }}>{table.id}</span>
                            {!table.isAvailable && <i className="fas fa-close" style={{ position: 'absolute', color: 'var(--text-muted)', fontSize: '0.8rem', bottom: '-22px' }}></i>}
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px', marginTop: '30px' }}>
                <span style={{ color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '800' }}>
                    <span style={{ width: '16px', height: '16px', background: 'rgba(142, 28, 28, 0.05)', border: '2px solid rgba(142, 28, 28, 0.4)', borderRadius: '50%' }}></span> Available
                </span>
                <span style={{ color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '800' }}>
                    <span style={{ width: '16px', height: '16px', background: 'var(--primary-color)', borderRadius: '50%', boxShadow: '0 0 10px rgba(142, 28, 28, 0.4)' }}></span> Selected
                </span>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '800' }}>
                    <span style={{ width: '16px', height: '16px', background: 'rgba(0,0,0,0.03)', border: '2px solid var(--border-color)', borderRadius: '50%' }}></span> Reserved
                </span>
            </div>
        </div>
    );
}
