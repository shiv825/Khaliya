import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import '../assets/admin-style.css';

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('orders'); // Default to live orders
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isSyncing, setIsSyncing] = useState(false);
    const navigate = useNavigate();

    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api';
    const lastBookingId = useRef(null);
    const lastOrderId = useRef(null);

    // Auto-adjust sidebar on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setIsSyncing(true);
        try {
            const timestamp = new Date().getTime(); // Cache buster
            const [bRes, oRes] = await Promise.all([
                axios.get(`${API_URL}/bookings?t=${timestamp}`),
                axios.get(`${API_URL}/orders?t=${timestamp}`)
            ]);

            const newBookings = bRes.data || [];
            const newOrders = oRes.data || [];

            // Notification for new items
            if (lastBookingId.current && newBookings.length > 0 && newBookings[0].id !== lastBookingId.current) {
                notifyNew('New Table Reservation!', `${newBookings[0].name} has booked a table.`);
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
            if (lastOrderId.current && newOrders.length > 0 && newOrders[0].id !== lastOrderId.current) {
                notifyNew('New Live Order!', `Kitchen: New order received!`);
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }

            if (newBookings.length > 0) lastBookingId.current = newBookings[0].id;
            if (newOrders.length > 0) lastOrderId.current = newOrders[0].id;

            setBookings(newBookings.reverse());
            setOrders(newOrders.reverse());
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setTimeout(() => setIsSyncing(false), 500);
        }
    };

    const notifyNew = (title, text) => {
        Swal.fire({
            title,
            text,
            icon: 'info',
            toast: true,
            position: 'top-end',
            timer: 4000,
            showConfirmButton: false,
            background: '#FFFFFF',
            color: '#E63946',
            iconColor: '#FFB703'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        onLogout(false);
        navigate('/');
    };

    const updateStatus = async (type, id, status) => {
        try {
            await axios.put(`${API_URL}/${type}/${id}`, { status });
            // Optimistic UI update
            if (type === 'bookings') {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            } else {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            }
            Swal.fire({
                title: 'Updated!',
                text: `${type === 'orders' ? 'Order' : 'Reservation'} status changed to ${status.toUpperCase()}.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (err) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    const pendingOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;
    const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

    return (
        <div className="admin-portal-wrapper admin-layout">
            <aside className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                    {isSidebarOpen && (
                        <h1 style={{ color: 'var(--admin-primary)', fontFamily: 'Playfair Display', fontSize: '2rem', margin: 0, fontWeight: '900' }}>
                            Khaliya<span style={{ color: 'var(--admin-accent)' }}>.</span>
                        </h1>
                    )}
                    {!isSidebarOpen && (
                        <h1 style={{ color: 'var(--admin-primary)', fontFamily: 'Playfair Display', fontSize: '2rem', margin: 0, fontWeight: '900' }}>
                            K<span style={{ color: 'var(--admin-accent)' }}>.</span>
                        </h1>
                    )}
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: window.innerWidth <= 768 ? 'row' : 'column', gap: '5px' }}>
                    <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                        <i className="fas fa-fire-burner" style={{ fontSize: '1.2rem', width: '25px', textAlign: 'center' }}></i>
                        {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>Live Kitchen</span>}
                        {isSidebarOpen && pendingOrdersCount > 0 && (
                            <span style={{ background: '#FFF', color: 'var(--admin-primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900' }}>
                                {pendingOrdersCount}
                            </span>
                        )}
                    </button>
                    
                    <button className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                        <i className="fas fa-chair" style={{ fontSize: '1.2rem', width: '25px', textAlign: 'center' }}></i>
                        {isSidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>Reservations</span>}
                        {isSidebarOpen && pendingBookingsCount > 0 && (
                            <span style={{ background: '#FFF', color: 'var(--admin-primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900' }}>
                                {pendingBookingsCount}
                            </span>
                        )}
                    </button>
                </nav>

                <button className="nav-tab" onClick={handleLogout} style={{ color: 'var(--admin-danger)', marginTop: window.innerWidth <= 768 ? '0' : 'auto' }}>
                    <i className="fas fa-sign-out-alt" style={{ fontSize: '1.2rem', width: '25px', textAlign: 'center' }}></i>
                    {isSidebarOpen && <span>Sign Out</span>}
                </button>
            </aside>

            <main className="admin-main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h2 className="dashboard-header-h">
                            {activeTab === 'bookings' ? 'Table Reservations' : 'Live Kitchen Orders'}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                            <div className={`sync-dot ${isSyncing ? 'syncing' : ''}`} style={{ 
                                width: '12px', 
                                height: '12px', 
                                background: 'var(--admin-success)', 
                                borderRadius: '50%'
                            }}></div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {isSyncing ? 'Syncing securely...' : 'System Live & Protected'}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {window.innerWidth > 768 && (
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="action-btn" style={{ background: '#FFF', color: 'var(--admin-primary)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}>
                                <i className={`fas fa-${isSidebarOpen ? 'outdent' : 'indent'}`}></i> Toggle Menu
                            </button>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'bookings' && (
                        <motion.div key="bookings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {bookings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--admin-text-muted)' }}>
                                    <i className="fas fa-book-open" style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '20px' }}></i>
                                    <h2>No Reservations Yet</h2>
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
                                                <span className="item-detail"><i className="fas fa-phone-alt"></i> {b.phone}</span>
                                                {b.email && <span className="item-detail"><i className="far fa-envelope"></i> {b.email}</span>}
                                            </div>

                                            {b.specialRequests && (
                                                <div className="order-items-box" style={{ borderColor: 'var(--admin-warning)' }}>
                                                    <strong style={{ color: 'var(--admin-warning)' }}><i className="fas fa-star"></i> Special Request:</strong><br/>
                                                    {b.specialRequests}
                                                </div>
                                            )}
                                        </div>
                                        <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', minWidth: '180px' }}>
                                            {b.status === 'pending' && (
                                                <button onClick={() => updateStatus('bookings', b.id, 'confirmed')} className="action-btn btn-confirm">
                                                    <i className="fas fa-check"></i> Confirm Table
                                                </button>
                                            )}
                                            {b.status !== 'cancelled' && (
                                                <button onClick={() => updateStatus('bookings', b.id, 'cancelled')} className="action-btn btn-cancel">
                                                    <i className="fas fa-times"></i> Cancel Booking
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--admin-text-muted)' }}>
                                    <i className="fas fa-utensils" style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '20px' }}></i>
                                    <h2>Kitchen is Quiet</h2>
                                    <p>No active orders right now.</p>
                                </div>
                            ) : (
                                orders.map(o => {
                                    // Map statuses for visual clarity
                                    let badgeClass = 'pending';
                                    let displayStatus = 'Received';
                                    if (o.status === 'preparing') { badgeClass = 'pending'; displayStatus = 'Cooking'; }
                                    if (o.status === 'ready') { badgeClass = 'confirmed'; displayStatus = 'Ready to Serve'; }
                                    if (o.status === 'delivered') { badgeClass = 'confirmed'; displayStatus = 'Completed'; }
                                    if (o.status === 'cancelled') { badgeClass = 'cancelled'; displayStatus = 'Cancelled'; }

                                    return (
                                        <div key={o.id} className="futuristic-row">
                                            <div style={{ flex: 1, paddingRight: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--admin-text)' }}>
                                                        {o.user?.name || 'Guest'}
                                                    </h3>
                                                    <span className={`item-badge badge-${badgeClass}`}>{displayStatus}</span>
                                                    {o.user?.address && (
                                                        <span className="table-tag" style={{ background: o.user.address.toLowerCase().includes('table') ? 'var(--admin-primary)' : 'var(--admin-accent)', color: o.user.address.toLowerCase().includes('table') ? '#FFF' : '#000' }}>
                                                            <i className="fas fa-map-marker-alt" style={{ marginRight: '5px' }}></i> {o.user.address}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                                    <span className="item-detail"><i className="fas fa-hashtag"></i> {o.id.substring(0, 8)}...</span>
                                                    <span className="item-detail"><i className="fas fa-rupee-sign"></i> {o.total}</span>
                                                    {o.user?.phone && o.user.phone !== 'N/A' && <span className="item-detail"><i className="fas fa-phone-alt"></i> {o.user.phone}</span>}
                                                </div>

                                                <div className="order-items-box">
                                                    <strong style={{ color: 'var(--admin-primary)', marginBottom: '8px', display: 'block' }}>
                                                        <i className="fas fa-receipt"></i> Order Items:
                                                    </strong>
                                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                        {o.items?.map((i, idx) => (
                                                            <li key={idx} style={{ marginBottom: '5px' }}>
                                                                <span style={{ fontWeight: '800', color: 'var(--admin-primary)' }}>{i.quantity}x</span> {i.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', minWidth: '180px' }}>
                                                {o.status === 'received' && (
                                                    <button onClick={() => updateStatus('orders', o.id, 'preparing')} className="action-btn btn-primary">
                                                        <i className="fas fa-fire"></i> Start Cooking
                                                    </button>
                                                )}
                                                {o.status === 'preparing' && (
                                                    <button onClick={() => updateStatus('orders', o.id, 'ready')} className="action-btn btn-confirm">
                                                        <i className="fas fa-bell"></i> Mark Ready
                                                    </button>
                                                )}
                                                {o.status === 'ready' && (
                                                    <button onClick={() => updateStatus('orders', o.id, 'delivered')} className="action-btn" style={{ background: 'var(--admin-text)', color: '#FFF' }}>
                                                        <i className="fas fa-check-double"></i> Complete Order
                                                    </button>
                                                )}
                                                {(o.status === 'received' || o.status === 'preparing') && (
                                                    <button onClick={() => updateStatus('orders', o.id, 'cancelled')} className="action-btn btn-cancel" style={{ marginTop: '10px' }}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
