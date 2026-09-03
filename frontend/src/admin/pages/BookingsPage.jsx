import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';

export default function BookingsPage() {
    const { bookings, updateStatus } = useAdmin();

    return (
        <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: '1.8rem', fontWeight: 800 }}>Table Reservations Manager</h2>
            {bookings.length === 0 ? (
                <div style={{ padding: '40px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                    No table reservations booked yet.
                </div>
            ) : (
                bookings.map(b => (
                    <div key={b.id} className="futuristic-row">
                        <div style={{ flex: 1, paddingRight: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--admin-text)' }}>{b.name}</h3>
                                <span className={`item-badge badge-${b.status}`}>{b.status}</span>
                                <span className="table-tag"><i className="fas fa-chair" style={{ marginRight: '5px' }}></i> {b.guests} Pax - {b.tableType}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                <span className="item-detail"><i className="far fa-calendar-check"></i> {b.date} at {b.time}</span>
                                <span className="item-detail"><i className="fas fa-phone-alt"></i> {b.phone || b.contactNumber || b.mobile || 'No phone provided'}</span>
                            </div>
                        </div>
                        <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                            {b.status === 'pending' && (
                                <button onClick={() => updateStatus('bookings', b.id, 'confirmed')} className="action-btn btn-confirm"> Confirm Reservation</button>
                            )}
                            {b.status !== 'cancelled' && (
                                <button onClick={() => updateStatus('bookings', b.id, 'cancelled')} className="action-btn btn-cancel"> Cancel</button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </motion.div>
    );
}
