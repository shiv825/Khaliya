import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../assets/style.css';

export default function TableQrOrder() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    const [tableInfo, setTableInfo] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [dietFilter, setDietFilter] = useState('ALL'); // ALL, VEG, NONVEG
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeOrders, setActiveOrders] = useState([]);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchActiveOrders, 10000);
        return () => clearInterval(interval);
    }, [tableId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tablesRes, menuRes, ordersRes] = await Promise.all([
                axios.get(`${API_URL}/tables`).catch(e => { console.warn('Tables fetch fallback:', e.message); return { data: [] }; }),
                axios.get(`${API_URL}/menu`).catch(e => { console.warn('Menu fetch fallback:', e.message); return { data: [] }; }),
                axios.get(`${API_URL}/orders`).catch(e => { console.warn('Orders fetch fallback:', e.message); return { data: [] }; })
            ]);

            const tablesList = Array.isArray(tablesRes.data) ? tablesRes.data : (tablesRes.data?.tables || []);
            const cleanId = (tableId || '').toLowerCase();
            const currentTable = tablesList.find(t => t.id?.toLowerCase() === cleanId || t.name?.toLowerCase() === cleanId);
            setTableInfo(currentTable || { id: (tableId || '').toUpperCase(), name: `Table ${(tableId || '').toUpperCase()}`, capacity: 4, section: 'Main Hall' });

            const items = Array.isArray(menuRes.data) ? menuRes.data : (menuRes.data?.items || []);
            setMenuItems(items);
            const uniqueCats = ['ALL', ...new Set(items.map(i => i.category || 'General'))];
            setCategories(uniqueCats);

            const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || []);
            const targetTable = (tableId || '').toUpperCase();
            const tableOrders = ordersList.filter(o => 
                ((o.table && String(o.table).toUpperCase() === targetTable) || (o.tableNumber && String(o.tableNumber).toUpperCase() === targetTable)) && 
                o.status !== 'completed' && o.status !== 'cancelled'
            );
            setActiveOrders(tableOrders);
        } catch (err) {
            console.error('Failed to load table ordering data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`);
            const ordersList = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
            const targetTable = (tableId || '').toUpperCase();
            const tableOrders = ordersList.filter(o => 
                ((o.table && String(o.table).toUpperCase() === targetTable) || (o.tableNumber && String(o.tableNumber).toUpperCase() === targetTable)) && 
                o.status !== 'completed' && o.status !== 'cancelled'
            );
            setActiveOrders(tableOrders);
        } catch (err) {}
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const getItemPrice = (item) => {
        if (typeof item.price === 'number') return item.price;
        if (typeof item.price === 'string') return parseInt(item.price.replace(/[^\d]/g, '')) || 0;
        return 0;
    };

    const cartTotal = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const getItemName = (item) => {
        if (item.name && typeof item.name === 'object') {
            return item.name[language] || item.name.en || item.name.hi || 'Item';
        }
        return item.name || 'Item';
    };

    const getItemDesc = (item) => {
        if (item.description && typeof item.description === 'object') {
            return item.description[language] || item.description.en || item.description.hi || '';
        }
        return item.description || '';
    };

    const filteredItems = menuItems.filter(item => {
        const name = getItemName(item).toLowerCase();
        const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        
        let matchesDiet = true;
        if (dietFilter === 'VEG') {
            matchesDiet = item.tags && item.tags.includes('veg');
        } else if (dietFilter === 'NONVEG') {
            matchesDiet = item.tags && item.tags.includes('non-veg');
        }

        return matchesCategory && matchesSearch && matchesDiet;
    });

    const handleRequestBillFromTable = async () => {
        try {
            const tableActiveTotal = activeOrders.reduce((sum, ord) => {
                return sum + (ord.items || []).reduce((isum, it) => isum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
            }, 0);
            const cgst = Math.round(tableActiveTotal * 0.025);
            const sgst = Math.round(tableActiveTotal * 0.025);
            const grandTotal = tableActiveTotal + cgst + sgst;

            const upiQrString = `upi://pay?pa=khaliyarestaurant@upi&pn=Khaliya%20Restaurant&am=${grandTotal}&tr=TBL-${tableId.toUpperCase()}&cu=INR`;
            const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiQrString)}&color=000000&bgcolor=ffffff`;

            Swal.fire({
                title: `🧾 Table ${tableId.toUpperCase()} Bill Summary`,
                html: `
                    <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 18px; color: #FFF;">
                        <div style="font-size: 0.85rem; color: #8A94A6; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between;">
                            <span>Active Items Subtotal:</span>
                            <strong style="color: #FFF;">₹${tableActiveTotal}</strong>
                        </div>
                        <div style="font-size: 0.85rem; color: #8A94A6; margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span>CGST + SGST (5%):</span>
                            <strong style="color: #FFF;">₹${cgst + sgst}</strong>
                        </div>
                        <div style="font-size: 1.2rem; color: #D4AF37; font-weight: 900; border-top: 1px dashed rgba(212, 175, 55, 0.4); padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between;">
                            <span>Total Payable:</span>
                            <span>₹${grandTotal}</span>
                        </div>
                        <div style="text-align: center; margin-top: 16px; background: #FFF; padding: 12px; border-radius: 12px; color: #000;">
                            <div style="font-size: 0.78rem; font-weight: 900; margin-bottom: 6px;">SCAN TO PAY VIA UPI</div>
                            <img src="${upiQrImageUrl}" alt="UPI QR" style="width: 140px; height: 140px; margin: 0 auto; display: block;" />
                            <div style="font-size: 0.68rem; color: #555; margin-top: 4px; font-weight: 700;">GPay • PhonePe • Paytm • BHIM</div>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '🔔 Alert Staff to Bring Bill Folder',
                cancelButtonText: 'Close',
                confirmButtonColor: '#D4AF37',
                cancelButtonColor: '#475569',
                background: '#121620',
                color: '#FFF'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await axios.post(`${API_URL}/tables/request-bill`, { tableId: tableId.toUpperCase() }).catch(() => null);
                    Swal.fire({
                        title: '🔔 Staff Alerted!',
                        text: 'A waiter will bring the leather bill folder to your table shortly.',
                        icon: 'success',
                        confirmButtonColor: '#D4AF37',
                        background: '#121620',
                        color: '#FFF'
                    });
                }
            });
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Could not request bill.', icon: 'error', background: '#121620', color: '#FFF' });
        }
    };

    const handlePlaceDineInOrder = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        const orderData = {
            table: tableId.toUpperCase(),
            tableNumber: tableId.toUpperCase(),
            orderType: 'dine-in',
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: getItemPrice(item),
                quantity: item.quantity
            })),
            total: cartTotal,
            totalAmount: cartTotal,
            notes: notes,
            customerName: tableInfo?.session?.guestName || `Dine-In (${tableId.toUpperCase()})`,
            paymentStatus: 'unpaid',
            status: 'received',
            createdAt: new Date().toISOString()
        };

        try {
            const res = await axios.post(`${API_URL}/orders`, orderData);
            if (res.data.success) {
                await axios.put(`${API_URL}/tables/${tableId.toUpperCase()}/status`, { status: 'OCCUPIED' }).catch(() => {});

                Swal.fire({
                    title: '🎉 Order Sent to Kitchen!',
                    text: `Your order has been transmitted directly to our chefs. Sit back and enjoy!`,
                    icon: 'success',
                    confirmButtonColor: '#D4AF37',
                    background: '#121620',
                    color: '#FFF'
                });

                setCart([]);
                setNotes('');
                setIsCartOpen(false);
                fetchActiveOrders();
            } else {
                throw new Error(res.data.message || 'Failed to place order');
            }
        } catch (err) {
            Swal.fire({
                title: 'Order Failed',
                text: err.response?.data?.message || err.message || 'Error sending order to kitchen. Please inform staff.',
                icon: 'error',
                confirmButtonColor: '#8E1C1C'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0B0E14', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#D4AF37', marginBottom: '15px' }}></i>
                <p style={{ letterSpacing: '2px', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem' }}>Preparing Royal Table Menu...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0B0E14', color: '#fff', paddingBottom: '120px', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
            
            {/* 7-Star Michelin Royal Hero Header Banner */}
            <div style={{
                background: 'linear-gradient(180deg, #1A2130 0%, #0B0E14 100%)',
                padding: '40px 20px 25px 20px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    
                    {/* Top Row: Table Badge & Language Selector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                            color: '#000',
                            padding: '6px 16px',
                            borderRadius: '25px',
                            fontSize: '0.85rem',
                            fontWeight: '900',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                        }}>
                            <i className="fas fa-chair" style={{ color: '#000' }}></i>
                            <span>{tableInfo?.name || `TABLE ${tableId.toUpperCase()}`}</span>
                        </div>

                        {/* Language Switcher */}
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(22, 18, 14, 0.9)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                            {['en', 'hi', 'ar'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    style={{
                                        background: language === lang ? 'linear-gradient(135deg, #D4AF37, #B8860B)' : 'transparent',
                                        color: language === lang ? '#000' : 'rgba(255, 255, 255, 0.8)',
                                        border: 'none',
                                        padding: '5px 12px',
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        ✦ GASTRONOMY HAVEN ✦
                    </span>
                    <h1 style={{ fontSize: '2.2rem', color: '#FFF', fontFamily: 'var(--font-heading, serif)', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
                        Khaliya Restaurant & Bar
                    </h1>
                    <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
                        {tableInfo?.section || 'Glass Frontage (Window View)'} • Quick Table QR Service
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 15px' }}>

                {/* Active Orders Banner */}
                {activeOrders.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(26, 22, 17, 0.95), rgba(15, 12, 9, 0.98))',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '20px',
                        padding: '18px 20px',
                        marginBottom: '25px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFD700', fontWeight: '800', fontSize: '1rem' }}>
                                <i className="fas fa-fire-burner fa-spin" style={{ color: '#D4AF37' }}></i>
                                <span>Active Kitchen Orders ({activeOrders.length})</span>
                            </div>
                            <button
                                onClick={handleRequestBillFromTable}
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '8px 18px',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                                }}
                            >
                                <i className="fas fa-receipt"></i> Request Bill / Pay
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                            {activeOrders.map(ord => (
                                <div key={ord.id || ord._id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', padding: '12px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#FFF5C0', fontSize: '0.88rem' }}>Order #{ord.id || ord._id?.slice(-4)}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                                            {Array.isArray(ord.items) ? ord.items.map(i => `${i.name?.en || i.name} (x${i.quantity || 1})`).join(', ') : 'Kitchen items'}
                                        </div>
                                    </div>
                                    <span style={{
                                        background: ord.status === 'preparing' ? '#f39c12' : ord.status === 'ready' ? '#2ecc71' : '#D4AF37',
                                        color: '#000',
                                        padding: '4px 10px',
                                        borderRadius: '15px',
                                        fontSize: '0.7rem',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}>
                                        {ord.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Diet Toggle Filter (All, Veg, Non-Veg) */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', background: 'rgba(22, 18, 14, 0.8)', padding: '4px', borderRadius: '25px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                        <button
                            onClick={() => setDietFilter('ALL')}
                            style={{
                                background: dietFilter === 'ALL' ? '#D4AF37' : 'transparent',
                                color: dietFilter === 'ALL' ? '#000' : 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                            }}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setDietFilter('VEG')}
                            style={{
                                background: dietFilter === 'VEG' ? '#2ECC71' : 'transparent',
                                color: dietFilter === 'VEG' ? '#000' : 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', display: 'inline-block' }}></span>
                            VEG
                        </button>
                        <button
                            onClick={() => setDietFilter('NONVEG')}
                            style={{
                                background: dietFilter === 'NONVEG' ? '#E74C3C' : 'transparent',
                                color: dietFilter === 'NONVEG' ? '#FFF' : 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E74C3C', display: 'inline-block' }}></span>
                            NON-VEG
                        </button>
                    </div>
                </div>

                {/* AI Matchmaker Modal */}
                {showAiMatchmaker && (
                    <AiMatchmaker onClose={() => setShowAiMatchmaker(false)} menuItems={menuItems} />
                )}

                {/* Glassmorphic Search Bar */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37', fontSize: '1rem' }}></i>
                    <input 
                        type="text"
                        placeholder="Search royal starters, curries, artisanal breads, desserts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(26, 22, 17, 0.85)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '16px',
                            padding: '14px 16px 14px 48px',
                            color: '#FFF5C0',
                            fontSize: '0.95rem',
                            outline: 'none',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                </div>

                {/* Category Navigation Bar (7-Star Gold Pill Tabs) */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '25px', scrollbarWidth: 'none' }}>
                    {categories.map(cat => {
                        const isSelected = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    background: isSelected ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'rgba(26, 22, 17, 0.7)',
                                    color: isSelected ? '#0d0d0d' : 'rgba(255, 255, 255, 0.8)',
                                    border: isSelected ? 'none' : '1px solid rgba(212, 175, 55, 0.2)',
                                    padding: '10px 22px',
                                    borderRadius: '25px',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isSelected ? '0 4px 15px rgba(212, 175, 55, 0.35)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* 7-Star Michelin Luxury Menu Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.8rem'
                }}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => {
                            const inCart = cart.find(c => c.id === item.id);
                            const price = getItemPrice(item);
                            const isVeg = item.tags && item.tags.includes('veg');
                            const isNonVeg = item.tags && item.tags.includes('non-veg');
                            const spicyTag = item.tags && item.tags.find(t => t.startsWith('spicy-'));
                            const spiceLevel = spicyTag ? parseInt(spicyTag.replace('spicy-', '')) : 0;

                            return (
                                <motion.div
                                    key={item.id || index}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(26, 22, 17, 0.95), rgba(15, 12, 9, 0.98))',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(212, 175, 55, 0.22)',
                                        borderRadius: '20px',
                                        padding: '1.2rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 235, 175, 0.15)'
                                    }}
                                >
                                    {/* Top Dish Image with Badges */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '190px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        marginBottom: '1rem',
                                        background: '#120f0c',
                                        border: '1px solid rgba(212, 175, 55, 0.15)'
                                    }}>
                                        <img
                                            loading="lazy"
                                            src={item.image}
                                            alt={getItemName(item)}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop';
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />

                                        {/* FSSAI Pure Veg / Non-Veg Official Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            background: 'rgba(15, 12, 9, 0.85)',
                                            backdropFilter: 'blur(10px)',
                                            border: isVeg ? '1px solid #2ECC71' : isNonVeg ? '1px solid #E74C3C' : '1px solid rgba(212, 175, 55, 0.3)',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                        }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                border: `2px solid ${isVeg ? '#2ECC71' : isNonVeg ? '#E74C3C' : '#FFD700'}`,
                                                borderRadius: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '1px'
                                            }}>
                                                <div style={{
                                                    width: '5px',
                                                    height: '5px',
                                                    borderRadius: '50%',
                                                    background: isVeg ? '#2ECC71' : isNonVeg ? '#E74C3C' : '#FFD700'
                                                }}></div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                color: isVeg ? '#2ECC71' : isNonVeg ? '#E74C3C' : '#FFD700',
                                                textTransform: 'uppercase'
                                            }}>
                                                {isVeg ? 'Veg' : isNonVeg ? 'Non-Veg' : 'Special'}
                                            </span>
                                        </div>

                                        {/* Category Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            padding: '4px 12px',
                                            background: 'rgba(0, 0, 0, 0.75)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(212, 175, 55, 0.35)',
                                            borderRadius: '20px',
                                            color: '#FFF5C0',
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}>
                                            {item.category}
                                        </div>

                                        {/* Spice Level Indicator Overlay */}
                                        {spiceLevel > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                right: '10px',
                                                padding: '3px 8px',
                                                background: 'rgba(0, 0, 0, 0.75)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255, 69, 0, 0.4)',
                                                fontSize: '0.75rem'
                                            }}>
                                                {Array(spiceLevel).fill('🌶️').join('')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Dish Title */}
                                    <h3 style={{
                                        fontFamily: 'var(--font-heading, serif)',
                                        fontSize: '1.2rem',
                                        color: '#FFF5C0',
                                        margin: '0 0 0.4rem 0',
                                        fontWeight: '700'
                                    }}>
                                        {getItemName(item)}
                                    </h3>

                                    {/* Dish Description */}
                                    <p style={{
                                        fontSize: '0.82rem',
                                        color: 'rgba(255, 255, 255, 0.68)',
                                        margin: '0 0 1.2rem 0',
                                        lineHeight: '1.5',
                                        flex: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {getItemDesc(item)}
                                    </p>

                                    {/* Card Footer: Price & Gold Add Button */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 'auto',
                                        paddingTop: '0.8rem',
                                        borderTop: '1px solid rgba(212, 175, 55, 0.12)'
                                    }}>
                                        <span style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 900,
                                            background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            ₹{price}
                                        </span>

                                        {!inCart ? (
                                            <button
                                                onClick={() => addToCart(item)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                                                    color: '#0d0d0d',
                                                    border: 'none',
                                                    borderRadius: '25px',
                                                    padding: '8px 18px',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                                }}
                                            >
                                                <i className="fas fa-plus" style={{ fontSize: '0.75rem' }}></i>
                                                <span>Add Item</span>
                                            </button>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                background: 'rgba(212, 175, 55, 0.15)',
                                                border: '1px solid #D4AF37',
                                                borderRadius: '20px',
                                                overflow: 'hidden'
                                            }}>
                                                <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '32px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>-</button>
                                                <span style={{ color: '#FFF5C0', fontWeight: '900', padding: '0 8px', fontSize: '0.9rem' }}>{inCart.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '32px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>+</button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '4rem 1rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            background: 'rgba(20, 17, 14, 0.5)',
                            borderRadius: '20px',
                            border: '1px dashed rgba(212, 175, 55, 0.2)'
                        }}>
                            <i className="fas fa-utensils" style={{ fontSize: '2.5rem', color: '#D4AF37', marginBottom: '1rem' }}></i>
                            <h3 style={{ color: '#FFF5C0', fontFamily: 'var(--font-heading, serif)' }}>No Royal Dishes Found</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try adjusting your search criteria or category filter.</p>
                            <button
                                onClick={() => { setActiveCategory('ALL'); setDietFilter('ALL'); setSearchQuery(''); }}
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                                    color: '#0d0d0d',
                                    fontWeight: 800,
                                    padding: '10px 22px',
                                    borderRadius: '25px',
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom Royal Cart Bar */}
            {cart.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '92%',
                    maxWidth: '650px',
                    background: 'linear-gradient(135deg, rgba(31, 39, 56, 0.95), rgba(18, 22, 32, 0.98))',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid #D4AF37',
                    borderRadius: '24px',
                    padding: '14px 24px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.25)',
                    zIndex: 999
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>
                            {cartItemCount} Items Selected ({tableInfo?.name || `Table ${tableId.toUpperCase()}`})
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFD700' }}>
                            ₹{cartTotal}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                            color: '#000',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '16px',
                            fontWeight: '900',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                        }}
                    >
                        Review & Order <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            )}

            {/* 7-Star Glassmorphic Order Review Drawer / Modal */}
            {isCartOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'flex-end'
                }}>
                    <div style={{
                        background: 'linear-gradient(180deg, #1A2130 0%, #0B0E14 100%)',
                        borderTop: '2px solid #D4AF37',
                        borderTopLeftRadius: '28px',
                        borderTopRightRadius: '28px',
                        padding: '28px 24px',
                        maxWidth: '650px',
                        margin: '0 auto',
                        width: '100%',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        boxShadow: '0 -15px 40px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <span style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    {tableInfo?.name || `TABLE ${tableId.toUpperCase()}`}
                                </span>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFF', margin: '4px 0 0 0' }}>
                                    Review Dine-In Order
                                </h2>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {/* Cart Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212, 175, 55, 0.15)', padding: '14px', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#FFF5C0', fontSize: '0.95rem' }}>{getItemName(item)}</div>
                                        <div style={{ fontSize: '0.82rem', color: '#D4AF37', marginTop: '2px' }}>₹{getItemPrice(item)} each</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', borderRadius: '12px' }}>
                                        <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '32px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>-</button>
                                        <span style={{ color: '#FFF', fontWeight: '900', padding: '0 8px', fontSize: '0.9rem' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '32px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Special Instructions */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', fontWeight: '700', marginBottom: '8px' }}>Special Kitchen Instructions (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Less spicy, serve drinks first..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '12px', padding: '12px 14px', color: '#FFF5C0', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        {/* Total & Submit Button */}
                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', color: '#FFF' }}>Total Payable Amount:</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFD700' }}>₹{cartTotal}</span>
                        </div>

                        <button
                            onClick={handlePlaceDineInOrder}
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                                color: '#000',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '16px',
                                fontWeight: '900',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
                            }}
                        >
                            {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Sending Order to Kitchen...</> : '🔥 Send Order to Kitchen'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
