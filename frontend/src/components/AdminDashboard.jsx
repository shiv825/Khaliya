import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import '../assets/admin-style.css';

import {
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const API_URL = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '/api';

    const [lastFetchCount, setLastFetchCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const bookingIdsRef = useRef(new Set());
    const [orders, setOrders] = useState([]);
    const orderIdsRef = useRef(new Set());

    useEffect(() => {
        fetchBookings(true); // Initial fetch
        fetchOrders(true);
        fetchMenu();
        
        // Start Phase 2: Super-Fast 2.5s Polling for "Instant" feel
        const pollInterval = setInterval(() => {
            fetchBookings(false);
            fetchOrders(false);
        }, 2500); 

        if (window.innerWidth < 1024) setIsSidebarOpen(false);
        
        return () => clearInterval(pollInterval);
    }, []);

    const fetchBookings = async (isInitial = false) => {
        setIsSyncing(true);
        try {
            const res = await axios.get(`${API_URL}/bookings`);
            const data = res.data || [];
            
            // Check for new bookings to notify
            if (!isInitial && data.length > 0) {
                const newBookings = data.filter(b => !bookingIdsRef.current.has(b.id));
                if (newBookings.length > 0) {
                    newBookings.forEach(nb => {
                        Swal.fire({
                            title: 'New Booking!',
                            text: `${nb.name} just reserved via ${nb.source || 'Web'}`,
                            icon: 'info',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 4000,
                            timerProgressBar: true,
                            background: '#1e293b',
                            color: '#fff'
                        });
                    });
                }
            }

            // Update refs and state
            data.forEach(b => bookingIdsRef.current.add(b.id));
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setTimeout(() => setIsSyncing(false), 800);
        }
    };

    const fetchMenu = async () => {
        try {
            const res = await axios.get(`${API_URL}/menu`);
            setMenu(res.data || []);
        } catch (err) {
            console.error('Failed to fetch menu', err);
        }
    };

    const fetchOrders = async (isInitial = false) => {
        try {
            const res = await axios.get(`${API_URL}/orders`);
            const data = Array.isArray(res.data) ? res.data : [];
            
            if (!isInitial && data.length > 0) {
                const newOrders = data.filter(o => !orderIdsRef.current.has(o.id));
                if (newOrders.length > 0) {
                    newOrders.forEach(no => {
                        Swal.fire({
                            title: 'New App Order!',
                            text: `${no.user?.name || 'Guest'} just ordered ${no.items?.length || 0} items`,
                            icon: 'info',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 4000,
                            timerProgressBar: true,
                            background: '#1D3557',
                            color: '#fff'
                        });
                    });
                }
            }

            data.forEach(o => orderIdsRef.current.add(o.id));
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout?',
            text: "You will be redirected to the home page.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E63946',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem('adminLoggedIn');
                onLogout(false);
                navigate('/');
            }
        });
    };

    // -- BOOKINGS LOGIC --
    const confirmBooking = async (id) => {
        try {
            await axios.put(`${API_URL}/bookings/${id}`, { status: 'confirmed' });
            fetchBookings();
            Swal.fire({ title: 'Confirmed!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (err) { console.error(err); }
    };

    const deleteBooking = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This booking will be permanently removed!",
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/bookings/${id}`);
                fetchBookings();
                Swal.fire('Deleted!', 'Booking has been deleted.', 'success');
            } catch (err) { console.error(err); }
        }
    };

    const sendWhatsApp = (booking) => {
        if (!booking.phone) return Swal.fire('Error', 'No phone number available', 'error');
        let phoneNum = booking.phone.replace(/[\s\-()]/g, '');
        if (phoneNum.length === 10) phoneNum = '91' + phoneNum;
        else if (phoneNum.startsWith('0')) phoneNum = '91' + phoneNum.substring(1);
        else if (phoneNum.startsWith('+')) phoneNum = phoneNum.substring(1);

        let message = `Hello ${booking.name || 'Guest'}!\n\nThis is a confirmation from Khaliya Restaurant. Your table reservation is confirmed:\n`;
        message += `📅 Date: ${booking.date}\n`;
        message += `⏰ Time: ${booking.time}\n`;
        message += `👥 Guests: ${booking.guests}\n`;
        message += `🪑 Table Type: ${booking.tableType}\n\n`;
        message += `Reference ID: #${booking.id}\n\nWe look forward to serving you!`;

        window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const filteredBookings = bookings.filter(b => {
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        if (search) {
            const hay = `${b.name} ${b.phone} ${b.date} ${b.email}`.toLowerCase();
            if (!hay.includes(search.toLowerCase())) return false;
        }
        return true;
    }).reverse();

    // -- STATS LOGIC --
    const todayFormatted = new Date().toISOString().split('T')[0];
    let todayBookingsCount = 0;
    let todayGuestsCount = 0;
    let totalGuests = 0;

    bookings.forEach(b => {
        const g = parseInt(b.guests) || 0;
        totalGuests += g;
        if (b.date && b.date.trim() === todayFormatted) {
            todayBookingsCount++;
            todayGuestsCount += g;
        }
    });

    // -- CHARTS LOGIC --
    const getChartData = () => {
        const last7Days = [];
        const counts = {};
        const revenue = {};

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days.push(dateStr);
            counts[dateStr] = 0;
            revenue[dateStr] = 0;
        }

        bookings.forEach(b => {
            if (counts[b.date] !== undefined) {
                counts[b.date]++;
                revenue[b.date] += (parseInt(b.guests) || 0) * 300;
            }
        });

        const labels = last7Days.map(d => d.substring(5)); // MM-DD
        
        // Source Data
        const sourceCounts = { 'Website': 0, 'App': 0 };
        bookings.forEach(b => {
            const s = b.source === 'App' ? 'App' : 'Website';
            sourceCounts[s]++;
        });

        // Peak Hour Data (Last 30 days)
        const hourCounts = {};
        bookings.forEach(b => {
            if (b.time) {
                hourCounts[b.time] = (hourCounts[b.time] || 0) + 1;
            }
        });

        return {
            trends: {
                labels,
                datasets: [{
                    label: 'Bookings',
                    data: last7Days.map(d => counts[d]),
                    borderColor: '#E63946',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#E63946'
                }]
            },
            revenue: {
                labels,
                datasets: [{
                    label: 'Est. Revenue',
                    data: last7Days.map(d => revenue[d]),
                    backgroundColor: '#457B9D',
                    borderRadius: 8,
                    barThickness: 20
                }]
            },
            sources: {
                labels: ['Website', 'App'],
                datasets: [{
                    data: [sourceCounts['Website'], sourceCounts['App']],
                    backgroundColor: ['#1D3557', '#E63946'],
                    borderWidth: 0
                }]
            },
            peakHours: {
                labels: Object.keys(hourCounts).sort(),
                datasets: [{
                    label: 'Volume',
                    data: Object.keys(hourCounts).sort().map(k => hourCounts[k]),
                    backgroundColor: '#FFB703',
                    borderRadius: 4
                }]
            }
        };
    };

    const charts = getChartData();

    // -- MENU LOGIC --
    const addMenuItem = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Menu Item',
            html:
                '<input id="swal-category" class="swal2-input" placeholder="Category (e.g. Appetizer)">' +
                '<input id="swal-name" class="swal2-input" placeholder="Item Name">' +
                '<input id="swal-description" class="swal2-input" placeholder="Description">' +
                '<input id="swal-price" class="swal2-input" placeholder="Price (e.g. ₹250)">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    category: document.getElementById('swal-category').value,
                    name: document.getElementById('swal-name').value,
                    description: document.getElementById('swal-description').value,
                    price: document.getElementById('swal-price').value
                }
            }
        });

        if (formValues && formValues.name && formValues.price) {
            try {
                await axios.post(`${API_URL}/menu`, formValues);
                fetchMenu();
                Swal.fire('Success', 'Item added to menu', 'success');
            } catch (err) { Swal.fire('Error', 'Failed to add item', 'error'); }
        }
    };

    const exportToCSV = () => {
        if (!bookings.length) return Swal.fire('No Data', 'There are no reservations to export.', 'info');
        
        const headers = ["ID", "Name", "Date", "Time", "Guests", "Phone", "Email", "Table Type", "Status"];
        const rows = bookings.map(b => [
            b.id, `"${b.name}"`, b.date, b.time, b.guests, `"${b.phone}"`, `"${b.email}"`, b.tableType, b.status
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `khaliya_bookings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Swal.fire({ title: 'Exported!', text: 'CSV file has been downloaded.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    };

    const toggleMenuAvailability = async (id, currentStatus) => {
        const newStatus = currentStatus === 'sold-out' ? 'available' : 'sold-out';
        try {
            await axios.put(`${API_URL}/menu/${id}`, { status: newStatus });
            fetchMenu();
            Swal.fire({ title: 'Updated!', text: `Item is now ${newStatus}`, icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (err) { console.error('Failed to update menu status', err); }
    };

    const deleteMenuItem = async (id) => {
        const result = await Swal.fire({
            title: 'Remove from Menu?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E63946',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            await axios.delete(`${API_URL}/menu/${id}`);
            fetchMenu();
            Swal.fire('Removed!', 'Menu item deleted.', 'success');
        }
    };

    // -- ORDERS LOGIC --
    const updateOrderStatus = async (id, newStatus) => {
        try {
            await axios.put(`${API_URL}/orders/${id}`, { status: newStatus });
            fetchOrders();
            Swal.fire({ title: 'Order Updated!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (err) { console.error(err); }
    };

    const deleteOrder = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Order?',
            text: "This will remove the order permanently.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/orders/${id}`);
                fetchOrders();
                Swal.fire('Deleted!', 'Order has been deleted.', 'success');
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div className="admin-portal-wrapper admin-layout">
            
            {/* Sidebar */}
            <aside className="admin-sidebar" style={{ width: isSidebarOpen ? '280px' : '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem', whiteSpace: 'nowrap' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--admin-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-utensils"></i>
                    </div>
                    {isSidebarOpen && <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Khaliya Admin</span>}
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { id: 'orders', icon: 'fa-shopping-bag', label: 'App Orders' },
                        { id: 'bookings', icon: 'fa-calendar-check', label: 'Reservations' },
                        { id: 'menu', icon: 'fa-layer-group', label: 'Menu Manager' },
                        { id: 'stats', icon: 'fa-chart-pie', label: 'Analytics' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '12px 15px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                color: activeTab === item.id ? '#fff' : '#94a3b8',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                width: '100%'
                            }}
                        >
                            <i className={`fas ${item.icon}`} style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}></i>
                            {isSidebarOpen && <span style={{ fontWeight: '600' }}>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <button 
                    onClick={handleLogout}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '12px 15px',
                        background: 'rgba(230, 57, 70, 0.1)',
                        border: 'none',
                        color: 'var(--admin-primary)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '700'
                    }}
                >
                    <i className="fas fa-sign-out-alt" style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}></i>
                    {isSidebarOpen && <span>Logout</span>}
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main-content">
                
                {/* Header / Top Bar */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
                                {activeTab === 'orders' ? 'App Orders Command' : activeTab === 'bookings' ? 'Reservations Control' : activeTab === 'menu' ? 'Menu Management' : 'Performance Insights'}
                            </h2>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                padding: '4px 10px', 
                                borderRadius: '20px',
                                marginLeft: '10px'
                            }}>
                                <div className={`sync-dot ${isSyncing ? 'syncing' : ''}`} style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Real-Time Command</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0' }}>Manage your restaurant operations effectively</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', marginRight: '10px' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Shiv Kumar</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Super Admin</span>
                        </div>
                        <img src="https://ui-avatars.com/api/?name=Admin&background=E63946&color=fff" style={{ width: '45px', height: '45px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} alt="Admin" />
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'orders' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="orders">
                            <div className="admin-stats-grid">
                                {[
                                    { label: 'Active Orders', value: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length, icon: 'fa-fire', color: '#E63946' },
                                    { label: 'Total App Orders', value: orders.length, icon: 'fa-shopping-bag', color: '#457B9D' },
                                    { label: 'Total Revenue', value: '₹' + orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0), icon: 'fa-coins', color: '#10b981' }
                                ].map((stat, i) => (
                                    <div key={i} className="stat-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: `${stat.color}15`, color: stat.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className={`fas ${stat.icon}`}></i>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>{stat.label}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="admin-glass-card" style={{ padding: '2.5rem', background: '#fff' }}>
                                <h3 style={{ margin: '0 0 2rem 0' }}>Live Kitchen Queue</h3>
                                <div className="bookings-container">
                                    {orders.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                                            <i className="fas fa-utensils" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                                            <p>No app orders yet.</p>
                                        </div>
                                    ) : [...orders].reverse().map((o) => (
                                        <div key={o.id} className="booking-item futuristic-row" style={{
                                            borderLeft: `6px solid ${o.status === 'delivered' ? '#22c55e' : o.status === 'preparing' ? '#FFB703' : o.status === 'ready' ? '#3b82f6' : '#ef4444'}`,
                                            boxShadow: 'var(--shadow-sm)',
                                            padding: '20px 25px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flex: 1 }}>
                                                <div style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    borderRadius: '18px', 
                                                    background: o.status === 'delivered' ? '#dcfce7' : o.status === 'preparing' ? '#fef3c7' : o.status === 'ready' ? '#dbeafe' : '#fee2e2',
                                                    color: o.status === 'delivered' ? '#166534' : o.status === 'preparing' ? '#92400e' : o.status === 'ready' ? '#1e40af' : '#991b1b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.4rem',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                }}>
                                                    <i className={`fas ${o.status === 'delivered' ? 'fa-check-double' : o.status === 'ready' ? 'fa-box' : 'fa-fire'}`}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                                        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: '#1e293b' }}>{o.user?.name || 'App Guest'}</h3>
                                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>#{o.id}</span>
                                                    </div>
                                                    <div style={{ marginTop: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                        <span className="item-detail"><i className="far fa-clock"></i> {o.timestamp}</span>
                                                        <span className="item-detail"><i className="fas fa-coins"></i> ₹{o.total}</span>
                                                        <span className="item-detail"><i className="fas fa-phone"></i> {o.user?.phone || 'N/A'}</span>
                                                        <span className="source-badge source-app" style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                                                            <i className="fas fa-mobile-alt"></i> Native App
                                                        </span>
                                                    </div>
                                                    <div style={{ marginTop: '12px', padding: '12px 15px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.9rem', color: '#475569' }}>
                                                        <strong>Items:</strong> {o.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="actions" style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <span className={`item-badge badge-${o.status}`} style={{ textAlign: 'center', fontSize: '0.65rem', background: o.status === 'delivered' ? '#dcfce7' : o.status === 'preparing' ? '#fef3c7' : o.status === 'ready' ? '#dbeafe' : '#fee2e2', color: o.status === 'delivered' ? '#166534' : o.status === 'preparing' ? '#92400e' : o.status === 'ready' ? '#1e40af' : '#991b1b' }}>{o.status.toUpperCase()}</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {o.status === 'received' && (
                                                            <button onClick={() => updateOrderStatus(o.id, 'preparing')} className="admin-btn-warning-small" title="Mark Preparing" style={{ background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer' }}><i className="fas fa-fire"></i></button>
                                                        )}
                                                        {o.status === 'preparing' && (
                                                            <button onClick={() => updateOrderStatus(o.id, 'ready')} className="admin-btn-info-small" title="Mark Ready" style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer' }}><i className="fas fa-box"></i></button>
                                                        )}
                                                        {o.status === 'ready' && (
                                                            <button onClick={() => updateOrderStatus(o.id, 'delivered')} className="admin-btn-success-small" title="Mark Delivered" style={{ background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer' }}><i className="fas fa-check-double"></i></button>
                                                        )}
                                                        <button onClick={() => deleteOrder(o.id)} className="admin-btn-danger-small" title="Delete"><i className="far fa-trash-alt"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'bookings' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="bookings">
                            
                            {/* Stats Cards */}
                            <div className="admin-stats-grid">
                                {[
                                    { label: 'Total Volume', value: bookings.length, icon: 'fa-book', color: '#457B9D' },
                                    { label: 'Total Guests', value: totalGuests, icon: 'fa-users', color: '#1D3557' },
                                    { label: 'Today Orders', value: todayBookingsCount, icon: 'fa-clock', color: '#E63946' },
                                    { label: 'Today Guests', value: todayGuestsCount, icon: 'fa-utensils', color: '#FFB703' }
                                ].map((stat, i) => (
                                    <div key={i} className="stat-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: `${stat.color}15`, color: stat.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className={`fas ${stat.icon}`}></i>
                                            </div>
                                            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}><i className="fas fa-arrow-up"></i> 12%</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>{stat.label}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Wrapper */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div className="admin-glass-card" style={{ padding: '2rem', background: '#fff' }}>
                                    <h4 style={{ margin: '0 0 1.5rem 0' }}>Reservation Trends</h4>
                                    <div style={{ height: '240px' }}><Line data={charts.trends} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
                                </div>
                                <div className="admin-glass-card" style={{ padding: '2rem', background: '#fff' }}>
                                    <h4 style={{ margin: '0 0 1.5rem 0' }}>Booking Sources</h4>
                                    <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
                                        <Pie data={charts.sources} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </div>
                                </div>
                                <div className="admin-glass-card" style={{ padding: '2rem', background: '#fff' }}>
                                    <h4 style={{ margin: '0 0 1.5rem 0' }}>Peak Dining Hours</h4>
                                    <div style={{ height: '240px' }}><Bar data={charts.peakHours} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                                </div>
                            </div>

                            {/* Bookings List */}
                            <div className="admin-glass-card" style={{ padding: '2.5rem', background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>Active Reservations</h3>
                                    <div style={{ display: 'flex', gap: '0.8rem', flex: 1, justifyContent: 'flex-end', minWidth: '350px', alignItems: 'center' }}>
                                        <button onClick={exportToCSV} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                                            <i className="fas fa-download"></i> Export CSV
                                        </button>
                                        <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
                                            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                                            <input 
                                                type="text" 
                                                placeholder="Search guest..." 
                                                value={search} 
                                                onChange={(e) => setSearch(e.target.value)} 
                                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                                            />
                                        </div>
                                        <select 
                                            value={statusFilter} 
                                            onChange={(e) => setStatusFilter(e.target.value)} 
                                            style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff', cursor: 'pointer' }}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bookings-container">
                                    {filteredBookings.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                                            <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                                            <p>No reservations found matching your criteria.</p>
                                        </div>
                                    ) : filteredBookings.map((b) => (
                                        <div key={b.id} className="booking-item futuristic-row" style={{
                                            borderLeft: `6px solid ${b.status === 'confirmed' ? '#22c55e' : b.status === 'pending' ? '#FFB703' : '#ef4444'}`,
                                            boxShadow: 'var(--shadow-sm)',
                                            padding: '20px 25px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flex: 1 }}>
                                                <div style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    borderRadius: '18px', 
                                                    background: b.status === 'confirmed' ? '#dcfce7' : b.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                    color: b.status === 'confirmed' ? '#166534' : b.status === 'pending' ? '#92400e' : '#991b1b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.4rem',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                }}>
                                                    <i className={`fas ${b.tableType === 'Premium' ? 'fa-crown' : 'fa-check'}`}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                                        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: '#1e293b' }}>{b.name || 'Anonymous Guest'}</h3>
                                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>#{b.id}</span>
                                                    </div>
                                                    <div style={{ marginTop: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                        <span className="item-detail"><i className="far fa-calendar-alt"></i> {b.date}</span>
                                                        <span className="item-detail"><i className="far fa-clock"></i> {b.time}</span>
                                                        <span className="item-detail"><i className="fas fa-users"></i> {b.guests} Guests</span>
                                                        <span className="item-detail"><i className="fas fa-phone"></i> {b.phone}</span>
                                                        <span className={`source-badge ${b.source === 'App' ? 'source-app' : 'source-web'}`} style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                                                            <i className={`fas ${b.source === 'App' ? 'fa-mobile-alt' : 'fa-laptop'}`}></i> {b.source || 'Web'}
                                                        </span>
                                                    </div>
                                                    {b.specialRequests && (
                                                        <div style={{ marginTop: '12px', padding: '12px 15px', background: '#f8fafc', borderRadius: '10px', borderLeft: '3px solid #64748b', fontSize: '0.9rem', color: '#475569', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                                                            <strong>Special Note:</strong> {b.specialRequests}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="actions" style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <span className={`item-badge badge-${b.status}`} style={{ textAlign: 'center', fontSize: '0.65rem' }}>{b.status}</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {b.status === 'pending' && (
                                                            <button onClick={() => confirmBooking(b.id)} className="admin-btn-success-small" title="Confirm Booking"><i className="fas fa-check"></i></button>
                                                        )}
                                                        <button onClick={() => sendWhatsApp(b)} className="admin-btn-wa-small" title="Send WhatsApp"><i className="fab fa-whatsapp"></i></button>
                                                        <button onClick={() => deleteBooking(b.id)} className="admin-btn-danger-small" title="Delete"><i className="far fa-trash-alt"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'menu' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="menu">
                             <div className="admin-glass-card" style={{ padding: '2.5rem', background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <h3 style={{ margin: 0 }}>Digital Menu Inventory</h3>
                                    <button onClick={addMenuItem} style={{ background: 'var(--admin-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(230, 57, 70, 0.2)' }}>
                                        <i className="fas fa-plus"></i> Add Menu Item
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {menu.map((item, idx) => (
                                        <div key={idx} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '20px', background: '#f8fafc', transition: 'all 0.3s ease', position: 'relative' }}>
                                            <span style={{ 
                                                position: 'absolute', 
                                                top: '15px', 
                                                right: '15px', 
                                                background: '#e2e8f0', 
                                                padding: '4px 10px', 
                                                borderRadius: '8px', 
                                                fontSize: '0.7rem', 
                                                fontWeight: '800', 
                                                color: '#475569' 
                                            }}>{item.category}</span>
                                            
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{item.name}</h4>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', minHeight: '40px', lineHeight: '1.5' }}>{item.description}</p>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.2rem' }}>{item.price}</div>
                                                    <button 
                                                        onClick={() => toggleMenuAvailability(item.id || item.name, item.status)} 
                                                        style={{ 
                                                            fontSize: '0.7rem', 
                                                            padding: '4px 8px', 
                                                            borderRadius: '6px', 
                                                            border: 'none', 
                                                            cursor: 'pointer',
                                                            background: item.status === 'sold-out' ? '#ef4444' : '#e2e8f0',
                                                            color: item.status === 'sold-out' ? '#fff' : '#64748b'
                                                        }}
                                                    >
                                                        {item.status === 'sold-out' ? 'Sold Out' : 'Available'}
                                                    </button>
                                                </div>
                                                <button onClick={() => deleteMenuItem(item.id || item.name)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1rem' }}><i className="far fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ height: '50px' }}></div>
            </main>

            <style>{`
                .item-detail {
                    font-size: 0.85rem;
                    color: var(--admin-text-muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .bookings-container {
                    display: flex;
                    flex-direction: column;
                }
                canvas {
                    max-width: 100% !important;
                }
                .swal2-popup {
                    border-radius: 24px !important;
                    font-family: inherit !important;
                }
                .swal2-confirm {
                    border-radius: 12px !important;
                    font-weight: 800 !important;
                }
            `}</style>
        </div>
    );
}
