import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Reservations({ predefinedTable }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: ''
    });
    const [availableTables, setAvailableTables] = useState(null);

    useEffect(() => {
        if (predefinedTable) {
            setFormData(prev => ({ ...prev, tableType: predefinedTable }));
        }
    }, [predefinedTable]);

    useEffect(() => {
        if (formData.date && formData.time) {
            // Mock real-time availability: deterministic based on date + time string
            const hash = (formData.date + formData.time).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const tablesLeft = (hash % 5) + 1; // Randomly yields 1 to 5 tables
            setAvailableTables(tablesLeft);
        } else {
            setAvailableTables(null);
        }
    }, [formData.date, formData.time]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        // Guest count logic: Auto-suggest table type
        if (name === 'guests') {
            if (value === '1' || value === '2') newFormData.tableType = 'intimate';
            else if (value === '3' || value === '4') newFormData.tableType = 'family';
            else if (value === '5-6') newFormData.tableType = 'group';
            else if (value === '7-10' || value === '10+') newFormData.tableType = 'party';
        }

        setFormData(newFormData);
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/api/bookings`, formData)
            .then(res => {
                import('sweetalert2').then(({ default: Swal }) => {
                    Swal.fire({
                        title: t('msg.bookingConfirmed') || 'Booking Confirmed!',
                        text: `Thank you ${formData.name}. Your table is reserved for ${formData.date} at ${formData.time}. You will receive an SMS confirmation shortly.`,
                        icon: 'success',
                        confirmButtonColor: 'var(--accent-color)'
                    });
                }).catch(() => {
                    alert(t('msg.bookingConfirmed') || 'Booking Confirmed!');
                });

                setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '', tableType: '' });
                setAvailableTables(null);
            })
            .catch(err => {
                console.error(err);
                import('sweetalert2').then(({ default: Swal }) => {
                    Swal.fire({
                        title: 'Oops!',
                        text: t('msg.bookingError') || 'Error saving booking. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#e53935'
                    });
                }).catch(() => {
                    alert(t('msg.bookingError') || 'Error saving booking');
                });
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
                    <select name="time" value={formData.time} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}>
                        <option value="">{t('form.selectTime') || 'Select a time slot'}</option>
                        <optgroup label="Lunch">
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                        </optgroup>
                        <optgroup label="Dinner">
                            <option value="19:00">7:00 PM</option>
                            <option value="20:00">8:00 PM</option>
                            <option value="21:00">9:00 PM</option>
                            <option value="22:00">10:00 PM</option>
                        </optgroup>
                    </select>
                    {availableTables !== null && formData.date && (
                        <div style={{ marginTop: '0.8rem', padding: '0.5rem', borderRadius: '4px', backgroundColor: availableTables < 3 ? '#ffebee' : '#e8f5e9', fontSize: '0.9rem', color: availableTables < 3 ? '#c62828' : '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`fas ${availableTables < 3 ? 'fa-fire' : 'fa-check-circle'}`}></i>
                            <span><strong>{availableTables} tables left</strong> for this time slot!</span>
                        </div>
                    )}
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

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>{t('reservations.confirmNote')}</p>
            </form>
        </section>
    );
}
