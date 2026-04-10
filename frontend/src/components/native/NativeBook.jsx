import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveFloorplan from '../InteractiveFloorplan';

export default function NativeBook() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ date: '', time: '', guests: 2, tableType: '' });

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
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
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.6rem', marginBottom: '20px' }}>When are you visiting?</h3>
                        <div className="form-group-native" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: '700', fontSize: '0.9rem' }}>Date</label>
                            <input 
                                type="date" 
                                value={formData.date} 
                                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                                className="native-input"
                                style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)', fontWeight: '600' }}
                            />
                        </div>
                        <div className="form-group-native" style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: '700', fontSize: '0.9rem' }}>Time</label>
                            <input 
                                type="time" 
                                value={formData.time} 
                                onChange={e => setFormData({ ...formData, time: e.target.value })} 
                                className="native-input"
                                style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)', fontWeight: '600' }}
                            />
                        </div>
                        <motion.button 
                            whileTap={{ scale: 0.95 }} 
                            className="zomato-btn-main" 
                            onClick={handleNext} 
                            disabled={!formData.date || !formData.time}
                            style={{ opacity: (!formData.date || !formData.time) ? 0.5 : 1 }}
                        >
                            Select Your Table <i className="fas fa-arrow-right" style={{ marginLeft: '10px' }}></i>
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
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.6rem', marginBottom: '20px' }}>Dining Details</h3>
                        <div className="form-group-native">
                            <label style={{ display: 'block', marginBottom: '15px', color: 'var(--text-light)', fontWeight: '700' }}>Number of Guests</label>
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
                            <label style={{ marginBottom: '20px', display: 'block', fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: '800' }}>Visual Seating Preference</label>
                            <InteractiveFloorplan onSelectTable={(type) => setFormData({ ...formData, tableType: type })} />
                            {formData.tableType && (
                                <div style={{ 
                                    marginTop: '20px', padding: '12px', background: 'rgba(142, 28, 28, 0.05)', 
                                    color: 'var(--primary-color)', textAlign: 'center', fontWeight: '900', 
                                    fontSize: '1.1rem', borderRadius: '12px', border: '1px dashed var(--primary-color)' 
                                }}>
                                    <i className="fas fa-check-circle"></i> Selected: {formData.tableType}
                                </div>
                            )}
                        </div>
                        <div className="wizard-actions" style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                className="native-btn-secondary" 
                                onClick={handlePrev}
                                style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-light)', fontWeight: '800' }}
                            >Back</motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }} 
                                className="zomato-btn-main" 
                                onClick={handleNext} 
                                disabled={!formData.tableType}
                                style={{ flex: 2, margin: 0, opacity: !formData.tableType ? 0.5 : 1 }}
                            >
                                Review Plan
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
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0' }}>
                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}><i className="fas fa-chair" style={{ marginRight: '8px' }}></i> Seating</span>
                                <strong style={{ color: 'var(--primary-color)', fontWeight: '900' }}>{formData.tableType}</strong>
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
                                onClick={() => Swal.fire({ title: 'Reserved!', text: 'Your royal table awaits.', icon: 'success', confirmButtonColor: '#8E1C1C' })}
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
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--primary-color)', margin: '0 0 20px 0' }}>Reserve Table</h2>
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
