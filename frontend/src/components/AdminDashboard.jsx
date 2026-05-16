import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import '../assets/admin-style.css';

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const navigate = useNavigate();

    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api';
    const lastBookingId = useRef(null);
    const lastOrderId = useRef(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000); // 1s polling for INSTANT real-time feel
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setIsSyncing(true);
        try {
            const [bRes, oRes] = await Promise.all([
                axios.get(`${API_URL}/bookings`),
                axios.get(`${API_URL}/orders`)
            ]);

            const newBookings = bRes.data || [];
            const newOrders = oRes.data || [];

            // Simple Notification for new items
            if (lastBookingId.current && newBookings.length > 0 && newBookings[0].id !== lastBookingId.current) {
                notifyNew('New Reservation!', `${newBookings[0].name} just booked a table.`);
            }
            if (lastOrderId.current && newOrders.length > 0 && newOrders[0].id !== lastOrderId.current) {
                notifyNew('New Order!', `A new order has been placed.`);
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
            timer: 3000,
            showConfirmButton: false,
            background: '#1A1A1A',
            color: '#D4AF37'
        });
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminLoggedIn');
        onLogout(false);
        navigate('/');
    };

    const updateStatus = async (type, id, status) => {
        try {
            await axios.put(`${API_URL}/${type}/${id}`, { status });
            fetchData();
        } catch (err) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    return (
        <div className="admin-portal-wrapper admin-layout">
            <aside className="admin-sidebar" style={{ width: isSidebarOpen ? '260px' : '80px' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ color: '#D4AF37', fontFamily: 'Playfair Display', fontSize: isSidebarOpen ? '1.5rem' : '1rem' }}>
                        {isSidebarOpen ? 'KHALIYA' : 'K'}
                    </h1>
                </div>

                <nav style={{ flex: 1 }}>
                    <button className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                        <i className="fas fa-calendar-alt"></i>
                        {isSidebarOpen && <span>Reservations</span>}
                    </button>
                    <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                        <i className="fas fa-utensils"></i>
                        {isSidebarOpen && <span>Live Orders</span>}
                    </button>
                    <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
                        <i className="fas fa-layer-group"></i>
                        {isSidebarOpen && <span>Menu</span>}
                    </button>
                </nav>

                <button className="nav-tab" onClick={handleLogout} style={{ color: '#E63946' }}>
                    <i className="fas fa-sign-out-alt"></i>
                    {isSidebarOpen && <span>Sign Out</span>}
                </button>
            </aside>

            <main className="admin-main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2 className="dashboard-header-h">
                            {activeTab === 'bookings' ? 'Reservations Feed' : activeTab === 'orders' ? 'Live Kitchen' : 'Digital Menu'}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={`sync-dot ${isSyncing ? 'syncing' : ''}`} style={{ 
                                width: '10px', 
                                height: '10px', 
                                background: isSyncing ? '#10B981' : '#D4AF37', 
                                borderRadius: '50%',
                                boxShadow: isSyncing ? '0 0 10px #10B981' : 'none',
                                transition: 'all 0.3s ease'
                            }}></div>
                            <span style={{ fontSize: '0.75rem', color: isSyncing ? '#10B981' : '#D4AF37', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {isSyncing ? 'Refreshing Live' : 'Live Syncing'}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="nav-tab" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', padding: '10px' }}>
                            <i className={`fas fa-${isSidebarOpen ? 'outdent' : 'indent'}`}></i>
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'bookings' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {bookings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>No reservations yet.</div>
                            ) : (
                                bookings.map(b => (
                                    <div key={b.id} className="futuristic-row">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{b.name}</h3>
                                                <span className={`item-badge badge-${b.status}`}>{b.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                <span className="item-detail"><i className="far fa-calendar"></i> {b.date}</span>
                                                <span className="item-detail"><i className="far fa-clock"></i> {b.time}</span>
                                                <span className="item-detail"><i className="fas fa-users"></i> {b.guests} Guests</span>
                                                <span className="item-detail"><i className="fas fa-chair"></i> {b.tableType}</span>
                                                <span className="item-detail"><i className="fas fa-phone"></i> {b.phone}</span>
                                            </div>
                                            {b.specialRequests && (
                                                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#888', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                                    <strong>Note:</strong> {b.specialRequests}
                                                </div>
                                            )}
                                        </div>
                                        <div className="actions" style={{ display: 'flex', gap: '10px' }}>
                                            {b.status === 'pending' && (
                                                <button onClick={() => updateStatus('bookings', b.id, 'confirmed')} className="nav-tab" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '8px 15px' }}>Confirm</button>
                                            )}
                                            <button onClick={() => updateStatus('bookings', b.id, 'cancelled')} className="nav-tab" style={{ background: 'rgba(230, 57, 70, 0.1)', color: '#E63946', padding: '8px 15px' }}>Cancel</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'orders' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>No live orders.</div>
                            ) : (
                                orders.map(o => (
                                    <div key={o.id} className="futuristic-row">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{o.user?.name || 'Guest'}</h3>
                                                <span className={`item-badge badge-${o.status === 'received' ? 'pending' : o.status === 'delivered' ? 'confirmed' : 'pending'}`}>{o.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                                                <span className="item-detail"><i className="fas fa-hashtag"></i> {o.id}</span>
                                                <span className="item-detail"><i className="fas fa-coins"></i> ₹{o.total}</span>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', fontSize: '0.9rem' }}>
                                                {o.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </div>
                                        </div>
                                        <div className="actions">
                                            {o.status === 'received' && <button onClick={() => updateStatus('orders', o.id, 'preparing')} className="nav-tab" style={{ background: 'var(--admin-primary)', color: '#000' }}>Prepare</button>}
                                            {o.status === 'preparing' && <button onClick={() => updateStatus('orders', o.id, 'ready')} className="nav-tab" style={{ background: '#10B981', color: '#fff' }}>Ready</button>}
                                            {o.status === 'ready' && <button onClick={() => updateStatus('orders', o.id, 'delivered')} className="nav-tab" style={{ background: '#fff', color: '#000' }}>Complete</button>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
