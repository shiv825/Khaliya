import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../admin/AdminContext';
import Swal from 'sweetalert2';

export default function StoreSettingsModal({ isOpen, onClose }) {
    const { settings, updateStoreSettings, toggleStoreStatus } = useAdmin();

    const [formState, setFormState] = useState({
        isOpen: true,
        gstRate: 5,
        packagingFee: 25,
        deliveryFee: 40,
        deliveryRadiusKm: 15,
        restaurantLat: 28.6139,
        restaurantLng: 77.2090,
        restaurantAddress: 'Khaliya Sanctuary, Main Boulevard, New Delhi'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormState({
                isOpen: settings.isOpen ?? true,
                gstRate: settings.gstRate ?? 5,
                packagingFee: settings.packagingFee ?? 25,
                deliveryFee: settings.deliveryFee ?? 40,
                deliveryRadiusKm: settings.deliveryRadiusKm ?? 15,
                restaurantLat: settings.restaurantLat ?? 28.6139,
                restaurantLng: settings.restaurantLng ?? 77.2090,
                restaurantAddress: settings.restaurantAddress || 'Khaliya Sanctuary, Main Boulevard, New Delhi'
            });
        }
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire('Not Supported', 'Geolocation is not supported by your browser.', 'error');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = parseFloat(pos.coords.latitude.toFixed(6));
                const lng = parseFloat(pos.coords.longitude.toFixed(6));
                setFormState(prev => ({
                    ...prev,
                    restaurantLat: lat,
                    restaurantLng: lng
                }));
                setIsLocating(false);
                Swal.fire({
                    title: 'GPS Coordinates Captured!',
                    text: `Lat: ${lat}, Lng: ${lng}`,
                    icon: 'success',
                    toast: true, position: 'top-end', timer: 2500, showConfirmButton: false
                });
            },
            (err) => {
                setIsLocating(false);
                Swal.fire('Error', `Location access denied or unavailable (${err.message})`, 'error');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            isOpen: formState.isOpen,
            gstRate: parseFloat(formState.gstRate) || 0,
            packagingFee: parseFloat(formState.packagingFee) || 0,
            deliveryFee: parseFloat(formState.deliveryFee) || 0,
            deliveryRadiusKm: parseFloat(formState.deliveryRadiusKm) || 1,
            restaurantLat: parseFloat(formState.restaurantLat) || 28.6139,
            restaurantLng: parseFloat(formState.restaurantLng) || 77.2090,
            restaurantAddress: formState.restaurantAddress.trim()
        };

        const success = await updateStoreSettings(payload);
        setIsSubmitting(false);
        if (success) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    style={{
                        width: '100%',
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: 'linear-gradient(145deg, #141822 0%, #0B0E14 100%)',
                        border: '1.5px solid #D4AF37',
                        borderRadius: '24px',
                        padding: '30px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(212, 175, 55, 0.25)',
                        color: '#F8FAFC'
                    }}
                >
                    {/* Modal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '6px' }}>
                                <span style={{ color: '#FFD700', fontSize: '0.75rem' }}>⚙️</span>
                                <span style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    ADMIN CONFIGURATION
                                </span>
                            </div>
                            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
                                Store, Fees &amp; Radius Settings
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: '#94A3B8',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Store Open / Closed Status */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: '800', color: '#FFF', fontSize: '1rem' }}>
                                    Store Ordering Status
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                                    {formState.isOpen ? 'Store is Currently OPEN for customer orders' : 'Store is CLOSED (orders paused)'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                                style={{
                                    background: formState.isOpen ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    border: `1.5px solid ${formState.isOpen ? '#4ADE80' : '#EF4444'}`,
                                    color: formState.isOpen ? '#4ADE80' : '#EF4444',
                                    padding: '8px 18px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {formState.isOpen ? '🟢 STORE OPEN' : '🔴 STORE CLOSED'}
                            </button>
                        </div>

                        {/* Extra Fees Section */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <h4 style={{ color: '#FFD700', margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                💰 EXTRA FEES CONFIGURATION
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Taxes &amp; GST Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={formState.gstRate}
                                        onChange={(e) => setFormState({ ...formState, gstRate: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Packaging Fee (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={formState.packagingFee}
                                        onChange={(e) => setFormState({ ...formState, packagingFee: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Delivery Fee (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={formState.deliveryFee}
                                        onChange={(e) => setFormState({ ...formState, deliveryFee: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location & Delivery Radius Section */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h4 style={{ color: '#FFD700', margin: 0, fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                    📍 RESTAURANT LOCATION &amp; DELIVERY RADIUS
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={isLocating}
                                    style={{
                                        background: 'rgba(212, 175, 55, 0.2)',
                                        border: '1px solid #D4AF37',
                                        color: '#FFD700',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <i className="fas fa-crosshairs"></i> {isLocating ? 'Capturing...' : 'Use My GPS'}
                                </button>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                    Restaurant Physical Address
                                </label>
                                <input
                                    type="text"
                                    value={formState.restaurantAddress}
                                    onChange={(e) => setFormState({ ...formState, restaurantAddress: e.target.value })}
                                    required
                                    placeholder="e.g. Khaliya Sanctuary, Main Boulevard, New Delhi"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        background: '#070A0E',
                                        color: '#FFF',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Max Delivery Radius (km)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        value={formState.deliveryRadiusKm}
                                        onChange={(e) => setFormState({ ...formState, deliveryRadiusKm: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Latitude (GPS)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formState.restaurantLat}
                                        onChange={(e) => setFormState({ ...formState, restaurantLat: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                                        Longitude (GPS)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formState.restaurantLng}
                                        onChange={(e) => setFormState({ ...formState, restaurantLng: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            background: '#070A0E',
                                            color: '#FFF',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    color: '#CBD5E1',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    flex: 2,
                                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                    border: 'none',
                                    color: '#000',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '0.95rem',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.6 : 1,
                                    boxShadow: '0 8px 25px rgba(212, 175, 55, 0.35)'
                                }}
                            >
                                {isSubmitting ? 'Saving...' : '💾 Save Settings Now'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
