import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import masterMenu from '../data/menu.json';

const AdminContext = createContext(null);

export const CULINARY_CATEGORIES = [
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

const playDing = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
    } catch (e) {}
};

const deduplicateMenu = (arr) => {
    if (!Array.isArray(arr)) return [];
    const seenIds = new Set();
    const seenNames = new Set();
    return arr.filter(item => {
        if (!item) return false;
        const idKey = item.id || item._id ? String(item.id || item._id) : null;
        const rawName = typeof item.name === 'object' ? item.name?.en : item.name;
        const nameKey = rawName ? String(rawName).trim().toLowerCase() : null;

        if (idKey && seenIds.has(idKey)) return false;
        if (nameKey && seenNames.has(nameKey)) return false;

        if (idKey) seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        return true;
    });
};

export function AdminProvider({ children }) {
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [menu, setMenu] = useState(() => {
        try {
            const cached = localStorage.getItem('khaliya_cached_menu');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return deduplicateMenu(parsed);
                }
            }
        } catch (e) {}
        return deduplicateMenu(masterMenu);
    });
    const [reviews, setReviews] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [settings, setSettings] = useState({ isOpen: true, isSurgeActive: false, surgeMultiplier: 1.2 });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLang, setModalLang] = useState('en');
    const [isUploading, setIsUploading] = useState(false);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';
    
    const lastOrderId = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('khaliya_admin_token') || sessionStorage.getItem('khaliya_admin_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        const handleResize = () => {
            if (window.innerWidth <= 992) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = async () => {
        setIsSyncing(true);
        try {
            const timestamp = Date.now();
            const [bRes, oRes, mRes, rRes, tRes, aRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/bookings?t=${timestamp}`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/orders?t=${timestamp}`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/menu?t=${timestamp}`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/reviews?t=${timestamp}`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/tables?t=${timestamp}`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/analytics?t=${timestamp}`).catch(() => ({ data: null })),
                axios.get(`${API_URL}/settings?t=${timestamp}`).catch(() => ({ data: null }))
            ]);

            let newBookings = Array.isArray(bRes.data) ? bRes.data : [];
            let newOrders = Array.isArray(oRes.data) ? oRes.data : [];
            let fetchedMenu = Array.isArray(mRes.data) && mRes.data.length > 0 ? mRes.data : null;
            let newReviews = Array.isArray(rRes.data) ? rRes.data : [];
            let newTables = Array.isArray(tRes.data) ? tRes.data : [];

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
                    showConfirmButton: false
                });
            }
            if (newOrders.length > 0) lastOrderId.current = newOrders[0].id;

            setBookings(newBookings);
            setOrders(newOrders);
            setTables(newTables);
            
            // Only update menu if backend returned non-empty data, or use masterMenu fallback if empty
            if (fetchedMenu && fetchedMenu.length > 0) {
                const cleanMenu = deduplicateMenu(fetchedMenu);
                setMenu(cleanMenu);
                try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(cleanMenu)); } catch (e) {}
            } else {
                setMenu(prev => (prev && prev.length > 0) ? prev : deduplicateMenu(masterMenu));
            }
            setReviews(newReviews);
            if (aRes.data) setAnalytics(aRes.data);
            if (sRes.data) setSettings(sRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const pollInterval = setInterval(() => {
            fetchData();
        }, 8000);
        
        let eventSource = null;
        const sseTimer = setTimeout(() => {
            const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
            const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
            const cleanSseUrl = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? `${cleanApiUrl}/live-updates` : `${cleanApiUrl}/api/live-updates`) : '/api/live-updates';
            
            eventSource = new EventSource(cleanSseUrl);
            eventSource.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.type === 'menu' && Array.isArray(payload.data)) {
                        setMenu(deduplicateMenu(payload.data));
                    } else if (payload.type === 'orders' && Array.isArray(payload.data)) {
                        setOrders([...payload.data].reverse());
                    } else if (payload.type === 'tables' && Array.isArray(payload.data)) {
                        setTables(payload.data);
                    } else if (payload.type === 'bookings' && Array.isArray(payload.data)) {
                        setBookings([...payload.data].reverse());
                    } else if (payload.type === 'reviews' && Array.isArray(payload.data)) {
                        setReviews([...payload.data].reverse());
                    } else if (payload.type === 'settings' && payload.data) {
                        setSettings(payload.data);
                    } else {
                        fetchData();
                    }
                } catch (e) {
                    fetchData();
                }
            };
            eventSource.onerror = () => {};
        }, 1000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(sseTimer);
            if (eventSource) eventSource.close();
        };
    }, []);

    const updateStatus = async (type, id, status, estimatedTime = null) => {
        try {
            const payload = { status };
            if (estimatedTime) payload.estimatedTime = estimatedTime;

            if (type === 'bookings') {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...payload } : b));
            } else {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o));
            }

            await axios.put(`${API_URL}/${type}/${id}`, payload);
        } catch (err) {
            Swal.fire('Error', 'Update failed. Re-syncing.', 'error');
            fetchData();
        }
    };

    const toggleStoreStatus = async () => {
        const newStatus = !settings.isOpen;
        setSettings({ ...settings, isOpen: newStatus });
        try {
            await axios.post(`${API_URL}/settings`, { isOpen: newStatus });
            Swal.fire({
                title: newStatus ? 'Store Opened!' : 'Store Closed!',
                text: newStatus ? 'Now accepting online orders.' : 'Store is now offline for orders.',
                icon: newStatus ? 'success' : 'warning',
                toast: true, position: 'top-end', timer: 3000, showConfirmButton: false
            });
        } catch (err) {
            Swal.fire('Error', 'Failed to update store status', 'error');
            fetchData();
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

    const updateStoreSettings = async (newSettings) => {
        try {
            const merged = { ...settings, ...newSettings };
            setSettings(merged);
            const res = await axios.post(`${API_URL}/settings`, merged);
            if (res.data?.success || res.data?.settings) {
                if (res.data.settings) setSettings(res.data.settings);
                Swal.fire({
                    title: 'Settings Saved!',
                    text: 'Store fees, location & delivery radius updated successfully.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
                return true;
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to save store settings', 'error');
            fetchData();
            return false;
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
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleConvertUrlToCloudinary = async (urlToConvert) => {
        if (!urlToConvert || (!urlToConvert.startsWith('http://') && !urlToConvert.startsWith('https://'))) return;
        if (urlToConvert.includes('cloudinary.com')) return;

        setIsUploading(true);
        try {
            const res = await axios.post(`${API_URL}/upload-url`, {
                url: urlToConvert,
                productId: editingItem?.id || Date.now()
            });
            if (res.data?.imageUrl) {
                setEditingItem(prev => ({ ...prev, image: res.data.imageUrl }));
                Toast.fire({ icon: 'success', title: 'URL Saved to Cloudinary!' });
            }
        } catch (err) {
            console.error('Error converting URL to Cloudinary:', err);
            Toast.fire({ icon: 'error', title: 'Cloudinary conversion failed' });
        } finally {
            setIsUploading(false);
        }
    };

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        try {
            let savedItem = { ...editingItem };
            const cleanPriceNum = String(savedItem.price || '0').replace(/[^\d.]/g, '');
            savedItem.price = `₹${cleanPriceNum}`;

            // Match existing item by ID or English dish name to ensure in-place update
            const existingInMenu = menu.find(m => 
                (savedItem.id && String(m.id || m._id) === String(savedItem.id)) ||
                (savedItem._id && String(m.id || m._id) === String(savedItem._id)) ||
                (m.name && savedItem.name && (
                    (typeof m.name === 'object' && typeof savedItem.name === 'object' && m.name.en && savedItem.name.en && String(m.name.en).trim().toLowerCase() === String(savedItem.name.en).trim().toLowerCase()) ||
                    (typeof m.name === 'string' && typeof savedItem.name === 'string' && m.name.trim().toLowerCase() === savedItem.name.trim().toLowerCase())
                ))
            );

            const targetId = savedItem.id || savedItem._id || (existingInMenu ? (existingInMenu.id || existingInMenu._id) : null);

            // ☁️ Convert public/online image URL to Cloudinary CDN URL before saving
            if (savedItem.image && (savedItem.image.startsWith('http://') || savedItem.image.startsWith('https://')) && !savedItem.image.includes('cloudinary.com')) {
                try {
                    const urlRes = await axios.post(`${API_URL}/upload-url`, {
                        url: savedItem.image,
                        productId: targetId || Date.now()
                    });
                    if (urlRes.data?.imageUrl) {
                        savedItem.image = urlRes.data.imageUrl;
                    }
                } catch (imgErr) {
                    console.warn('Could not convert online image URL, saving original:', imgErr);
                }
            }

            setIsModalOpen(false);

            if (targetId) {
                savedItem.id = targetId;
                // ⚡ Optimistic Update with Cloudinary URL
                setMenu(prev => {
                    const next = deduplicateMenu(prev.map(m => (
                        String(m.id || m._id) === String(targetId) ||
                        (typeof m.name === 'object' && typeof savedItem.name === 'object' && m.name.en && savedItem.name.en && String(m.name.en).trim().toLowerCase() === String(savedItem.name.en).trim().toLowerCase())
                    ) ? { ...m, ...savedItem, id: targetId } : m));
                    try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(next)); } catch (e) {}
                    return next;
                });
                Toast.fire({ icon: 'success', title: 'Product Updated Successfully!' });

                // Async network sync to Cloudinary & DB
                const res = await axios.put(`${API_URL}/menu/${targetId}`, savedItem);
                if (res.data && (res.data.id || res.data._id)) {
                    setMenu(prev => {
                        const next = deduplicateMenu(prev.map(m => String(m.id || m._id) === String(targetId) ? res.data : m));
                        try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(next)); } catch (e) {}
                        return next;
                    });
                }
            } else {
                const tempId = Date.now();
                const optimisticItem = { ...savedItem, id: tempId };

                setMenu(prev => {
                    const next = deduplicateMenu([optimisticItem, ...prev]);
                    try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(next)); } catch (e) {}
                    return next;
                });
                Toast.fire({ icon: 'success', title: 'Product Created Successfully!' });

                const res = await axios.post(`${API_URL}/menu`, savedItem);
                if (res.data && (res.data.id || res.data._id)) {
                    setMenu(prev => {
                        const next = deduplicateMenu(prev.map(m => String(m.id) === String(tempId) ? res.data : m));
                        try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(next)); } catch (e) {}
                        return next;
                    });
                }
            }
        } catch (err) {
            console.error('Error saving menu item:', err);
            Toast.fire({ icon: 'error', title: 'Failed to save product' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteMenu = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Item?', icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--admin-danger)'
        });
        if (result.isConfirmed) {
            try {
                setMenu(prev => prev.filter(m => m.id !== id));
                await axios.delete(`${API_URL}/menu/${id}`);
            } catch (err) {
                Swal.fire('Error', 'Failed to delete. Re-syncing.', 'error');
                fetchData();
            }
        }
    };

    const seatCustomer = async (tableId, guestInfo) => {
        try {
            const res = await axios.post(`${API_URL}/tables/seat`, { tableId, ...guestInfo });
            if (res.data?.table) {
                setTables(prev => prev.map(t => t.id === tableId ? res.data.table : t));
                Toast.fire({ icon: 'success', title: `Seated guest at ${tableId}!` });
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to seat guest' });
        }
    };

    const changeTableStatus = async (tableId, status) => {
        try {
            const res = await axios.put(`${API_URL}/tables/${tableId}/status`, { status });
            if (res.data?.table) {
                setTables(prev => prev.map(t => t.id === tableId ? res.data.table : t));
                Toast.fire({ icon: 'info', title: `Table ${tableId} set to ${status}` });
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to update table status' });
        }
    };

    const releaseTable = async (tableId) => {
        try {
            const res = await axios.post(`${API_URL}/tables/${tableId}/release`);
            if (res.data?.table) {
                setTables(prev => prev.map(t => t.id === tableId ? res.data.table : t));
                Toast.fire({ icon: 'success', title: `Table ${tableId} is now AVAILABLE!` });
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to release table' });
        }
    };

    const addTable = async (tableData) => {
        try {
            const res = await axios.post(`${API_URL}/tables`, tableData);
            if (res.data?.table) {
                setTables(prev => [...prev, res.data.table]);
                Toast.fire({ icon: 'success', title: `Created ${res.data.table.name}!` });
                return true;
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to add table' });
            return false;
        }
    };

    const updateTable = async (tableId, tableData) => {
        try {
            const res = await axios.put(`${API_URL}/tables/${tableId}`, tableData);
            if (res.data?.table) {
                setTables(prev => prev.map(t => t.id === tableId ? res.data.table : t));
                Toast.fire({ icon: 'success', title: `Updated ${tableId}!` });
                return true;
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to update table' });
            return false;
        }
    };

    const deleteTable = async (tableId) => {
        try {
            const res = await axios.delete(`${API_URL}/tables/${tableId}`);
            if (res.data?.success) {
                setTables(prev => prev.filter(t => t.id !== tableId));
                Toast.fire({ icon: 'success', title: `Deleted table ${tableId}` });
                return true;
            }
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Failed to delete table' });
            return false;
        }
    };

    const value = {
        API_URL,
        bookings,
        orders,
        tables,
        menu,
        reviews,
        analytics,
        settings,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isSidebarOpen,
        setIsSidebarOpen,
        isSyncing,
        isModalOpen,
        setIsModalOpen,
        editingItem,
        setEditingItem,
        modalLang,
        setModalLang,
        isUploading,
        fetchData,
        updateStatus,
        toggleStoreStatus,
        toggleSurgePricing,
        updateStoreSettings,
        toggleStockStatus,
        handleImageUpload,
        handleConvertUrlToCloudinary,
        handleSaveMenu,
        handleDeleteMenu,
        seatCustomer,
        changeTableStatus,
        releaseTable,
        addTable,
        updateTable,
        deleteTable
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}
