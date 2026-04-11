import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import InteractiveFloorplan from './InteractiveFloorplan';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reservations({ predefinedTable }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: ''
    });
    const [message, setMessage] = useState('');

    const [selectedTableInfo, setSelectedTableInfo] = useState(null);

    useEffect(() => {
        if (predefinedTable) {
            setFormData(prev => ({ ...prev, tableType: predefinedTable }));
        }
    }, [predefinedTable]);

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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/api/bookings`, formData)
            .then(res => {
                setMessage(t('msg.bookingConfirmed') || 'Booking saved!');
                setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: '' });
                setTimeout(() => setMessage(''), 5000);
            })
            .catch(err => {
                console.error(err);
                setMessage(t('msg.bookingError') || 'Error saving booking');
            });
    };

    return (
        <section id="reservations" style={{ padding: '6rem 1.5rem', background: 'var(--bg-body)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>{t('reservations.title')}</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '4rem', fontSize: '1.1rem' }}>{t('reservations.sub', 'Secure your table for an unforgettable culinary experience.')}</p>
                
                <div style={{ marginBottom: '4rem' }}>
                    <InteractiveFloorplan onSelectTable={(type, id) => handleTableSelect(type, id)} />
                </div>
                
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
                                {t('reservations.selectedTable', 'Space Reserved:')} {selectedTableInfo.type} ({selectedTableInfo.id})
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
                            <input name="time" type="time" value={formData.time} onChange={handleChange} required style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '0.5rem', background: 'var(--bg-body)', color: 'var(--text-dark)' }} />
                        </label>
                    </div>

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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2.5rem', padding: '18px' }}>{t('form.confirmButton')}</button>
                    
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
