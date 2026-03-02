import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HoursAndLocation() {
    const { t } = useLanguage();
    const [locationState, setLocationState] = useState({
        lat: null, lng: null, distance: null, travelTime: null, error: null
    });

    const RESTAURANT_COORD = { lat: 22.6108, lng: 88.3370 }; // Khaliya Howrah coord

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in km
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
            setLocationState(prev => ({ ...prev, error: "Geolocation is not supported by your browser" }));
            return;
        }

        setLocationState(prev => ({ ...prev, error: "Locating..." }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLat = position.coords.latitude;
                const currentLng = position.coords.longitude;

                const distKm = calculateDistance(currentLat, currentLng, RESTAURANT_COORD.lat, RESTAURANT_COORD.lng);
                // Rough estimation: 30km/h average city speed
                const timeMinutes = Math.round((distKm / 30) * 60);

                let timeStr = "";
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
                setLocationState(prev => ({ ...prev, error: "Unable to retrieve your location" }));
            }
        );
    };

    return (
        <>
            <section id="hours" data-aos="fade-up" data-aos-duration="700">
                <h2>{t('hours.title')}</h2>
                <table className="hours-table" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px' }}>{t('hours.day')}</th>
                            <th style={{ padding: '15px' }}>{t('hours.opening')}</th>
                            <th style={{ padding: '15px' }}>{t('hours.closing')}</th>
                            <th style={{ padding: '15px' }}>{t('hours.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{t('hours.monFri')}</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>11:00 AM</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>10:00 PM</td>
                            <td className="open" style={{ padding: '15px', borderBottom: '1px solid #eee', color: '#4caf50', fontWeight: 'bold' }}>{t('hours.open')}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{t('hours.sat')}</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>10:00 AM</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>11:00 PM</td>
                            <td className="open" style={{ padding: '15px', borderBottom: '1px solid #eee', color: '#4caf50', fontWeight: 'bold' }}>{t('hours.open')}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{t('hours.sun')}</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>10:00 AM</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>11:00 PM</td>
                            <td className="open" style={{ padding: '15px', borderBottom: '1px solid #eee', color: '#4caf50', fontWeight: 'bold' }}>{t('hours.open')}</td>
                        </tr>
                    </tbody>
                </table>
                <p style={{ marginTop: '1rem', color: '#666', textAlign: 'center' }}><strong>{t('hours.note')}</strong> {t('hours.noteDesc')}</p>
            </section>

            <section id="track">
                <h2>{t('track.title')}</h2>
                <p>{t('track.sub')}</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <button onClick={trackLocation} className="btn">{t('track.button')}</button>
                </div>

                {locationState.error && <div style={{ textAlign: 'center', color: '#ff9800', marginBottom: '1rem' }}>{locationState.error}</div>}

                {locationState.lat && (
                    <div id="userLocation" className="location-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justification: 'center', background: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <h3>{t('track.currentLocation')}</h3>
                            <p><strong>{t('track.coordinates')}</strong></p>
                            <p><span>{t('track.lat')}</span> {locationState.lat}</p>
                            <p><span>{t('track.lng')}</span> {locationState.lng}</p>
                        </div>
                        <div style={{ flex: '1 1 300px', background: '#fff3e0', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #ff9800' }}>
                            <p><strong>{t('track.distanceTo')}</strong></p>
                            <p><span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e65100' }}>{locationState.distance}</span> <span>{t('track.kmAway')}</span></p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}><span>{t('track.travelTimeLabel')}</span> {locationState.travelTime}</p>
                        </div>
                    </div>
                )}

                <h3 style={{ marginTop: '2rem', textAlign: 'center' }}>{t('track.mapTitle')}</h3>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.003975762078!2d88.3347072!3d22.6108169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02798f090d80c9%3A0xe104332b4b47ea87!2sKhaliya%20Restaurant!5e0!3m2!1sen!2sin!4v1714902123955!5m2!1sen!2sin"
                    width="100%" height="400" style={{ border: 0, borderRadius: '8px' }} allowFullScreen="" loading="lazy"></iframe>
            </section>
        </>
    );
}
