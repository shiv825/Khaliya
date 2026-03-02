import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Reservations({ predefinedTable }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (predefinedTable) {
            setFormData(prev => ({ ...prev, tableType: predefinedTable }));
        }
    }, [predefinedTable]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/bookings', formData)
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
        <section id="reservations">
            <h2>{t('reservations.title')}</h2>
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <label style={{ display: 'block', marginBottom: '1rem' }}>
                    <strong>{t('form.name')}</strong><br />
                    <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder={t('form.namePlaceholder')} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1rem' }}>
                    <strong>{t('form.phone')}</strong><br />
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder={t('form.phonePlaceholder')} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1rem' }}>
                    <strong>{t('form.email')}</strong><br />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t('form.emailPlaceholder')} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1rem' }}>
                    <strong>{t('form.date')}</strong><br />
                    <input name="date" type="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }} />
                    <small style={{ color: '#999', marginTop: '0.3rem', display: 'block' }}>{t('form.dateHelp')}</small>
                </label>
                <label style={{ display: 'block', marginBottom: '1rem' }}>
                    <strong>{t('form.time')}</strong><br />
                    <input name="time" type="time" value={formData.time} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                    <strong>{t('form.guests')}</strong><br />
                    <select name="guests" value={formData.guests} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}>
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
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                    <strong>{t('form.tableType')}</strong><br />
                    <select name="tableType" value={formData.tableType} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}>
                        <option value="">{t('form.selectTableType')}</option>
                        <option value="intimate">{t('form.typeIntimate')}</option>
                        <option value="family">{t('form.typeFamily')}</option>
                        <option value="group">{t('form.typeGroup')}</option>
                        <option value="party">{t('form.typeParty')}</option>
                        <option value="window">{t('form.typeWindow')}</option>
                    </select>
                </label>

                <button type="submit" className="btn" style={{ width: '100%' }}>{t('form.confirmButton')}</button>
                {message && (
                    <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '6px', background: '#e8f5e9', color: '#2e7d32' }}>
                        {message}
                    </div>
                )}
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>{t('reservations.confirmNote')}</p>
            </form>
        </section>
    );
}
