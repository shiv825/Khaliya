import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="wizard-step"
                    >
                        <h3>When are you visiting?</h3>
                        <div className="form-group-native">
                            <label>Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="native-input" />
                        </div>
                        <div className="form-group-native">
                            <label>Time</label>
                            <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="native-input" />
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} className="native-btn-primary full-width" onClick={handleNext} disabled={!formData.date || !formData.time}>
                            Next Step <i className="fas fa-arrow-right"></i>
                        </motion.button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="wizard-step"
                    >
                        <h3>Dining Details</h3>
                        <div className="form-group-native">
                            <label>Number of Guests</label>
                            <div className="stepper">
                                <motion.button whileTap={{ scale: 0.9 }} className="stepper-btn" onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}>-</motion.button>
                                <span>{formData.guests}</span>
                                <motion.button whileTap={{ scale: 0.9 }} className="stepper-btn" onClick={() => setFormData({ ...formData, guests: Math.min(20, formData.guests + 1) })}>+</motion.button>
                            </div>
                        </div>
                        <div className="form-group-native table-types">
                            <label>Seating Preference</label>
                            <div className="table-grid">
                                {['Indoor', 'Patio', 'Window', 'Private Booth'].map(type => (
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        key={type}
                                        className={`table-card ${formData.tableType === type ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, tableType: type })}
                                    >
                                        {type}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="wizard-actions">
                            <motion.button whileTap={{ scale: 0.95 }} className="native-btn-secondary" onClick={handlePrev}>Back</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} className="native-btn-primary" onClick={handleNext} disabled={!formData.tableType}>
                                Review <i className="fas fa-arrow-right"></i>
                            </motion.button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="wizard-step"
                    >
                        <h3>Confirm Booking</h3>
                        <div className="booking-summary">
                            <div className="summary-row">
                                <span><i className="far fa-calendar-alt"></i> Date</span>
                                <strong>{formData.date}</strong>
                            </div>
                            <div className="summary-row">
                                <span><i className="far fa-clock"></i> Time</span>
                                <strong>{formData.time}</strong>
                            </div>
                            <div className="summary-row">
                                <span><i className="fas fa-users"></i> Guests</span>
                                <strong>{formData.guests} People</strong>
                            </div>
                            <div className="summary-row">
                                <span><i className="fas fa-chair"></i> Seating</span>
                                <strong>{formData.tableType}</strong>
                            </div>
                        </div>
                        <div className="wizard-actions">
                            <motion.button whileTap={{ scale: 0.95 }} className="native-btn-secondary" onClick={handlePrev}>Edit</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} className="native-btn-success" onClick={() => alert('Booking Confirmed!')}>
                                Confirm Reservation
                            </motion.button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="native-book-view" id="native-book">
            <div className="native-book-header">
                <h2>Reserve Table</h2>
                <div className="progress-bar-container">
                    <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>
                <div className="steps-indicator">
                    <span className={step >= 1 ? 'active' : ''}>When</span>
                    <span className={step >= 2 ? 'active' : ''}>Details</span>
                    <span className={step >= 3 ? 'active' : ''}>Confirm</span>
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
