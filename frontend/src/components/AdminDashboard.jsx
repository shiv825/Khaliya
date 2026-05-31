import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../assets/admin-style.css';

const playDing = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // High C
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
    } catch (e) { console.log("Audio not supported"); }
};

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // New Default
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [settings, setSettings] = useState({ isOpen: true });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLang, setModalLang] = useState('en');
    
    const navigate = useNavigate();

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';
    const lastBookingId = useRef(null);
    const lastOrderId = useRef(null);

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
        
        // Setup EventSource for real-time SSE updates
        const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
        const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
        const cleanSseUrl = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? `${cleanApiUrl}/live-updates` : `${cleanApiUrl}/api/live-updates`) : '/api/live-updates';
        
        console.log('⚡ Connecting to SSE at:', cleanSseUrl);
        const eventSource = new EventSource(cleanSseUrl);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('⚡ [SSE] Real-time Update Triggered:', data.type);
            } catch(e) {}
            fetchData();
        };

        eventSource.onerror = (err) => {
            console.warn('⚠️ [SSE] Connection failed or timed out. Falling back to background polling.', err);
        };

        // Fallback polling (Runs in background as safety measure)
        const interval = setInterval(fetchData, 15000); 
        
        return () => {
            eventSource.close();
            clearInterval(interval);
        };
    }, [API_URL]);

    const fetchData = async () => {
        setIsSyncing(true);
        try {
            const timestamp = new Date().getTime(); 
            const [bRes, oRes, mRes, rRes, aRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/bookings?t=${timestamp}`),
                axios.get(`${API_URL}/orders?t=${timestamp}`),
                axios.get(`${API_URL}/menu?t=${timestamp}`),
                axios.get(`${API_URL}/reviews?t=${timestamp}`),
                axios.get(`${API_URL}/analytics?t=${timestamp}`).catch(() => ({ data: null })),
                axios.get(`${API_URL}/settings?t=${timestamp}`).catch(() => ({ data: null }))
            ]);

            let newBookings = Array.isArray(bRes.data) ? bRes.data : [];
            let newOrders = Array.isArray(oRes.data) ? oRes.data : [];
            let newMenu = Array.isArray(mRes.data) ? mRes.data : [];
            let newReviews = Array.isArray(rRes.data) ? rRes.data : [];

            newBookings = [...newBookings].reverse();
            newOrders = [...newOrders].reverse();
            newReviews = [...newReviews].reverse();

            if (lastOrderId.current && newOrders.length > 0 && newOrders[0].id !== lastOrderId.current) {
                playDing();
                Swal.fire({
                    title: 'New Live Order!',
                    text: `Order received!`,
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    timer: 4000,
                    showConfirmButton: false,
                });
            }

            if (newBookings.length > 0) lastBookingId.current = newBookings[0].id;
            if (newOrders.length > 0) lastOrderId.current = newOrders[0].id;

            setBookings(newBookings);
            setOrders(newOrders);
            setMenu(newMenu);
            setReviews(newReviews);
            if (aRes?.data) setAnalytics(aRes.data);
            if (sRes?.data) setSettings(sRes.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setTimeout(() => setIsSyncing(false), 500);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        onLogout(false);
        navigate('/');
    };

    const toggleStoreStatus = async () => {
        const newStatus = !settings.isOpen;
        setSettings({ ...settings, isOpen: newStatus });
        try {
            await axios.post(`${API_URL}/settings`, { isOpen: newStatus });
        } catch(e) {
            console.error(e);
        }
    };

    const updateStatus = async (type, id, status) => {
        try {
            let estimatedTime = null;
            if (type === 'orders' && status === 'preparing') {
                const order = orders.find(o => o.id === id);
                let maxPrepTime = 15; // default 15 min
                
                if (order && order.items) {
                    order.items.forEach(item => {
                        const menuItem = menu.find(m => 
                            m.name === item.name || 
                            (m.name && m.name.en === item.name)
                        );
                        let itemTime = 15;
                        if (menuItem) {
                            const cat = (menuItem.category || '').toLowerCase();
                            if (cat.includes('main')) itemTime = 25;
                            else if (cat.includes('appetizer') || cat.includes('starter')) itemTime = 15;
                            else if (cat.includes('bread')) itemTime = 10;
                            else if (cat.includes('dessert')) itemTime = 10;
                            else if (cat.includes('beverage')) itemTime = 5;
                        } else {
                            const n = (item.name || '').toLowerCase();
                            if (n.includes('chicken') || n.includes('mutton') || n.includes('paneer') || n.includes('biryani') || n.includes('masala')) itemTime = 25;
                            else if (n.includes('naan') || n.includes('roti') || n.includes('paratha')) itemTime = 10;
                        }
                        if (itemTime > maxPrepTime) maxPrepTime = itemTime;
                    });
                    if (order.items.length > 3) maxPrepTime += 5; // buffer for large orders
                }

                const { value: timeStr } = await Swal.fire({
                    title: 'Preparation Time',
                    input: 'number',
                    inputLabel: 'Estimated minutes for these dishes',
                    inputValue: maxPrepTime,
                    showCancelButton: true,
                    inputValidator: (value) => {
                        if (!value) return 'Please enter the estimated time!';
                    }
                });
                
                if (!timeStr) return; // cancelled
                estimatedTime = parseInt(timeStr, 10);
            }

            const payload = { status };
            if (estimatedTime) {
                payload.estimatedTime = estimatedTime;
            }

            await axios.put(`${API_URL}/${type}/${id}`, payload);
            if (type === 'bookings') {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...payload } : b));
            } else {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o));
            }
        } catch (err) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    const toggleMenuItem = async (item) => {
        const updatedItem = { ...item, available: !item.available };
        try {
            await axios.put(`${API_URL}/menu/${item.id}`, updatedItem);
            setMenu(prev => prev.map(m => m.id === item.id ? updatedItem : m));
        } catch (err) {}
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        try {
            if (editingItem.id) {
                await axios.put(`${API_URL}/menu/${editingItem.id}`, editingItem);
                Swal.fire({ title: 'Updated!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            } else {
                await axios.post(`${API_URL}/menu`, editingItem);
                Swal.fire({ title: 'Added!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            Swal.fire('Error', 'Failed to save', 'error');
        }
    };

    const handleDeleteMenu = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Item?', icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--admin-danger)'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/menu/${id}`);
                fetchData();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete', 'error');
            }
        }
    };

    const pendingOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;
    const outOfStockItems = menu.filter(m => !m.available);
    const kitchenLoad = Math.min((pendingOrdersCount / 20) * 100, 100); 

    const filteredOrders = orders.filter(o => o.id.includes(searchQuery) || (o.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const pieColors = ['#E63946', '#FF9F1C', '#2A9D8F', '#264653', '#E9C46A'];
    const categorySales = {};
    orders.forEach(o => {
        if(o.status !== 'cancelled') {
            o.items?.forEach(i => {
                const menuItem = menu.find(m => m.name === i.name || (m.name && m.name.en === i.name));
                const cat = menuItem?.category || 'Other';
                categorySales[cat] = (categorySales[cat] || 0) + i.quantity;
            });
        }
    });
    const pieData = Object.keys(categorySales).map(key => ({ name: key, value: categorySales[key] })).filter(d => d.value > 0);

    return (
        <div className="admin-portal-wrapper admin-layout">
            {isSidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : 'mobile-open'}`}>
                <div className="sidebar-logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h1 style={{ color: 'var(--admin-text)', fontFamily: 'var(--font-heading)', fontSize: isSidebarOpen ? '1.8rem' : '1.2rem', margin: '0 0 20px 0', fontWeight: '900' }}>
                        {isSidebarOpen ? 'Khaliya' : 'K'}
                        <span style={{ color: 'var(--admin-primary)' }}>.</span>
                    </h1>
                    <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <nav className="admin-nav">
                    <button className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); if(window.innerWidth <= 768) setIsSidebarOpen(false); }}>
                        <i className="fas fa-th-large"></i>
                        <span className="nav-label">Dashboard</span>
                    </button>
                    <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); if(window.innerWidth <= 768) setIsSidebarOpen(false); }}>
                        <i className="fas fa-fire-burner"></i>
                        <span className="nav-label">Live Orders</span>
                        {pendingOrdersCount > 0 && <span className="nav-badge">{pendingOrdersCount}</span>}
                    </button>
                    <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => { setActiveTab('menu'); if(window.innerWidth <= 768) setIsSidebarOpen(false); }}>
                        <i className="fas fa-hamburger"></i>
                        <span className="nav-label">Menu Setup</span>
                    </button>
                    <button className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => { setActiveTab('bookings'); if(window.innerWidth <= 768) setIsSidebarOpen(false); }}>
                        <i className="fas fa-calendar-check"></i>
                        <span className="nav-label">Reservations</span>
                    </button>
                    <button className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => { setActiveTab('reviews'); if(window.innerWidth <= 768) setIsSidebarOpen(false); }}>
                        <i className="fas fa-star"></i>
                        <span className="nav-label">Feedback</span>
                    </button>
                </nav>

                <button className="nav-tab" onClick={handleLogout} style={{ color: 'var(--admin-danger)', marginTop: 'auto' }}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span className="nav-label">Sign Out</span>
                </button>
            </aside>

            <main className={`admin-main-content ${!isSidebarOpen ? 'expanded' : ''}`} style={{ padding: 0 }}>
                {/* SAAS TOP HEADER */}
                <div className="saas-top-header">
                    <div className="saas-top-header-left">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="saas-search-bar">
                            <i className="fas fa-search" style={{ color: 'var(--admin-text-muted)' }}></i>
                            <input type="text" placeholder="Search orders, customers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="saas-top-header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className={`saas-status-toggle ${settings.isOpen ? 'open' : 'closed'}`} onClick={toggleStoreStatus}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'currentColor' }}></div>
                            <span>{settings.isOpen ? 'Accepting Orders' : 'Store Closed'}</span>
                        </div>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <i className="fas fa-bell" style={{ fontSize: '1.2rem', color: 'var(--admin-text-muted)' }}></i>
                            {pendingOrdersCount > 0 && (
                                <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--admin-primary)', color: '#FFF', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                                    {pendingOrdersCount}
                                </span>
                            )}
                        </div>
                        <div style={{ width: 35, height: 35, borderRadius: '50%', background: 'var(--admin-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    <AnimatePresence mode="wait">
                        
                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && (
                            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="hero-grid">
                                    <div className="hero-card">
                                        <div className="hero-card-title">Today's Revenue</div>
                                        <div className="hero-card-value">₹{analytics?.revenue?.today?.toFixed(2) || '0.00'}</div>
                                        <div className="hero-card-trend" style={{ color: 'var(--admin-success)' }}><i className="fas fa-arrow-up"></i> Live tracking</div>
                                    </div>
                                    <div className="hero-card">
                                        <div className="hero-card-title">Active Orders</div>
                                        <div className="hero-card-value">{analytics?.activeOrders || 0}</div>
                                        <div className="hero-card-trend" style={{ color: 'var(--admin-accent)' }}>Kitchen is preparing</div>
                                    </div>
                                    <div className="hero-card">
                                        <div className="hero-card-title">New Customers Today</div>
                                        <div className="hero-card-value">{analytics?.visitors?.today || 0}</div>
                                        <div className="hero-card-trend" style={{ color: 'var(--admin-success)' }}><i className="fas fa-chart-line"></i> App & Web Traffic</div>
                                    </div>
                                    <div className="hero-card">
                                        <div className="hero-card-title">Top Selling Item</div>
                                        <div className="hero-card-value" style={{ fontSize: '1.2rem', marginTop: '10px' }}>{typeof analytics?.topItem?.name === 'object' ? analytics.topItem.name.en : (analytics?.topItem?.name || 'Loading...')}</div>
                                        <div className="hero-card-trend" style={{ color: 'var(--admin-primary)' }}>🔥 {analytics?.topItem?.sold || 0} sold today</div>
                                    </div>
                                </div>

                                <div className="admin-charts-grid">
                                    <div className="hero-card" style={{ height: '400px' }}>
                                        <h3 style={{ margin: '0 0 20px 0' }}>Hourly Rush (Orders Today)</h3>
                                        {analytics?.hourlyRush && analytics.hourlyRush.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={analytics.hourlyRush}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="time" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="orders" stroke="var(--admin-primary)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)' }}>Not enough data for chart</div>
                                        )}
                                    </div>
                                    <div className="hero-card" style={{ height: '400px' }}>
                                        <h3 style={{ margin: '0 0 20px 0' }}>Sales by Category</h3>
                                        {pieData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-text-muted)' }}>Not enough data for chart</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* LIVE ORDERS SPLIT SCREEN */}
                        {activeTab === 'orders' && (
                            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="split-screen">
                                <div className="split-left kanban-grid">
                                    {['received', 'preparing', 'ready'].map(status => (
                                        <div 
                                            key={status} 
                                            className="kanban-column" 
                                            style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px', borderRadius: '15px', background: 'rgba(0,0,0,0.02)' }}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const orderId = e.dataTransfer.getData('orderId');
                                                if (orderId) updateStatus('orders', orderId, status);
                                            }}
                                        >
                                            <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.2rem', textTransform: 'capitalize' }}>
                                                {status === 'received' ? 'New Orders' : status}
                                            </h2>
                                            {filteredOrders.filter(o => o.status === status).length === 0 ? (
                                                <p style={{ color: 'var(--admin-text-muted)' }}>No orders</p>
                                            ) : (
                                                filteredOrders.filter(o => o.status === status).map(o => (
                                                    <div 
                                                        key={o.id} 
                                                        className={`kanban-card status-${o.status}`}
                                                        draggable
                                                        onDragStart={(e) => e.dataTransfer.setData('orderId', o.id)}
                                                        style={{ cursor: 'grab' }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <h3 style={{ margin: 0 }}>{o.user?.name || 'Guest'} <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>#{o.id.substring(0,6)}</span></h3>
                                                            <span className={`item-badge badge-${o.status === 'received' ? 'pending' : 'confirmed'}`}>{o.status.toUpperCase()}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.95rem', color: 'var(--admin-text)', marginTop: '10px' }}>
                                                            {o.items?.map((i, idx) => {
                                                                const isVeg = menu.find(m => m.name?.en === i.name || m.name === i.name)?.tags?.includes('veg');
                                                                const isNonVeg = menu.find(m => m.name?.en === i.name || m.name === i.name)?.tags?.includes('non-veg');
                                                                return (
                                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px dashed var(--admin-border)' }}>
                                                                        <span style={{ fontWeight: '800', color: 'var(--admin-primary)', minWidth: '24px' }}>{i.quantity}x</span> 
                                                                        <span style={{ flex: 1 }}>{typeof i.name === 'object' ? i.name.en : i.name}</span>
                                                                        {isVeg && <span title="Vegetarian" style={{ fontSize: '0.8rem', filter: 'drop-shadow(0 0 3px rgba(0,255,0,0.4))' }}>🌱</span>}
                                                                        {isNonVeg && <span title="Non-Vegetarian" style={{ fontSize: '0.8rem', filter: 'drop-shadow(0 0 3px rgba(255,0,0,0.4))' }}>🍖</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px', marginTop: 10, flexWrap: 'wrap' }}>
                                                            {o.status === 'received' && <button onClick={() => updateStatus('orders', o.id, 'preparing')} className="action-btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Start Cooking</button>}
                                                            {o.status === 'preparing' && <button onClick={() => updateStatus('orders', o.id, 'ready')} className="action-btn btn-confirm" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Mark Ready</button>}
                                                            {o.status === 'ready' && <button onClick={() => updateStatus('orders', o.id, 'delivered')} className="action-btn" style={{ padding: '8px 15px', fontSize: '0.8rem', background: 'var(--admin-bg)', color: '#FFF' }}>Complete</button>}
                                                            {(o.status === 'received' || o.status === 'preparing') && <button onClick={() => updateStatus('orders', o.id, 'cancelled')} className="action-btn btn-cancel" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Cancel</button>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="split-right" style={{ flex: 2 }}>
                                    <h3 style={{ marginTop: 0 }}>Kitchen Load</h3>
                                    <div style={{ width: '100%', height: 10, background: '#eee', borderRadius: 5, marginBottom: 5 }}>
                                        <div style={{ width: `${kitchenLoad}%`, height: '100%', background: kitchenLoad > 80 ? 'var(--admin-danger)' : 'var(--admin-accent)', borderRadius: 5, transition: 'width 0.5s' }}></div>
                                    </div>
                                    <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#666' }}>{kitchenLoad > 80 ? 'High capacity' : 'Manageable'}</p>

                                    <h3>Stock Alerts</h3>
                                    {outOfStockItems.length === 0 ? <p style={{ fontSize: '0.9rem', color: '#666' }}>All items in stock.</p> : (
                                        <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--admin-danger)', fontSize: '0.9rem' }}>
                                            {outOfStockItems.map(m => <li key={m.id}>{typeof m.name === 'object' ? m.name.en : m.name}</li>)}
                                        </ul>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* MENU MANAGEMENT */}
                        {activeTab === 'menu' && (
                            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <h2 style={{ margin: 0 }}>Menu Catalog</h2>
                                    <button onClick={() => { 
                                        setEditingItem({ 
                                            name: { en: '', hi: '', ar: '' }, 
                                            description: { en: '', hi: '', ar: '' }, 
                                            price: '', 
                                            category: 'Starters', 
                                            available: true, 
                                            image: '' 
                                        }); 
                                        setModalLang('en');
                                        setIsModalOpen(true); 
                                    }} className="action-btn btn-primary">
                                        + Add Item
                                    </button>
                                </div>
                                <div className="menu-list-view">
                                    {menu.map(item => (
                                        <div key={item.id} className="menu-list-row">
                                            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                                {item.image ? <img src={item.image} className="menu-list-image" alt="dish" /> : <div className="menu-list-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-image" style={{ color: '#ccc' }}></i></div>}
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{typeof item.name === 'object' ? item.name.en : item.name}</div>
                                                    <div style={{ color: 'var(--admin-primary)', fontWeight: 'bold' }}>₹{item.price}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#666', width: 60, textAlign: 'right' }}>{item.available ? 'In Stock' : 'Out'}</span>
                                                    <div className={`toggle-switch ${item.available ? 'on' : ''}`} onClick={() => toggleMenuItem(item)}></div>
                                                </div>
                                                <button onClick={() => { 
                                                    setEditingItem({
                                                        ...item,
                                                        name: typeof item.name === 'string' ? { en: item.name, hi: '', ar: '' } : { en: '', hi: '', ar: '', ...(item.name || {}) },
                                                        description: typeof item.description === 'string' ? { en: item.description, hi: '', ar: '' } : { en: '', hi: '', ar: '', ...(item.description || {}) }
                                                    }); 
                                                    setModalLang('en');
                                                    setIsModalOpen(true); 
                                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-accent)' }}><i className="fas fa-edit"></i></button>
                                                <button onClick={() => handleDeleteMenu(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-danger)' }}><i className="fas fa-trash"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* BOOKINGS */}
                        {activeTab === 'bookings' && (
                            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h2 style={{ marginTop: 0, marginBottom: 20 }}>Table Reservations</h2>
                                {bookings.map(b => (
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
                                            </div>
                                        </div>
                                        <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                                            {b.status === 'pending' && (
                                                <button onClick={() => updateStatus('bookings', b.id, 'confirmed')} className="action-btn btn-confirm"> Confirm</button>
                                            )}
                                            {b.status !== 'cancelled' && (
                                                <button onClick={() => updateStatus('bookings', b.id, 'cancelled')} className="action-btn btn-cancel"> Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* REVIEWS */}
                        {activeTab === 'reviews' && (
                            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h2 style={{ marginTop: 0, marginBottom: 20 }}>Customer Feedback</h2>
                                {reviews.map(r => (
                                    <div key={r.id} className="futuristic-row" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0 }}>{r.name || 'Guest'}</h3>
                                            <span style={{ color: '#888' }}>{new Date(r.date || r.id).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: 0, fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 8 }}>"{r.text}"</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        
                    </AnimatePresence>
                </div>
            </main>

            {/* Menu Edit Modal */}
            <AnimatePresence>
                {isModalOpen && editingItem && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="admin-modal-content">
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: 'var(--admin-text)' }}>{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
                            <form onSubmit={handleSaveMenu}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <button type="button" onClick={() => setModalLang('en')} className={`action-btn ${modalLang === 'en' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', border: modalLang !== 'en' ? '1px solid var(--admin-border)' : 'none' }}>English</button>
                                    <button type="button" onClick={() => setModalLang('hi')} className={`action-btn ${modalLang === 'hi' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', border: modalLang !== 'hi' ? '1px solid var(--admin-border)' : 'none' }}>Hindi</button>
                                    <button type="button" onClick={() => setModalLang('ar')} className={`action-btn ${modalLang === 'ar' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', border: modalLang !== 'ar' ? '1px solid var(--admin-border)' : 'none' }}>Arabic</button>
                                </div>
                                <div className="admin-form-group">
                                    <label>Item Name ({modalLang.toUpperCase()})</label>
                                    <input type="text" className="admin-input" required={modalLang === 'en'} value={editingItem.name?.[modalLang] || ''} onChange={e => setEditingItem({...editingItem, name: {...editingItem.name, [modalLang]: e.target.value}})} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Description ({modalLang.toUpperCase()})</label>
                                    <textarea className="admin-textarea" value={editingItem.description?.[modalLang] || ''} onChange={e => setEditingItem({...editingItem, description: {...editingItem.description, [modalLang]: e.target.value}})}></textarea>
                                </div>
                                <div className="admin-form-row">
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Price (₹)</label>
                                        <input type="number" className="admin-input" required value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} />
                                    </div>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <select className="admin-select" value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})}>
                                            <option value="Starters">Starters</option>
                                            <option value="Main Course">Main Course</option>
                                            <option value="Breads">Breads</option>
                                            <option value="Desserts">Desserts</option>
                                            <option value="Beverages">Beverages</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                                    <label>Image URL</label>
                                    <div className="modal-image-row">
                                        <input type="text" className="admin-input" style={{ flex: 1 }} placeholder="https://example.com/image.jpg" value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} />
                                        {editingItem.image && (
                                            <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)', flexShrink: 0 }}>
                                                <img src={editingItem.image} alt="Preview" onError={(e) => e.target.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="admin-form-row modal-actions-row">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="action-btn btn-cancel" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="action-btn btn-primary" style={{ flex: 2 }}>Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
