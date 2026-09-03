import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

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
    const seen = new Set();
    return arr.filter(item => {
        const key = String(item.id || item._id || item.name?.en || item.name);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export function AdminProvider({ children }) {
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState(() => {
        try {
            const cached = localStorage.getItem('khaliya_cached_menu');
            return cached ? deduplicateMenu(JSON.parse(cached)) : [];
        } catch (e) {
            return [];
        }
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
                    showConfirmButton: false
                });
            }
            if (newOrders.length > 0) lastOrderId.current = newOrders[0].id;

            setBookings(newBookings);
            setOrders(newOrders);
            const cleanMenu = deduplicateMenu(newMenu);
            setMenu(cleanMenu);
            try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(cleanMenu)); } catch (e) {}
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
        
        const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
        const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
        const cleanSseUrl = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? `${cleanApiUrl}/live-updates` : `${cleanApiUrl}/api/live-updates`) : '/api/live-updates';
        
        const eventSource = new EventSource(cleanSseUrl);
        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'menu' && Array.isArray(payload.data)) {
                    setMenu(deduplicateMenu(payload.data));
                } else if (payload.type === 'orders' && Array.isArray(payload.data)) {
                    setOrders([...payload.data].reverse());
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

        const interval = setInterval(fetchData, 15000);
        return () => {
            eventSource.close();
            clearInterval(interval);
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
        } catch (err) {
            Swal.fire('Error', 'Image upload failed', 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
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

            setIsModalOpen(false);

            const targetId = savedItem.id || savedItem._id;
            if (targetId) {
                savedItem.id = targetId;
                // ⚡ Instant Optimistic Update (0ms delay for UI)
                setMenu(prev => {
                    const next = deduplicateMenu(prev.map(m => String(m.id || m._id) === String(targetId) ? { ...m, ...savedItem } : m));
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

                // ⚡ Instant Optimistic Create (0ms delay for UI)
                setMenu(prev => {
                    const next = deduplicateMenu([optimisticItem, ...prev]);
                    try { localStorage.setItem('khaliya_cached_menu', JSON.stringify(next)); } catch (e) {}
                    return next;
                });
                Toast.fire({ icon: 'success', title: 'Product Created Successfully!' });

                // Async network sync to Cloudinary & DB
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

    const value = {
        API_URL,
        bookings,
        orders,
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
        toggleStockStatus,
        handleImageUpload,
        handleSaveMenu,
        handleDeleteMenu
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
    return useContext(AdminContext);
}
