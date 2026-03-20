import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import InteractiveFloorplan from './InteractiveFloorplan';

export default function Tables({ onSelectTable }) {
    const { t } = useLanguage();
    const [filterType, setFilterType] = useState('all');
    const [selectedTable, setSelectedTable] = useState(null);

    // Hardcoded table data as in the original script
    const tablesData = [
        { id: 1, type: "window", name: "Window 1", capacity: 2, status: "available" },
        { id: 2, type: "window", name: "Window 2", capacity: 4, status: "booked" },
        { id: 3, type: "party", name: "Party Central", capacity: 12, status: "available" },
        { id: 4, type: "regular", name: "Center 1", capacity: 4, status: "available" },
        { id: 5, type: "regular", name: "Center 2", capacity: 6, status: "booked" },
        { id: 6, type: "intimate", name: "Cozy Corner", capacity: 2, status: "available" },
        { id: 7, type: "family", name: "Family Booth", capacity: 6, status: "available" },
        { id: 8, type: "group", name: "Group Table", capacity: 8, status: "booked" },
    ];

    const handleTableClick = (table) => {
        if (table.status !== 'available') return;
        setSelectedTable(table.id);
        if (onSelectTable) onSelectTable(table.type);

        // Auto-scroll to reservation form
        document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
    };

    const filteredTables = filterType === 'all'
        ? tablesData
        : tablesData.filter(t => t.type === filterType);

    const getTypeStyle = (type) => {
        const typeMapping = {
            'intimate': { icon: '🥂', color: '#e91e63' },
            'family': { icon: '👨‍👩‍👧‍👦', color: '#2196F3' },
            'group': { icon: '🎉', color: '#9c27b0' },
            'party': { icon: '🎊', color: '#ff9800' },
            'window': { icon: '🪟', color: '#00bcd4' },
            'regular': { icon: '🍽️', color: '#607d8b' }
        };
        return typeMapping[type] || typeMapping['regular'];
    };

    return (
        <section id="tables">
            <h2>{t('tables.title')}</h2>
            <p style={{ fontSize: '1.1rem', color: '#333' }}><strong>{t('tables.sub')}</strong></p>

            {/* Categories */}
            <div style={{ margin: '1rem 0', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '5px solid #2196F3' }}>
                <p style={{ margin: '0.5rem 0', fontWeight: 'bold', color: '#333' }}>{t('tables.typesAvailable')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div className="table-type-card" onClick={() => setFilterType('intimate')} style={{ cursor: 'pointer', outline: filterType === 'intimate' ? '2px solid #2196F3' : 'none' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥂</div>
                        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('form.typeIntimateName')}</strong>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>{t('tables.typeIntimateSub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('family')} style={{ cursor: 'pointer', outline: filterType === 'family' ? '2px solid #2196F3' : 'none' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦</div>
                        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('form.typeFamilyName')}</strong>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>{t('tables.typeFamilySub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('group')} style={{ cursor: 'pointer', outline: filterType === 'group' ? '2px solid #2196F3' : 'none' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</div>
                        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('form.typeGroupName')}</strong>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>{t('tables.typeGroupSub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('party')} style={{ cursor: 'pointer', outline: filterType === 'party' ? '2px solid #2196F3' : 'none' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎊</div>
                        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('form.typePartyName')}</strong>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>{t('tables.typePartySub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('window')} style={{ cursor: 'pointer', outline: filterType === 'window' ? '2px solid #2196F3' : 'none' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🪟</div>
                        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('form.typeWindowName')}</strong>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>{t('tables.typeWindowSub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('all')} style={{ cursor: 'pointer', outline: filterType === 'all' ? '2px solid #2196F3' : 'none' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
                        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('tables.viewAll')}</strong>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>{t('tables.viewAllSub')}</p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ margin: '1rem 0', padding: '1.5rem', background: '#fff3e0', borderRadius: '8px', borderLeft: '5px solid #ff9800' }}>
                <p style={{ margin: '0.5rem 0', fontWeight: 'bold', color: '#333' }}>{t('tables.legend')}</p>
                <p style={{ margin: '0.5rem 0' }}>
                    <span style={{ display: 'inline-block', width: '24px', height: '24px', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', borderRadius: '6px', marginRight: '0.8rem', verticalAlign: 'middle', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></span>
                    <strong>{t('tables.available')}</strong> <span>{t('tables.availableDesc')}</span>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                    <span style={{ display: 'inline-block', width: '24px', height: '24px', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', borderRadius: '6px', marginRight: '0.8rem', verticalAlign: 'middle', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></span>
                    <strong>{t('tables.booked')}</strong> <span>{t('tables.bookedDesc')}</span>
                </p>
            </div>

            <div style={{ margin: '1rem 0', padding: '1.5rem', background: '#e8f5e9', borderRadius: '8px', borderLeft: '5px solid #4caf50' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>{t('tables.tip')}</p>
            </div>

            {/* Visual Map SVG placeholder logic (Optional, since CSS grid is there) */}
            <div style={{ margin: '3rem 0' }}>
                <InteractiveFloorplan onSelectTable={(type) => { 
                    setFilterType(type.toLowerCase().includes('window') ? 'window' : type.toLowerCase().includes('family') ? 'family' : 'regular'); 
                    if (onSelectTable) onSelectTable(type);
                    document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' });
                }} />
            </div>

            {/* Table Grid */}
            <div id="tableGrid" className="table-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {filteredTables.map(t => {
                    const styleObj = getTypeStyle(t.type);
                    const isAvailable = t.status === 'available';
                    return (
                        <div
                            key={t.id}
                            onClick={() => handleTableClick(t)}
                            style={{
                                background: isAvailable ? 'white' : '#ffebee',
                                border: `2px solid ${isAvailable ? '#4caf50' : '#f44336'}`,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                textAlign: 'center',
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                opacity: isAvailable ? 1 : 0.7,
                                transition: 'all 0.3s ease',
                                boxShadow: selectedTable === t.id ? '0 0 0 3px #1976d2' : '0 4px 6px rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                if (isAvailable && selectedTable !== t.id) {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (isAvailable && selectedTable !== t.id) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{styleObj.icon}</div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: styleObj.color }}>{t.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                <i className="fas fa-users" style={{ marginRight: '5px' }}></i>
                                Max {t.capacity}
                            </p>
                            <div style={{
                                padding: '0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                background: isAvailable ? '#e8f5e9' : '#ffebee',
                                color: isAvailable ? '#2e7d32' : '#c62828'
                            }}>
                                {isAvailable ? 'Available' : 'Booked'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
