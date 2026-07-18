import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reservations({ predefinedTable }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: '', specialRequests: ''
    });
    const [message, setMessage] = useState('');
    const [availability, setAvailability] = useState({ bookedSlots: {}, maxCapacity: 4 });
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const [selectedTableInfo, setSelectedTableInfo] = useState(null);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    const mapTableType = (type) => {
        if (!type) return '';
        const t = type.toLowerCase();
        if (t.includes('window')) return 'window';
        if (t.includes('family')) return 'family';
        if (t.includes('vip') || t.includes('intimate')) return 'intimate';
        if (t.includes('party')) return 'party';
        return 'group'; // default for dining, regular, patio, group
    };

    useEffect(() => {
        // AI Suggestion pre-fill
        const aiMatch = localStorage.getItem('khaliya_ai_match');
        if (aiMatch) {
            setFormData(prev => ({ ...prev, specialRequests: `AI Suggestion: ${aiMatch}` }));
            localStorage.removeItem('khaliya_ai_match');
        }

        // User profile pre-fill
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
            } catch (e) {
                console.warn('Failed to parse user for reservation pre-fill');
            }
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

            // If it's a visual floorplan table name, display selection alert
            const labels = ['Window 2-Seater', 'Main Dining 4-Seater', 'VIP Booth', 'Large Family Table', 'Outdoor Patio'];
            if (labels.includes(predefinedTable)) {
                const idMap = {
                    'Window 2-Seater': 'T1',
                    'Main Dining 4-Seater': 'T2',
                    'VIP Booth': 'T3',
                    'Large Family Table': 'T4',
                    'Outdoor Patio': 'T5'
                };
                setSelectedTableInfo({ id: idMap[predefinedTable], type: predefinedTable });
            }
        }
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

    const handleTableSelect = (type, id) => {
        const guestsMap = {
            'Window 2-Seater': '2',
            'Main Dining 4-Seater': '4',
            'VIP Booth': '2',
            'Large Family Table': '7-10',
            'Outdoor Patio': '4'
        };
        
        setFormData(prev => ({
            ...prev,
            tableType: type.toLowerCase().includes('window') ? 'window' : 
                       type.toLowerCase().includes('family') ? 'family' : 
                       type.toLowerCase().includes('vip') ? 'intimate' : 'group',
            guests: guestsMap[type] || ''
        }));
        setSelectedTableInfo({ id, type });
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
                setMessage(t('msg.bookingConfirmed') || 'Booking saved!');
                setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: '', specialRequests: '' });
                setSelectedTableInfo(null);
                setTimeout(() => setMessage(''), 5000);
            })
            .catch(err => {
                console.error(err);
                const errMsg = err.response?.data?.message || t('msg.bookingError') || 'Error saving booking';
                setMessage(errMsg);
            });
    };

    return (
        <section id="reservations" style={{ padding: '6rem 1.5rem', background: 'var(--bg-body)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>{t('reservations.title')}</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '4rem', fontSize: '1.1rem' }}>{t('reservations.sub', 'Secure one of our 20 exclusive tables for an unforgettable culinary experience.')}</p>
                
                
                <form onSubmit={handleSubmit} style={{ 
                    background: 'var(--bg-surface)', 
                    padding: '3rem', 
                    borderRadius: 'var(--radius-lg)', 
                    maxWidth: '600px', 
                    margin: '0 auto',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'left'
                }}>
                    <AnimatePresence>
                        {selectedTableInfo && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ 
                                    background: 'rgba(218, 165, 32, 0.1)', 
                                    padding: '15px 20px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--accent-color)',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: 'var(--primary-color)',
                                    fontWeight: '800',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <i className="fas fa-check-circle"></i>
                                <span style={{ flex: 1 }}>{t('reservations.selectedTable', 'Space Reserved:')} {selectedTableInfo.type} ({selectedTableInfo.id})</span>
                                <button 
                                    type="button"
                                    onClick={() => { setSelectedTableInfo(null); setFormData(prev => ({ ...prev, tableType: '', guests: '' })); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        <label style={{ display: 'block' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.name')}</strong>
                            <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder={t('form.namePlaceholder')} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }} />
                        </label>
                        <label style={{ display: 'block' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.phone')}</strong>
                            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder={t('form.phonePlaceholder')} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }} />
                        </label>
                    </div>

                    <label style={{ display: 'block', marginTop: '1.5rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.email')}</strong>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t('form.emailPlaceholder')} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }} />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <label style={{ display: 'block' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.date')}</strong>
                            <input name="date" type="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }} />
                            <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block', fontSize: '0.75rem' }}>{t('form.dateHelp')}</small>
                        </label>
                        <label style={{ display: 'block' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.time')}</strong>
                            <input 
                                name="time" 
                                type="time" 
                                value={formData.time} 
                                onChange={handleChange} 
                                required 
                                style={{ width: '100%', padding: '1rem', border: isSlotFull() ? '1.5px solid #ff9800' : '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }} 
                            />
                            {isSlotFull() ? (
                                <small style={{ color: '#ff9800', marginTop: '0.5rem', display: 'block', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    ⚠️ This slot is fully booked for the selected table type.
                                </small>
                            ) : (
                                <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block', fontSize: '0.75rem' }}>Availability will be confirmed upon reservation</small>
                            )}
                        </label>
                    </div>

                    <label style={{ display: 'block', marginTop: '1.5rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Special Requests / Occasion (Optional)</strong>
                        <textarea 
                            name="specialRequests" 
                            value={formData.specialRequests} 
                            onChange={handleChange} 
                            placeholder="Birthday, anniversary, AI recommendations, or dietary needs..." 
                            style={{ 
                                width: '100%', padding: '1rem', border: '1px solid var(--border-color)', 
                                borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', 
                                color: 'var(--text-dark)', minHeight: '100px', resize: 'vertical' 
                            }} 
                        />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <label style={{ display: 'block' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.guests')}</strong>
                            <select name="guests" value={formData.guests} onChange={handleChange} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }}>
                                <option value="">{t('form.selectGuests')}</option>
                                <option value="1">{t('form.guest1')}</option>
                                <option value="2">{t('form.guest2')}</option>
                                <option value="3">{t('form.guest3')}</option>
                                <option value="4">{t('form.guest4')}</option>
                                <option value="5-6">{t('form.guest5_6')}</option>
                                <option value="7-10">{t('form.guest7_10')}</option>
                                <option value="10+">{t('form.tenPlus')}</option>
                            </select>
                        </label>
                        <label style={{ display: 'block' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('form.tableType')}</strong>
                            <select name="tableType" value={formData.tableType} onChange={handleChange} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }}>
                                <option value="">{t('form.selectTableType')}</option>
                                <option value="intimate">{t('form.typeIntimate')}</option>
                                <option value="family">{t('form.typeFamily')}</option>
                                <option value="group">{t('form.typeGroup')}</option>
                                <option value="party">{t('form.typeParty')}</option>
                                <option value="window">{t('form.typeWindow')}</option>
                            </select>
                        </label>
                    </div>

                    <button type="submit" disabled={isSlotFull()} className="btn btn-primary" style={{ width: '100%', marginTop: '2.5rem', padding: '18px', opacity: isSlotFull() ? 0.5 : 1 }}>
                        {isSlotFull() ? 'Fully Booked' : t('form.confirmButton')}
                    </button>
                    
                    {message && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', textAlign: 'center', fontWeight: 'bold' }}>
                            {message}
                        </div>
                    )}
                    <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('reservations.confirmNote')}</p>
                </form>
            </div>
        </section>
    );
}
