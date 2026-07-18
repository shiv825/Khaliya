import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeVisit({ setActiveTab }) {
    const { t, language = 'en' } = useLanguage();
    const [locationState, setLocationState] = useState({
        lat: null, lng: null, distance: null, travelTime: null, error: null
    });

    const RESTAURANT_COORD = { lat: 22.6108, lng: 88.3370 };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const trackLocation = () => {
        if (!navigator.geolocation) {
            setLocationState(prev => ({ ...prev, error: 'Geolocation not supported' }));
            return;
        }

        setLocationState(prev => ({ ...prev, error: 'Locating...' }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLat = position.coords.latitude;
                const currentLng = position.coords.longitude;
                const distKm = calculateDistance(currentLat, currentLng, RESTAURANT_COORD.lat, RESTAURANT_COORD.lng);
                const timeMinutes = Math.round((distKm / 30) * 60);

                let timeStr = '';
                if (timeMinutes < 60) timeStr = `${timeMinutes} mins`;
                else timeStr = `${Math.floor(timeMinutes / 60)} hr ${timeMinutes % 60} mins`;

                setLocationState({
                    lat: currentLat.toFixed(4),
                    lng: currentLng.toFixed(4),
                    distance: distKm.toFixed(1),
                    travelTime: timeStr,
                    error: null
                });
            },
            () => {
                setLocationState(prev => ({ ...prev, error: 'Unable to retrieve location' }));
            }
        );
    };

    return (
        <div style={{ padding: '20px 20px 120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('home')}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--primary-color)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <i className="fas fa-arrow-left" style={{ fontSize: '1.1rem' }}></i>
                </button>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--primary-color)', margin: 0 }}>
                        {language === 'hi' ? 'खालिया रेस्टोरेंट' : language === 'ar' ? 'مطعم خاليا' : 'Visit Khaliya'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        {language === 'hi' ? 'हम आपका स्वागत करने के लिए उत्सुक हैं!' : language === 'ar' ? 'يسعدना استضافتك في مطعمना!' : 'We would love to host you!'}
                    </p>
                </div>
                <div style={{ width: '44px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '30px',
                    padding: '24px 20px',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <a
                    href="https://www.google.com/maps/search/?api=1&query=Khaliya+Restaurant"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'block',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        height: '180px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '20px',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <iframe
                        title="Khaliya Restaurant Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.003975762078!2d88.3347072!3d22.6108169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02798f090d80c9%3A0xe104332b4b47ea87!2sKhaliya%20Restaurant!5e0!3m2!1sen!2sin!4v1714902123955!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0, pointerEvents: 'none' }}
                        allowFullScreen=""
                                            />
                </a>

                <div style={{ background: 'rgba(142, 28, 28, 0.03)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
                    {!locationState.lat ? (
                        <>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.4' }}>
                                {t('track.sub') || 'Find out how far you are from our restaurant and get travel times.'}
                            </p>
                            {locationState.error && locationState.error !== 'Locating...' && (
                                <div style={{ fontSize: '0.8rem', color: '#ff9800', marginBottom: '8px', fontWeight: '700' }}>
                                    {locationState.error}
                                </div>
                            )}
                            <button
                                onClick={trackLocation}
                                disabled={locationState.error === 'Locating...'}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '30px',
                                    fontWeight: '800',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {locationState.error === 'Locating...' ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <span>{language === 'hi' ? 'खोज रहे हैं...' : 'Locating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-location-arrow"></i>
                                        <span>{t('track.button') || 'Track Distance'}</span>
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--primary-color)', lineHeight: '1' }}>{locationState.distance}</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>{t('track.kmAway') || 'km away'}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '15px', fontWeight: '600' }}>
                                <i className="fas fa-clock" style={{ color: 'var(--primary-color)', marginRight: '6px' }}></i>
                                {t('track.travelTimeLabel') || 'Est. Time:'} <strong>{locationState.travelTime}</strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <a href={`https://www.google.com/maps/dir/?api=1&origin=${locationState.lat},${locationState.lng}&destination=${RESTAURANT_COORD.lat},${RESTAURANT_COORD.lng}&travelmode=driving`} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 5px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                                    <i className="fas fa-car" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}></i>
                                    <span>Drive</span>
                                </a>
                                <a href={`https://www.google.com/maps/dir/?api=1&origin=${locationState.lat},${locationState.lng}&destination=${RESTAURANT_COORD.lat},${RESTAURANT_COORD.lng}&travelmode=two-wheeler`} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 5px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                                    <i className="fas fa-motorcycle" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}></i>
                                    <span>Ride</span>
                                </a>
                                <a href={`https://www.google.com/maps/dir/?api=1&origin=${locationState.lat},${locationState.lng}&destination=${RESTAURANT_COORD.lat},${RESTAURANT_COORD.lng}&travelmode=walking`} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 5px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                                    <i className="fas fa-walking" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}></i>
                                    <span>Walk</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginTop: '2px' }}></i>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '2px' }}>{t('contact.addressLabel') || 'Address'}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{t('contact.addressContent')}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <i className="fas fa-clock" style={{ color: 'var(--primary-color)', fontSize: '1rem', marginTop: '2px' }}></i>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '2px' }}>{t('hours.title') || 'Hours'}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{t('contact.hoursContent')}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <i className="fas fa-phone-alt" style={{ color: 'var(--primary-color)', fontSize: '1rem', marginTop: '2px' }}></i>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '2px' }}>{t('contact.phoneLabel') || 'Phone'}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>+91 82527 31784</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="tel:+918252731784" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '14px', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', textAlign: 'center' }}>
                        <i className="fas fa-phone-alt"></i>
                        <span>{t('contact.callNow') || 'Call Now'}</span>
                    </a>
                    <a href="https://www.google.com/maps/search/?api=1&query=Khaliya+Restaurant" target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '14px', backgroundColor: 'var(--primary-color)', color: '#FFF', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', textAlign: 'center' }}>
                        <i className="fas fa-directions"></i>
                        <span>{t('track.button') || 'Directions'}</span>
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
