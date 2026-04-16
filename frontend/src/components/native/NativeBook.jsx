import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveFloorplan from '../InteractiveFloorplan';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';

export default function NativeBook() {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ date: '', time: '', guests: 2, tableType: '', specialRequests: '' });
    const [availability, setAvailability] = useState({ bookedSlots: {}, maxCapacity: 4 });
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api';

    const fetchAvailability = async (date, tableType) => {
        if (!date || !tableType) return;
        setIsLoadingSlots(true);
        try {
            const res = await axios.get(`${API_URL}/bookings/availability`, {
                params: { date, tableType }
            });
            setAvailability(res.data);
        } catch (err) {
            console.error('Failed to fetch availability', err);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && formData.date && formData.tableType) {
            fetchAvailability(formData.date, formData.tableType);
        }
        setStep(prev => Math.min(prev + 1, 3));
    };
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="wizard-step"
                    >
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.6rem', marginBottom: '20px' }}>{t('res.personalTitle')}</h3>
                        <div className="form-group-native" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: '700', fontSize: '0.9rem' }}>{t('res.date')}</label>
                            <input 
                                type="date" 
                                value={formData.date} 
                                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                                className="native-input"
                                style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)', fontWeight: '600' }}
                            />
                        </div>
                        <div className="form-group-native" style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: '700', fontSize: '0.9rem' }}>{t('res.time')}</label>
                            <div className="time-slot-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                {['11:00', '13:00', '18:00', '19:00', '20:00', '21:00'].map(slot => (
                                    <button 
                                        key={slot}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, time: slot })}
                                        className={`time-slot-btn ${formData.time === slot ? 'selected' : ''}`}
                                        style={{ height: '60px' }}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                            <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>Availability will be confirmed in the next step</small>
                        </div>
                        <motion.button 
                            whileTap={{ scale: 0.95 }} 
                            className="zomato-btn-main" 
                            onClick={handleNext} 
                            disabled={!formData.date || !formData.time}
                            style={{ opacity: (!formData.date || !formData.time) ? 0.5 : 1 }}
                        >
                            {t('res.selectTitle')} <i className="fas fa-arrow-right" style={{ marginLeft: '10px' }}></i>
                        </motion.button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="wizard-step"
                    >
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.6rem', marginBottom: '20px' }}>{t('res.details')}</h3>
                        <div className="form-group-native">
                            <label style={{ display: 'block', marginBottom: '15px', color: 'var(--text-light)', fontWeight: '700' }}>{t('res.guests')}</label>
                            <div className="stepper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', background: 'var(--bg-surface)', padding: '15px', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }} 
                                    className="stepper-btn" 
                                    onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                                    style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid var(--primary-color)', background: 'none', color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: '900' }}
                                >—</motion.button>
                                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)', minWidth: '40px', textAlign: 'center' }}>{formData.guests}</span>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }} 
                                    className="stepper-btn" 
                                    onClick={() => setFormData({ ...formData, guests: Math.min(20, formData.guests + 1) })}
                                    style={{ width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: 'var(--primary-color)', color: '#FFF', fontSize: '1.5rem', fontWeight: '900' }}
                                >+</motion.button>
                            </div>
                        </div>
                        <div className="form-group-native table-types" style={{ marginTop: '20px' }}>
                            <label style={{ marginBottom: '20px', display: 'block', fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: '800' }}>Select Seating Preference</label>
                            
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {[
                                    { id: 'intimate', label: 'Intimate Table', sub: 'Perfect for couples', icon: '🥂' },
                                    { id: 'family', label: 'Family Booth', sub: 'Cozy for families', icon: '👨‍👩‍👧‍👦' },
                                    { id: 'window', label: 'Window View', sub: 'Scenic city views', icon: '🪟' },
                                    { id: 'group', label: 'Group Table', sub: 'Great for friends', icon: '🎉' },
                                    { id: 'party', label: 'Party Hall', sub: 'Grand celebrations', icon: '🎊' }
                                ].map((type) => (
                                    <motion.div
                                        key={type.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, tableType: type.id })}
                                        style={{
                                            padding: '18px',
                                            borderRadius: '20px',
                                            background: formData.tableType === type.id ? 'var(--bg-surface)' : 'rgba(142, 28, 28, 0.02)',
                                            border: `2px solid ${formData.tableType === type.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ 
                                            fontSize: '1.5rem', width: '50px', height: '50px', 
                                            borderRadius: '12px', background: formData.tableType === type.id ? 'var(--primary-color)' : 'var(--bg-surface)',
                                            color: formData.tableType === type.id ? '#FFF' : 'var(--primary-color)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {type.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '800', color: 'var(--text-dark)', fontSize: '1rem' }}>{type.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{type.sub}</div>
                                        </div>
                                        {formData.tableType === type.id && (
                                            <i className="fas fa-check-circle" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="wizard-actions" style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                className="native-btn-secondary" 
                                onClick={handlePrev}
                                style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-light)', fontWeight: '800' }}
                            >{t('common.prev') || "Back"}</motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                className="zomato-btn-main" 
                                onClick={handleNext} 
                                disabled={!formData.tableType}
                                style={{ flex: 2, margin: 0, opacity: !formData.tableType ? 0.5 : 1 }}
                            >
                                {t('common.next') || "Next"}
                            </motion.button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="wizard-step"
                    >
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.6rem', marginBottom: '20px' }}>Confirm Reservation</h3>
                        <div className="booking-summary" style={{ background: 'var(--bg-surface)', borderRadius: '25px', padding: '25px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: '30px' }}>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}><i className="far fa-calendar-alt" style={{ marginRight: '8px' }}></i> Date</span>
                                <strong style={{ color: 'var(--text-dark)', fontWeight: '800' }}>{formData.date}</strong>
                            </div>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}><i className="far fa-clock" style={{ marginRight: '8px' }}></i> Time</span>
                                <strong style={{ color: 'var(--text-dark)', fontWeight: '800' }}>{formData.time}</strong>
                            </div>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}><i className="fas fa-users" style={{ marginRight: '8px' }}></i> Guests</span>
                                <strong style={{ color: 'var(--text-dark)', fontWeight: '800' }}>{formData.guests} People</strong>
                            </div>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}><i className="fas fa-chair" style={{ marginRight: '8px' }}></i> Seating</span>
                                <strong style={{ color: 'var(--primary-color)', fontWeight: '900' }}>{formData.tableType}</strong>
                            </div>
                            <div className="summary-row" style={{ padding: '15px 0' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontSize: '0.85rem' }}>Special Requests</label>
                                <textarea 
                                    placeholder="Add notes for the host..."
                                    value={formData.specialRequests}
                                    onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', minHeight: '80px' }}
                                />
                            </div>
                        </div>
                        <div className="wizard-actions" style={{ display: 'flex', gap: '15px' }}>
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                className="native-btn-secondary" 
                                onClick={handlePrev}
                                style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-light)', fontWeight: '800' }}
                            >Edit</motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                className="zomato-btn-main" 
                                onClick={() => {
                                    const storedUser = localStorage.getItem('khaliya_native_user');
                                    const user = storedUser ? JSON.parse(storedUser) : { name: 'PWA Guest' };
                                    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api';
                                    
                                    const payload = {
                                        ...formData,
                                        name: user.name,
                                        phone: user.phone || '9999999999',
                                        email: user.email || 'guest@khaliya.pwa',
                                        source: 'App'
                                    };

                                    axios.post(`${API_URL}/bookings`, payload)
                                        .then(() => {
                                            Swal.fire({ title: 'Reserved!', text: 'Your royal table awaits.', icon: 'success', confirmButtonColor: '#8E1C1C' });
                                            setStep(1);
                                            setFormData({ date: '', time: '', guests: 2, tableType: '' });
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            Swal.fire('Error', 'Failed to connect. Please try again.', 'error');
                                        });
                                }}
                                style={{ flex: 2, margin: 0 }}
                            >
                                Confirm Table
                            </motion.button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="native-book-view" id="native-book" style={{ padding: '20px', paddingBottom: '120px' }}>
            <div className="native-book-header" style={{ marginBottom: '35px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--primary-color)', margin: '0 0 20px 0' }}>{t('nav.reservations')}</h2>
                <div className="progress-bar-container" style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                    <div className="progress-fill" style={{ width: `${(step / 3) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                </div>
                <div className="steps-indicator" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {['When', 'Details', 'Confirm'].map((label, i) => (
                        <span key={label} style={{ 
                            fontSize: '0.85rem', fontWeight: '800', 
                            color: step > i ? 'var(--primary-color)' : 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}>{label}</span>
                    ))}
                </div>
            </div>

            <div className="wizard-container">
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}
