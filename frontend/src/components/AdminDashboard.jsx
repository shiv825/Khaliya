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
import '../assets/admin-portal.css';

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
        <div className="admin-portal-body">

            <div className="admin-header">
                <div className="admin-header-title">
                    <h1>Khaliya Admin</h1>
                    <div className="admin-live-badge">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="admin-live-dot"
                        />
                        <span>Live Sync</span>
                    </div>
                </div>
                <div className="admin-nav">
                    <button className={activeTab === 'bookings' ? 'admin-tab-btn active' : 'admin-tab-btn'} onClick={() => setActiveTab('bookings')}>Bookings</button>
                    <button className={activeTab === 'menu' ? 'admin-tab-btn active' : 'admin-tab-btn'} onClick={() => setActiveTab('menu')}>Menu Manager</button>
                    <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {fetchError && (
                <div className="admin-error-message">
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i> {fetchError}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="admin-bookings">
                    {/* Stats Grid */}
                    <div className="admin-stats-grid">
                        {[{ label: 'Total Bookings', value: bookings.length }, { label: 'Total Guests', value: totalGuests }, { label: 'Today Bookings', value: todayBookingsCount }, { label: 'Today Guests', value: todayGuestsCount }].map((stat, i) => (
                            <div key={i} className="admin-stat-card-lite">
                                <div className="stat-label-lite">{stat.label}</div>
                                <div className="stat-value-lite">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="admin-charts-grid">
                        <div className="admin-chart-card">
                            <h3>Booking Trends (7 Days)</h3>
                            <div className="chart-container">
                                <Line data={charts.trends} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                        <div className="admin-chart-card">
                            <h3>Estimated Revenue</h3>
                            <div className="chart-container">
                                <Bar data={charts.revenue} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <div className="admin-bookings-list-container">
                        <div className="admin-bookings-list-header">
                            <h3>All Bookings</h3>
                            <div className="admin-bookings-list-filters">
                                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-filter-input" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-select">
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="admin-bookings-list">
                            {filteredBookings.length === 0 ? <p className="admin-empty-state-text">No reservations found.</p> : filteredBookings.map((b) => (
                                <div key={b.id} className={`booking-list-item ${b.status}`}>
                                    <div className="booking-info">
                                        <div className="booking-guest-name">👤 {b.name || 'Guest'} <span className="booking-id">#{b.id}</span></div>
                                        <div className="booking-details-grid">
                                            <span>📅 {b.date}</span> <span>🕐 {b.time}</span> <span>👥 {b.guests}</span>
                                            <span>📞 {b.phone}</span>
                                            <span className="booking-status-badge">📍 Status: {b.status}</span>
                                        </div>
                                    </div>
                                    <div className="booking-actions">
                                        {b.status === 'pending' && <button onClick={() => confirmBooking(b.id)} className="btn-confirm">Confirm</button>}
                                        <button onClick={() => deleteBooking(b.id)} className="btn-delete-booking">Delete</button>
                                        <button onClick={() => sendWhatsApp(b)} className="btn-whatsapp"><i className="fab fa-whatsapp"></i> WhatsApp</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'menu' && (
                <div className="admin-menu-manager-container">
                    <div className="admin-menu-manager-header">
                        <h2>Menu Manager</h2>
                        <button onClick={addMenuItem} className="btn-add-menu-item">+ Add New Item</button>
                    </div>

                    <div className="admin-menu-manager-grid">
                        {menu.map((item, idx) => (
                            <div key={idx} className="admin-menu-manager-item">
                                <span className="menu-item-category">{item.category}</span>
                                <h3>{item.name}</h3>
                                <p className="menu-item-desc">{item.description}</p>
                                <div className="menu-item-price">{item.price}</div>
                                <div className="menu-item-actions">
                                    <button onClick={() => deleteMenuItem(item.id || item.name)} className="btn-delete-menu-item">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}
