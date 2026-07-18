import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

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
        <section id="tables" style={{ padding: '6rem 1.5rem', background: 'var(--bg-body)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontSize: '2.8rem' }}>{t('tables.title')}</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-light)', textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>{t('tables.sub')}</p>

            {/* Categories */}
            <div style={{ margin: '2rem auto', padding: '2rem', background: 'var(--bg-surface)', borderRadius: '25px', border: '1px solid var(--border-color)', maxWidth: '1200px', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ margin: '0 0 1.5rem 0', fontWeight: '800', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', fontSize: '0.9rem' }}>{t('tables.typesAvailable')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                    <div className="table-type-card" onClick={() => setFilterType('intimate')} style={{ cursor: 'pointer', border: filterType === 'intimate' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: filterType === 'intimate' ? 'rgba(142, 28, 28, 0.05)' : 'transparent', padding: '1.5rem', borderRadius: '15px', textAlign: 'center', transition: 'var(--transition)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>🥂</div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('form.typeIntimateName')}</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-light)' }}>{t('tables.typeIntimateSub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('family')} style={{ cursor: 'pointer', border: filterType === 'family' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: filterType === 'family' ? 'rgba(142, 28, 28, 0.05)' : 'transparent', padding: '1.5rem', borderRadius: '15px', textAlign: 'center', transition: 'var(--transition)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>👨‍👩‍👧‍👦</div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('form.typeFamilyName')}</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-light)' }}>{t('tables.typeFamilySub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('group')} style={{ cursor: 'pointer', border: filterType === 'group' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: filterType === 'group' ? 'rgba(142, 28, 28, 0.05)' : 'transparent', padding: '1.5rem', borderRadius: '15px', textAlign: 'center', transition: 'var(--transition)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>🎉</div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('form.typeGroupName')}</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-light)' }}>{t('tables.typeGroupSub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('party')} style={{ cursor: 'pointer', border: filterType === 'party' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: filterType === 'party' ? 'rgba(142, 28, 28, 0.05)' : 'transparent', padding: '1.5rem', borderRadius: '15px', textAlign: 'center', transition: 'var(--transition)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>🎊</div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('form.typePartyName')}</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-light)' }}>{t('tables.typePartySub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('window')} style={{ cursor: 'pointer', border: filterType === 'window' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: filterType === 'window' ? 'rgba(142, 28, 28, 0.05)' : 'transparent', padding: '1.5rem', borderRadius: '15px', textAlign: 'center', transition: 'var(--transition)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>🪟</div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('form.typeWindowName')}</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-light)' }}>{t('tables.typeWindowSub')}</p>
                    </div>
                    <div className="table-type-card" onClick={() => setFilterType('all')} style={{ cursor: 'pointer', border: filterType === 'all' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: filterType === 'all' ? 'rgba(142, 28, 28, 0.05)' : 'transparent', padding: '1.5rem', borderRadius: '15px', textAlign: 'center', transition: 'var(--transition)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>📋</div>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{t('tables.viewAll')}</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-light)' }}>{t('tables.viewAllSub')}</p>
                    </div>
                </div>
            </div>

            {/* Legend & Tip */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '2rem auto' }}>
                <div style={{ flex: 1, minWidth: '300px', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <p style={{ margin: '0 0 1rem 0', fontWeight: '800', color: 'var(--text-dark)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('tables.legend')}</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'inline-block', width: '20px', height: '20px', background: 'var(--primary-color)', borderRadius: '6px', boxShadow: '0 2px 5px rgba(142, 28, 28, 0.2)' }}></span>
                            <strong style={{ fontSize: '0.9rem' }}>{t('tables.available')}</strong>
                        </p>
                        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'inline-block', width: '20px', height: '20px', background: 'var(--text-muted)', borderRadius: '6px', opacity: 0.3 }}></span>
                            <strong style={{ fontSize: '0.9rem' }}>{t('tables.booked')}</strong>
                        </p>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: '300px', padding: '1.5rem', background: 'rgba(142, 28, 28, 0.05)', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <i className="fas fa-lightbulb" style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}></i>
                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--primary-color)', fontSize: '0.95rem' }}>{t('tables.tip')}</p>
                </div>
            </div>



            {/* Table Grid */}
            <div id="tableGrid" className="table-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {filteredTables.map(table => {
                    const styleObj = getTypeStyle(table.type);
                    const isAvailable = table.status === 'available';
                    return (
                        <div
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            style={{
                                background: isAvailable ? 'var(--bg-surface)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${selectedTable === table.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                borderRadius: '25px',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                opacity: isAvailable ? 1 : 0.4,
                                transition: 'var(--transition)',
                                boxShadow: selectedTable === table.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                if (isAvailable && selectedTable !== table.id) {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (isAvailable && selectedTable !== table.id) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{styleObj.icon}</div>
                            <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>{table.name}</h4>
                            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: '600' }}>
                                <i className="fas fa-users" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                                {table.capacity} {t('common.guests', 'Guests')}
                            </p>
                            <div style={{
                                padding: '0.8rem',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                background: isAvailable ? 'var(--primary-color)' : 'transparent',
                                color: isAvailable ? '#fff' : 'var(--text-muted)',
                                border: isAvailable ? 'none' : '1px solid var(--border-color)'
                            }}>
                                {isAvailable ? t('tables.available', 'Available') : t('tables.booked', 'Booked')}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
