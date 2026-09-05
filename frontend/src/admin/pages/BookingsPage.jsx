import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getBookingEmailTemplate } from '../../utils/emailTemplates';


export default function BookingsPage() {
    const { bookings, tables, API_URL, updateStatus, seatCustomer, fetchData } = useAdmin();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // New Booking Form State
    const [newBooking, setNewBooking] = useState({
        name: '',
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:30',
        guests: 2,
        tableType: 'Indoor',
        specialRequests: '',
        depositPaid: 200
    });


    // Seating Modal State
    const [seatingBooking, setSeatingBooking] = useState(null);
    const [targetTableId, setTargetTableId] = useState('');

    // Metrics
    const totalBookings = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const totalPax = bookings.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);

    // Available tables for seating
    const availableTables = tables.filter(t => t.status === 'AVAILABLE' || t.status === 'CLEANING');

    // Filtered Bookings
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter.toLowerCase();
        const queryLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (b.name && b.name.toLowerCase().includes(queryLower)) ||
            (b.phone && b.phone.toLowerCase().includes(queryLower)) ||
            (b.date && b.date.toLowerCase().includes(queryLower)) ||
            (b.tableType && b.tableType.toLowerCase().includes(queryLower));
        return matchesStatus && matchesSearch;
    });

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        if (!newBooking.name || !newBooking.phone) {
            Swal.fire('Required Fields', 'Please enter guest name and contact phone number.', 'warning');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/bookings`, {
                ...newBooking,
                status: 'confirmed'
            });

            if (res.data.success || res.data.booking || res.data.id) {
                Swal.fire({
                    title: 'Reservation Created!',
                    text: `Confirmed booking for ${newBooking.name} on ${newBooking.date} at ${newBooking.time}.`,
                    icon: 'success',
                    background: '#121620',
                    color: '#FFF',
                    confirmButtonColor: '#D4AF37'
                });
                setIsCreateModalOpen(false);
                setNewBooking({
                    name: '',
                    phone: '',
                    email: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '19:30',
                    guests: 2,
                    tableType: 'Indoor',
                    specialRequests: ''
                });
                if (fetchData) fetchData();
            }
        } catch (err) {
            Swal.fire('Booking Failed', err.response?.data?.message || 'Error creating reservation', 'error');
        }
    };

    const handleDeleteBooking = async (id, name) => {
        const confirm = await Swal.fire({
            title: 'Delete Reservation?',
            text: `Are you sure you want to delete the booking for ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            background: '#121620',
            color: '#FFF'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/bookings/${id}`);
                Swal.fire({ title: 'Deleted!', text: 'Reservation removed.', icon: 'success', timer: 1500, showConfirmButton: false });
                if (fetchData) fetchData();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete reservation.', 'error');
            }
        }
    };

    const handleConfirmAndSeat = async () => {
        if (!targetTableId || !seatingBooking) {
            Swal.fire('Select Table', 'Please pick an available table to seat the guest.', 'warning');
            return;
        }

        try {
            // Seat guest at table
            await seatCustomer(targetTableId, {
                guestName: seatingBooking.name,
                guestCount: seatingBooking.guests,
                phone: seatingBooking.phone
            });

            // Update booking status to seated
            await updateStatus('bookings', seatingBooking.id, 'seated');

            Swal.fire({
                title: 'Guest Seated!',
                text: `${seatingBooking.name} seated at Table ${targetTableId}!`,
                icon: 'success',
                background: '#121620',
                color: '#FFF',
                confirmButtonColor: '#D4AF37'
            });

            setSeatingBooking(null);
            setTargetTableId('');
            if (fetchData) fetchData();
        } catch (err) {
            Swal.fire('Seating Failed', 'Could not assign table to guest.', 'error');
        }
    };

    const sendEmailConfirmation = (booking) => {
        const guestEmail = booking.email || '';
        const emailData = getBookingEmailTemplate({ booking });
        const subject = encodeURIComponent(emailData.subject);
        const bodyText = encodeURIComponent(emailData.text);

        Swal.fire({
            title: '✨ Premium Reservation Email',
            html: `
                <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 20px; color: #FFF; max-height: 420px; overflow-y: auto; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">
                    <div style="margin-bottom: 12px; font-size: 0.85rem; color: #8A94A6; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                        <strong style="color: #D4AF37;">Recipient:</strong> ${booking.name} ${guestEmail ? `&lt;${guestEmail}&gt;` : '(No Email Address Provided)'}
                    </div>
                    <iframe srcdoc="${emailData.html.replace(/"/g, '&quot;')}" style="width: 100%; height: 320px; border: none; border-radius: 12px; background: #0B0E14;"></iframe>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: guestEmail ? '📧 Launch Email App' : '📋 Copy Plain Text',
            cancelButtonText: 'Close',
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF',
            width: '650px'
        }).then((result) => {
            if (result.isConfirmed) {
                if (guestEmail) {
                    window.open(`mailto:${guestEmail}?subject=${subject}&body=${bodyText}`, '_blank');
                } else {
                    navigator.clipboard.writeText(emailData.text);
                    Swal.fire({ title: 'Copied!', text: 'Email text copied to clipboard.', icon: 'success', background: '#121620', color: '#FFF', confirmButtonColor: '#D4AF37' });
                }
            }
        });
    };

    return (
        <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '5px' }}>
            {/* Header & New Booking Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-calendar-check" style={{ color: 'var(--admin-primary)' }}></i>
                        Table Reservations Manager
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Manage online table bookings, walk-in reservations, email guest confirmations & direct floor seating.
                    </p>
                </div>


                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                        color: '#000',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                >
                    <i className="fas fa-plus-circle"></i> + New Reservation
                </button>
            </div>

            {/* KPI Metric Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '22px' }}>
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-bookmark"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Reservations</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-text)' }}>{totalBookings}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-clock"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Pending Approvals</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f1c40f' }}>{pendingCount}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Confirmed Bookings</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2ecc71' }}>{confirmedCount}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-user-friends"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Expected Guests</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#3498db' }}>{totalPax} Pax</div>
                    </div>
                </div>
            </div>

            {/* Instant Search Bar & Status Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}></i>
                    <input
                        type="text"
                        placeholder="Search guest name, phone, date or table type..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            background: 'var(--admin-surface)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '12px',
                            color: 'var(--admin-text)',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['ALL', 'PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            style={{
                                background: statusFilter === st ? 'var(--admin-primary)' : 'var(--admin-surface)',
                                color: statusFilter === st ? '#000' : 'var(--admin-text)',
                                border: `1px solid ${statusFilter === st ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
                    <i className="fas fa-calendar-times" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4, display: 'block' }}></i>
                    No reservations matching your search or filter.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredBookings.map(b => {
                        const statusColors = {
                            pending: { bg: 'rgba(241, 196, 15, 0.15)', text: '#f1c40f', border: '#f1c40f' },
                            confirmed: { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ecc71', border: '#2ecc71' },
                            seated: { bg: 'rgba(52, 152, 219, 0.15)', text: '#3498db', border: '#3498db' },
                            cancelled: { bg: 'rgba(231, 76, 60, 0.15)', text: '#e74c3c', border: '#e74c3c' }
                        };
                        const sc = statusColors[b.status] || statusColors.pending;

                        return (
                            <div
                                key={b.id || b._id}
                                style={{
                                    background: 'var(--admin-surface)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '18px',
                                    padding: '20px',
                                    display: 'flex',
                                    justify: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '15px'
                                }}
                            >
                                <div style={{ flex: 1, minWidth: '260px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-text)' }}>
                                            {b.name}
                                        </h3>
                                        <span style={{
                                            background: sc.bg,
                                            color: sc.text,
                                            border: `1px solid ${sc.border}`,
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}>
                                            {b.status}
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                                            <i className="fas fa-chair" style={{ color: 'var(--admin-primary)', marginRight: '6px' }}></i>
                                            {b.guests} Guests ({b.tableType || 'Standard Dining'})
                                        </span>
                                        {Number(b.depositPaid || b.advanceDeposit || 0) > 0 && (
                                            <span style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid #2ecc71', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                                                <i className="fas fa-money-bill-wave" style={{ marginRight: '6px' }}></i>
                                                Deposit Paid: ₹{b.depositPaid || b.advanceDeposit}
                                            </span>
                                        )}
                                    </div>


                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
                                        <span><i className="far fa-calendar-alt" style={{ color: 'var(--admin-primary)', marginRight: '6px' }}></i> {b.date} at {b.time}</span>
                                        <span><i className="fas fa-phone-alt" style={{ color: 'var(--admin-primary)', marginRight: '6px' }}></i> {b.phone || b.contactNumber || 'No phone'}</span>
                                        {b.email && <span><i className="far fa-envelope" style={{ marginRight: '6px' }}></i> {b.email}</span>}
                                    </div>

                                    {b.specialRequests && (
                                        <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#D4AF37', background: 'rgba(212, 175, 55, 0.08)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
                                            <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i> Note: {b.specialRequests}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {b.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus('bookings', b.id, 'confirmed')}
                                            style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid #2ecc71', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                                        >
                                            <i className="fas fa-check"></i> Confirm
                                        </button>
                                    )}

                                    {b.status !== 'cancelled' && b.status !== 'seated' && (
                                        <button
                                            onClick={() => setSeatingBooking(b)}
                                            style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', border: '1px solid #D4AF37', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                                        >
                                            <i className="fas fa-chair"></i> Seat at Table
                                        </button>
                                    )}

                                    <button
                                        onClick={() => sendEmailConfirmation(b)}
                                        style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid #3498db', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                                    >
                                        <i className="fas fa-envelope"></i> Email Confirmation
                                    </button>


                                    {b.status !== 'cancelled' && (
                                        <button
                                            onClick={() => updateStatus('bookings', b.id, 'cancelled')}
                                            style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                                        >
                                            <i className="fas fa-times"></i> Cancel
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDeleteBooking(b.id, b.name)}
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text-muted)', border: '1px solid var(--admin-border)', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer' }}
                                        title="Delete Booking Record"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create New Reservation Modal */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ background: '#121620', border: '2px solid var(--admin-primary)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '25px', color: '#FFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-primary)' }}>
                                <i className="fas fa-calendar-plus" style={{ marginRight: '8px' }}></i> Create Table Reservation
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.2rem', cursor: 'pointer' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Guest Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Vikram Sharma"
                                    value={newBooking.name}
                                    onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="e.g. 9876543210"
                                        value={newBooking.phone}
                                        onChange={e => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Guests (Pax)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newBooking.guests}
                                        onChange={e => setNewBooking({ ...newBooking, guests: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Date</label>
                                    <input
                                        type="date"
                                        value={newBooking.date}
                                        onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Time Slot</label>
                                    <input
                                        type="time"
                                        value={newBooking.time}
                                        onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Preferred Seating Area</label>
                                <select
                                    value={newBooking.tableType}
                                    onChange={e => setNewBooking({ ...newBooking, tableType: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                >
                                    <option value="Ground Hall" style={{ background: '#121620', color: '#FFF' }}>Ground Hall</option>
                                    <option value="Rooftop Terrace" style={{ background: '#121620', color: '#FFF' }}>Rooftop Terrace</option>
                                    <option value="VIP Private Booths" style={{ background: '#121620', color: '#FFF' }}>VIP Private Booths</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Special Requests / Notes</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Birthday anniversary candlelight setup"
                                    value={newBooking.specialRequests}
                                    onChange={e => setNewBooking({ ...newBooking, specialRequests: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '10px',
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirm & Save Reservation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Direct Table Seating Modal */}
            {seatingBooking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ background: '#121620', border: '2px solid var(--admin-primary)', borderRadius: '24px', width: '100%', maxWidth: '460px', padding: '25px', color: '#FFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: 'var(--admin-primary)' }}>
                                <i className="fas fa-chair" style={{ marginRight: '8px' }}></i> Seat Guest at Table Floor Map
                            </h2>
                            <button onClick={() => setSeatingBooking(null)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.2rem', cursor: 'pointer' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            Assign <strong>{seatingBooking.name}</strong> ({seatingBooking.guests} Guests) to an active floor table:
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '8px' }}>Available Floor Tables</label>
                            <select
                                value={targetTableId}
                                onChange={e => setTargetTableId(e.target.value)}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '12px', color: '#FFF', fontWeight: '800' }}
                            >
                                <option value="" style={{ background: '#121620', color: '#FFF' }}>-- Select Available Table --</option>
                                {availableTables.map(t => (
                                    <option key={t.id} value={t.id} style={{ background: '#121620', color: '#FFF' }}>
                                        {t.name} ({t.category || 'Ground'}) - Cap: {t.capacity || 4} Seats [{t.status}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleConfirmAndSeat}
                            disabled={!targetTableId}
                            style={{
                                width: '100%',
                                background: targetTableId ? 'linear-gradient(135deg, var(--admin-primary), #AA7C11)' : 'rgba(255,255,255,0.1)',
                                color: targetTableId ? '#000' : 'var(--admin-text-muted)',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '12px',
                                fontWeight: '900',
                                fontSize: '1rem',
                                cursor: targetTableId ? 'pointer' : 'not-allowed'
                            }}
                        >
                            🪑 Complete Seating & Occupy Table
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
