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

const CULINARY_CATEGORIES = [
    'All Categories',
    'Appetizers & Starters',
    'Tandoor & Kebabs',
    'Vegetarian Main Course',
    'Non-Vegetarian Main Course',
    'Rice & Biryani',
    'Breads',
    'Desserts',
    'Beverages'
];

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [settings, setSettings] = useState({ isOpen: true, isSurgeActive: false, surgeMultiplier: 1.2 });
    
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLang, setModalLang] = useState('en');
    const [isUploading, setIsUploading] = useState(false);
    
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
        const token = localStorage.getItem('adminSessionToken');
        if (!token) {
            handleLogout();
            return;
        }

        // Set default Authorization header for all subsequent Axios calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verify token with backend
        axios.get(`${API_URL}/auth/verify-admin-token`)
            .then(res => {
                if (!res.data.success) {
                    Swal.fire({
                        title: 'Session Expired',
                        text: 'Your secure session has expired. Please log in again.',
                        icon: 'warning',
                        confirmButtonColor: '#8E1C1C'
                    });
                    handleLogout();
                }
            })
            .catch(() => {
                // If backend is offline or fallback JSON mode, let them stay if local storage has token
                console.warn('Could not verify token remotely, offline fallback');
            });

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

            if (lastBookingId.current && newBookings.length > 0 && newBookings[0].id !== lastBookingId.current) {
                playDing();
                Swal.fire({
                    title: 'New Live Booking!',
                    text: `New reservation from ${newBookings[0].name} for ${newBookings[0].guests} guests!`,
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 4500,
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
        localStorage.removeItem('adminSessionToken');
        delete axios.defaults.headers.common['Authorization'];
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

            // Optimistic UI update for instantaneous button responsiveness
            if (type === 'bookings') {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...payload } : b));
            } else {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o));
            }

            await axios.put(`${API_URL}/${type}/${id}`, payload);
        } catch (err) {
            Swal.fire('Error', 'Update failed. Re-syncing database.', 'error');
            // Re-fetch data on failure to restore correct server state
            const timestamp = Date.now();
            axios.get(`${API_URL}/${type}?t=${timestamp}`).then(res => {
                if (type === 'bookings') setBookings(res.data);
                else setOrders(res.data);
            }).catch(e => console.error(e));
        }
    };

    const toggleSurgePricing = async (active, multiplier = 1.2) => {
        try {
            const updatedSettings = { ...settings, isSurgeActive: active, surgeMultiplier: multiplier };
            setSettings(updatedSettings);
            await axios.post(`${API_URL}/settings`, updatedSettings);
            Swal.fire({
                title: active ? `Peak Demand Surge Activated (${multiplier}x)` : 'Surge Pricing Deactivated',
                icon: active ? 'warning' : 'success',
                toast: true, position: 'top-end', timer: 2500, showConfirmButton: false
            });
            fetchData();
        } catch (err) {
            Swal.fire('Error', 'Failed to update surge pricing', 'error');
        }
    };

    const toggleStockStatus = async (item) => {
        const isCurrentlyAvailable = item.available !== false && item.inStock !== false;
        const updated = { ...item, available: !isCurrentlyAvailable, inStock: !isCurrentlyAvailable };
        setMenu(prev => prev.map(m => m.id === item.id ? updated : m));
        try {
            await axios.put(`${API_URL}/menu/${item.id}`, updated);
            Swal.fire({
                title: !isCurrentlyAvailable ? 'Item Back In Stock!' : 'Item Marked Sold Out!',
                icon: !isCurrentlyAvailable ? 'success' : 'info',
                toast: true, position: 'top-end', timer: 2000, showConfirmButton: false
            });
        } catch (err) {
            Swal.fire('Error', 'Failed to toggle stock', 'error');
            fetchData();
        }
    };

    const toggleMenuItem = async (item) => {
        return toggleStockStatus(item);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        if (editingItem?.id) formData.append('productId', editingItem.id);
        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const rawUrl = res.data.imageUrl;
            const baseUrl = API_URL.replace(/\/api$/, '');
            const fullUrl = (rawUrl && rawUrl.startsWith('/uploads')) ? `${baseUrl}${rawUrl}` : rawUrl;
            setEditingItem({ ...editingItem, image: fullUrl });
            Swal.fire({ title: 'Image Saved!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (err) {
            console.error('Upload failed', err);
            Swal.fire('Error', 'Image upload failed', 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleImportUrl = async () => {
        if (!editingItem?.image || (!editingItem.image.startsWith('http://') && !editingItem.image.startsWith('https://'))) {
            Swal.fire('Notice', 'Please enter a valid online image HTTP/HTTPS link first.', 'info');
            return;
        }
        setIsUploading(true);
        try {
            const res = await axios.post(`${API_URL}/upload-url`, {
                url: editingItem.image,
                productId: editingItem.id || Date.now()
            });
            if (res.data?.imageUrl) {
                const rawUrl = res.data.imageUrl;
                const baseUrl = API_URL.replace(/\/api$/, '');
                const fullUrl = (rawUrl && rawUrl.startsWith('/uploads')) ? `${baseUrl}${rawUrl}` : rawUrl;
                setEditingItem({ ...editingItem, image: fullUrl });
                Swal.fire({ title: 'Online Image Downloaded & Saved!', icon: 'success', toast: true, position: 'top-end', timer: 2500, showConfirmButton: false });
            }
        } catch (err) {
            console.error('Import failed', err);
            Swal.fire('Error', 'Failed to internally download online image.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        try {
            let savedItem = { ...editingItem };
            if (savedItem.price && !String(savedItem.price).startsWith('₹')) {
                savedItem.price = `₹${savedItem.price}`;
            }

            // Automatically download & process online image URL if it's external
            if (savedItem.image && (savedItem.image.startsWith('http://') || savedItem.image.startsWith('https://')) && !savedItem.image.includes('/uploads/menu/') && !savedItem.image.includes('cloudinary.com')) {
                try {
                    const urlRes = await axios.post(`${API_URL}/upload-url`, {
                        url: savedItem.image,
                        productId: savedItem.id || Date.now()
                    });
                    if (urlRes.data?.imageUrl) {
                        const rawUrl = urlRes.data.imageUrl;
                        const baseUrl = API_URL.replace(/\/api$/, '');
                        savedItem.image = (rawUrl && rawUrl.startsWith('/uploads')) ? `${baseUrl}${rawUrl}` : rawUrl;
                    }
                } catch (imgErr) {
                    console.warn('Could not internally download online image URL, saving original link:', imgErr);
                }
            }

            // Close modal immediately for smooth transitions
            setIsModalOpen(false);

            if (savedItem.id) {
                // Optimistically update frontend state for existing item
                setMenu(prev => prev.map(m => m.id === savedItem.id ? savedItem : m));
                await axios.put(`${API_URL}/menu/${savedItem.id}`, savedItem);
                Swal.fire({ title: 'Updated!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            } else {
                // Make the call and push the response item once it resolves
                const res = await axios.post(`${API_URL}/menu`, savedItem);
                if (res.data) {
                    setMenu(prev => [...prev, res.data]);
                }
                Swal.fire({ title: 'Added!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to save. Re-syncing.', 'error');
            fetchData();
        }
    };

    const handleDeleteMenu = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Item?', icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--admin-danger)'
        });
        if (result.isConfirmed) {
            try {
                // Optimistically update frontend state
                setMenu(prev => prev.filter(m => m.id !== id));
                await axios.delete(`${API_URL}/menu/${id}`);
            } catch (err) {
                Swal.fire('Error', 'Failed to delete. Re-syncing.', 'error');
                fetchData();
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
        <div className="admin-layout-wrapper">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && window.innerWidth <= 992 && (
                <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isSidebarOpen && window.innerWidth <= 992 ? 'mobile-open' : ''}`}>
                <div>
                    {/* Brand Section */}
                    <div className="sidebar-brand">
                        <div className="sidebar-logo-icon">K</div>
                        {isSidebarOpen && (
                            <div className="sidebar-brand-text">
                                <span className="sidebar-brand-title">Khaliya</span>
                                <span className="sidebar-brand-sub">Command Center</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Menu Links */}
                    <nav className="sidebar-nav">
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('dashboard'); if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Dashboard"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-chart-pie"></i>
                                {isSidebarOpen && <span>Dashboard</span>}
                            </div>
                        </button>

                        <button 
                            className={`sidebar-nav-item ${activeTab === 'products' || activeTab === 'menu' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('products'); if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Product Catalog"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-utensils"></i>
                                {isSidebarOpen && <span>Product Catalog</span>}
                            </div>
                        </button>

                        <button 
                            className={`sidebar-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('inventory'); if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Stock & Surge Pricing"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-bolt"></i>
                                {isSidebarOpen && <span>Stock & Surge</span>}
                            </div>
                            {settings.isSurgeActive && (
                                <span className="sidebar-nav-badge" style={{ background: 'var(--admin-accent)' }}>SURGE</span>
                            )}
                        </button>

                        <button 
                            className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('orders'); if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Live Orders"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-fire-burner"></i>
                                {isSidebarOpen && <span>Live Orders</span>}
                            </div>
                            {pendingOrdersCount > 0 && (
                                <span className="sidebar-nav-badge">{pendingOrdersCount}</span>
                            )}
                        </button>

                        <button 
                            className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('bookings'); if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Reservations"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-calendar-check"></i>
                                {isSidebarOpen && <span>Reservations</span>}
                            </div>
                        </button>

                        <button 
                            className={`sidebar-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('reviews'); if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Feedback"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-star"></i>
                                {isSidebarOpen && <span>Feedback</span>}
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    {isSidebarOpen && (
                        <div className="sidebar-profile">
                            <div className="sidebar-profile-avatar">S</div>
                            <div className="sidebar-profile-info">
                                <span className="sidebar-profile-name">Shiv Kumar</span>
                                <span className="sidebar-profile-role">Administrator</span>
                            </div>
                        </div>
                    )}
                    <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
                        <i className="fas fa-sign-out-alt"></i>
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA (RIGHT SIDE) */}
            <div className="admin-content-wrapper">
                {/* Topbar Header */}
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Toggle Sidebar">
                            <i className={`fas ${isSidebarOpen ? 'fa-outdent' : 'fa-indent'}`}></i>
                        </button>
                        <div className="admin-page-breadcrumb">
                            <span className="breadcrumb-sub">Khaliya Sanctuary</span>
                            <h2 className="breadcrumb-title">
                                {activeTab === 'dashboard' && 'Executive Dashboard'}
                                {activeTab === 'orders' && 'Live Kitchen Orders'}
                                {activeTab === 'menu' && 'Menu & Recipe Management'}
                                {activeTab === 'bookings' && 'Table Reservations'}
                                {activeTab === 'reviews' && 'Customer Reviews & Ratings'}
                            </h2>
                        </div>
                    </div>

                    <div className="admin-topbar-right">
                        <div className="saas-search-bar" style={{ width: '200px', margin: 0 }}>
                            <i className="fas fa-search" style={{ color: 'var(--admin-text-muted)' }}></i>
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>

                        <div className={`saas-status-toggle ${settings.isOpen ? 'open' : 'closed'}`} onClick={toggleStoreStatus} style={{ margin: 0, padding: '8px 14px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></div>
                            <span className="status-toggle-label" style={{ fontSize: '0.85rem' }}>{settings.isOpen ? 'Accepting Orders' : 'Store Closed'}</span>
                        </div>
                    </div>
                </header>

                <main className="admin-main-full">
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
                                                        <div className="order-card-actions">
                                                            {o.status === 'received' && <button onClick={() => updateStatus('orders', o.id, 'preparing')} className="action-btn btn-primary">Start Cooking</button>}
                                                            {o.status === 'preparing' && <button onClick={() => updateStatus('orders', o.id, 'ready')} className="action-btn btn-confirm">Mark Ready</button>}
                                                            {o.status === 'ready' && <button onClick={() => updateStatus('orders', o.id, 'delivered')} className="action-btn btn-complete">Complete</button>}
                                                            {(o.status === 'received' || o.status === 'preparing') && <button onClick={() => updateStatus('orders', o.id, 'cancelled')} className="action-btn btn-cancel">Cancel</button>}
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

                        {/* PRODUCT CATALOG & CREATOR TAB */}
                        {(activeTab === 'products' || activeTab === 'menu') && (
                            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Product Catalog Creator</h2>
                                        <p style={{ margin: '5px 0 0 0', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Manage multilingual dishes, dietary tags, and imagery across 8 culinary categories.</p>
                                    </div>
                                    <button onClick={() => { 
                                        setEditingItem({ 
                                            name: { en: '', hi: '', ar: '' }, 
                                            description: { en: '', hi: '', ar: '' }, 
                                            price: '', 
                                            category: 'Appetizers & Starters', 
                                            available: true, 
                                            image: '' 
                                        }); 
                                        setModalLang('en');
                                        setIsModalOpen(true); 
                                    }} className="action-btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                                        + Create New Product
                                    </button>
                                </div>

                                {/* Culinary Category Filter Pills */}
                                <div className="category-filter-bar">
                                    {CULINARY_CATEGORIES.map(cat => (
                                        <button 
                                            key={cat} 
                                            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="menu-list-view">
                                    {menu.filter(item => {
                                        const matchesCat = selectedCategory === 'All Categories' || item.category === selectedCategory || (selectedCategory.includes('Starters') && (item.category === 'Starters' || item.category === 'Appetizers & Starters'));
                                        const itemNameStr = (typeof item.name === 'object' ? item.name.en : item.name) || '';
                                        const matchesSearch = itemNameStr.toLowerCase().includes(searchQuery.toLowerCase());
                                        return matchesCat && matchesSearch;
                                    }).length === 0 ? (
                                        <div style={{ textAlignment: 'center', padding: '40px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                                            No products found in this category. Click "+ Create New Product" to add one.
                                        </div>
                                    ) : (
                                        menu.filter(item => {
                                            const matchesCat = selectedCategory === 'All Categories' || item.category === selectedCategory || (selectedCategory.includes('Starters') && (item.category === 'Starters' || item.category === 'Appetizers & Starters'));
                                            const itemNameStr = (typeof item.name === 'object' ? item.name.en : item.name) || '';
                                            const matchesSearch = itemNameStr.toLowerCase().includes(searchQuery.toLowerCase());
                                            return matchesCat && matchesSearch;
                                        }).map(item => {
                                            const isAvailable = item.available !== false && item.inStock !== false;
                                            const nameEn = typeof item.name === 'object' ? item.name.en : item.name;
                                            return (
                                                <div key={item.id} className="menu-list-row" style={{ opacity: isAvailable ? 1 : 0.65 }}>
                                                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                                        {item.image ? (
                                                            <img src={item.image} className="menu-list-image" alt={nameEn} />
                                                        ) : (
                                                            <div className="menu-list-image" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <i className="fas fa-utensils" style={{ color: 'var(--admin-text-muted)' }}></i>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--admin-text)' }}>{nameEn}</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                                <span style={{ color: 'var(--admin-primary)', fontWeight: '800', fontSize: '1rem' }}>₹{item.price}</span>
                                                                <span className="category-pill" style={{ padding: '2px 10px', fontSize: '0.72rem', height: '22px' }}>{item.category || 'Appetizers'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                                        <button 
                                                            className={`stock-toggle-btn ${isAvailable ? 'in-stock' : 'sold-out'}`}
                                                            onClick={() => toggleStockStatus(item)}
                                                        >
                                                            <i className={`fas ${isAvailable ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                                            {isAvailable ? 'In Stock' : 'Sold Out'}
                                                        </button>

                                                        <button onClick={() => { 
                                                            const priceClean = item.price ? String(item.price).replace(/[^\d]/g, '') : '';
                                                            setEditingItem({
                                                                ...item,
                                                                price: priceClean,
                                                                name: typeof item.name === 'string' ? { en: item.name, hi: '', ar: '' } : { en: '', hi: '', ar: '', ...(item.name || {}) },
                                                                description: typeof item.description === 'string' ? { en: item.description, hi: '', ar: '' } : { en: '', hi: '', ar: '', ...(item.description || {}) }
                                                            }); 
                                                            setModalLang('en');
                                                            setIsModalOpen(true); 
                                                        }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--admin-border)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', color: 'var(--admin-primary)' }} title="Edit Product">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button onClick={() => handleDeleteMenu(item.id)} style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', color: 'var(--admin-danger)' }} title="Delete Product">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STOCK & PEAK SURGE PRICING TAB */}
                        {activeTab === 'inventory' && (
                            <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="surge-controller-card">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-text)' }}>⚡ Peak Demand Surge Pricing Controller</h2>
                                            <span className={`surge-status-badge ${settings.isSurgeActive ? 'active' : 'inactive'}`}>
                                                {settings.isSurgeActive ? `Surge Active (${settings.surgeMultiplier || 1.2}x)` : 'Standard Pricing'}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '0.9rem', maxWidth: '650px' }}>
                                            Dynamically adjust menu prices during high peak demand (e.g. weekend dinner rush). Out of stock items are instantly hidden from customer ordering apps.
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {[1.1, 1.2, 1.3, 1.5].map(m => (
                                            <button 
                                                key={m} 
                                                className={`surge-multiplier-btn ${settings.isSurgeActive && settings.surgeMultiplier === m ? 'active' : ''}`}
                                                onClick={() => toggleSurgePricing(true, m)}
                                            >
                                                {m}x (+{Math.round((m - 1) * 100)}%)
                                            </button>
                                        ))}
                                        <button 
                                            className={`action-btn ${settings.isSurgeActive ? 'btn-cancel' : 'btn-primary'}`}
                                            onClick={() => toggleSurgePricing(!settings.isSurgeActive, settings.surgeMultiplier || 1.2)}
                                            style={{ padding: '10px 18px' }}
                                        >
                                            {settings.isSurgeActive ? 'Deactivate Surge' : 'Activate Peak Surge'}
                                        </button>
                                    </div>
                                </div>

                                <div className="menu-list-view">
                                    <h3 style={{ marginTop: 0, marginBottom: 15 }}>Live Inventory & Price Overrides</h3>
                                    {menu.map(item => {
                                        const isAvailable = item.available !== false && item.inStock !== false;
                                        const nameEn = typeof item.name === 'object' ? item.name.en : item.name;
                                        const basePrice = item.price ? String(item.price).replace(/[^\d.]/g, '') : '0';
                                        const surgePrice = item.effectivePriceNum || Math.round(Number(basePrice) * (settings.surgeMultiplier || 1.2));
                                        return (
                                            <div key={item.id} className="menu-list-row" style={{ opacity: isAvailable ? 1 : 0.6 }}>
                                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                                    {item.image ? <img src={item.image} className="menu-list-image" alt={nameEn} /> : <div className="menu-list-image" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-box" style={{ color: 'var(--admin-text-muted)' }}></i></div>}
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--admin-text)' }}>{nameEn}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Category: {item.category || 'Main Course'}</div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Base: ₹{basePrice}</div>
                                                        {settings.isSurgeActive && (
                                                            <div style={{ fontWeight: '800', color: 'var(--admin-accent)', fontSize: '0.95rem' }}>
                                                                Surge: ₹{surgePrice}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button 
                                                        className={`stock-toggle-btn ${isAvailable ? 'in-stock' : 'sold-out'}`}
                                                        onClick={() => toggleStockStatus(item)}
                                                        style={{ padding: '8px 16px' }}
                                                    >
                                                        <i className={`fas ${isAvailable ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                                        {isAvailable ? 'In Stock' : 'Mark Out of Stock'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                                <span className="item-detail"><i className="fas fa-phone-alt"></i> {b.phone || b.contactNumber || b.mobile || 'No phone provided'}</span>
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
                                        <input type="number" className="admin-input" required value={editingItem.price ?? ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})} />
                                    </div>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <select className="admin-select" value={editingItem.category || 'Appetizers & Starters'} onChange={e => setEditingItem({...editingItem, category: e.target.value})}>
                                            {CULINARY_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                                    <label>Image URL or Upload</label>
                                    <div className="modal-image-row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input type="text" className="admin-input" placeholder="https://example.com/image.jpg" value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} />
                                            <div style={{ position: 'relative', border: '2px dashed var(--admin-border)', borderRadius: '10px', padding: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'var(--transition)' }}>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                                {isUploading ? (
                                                    <span style={{ color: 'var(--admin-primary)', fontWeight: 'bold' }}><i className="fas fa-spinner fa-spin"></i> Uploading...</span>
                                                ) : (
                                                    <span style={{ color: 'var(--admin-text-muted)' }}><i className="fas fa-cloud-upload-alt"></i> Drag & Drop or Click to Upload</span>
                                                )}
                                            </div>
                                        </div>
                                        {editingItem.image && (
                                            <div style={{ width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)', flexShrink: 0, position: 'relative' }}>
                                                <img 
                                                    key={editingItem.image}
                                                    src={editingItem.image} 
                                                    alt="Preview" 
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Crect width='90' height='90' fill='%23121620'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-size='11' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                    }} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
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
        </div>
    );
}
