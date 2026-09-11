import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Reservations({ predefinedTable }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: '', specialRequests: ''
    });
    const [message, setMessage] = useState('');
    const [availability, setAvailability] = useState({ bookedSlots: {}, maxCapacity: 4 });
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedTableInfo, setSelectedTableInfo] = useState(null);

    // Custom Dropdown Open States
    const [isGuestsOpen, setIsGuestsOpen] = useState(false);
    const [isTableTypeOpen, setIsTableTypeOpen] = useState(false);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    const guestOptions = [
        { value: '1', label: t('form.guest1', '1 Guest'), sub: 'Solo Fine Dining' },
        { value: '2', label: t('form.guest2', '2 Guests'), sub: 'Couple / Pair' },
        { value: '3', label: t('form.guest3', '3 Guests'), sub: 'Small Family' },
        { value: '4', label: t('form.guest4', '4 Guests'), sub: 'Standard Table' },
        { value: '5-6', label: t('form.guest5_6', '5-6 Guests'), sub: 'Family Gathering' },
        { value: '7-10', label: t('form.guest7_10', '7-10 Guests'), sub: 'Large Group' },
        { value: '10+', label: t('form.tenPlus', '10+ Guests (Call us)'), sub: 'Grand Banquet' }
    ];

    const defaultTableTypeOptions = [
        { 
            value: 'intimate', 
            label: t('form.typeIntimate', '🥂 Intimate - Cozy corner for 2-4 guests'), 
            shortLabel: '🥂 Intimate Corner',
            sub: 'Cozy booth & VIP quiet area', 
            realPosition: 'Table 03 & Table 08 (VIP Lounge & Booths)',
            desc: 'Privacy guaranteed, plush leather seating, romantic ambient lighting.'
        },
        { 
            value: 'family', 
            label: t('form.typeFamily', '👨‍👩‍👧‍👦 Family - Spacious table for 4-6 guests'), 
            shortLabel: '👨‍👩‍👧‍👦 Family Dining',
            sub: 'Spacious central hall seating', 
            realPosition: 'Table 04, Table 05 & Table 06 (Main Dining Hall)',
            desc: 'Central main floor position with easy service & buffet access.'
        },
        { 
            value: 'group', 
            label: t('form.typeGroup', '🎉 Group - Large table for 6-10 guests'), 
            shortLabel: '🎉 Royal Group Table',
            sub: 'Large central banquet table', 
            realPosition: 'Table 07 & Table 09 (Royal Court Banquet)',
            desc: 'Elevated central seating area designed for celebration feasts.'
        },
        { 
            value: 'party', 
            label: t('form.typeParty', '🎊 Party - Multiple tables for 10+ guests'), 
            shortLabel: '🎊 Party Hall & Terrace',
            sub: 'Multi-table setup / Al Fresco', 
            realPosition: 'Table 10 & Table 11 (Grand Terrace & Al Fresco)',
            desc: 'Flexible layout with dedicated personal server & speaker zone.'
        },
        { 
            value: 'window', 
            label: t('form.typeWindow', '🪟 Window Seat - Scenic view for any group'), 
            shortLabel: '🪟 Scenic Window Seat',
            sub: 'Panoramic city glass wall view', 
            realPosition: 'Table 01 & Table 02 (Glass Frontage View)',
            desc: 'Prime street view tables overlooking the main promenade.'
        }
    ];

    const [tableTypeOptions, setTableTypeOptions] = useState(defaultTableTypeOptions);

    useEffect(() => {
        const fetchSystemTableTypes = async () => {
            try {
                const res = await axios.get(`${API_URL}/table-types`);
                if (res.data?.success && Array.isArray(res.data.tableTypes) && res.data.tableTypes.length > 0) {
                    setTableTypeOptions(res.data.tableTypes);
                }
            } catch (err) {
                console.warn('System table types API fallback:', err);
            }
        };
        fetchSystemTableTypes();
    }, [API_URL]);

    const mapTableType = (type) => {
        if (!type) return '';
        const t = type.toLowerCase();
        if (t.includes('window')) return 'window';
        if (t.includes('family')) return 'family';
        if (t.includes('vip') || t.includes('intimate')) return 'intimate';
        if (t.includes('party')) return 'party';
        return 'group';
    };

    useEffect(() => {
        const handleQuickBookEvent = (e) => {
            if (e.detail) {
                setFormData(prev => ({
                    ...prev,
                    date: e.detail.date || prev.date,
                    time: e.detail.time || prev.time,
                    guests: e.detail.guests || prev.guests,
                    tableType: e.detail.tableType || prev.tableType
                }));
            }
        };
        window.addEventListener('khaliya-quick-book', handleQuickBookEvent);

        const aiMatch = localStorage.getItem('khaliya_ai_match');
        if (aiMatch) {
            setFormData(prev => ({ ...prev, specialRequests: `AI Suggestion: ${aiMatch}` }));
            localStorage.removeItem('khaliya_ai_match');
        }

        const storedUserStr = localStorage.getItem('khaliya_native_user');
        if (storedUserStr) {
            try {
                const user = JSON.parse(storedUserStr);
                setFormData(prev => ({ 
                    ...prev, 
                    name: user.name !== 'Khaliya Member' && user.name !== 'Guest' ? user.name : prev.name, 
                    email: user.email || prev.email,
                    phone: user.phone || prev.phone
                }));
            } catch (e) {}
        }

        if (predefinedTable) {
            const mapped = mapTableType(predefinedTable);
            const guestsMap = {
                'Window 2-Seater': '2',
                'Main Dining 4-Seater': '4',
                'VIP Booth': '2',
                'Large Family Table': '7-10',
                'Outdoor Patio': '4',
                'window': '2',
                'family': '5-6',
                'intimate': '2',
                'group': '7-10',
                'party': '10+',
                'regular': '4'
            };
            setFormData(prev => ({ 
                ...prev, 
                tableType: mapped,
                guests: guestsMap[predefinedTable] || guestsMap[mapped] || prev.guests 
            }));

            const labels = ['Window 2-Seater', 'Main Dining 4-Seater', 'VIP Booth', 'Large Family Table', 'Outdoor Patio'];
            if (labels.includes(predefinedTable)) {
                const idMap = {
                    'Window 2-Seater': 'T01',
                    'Main Dining 4-Seater': 'T04',
                    'VIP Booth': 'T03',
                    'Large Family Table': 'T07',
                    'Outdoor Patio': 'T10'
                };
                setSelectedTableInfo({ id: idMap[predefinedTable], type: predefinedTable });
            }
        }

        return () => {
            window.removeEventListener('khaliya-quick-book', handleQuickBookEvent);
        };
    }, [predefinedTable]);

    useEffect(() => {
        if (formData.date && formData.tableType) {
            fetchAvailability();
        }
    }, [formData.date, formData.tableType]);

    const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        try {
            const res = await axios.get(`${API_URL}/bookings/availability`, {
                params: { date: formData.date, tableType: formData.tableType }
            });
            setAvailability(res.data);
        } catch (err) {
            console.error('Failed to fetch availability', err);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const isSlotFull = () => {
        if (!formData.time || !availability.bookedSlots) return false;
        const currentBookings = availability.bookedSlots[formData.time] || 0;
        return currentBookings >= availability.maxCapacity;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSlotFull()) {
            setMessage('Selected slot is fully booked. Please select a different slot.');
            return;
        }

        const trimmedPhone = (formData.phone || '').trim();
        if (!trimmedPhone) {
            setMessage('Please enter a contact phone number for this reservation.');
            return;
        }

        const phonePattern = /^\+?[0-9\s\-()]{7,15}$/;
        if (!phonePattern.test(trimmedPhone)) {
            setMessage('Please enter a valid contact phone number (7 to 15 digits).');
            return;
        }

        const payload = { ...formData, phone: trimmedPhone, source: 'Website' };
        axios.post(`${API_URL}/bookings`, payload)
            .then(res => {
                setMessage(t('msg.bookingConfirmed') || 'Royal reservation confirmed! We look forward to hosting you.');
                setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: '', specialRequests: '' });
                setSelectedTableInfo(null);
                setTimeout(() => setMessage(''), 6000);
            })
            .catch(err => {
                console.error(err);
                const errMsg = err.response?.data?.message || t('msg.bookingError') || 'Error saving booking';
                setMessage(errMsg);
            });
    };

    const activeGuestObj = guestOptions.find(o => o.value === formData.guests);
    const activeTableTypeObj = tableTypeOptions.find(o => o.value === formData.tableType);

    return (
        <section id="reservations" style={{ padding: '5rem 1.5rem', background: 'var(--bg-body)' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
                <span className="subtitle" style={{ letterSpacing: '4px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t('reservations.subtitle', 'Regal Dining Experience')}
                </span>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 50%, #B8860B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginTop: '0.4rem',
                    marginBottom: '0.8rem'
                }}>
                    {t('reservations.title', 'Reserve Your Table')}
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.75)', marginBottom: '3rem', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
                    {t('reservations.sub', 'Select from real dining tables (T01 - T11) configured live in our system for an unparalleled restaurant experience.')}
                </p>

                {/* Luxury Glassmorphic Form Card */}
                <form onSubmit={handleSubmit} style={{
                    background: 'linear-gradient(145deg, rgba(26, 22, 17, 0.95), rgba(15, 12, 9, 0.98))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 235, 175, 0.2)',
                    textAlign: 'left'
                }}>
                    {/* Pre-Selected Visual Table Banner if present */}
                    <AnimatePresence>
                        {selectedTableInfo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    background: 'rgba(212, 175, 55, 0.15)',
                                    padding: '14px 20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 215, 0, 0.4)',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#FFF5C0',
                                    fontWeight: '700',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <i className="fas fa-map-marker-alt" style={{ color: '#FFD700', fontSize: '1.1rem' }}></i>
                                <span style={{ flex: 1 }}>
                                    {t('reservations.selectedTable', 'Interactive Seating Reserved:')} <strong style={{ color: '#FFD700' }}>{selectedTableInfo.type} ({selectedTableInfo.id})</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedTableInfo(null); setFormData(prev => ({ ...prev, tableType: '', guests: '' })); }}
                                    style={{ background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer', fontSize: '1.1rem', padding: '0 5px' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Grid 1: Name & Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <label style={{ display: 'block' }}>
                            <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fas fa-user" style={{ fontSize: '0.75rem' }}></i> {t('form.name')}
                            </span>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t('form.namePlaceholder', 'Enter your full name')}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    marginTop: '0.5rem',
                                    background: 'rgba(15, 12, 9, 0.8)',
                                    color: '#FFF',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                            />
                        </label>

                        <label style={{ display: 'block' }}>
                            <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fas fa-phone-alt" style={{ fontSize: '0.75rem' }}></i> {t('form.phone')}
                            </span>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder={t('form.phonePlaceholder', '+91 XXXXXXXXXX')}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    marginTop: '0.5rem',
                                    background: 'rgba(15, 12, 9, 0.8)',
                                    color: '#FFF',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                            />
                        </label>
                    </div>

                    {/* Email Input */}
                    <label style={{ display: 'block', marginTop: '1.2rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-envelope" style={{ fontSize: '0.75rem' }}></i> {t('form.email')}
                        </span>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('form.emailPlaceholder', 'your.email@example.com')}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px',
                                marginTop: '0.5rem',
                                background: 'rgba(15, 12, 9, 0.8)',
                                color: '#FFF',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                        />
                    </label>

                    {/* Date & Time Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.2rem' }}>
                        <label style={{ display: 'block' }}>
                            <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fas fa-calendar-alt" style={{ fontSize: '0.75rem' }}></i> {t('form.date')}
                            </span>
                            <input
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    marginTop: '0.5rem',
                                    background: 'rgba(15, 12, 9, 0.8)',
                                    color: '#FFF',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                            />
                        </label>

                        <label style={{ display: 'block' }}>
                            <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fas fa-clock" style={{ fontSize: '0.75rem' }}></i> {t('form.time')}
                            </span>
                            <input
                                name="time"
                                type="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: isSlotFull() ? '1.5px solid #FF4500' : '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    marginTop: '0.5rem',
                                    background: 'rgba(15, 12, 9, 0.8)',
                                    color: '#FFF',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                                onBlur={(e) => e.target.style.borderColor = isSlotFull() ? '#FF4500' : 'rgba(212, 175, 55, 0.3)'}
                            />
                            {isSlotFull() && (
                                <small style={{ color: '#FF4500', marginTop: '0.4rem', display: 'block', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    ⚠️ Slot fully booked for selected seating type.
                                </small>
                            )}
                        </label>
                    </div>

                    {/* DYNAMIC SYSTEM DROPDOWNS: Number of Guests & System Table Type */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.4rem' }}>
                        
                        {/* Custom Dropdown 1: Number of Guests */}
                        <div style={{ position: 'relative' }}>
                            <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                                <i className="fas fa-users" style={{ fontSize: '0.75rem' }}></i> {t('form.guests')}
                            </span>
                            
                            <button
                                type="button"
                                onClick={() => { setIsGuestsOpen(!isGuestsOpen); setIsTableTypeOpen(false); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'space-between',
                                    padding: '12px 16px',
                                    background: 'rgba(15, 12, 9, 0.8)',
                                    border: isGuestsOpen ? '1px solid #FFD700' : '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    color: activeGuestObj ? '#FFF5C0' : 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isGuestsOpen ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none'
                                }}
                            >
                                <span>{activeGuestObj ? `${activeGuestObj.label} (${activeGuestObj.sub})` : t('form.selectGuests', 'Select number of guests')}</span>
                                <i className="fas fa-chevron-down" style={{
                                    color: '#D4AF37',
                                    fontSize: '0.8rem',
                                    transition: 'transform 0.3s ease',
                                    transform: isGuestsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}></i>
                            </button>

                            <AnimatePresence>
                                {isGuestsOpen && (
                                    <>
                                        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setIsGuestsOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 6px)',
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(20, 16, 12, 0.98)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                                borderRadius: '14px',
                                                padding: '6px',
                                                boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.15)',
                                                zIndex: 100,
                                                maxHeight: '260px',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            {guestOptions.map(opt => {
                                                const isSel = formData.guests === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, guests: opt.value });
                                                            setIsGuestsOpen(false);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justify: 'space-between',
                                                            padding: '10px 14px',
                                                            background: isSel ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            color: isSel ? '#FFD700' : 'rgba(255, 255, 255, 0.85)',
                                                            fontSize: '0.88rem',
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            marginBottom: '2px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)'; }}
                                                        onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <div>
                                                            <div style={{ fontWeight: isSel ? '700' : '500' }}>{opt.label}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>{opt.sub}</div>
                                                        </div>
                                                        {isSel && <i className="fas fa-check" style={{ color: '#FFD700', fontSize: '0.85rem' }}></i>}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Custom Dropdown 2: Dynamic System Table Types */}
                        <div style={{ position: 'relative' }}>
                            <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                                <i className="fas fa-chair" style={{ fontSize: '0.75rem' }}></i> {t('form.tableType')}
                            </span>

                            <button
                                type="button"
                                onClick={() => { setIsTableTypeOpen(!isTableTypeOpen); setIsGuestsOpen(false); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'space-between',
                                    padding: '12px 16px',
                                    background: 'rgba(15, 12, 9, 0.8)',
                                    border: isTableTypeOpen ? '1px solid #FFD700' : '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    color: activeTableTypeObj ? '#FFF5C0' : 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isTableTypeOpen ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none'
                                }}
                            >
                                <span>{activeTableTypeObj ? activeTableTypeObj.shortLabel : t('form.selectTableType', 'Select table type')}</span>
                                <i className="fas fa-chevron-down" style={{
                                    color: '#D4AF37',
                                    fontSize: '0.8rem',
                                    transition: 'transform 0.3s ease',
                                    transform: isTableTypeOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}></i>
                            </button>

                            <AnimatePresence>
                                {isTableTypeOpen && (
                                    <>
                                        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setIsTableTypeOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 6px)',
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(20, 16, 12, 0.98)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                                borderRadius: '14px',
                                                padding: '6px',
                                                boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.15)',
                                                zIndex: 100,
                                                maxHeight: '300px',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            {tableTypeOptions.map(opt => {
                                                const isSel = formData.tableType === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, tableType: opt.value });
                                                            setIsTableTypeOpen(false);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justify: 'space-between',
                                                            padding: '10px 14px',
                                                            background: isSel ? 'rgba(212, 175, 55, 0.18)' : 'transparent',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            color: isSel ? '#FFD700' : 'rgba(255, 255, 255, 0.85)',
                                                            fontSize: '0.88rem',
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            marginBottom: '4px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)'; }}
                                                        onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <div>
                                                            <div style={{ fontWeight: isSel ? '700' : '600' }}>{opt.label}</div>
                                                            <div style={{ fontSize: '0.74rem', color: '#D4AF37', marginTop: '2px' }}>
                                                                📍 {opt.realPosition}
                                                            </div>
                                                        </div>
                                                        {isSel && <i className="fas fa-check" style={{ color: '#FFD700', fontSize: '0.85rem' }}></i>}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* REAL RESTAURANT POSITION MATCHING INFO CARD */}
                    {activeTableTypeObj && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1.5rem',
                                background: 'rgba(212, 175, 55, 0.08)',
                                border: '1px solid rgba(212, 175, 55, 0.25)',
                                borderRadius: '16px',
                                padding: '1.2rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '14px'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                color: '#0d0d0d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                flexShrink: 0,
                                boxShadow: '0 0 12px rgba(255, 215, 0, 0.3)'
                            }}>
                                <i className="fas fa-compass"></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                    <h4 style={{ color: '#FFF5C0', margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>
                                        System Mapped Tables: {activeTableTypeObj.realPosition}
                                    </h4>
                                    <Link
                                        to="/tables"
                                        style={{
                                            fontSize: '0.78rem',
                                            color: '#FFD700',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            borderBottom: '1px dashed #FFD700'
                                        }}
                                    >
                                        View on 3D Floorplan <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                                    </Link>
                                </div>
                                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '4px 0 0 0', fontSize: '0.82rem', lineHeight: '1.5' }}>
                                    {activeTableTypeObj.desc}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Special Requests */}
                    <label style={{ display: 'block', marginTop: '1.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-comment-dots" style={{ fontSize: '0.75rem' }}></i> Special Requests / Occasion (Optional)
                        </span>
                        <textarea
                            name="specialRequests"
                            value={formData.specialRequests}
                            onChange={handleChange}
                            placeholder="Birthday, anniversary, AI flavor preferences, or dietary notes..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px',
                                marginTop: '0.5rem',
                                background: 'rgba(15, 12, 9, 0.8)',
                                color: '#FFF',
                                fontSize: '0.92rem',
                                outline: 'none',
                                minHeight: '85px',
                                resize: 'vertical'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                        />
                    </label>

                    {/* Submission Button */}
                    <motion.button
                        type="submit"
                        disabled={isSlotFull()}
                        whileHover={{ scale: isSlotFull() ? 1 : 1.02 }}
                        whileTap={{ scale: isSlotFull() ? 1 : 0.98 }}
                        style={{
                            width: '100%',
                            marginTop: '2rem',
                            padding: '16px',
                            background: isSlotFull() ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 50%, #B8860B 100%)',
                            color: '#0d0d0d',
                            border: 'none',
                            borderRadius: '30px',
                            fontWeight: '800',
                            fontSize: '1.02rem',
                            letterSpacing: '1px',
                            cursor: isSlotFull() ? 'not-allowed' : 'pointer',
                            boxShadow: isSlotFull() ? 'none' : '0 8px 30px rgba(212, 175, 55, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isSlotFull() ? 'Selected Slot Fully Booked' : t('form.confirmButton', 'Confirm Reservation')}
                    </motion.button>

                    {message && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            background: message.includes('Error') || message.includes('booked') ? 'rgba(255, 69, 0, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                            border: message.includes('Error') || message.includes('booked') ? '1px solid #FF4500' : '1px solid #2ECC71',
                            color: message.includes('Error') || message.includes('booked') ? '#FF6B6B' : '#2ECC71',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.92rem'
                        }}>
                            {message}
                        </div>
                    )}
                    <p style={{ marginTop: '1.2rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                        {t('reservations.confirmNote', 'We will confirm your reservation within 2 hours via SMS/email.')}
                    </p>
                </form>
            </div>
        </section>
    );
}
