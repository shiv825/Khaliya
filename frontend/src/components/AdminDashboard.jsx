import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fetchError, setFetchError] = useState('');
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchBookings();
        fetchMenu();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/bookings`);
            setBookings(res.data || []);
            setFetchError('');
        } catch (err) {
            console.error('Failed to fetch bookings', err);
            setFetchError('Failed to connect to backend server. Make sure it is running.');
        }
    };

    const fetchMenu = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/menu`);
            setMenu(res.data || []);
            setFetchError('');
        } catch (err) {
            console.error('Failed to fetch menu', err);
            setFetchError('Failed to connect to backend server. Make sure it is running.');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminLoggedIn');
        onLogout(false);
        navigate('/');
    };

    // -- BOOKINGS LOGIC --
    const confirmBooking = async (id) => {
        try {
            await axios.put(`${API_URL}/api/bookings/${id}`, { status: 'confirmed' });
            fetchBookings();
        } catch (err) { console.error(err); }
    };

    const deleteBooking = async (id) => {
        if (!window.confirm('Delete this booking?')) return;
        try {
            await axios.delete(`${API_URL}/api/bookings/${id}`);
            fetchBookings();
        } catch (err) { console.error(err); }
    };

    const sendWhatsApp = (booking) => {
        if (!booking.phone) return alert("No phone number");
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
            // Very simple string matching to see if it landed in the last 7 days.
            if (counts[b.date] !== undefined) {
                counts[b.date]++;
                revenue[b.date] += (parseInt(b.guests) || 0) * 300;
            }
        });

        const labels = last7Days.map(d => d.substring(5)); // MM-DD
        return {
            trends: {
                labels,
                datasets: [{
                    label: 'Bookings',
                    data: last7Days.map(d => counts[d]),
                    borderColor: '#E63946',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            revenue: {
                labels,
                datasets: [{
                    label: 'Estimated Revenue (₹)',
                    data: last7Days.map(d => revenue[d]),
                    backgroundColor: '#E63946',
                    hoverBackgroundColor: '#8b1d26',
                    borderRadius: 8
                }]
            }
        };
    };

    const charts = getChartData();

    // -- MENU LOGIC --
    const addMenuItem = async () => {
        const category = window.prompt('Category (e.g. Appetizer, Main Course):');
        if (!category) return;
        const name = window.prompt('Item name:');
        if (!name) return;
        const description = window.prompt('Description:');
        const price = window.prompt('Price (e.g. ₹250):');

        if (name && price) {
            await axios.post(`${API_URL}/api/menu`, { category, name, description, price });
            fetchMenu();
        }
    };

    const deleteMenuItem = async (id) => {
        if (!window.confirm('Delete this menu item?')) return;
        await axios.delete(`${API_URL}/api/menu/${id}`);
        fetchMenu();
    };

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1.2rem 2.5rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ margin: 0, color: '#E63946', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Khaliya Admin</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Live Sync</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ padding: '0.6rem 1.2rem', background: activeTab === 'bookings' ? '#E63946' : 'transparent', color: activeTab === 'bookings' ? 'white' : '#666', border: activeTab === 'bookings' ? 'none' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }} onClick={() => setActiveTab('bookings')}>Bookings</button>
                    <button style={{ padding: '0.6rem 1.2rem', background: activeTab === 'menu' ? '#E63946' : 'transparent', color: activeTab === 'menu' ? 'white' : '#666', border: activeTab === 'menu' ? 'none' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }} onClick={() => setActiveTab('menu')}>Menu Manager</button>
                    <button style={{ padding: '0.6rem 1.2rem', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {fetchError && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fca5a5', textAlign: 'center', fontWeight: 'bold' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i> {fetchError}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="admin-bookings">
                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        {[{ label: 'Total Bookings', value: bookings.length }, { label: 'Total Guests', value: totalGuests }, { label: 'Today Bookings', value: todayBookingsCount }, { label: 'Today Guests', value: todayGuestsCount }].map((stat, i) => (
                            <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{stat.label}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <h3 style={{ marginTop: 0 }}>Booking Trends (7 Days)</h3>
                            <div style={{ height: '250px' }}>
                                <Line data={charts.trends} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <h3 style={{ marginTop: 0 }}>Estimated Revenue</h3>
                            <div style={{ height: '250px' }}>
                                <Bar data={charts.revenue} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <div style={{ background: 'white', padding: 'clamp(1rem, 5vw, 2rem)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ margin: 0 }}>All Bookings</h3>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                width: '100%',
                                maxWidth: '500px'
                            }}>
                                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: 1, minWidth: '130px', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ddd' }}>
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredBookings.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>No reservations found.</p> : filteredBookings.map((b) => (
                                <div key={b.id} style={{
                                    display: 'flex',
                                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                                    padding: '1.2rem',
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    background: b.status === 'confirmed' ? '#f0fdf4' : b.status === 'pending' ? '#fffbeb' : '#fef2f2',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>👤 {b.name || 'Guest'} <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>#{b.id}</span></div>
                                        <div style={{
                                            color: '#555',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.8rem'
                                        }}>
                                            <span>📅 {b.date}</span> <span>🕐 {b.time}</span> <span>👥 {b.guests}</span>
                                            <span>📞 {b.phone}</span>
                                            <span style={{ fontWeight: 'bold' }}>📍 Status: {b.status}</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        width: window.innerWidth < 768 ? '100%' : 'auto',
                                        flexWrap: 'wrap'
                                    }}>
                                        {b.status === 'pending' && <button onClick={() => confirmBooking(b.id)} style={{ flex: 1, background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm</button>}
                                        <button onClick={() => deleteBooking(b.id)} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                        <button onClick={() => sendWhatsApp(b)} style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}><i className="fab fa-whatsapp"></i> WhatsApp</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'menu' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h2 style={{ margin: 0 }}>Menu Manager</h2>
                        <button onClick={addMenuItem} style={{ background: '#E63946', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add New Item</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {menu.map((item, idx) => (
                            <div key={idx} style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                                <span style={{ background: '#ddd', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.category}</span>
                                <h3 style={{ margin: '0.5rem 0' }}>{item.name}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '40px' }}>{item.description}</p>
                                <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '1.1rem' }}>{item.price}</div>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
                                    <button onClick={() => deleteMenuItem(item.id || item.name)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}
