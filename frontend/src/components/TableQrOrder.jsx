import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLanguage } from '../context/LanguageContext';
import '../assets/style.css';

export default function TableQrOrder() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    const [tableInfo, setTableInfo] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
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
                axios.get(`${API_URL}/tables`),
                axios.get(`${API_URL}/menu`),
                axios.get(`${API_URL}/orders`)
            ]);

            if (tablesRes.data.success) {
                const currentTable = tablesRes.data.tables.find(t => t.id.toLowerCase() === tableId.toLowerCase() || t.name.toLowerCase() === tableId.toLowerCase());
                setTableInfo(currentTable || { id: tableId.toUpperCase(), name: `Table ${tableId.toUpperCase()}`, capacity: 4, section: 'Main Hall' });
            }

            if (menuRes.data.success) {
                const items = menuRes.data.items || [];
                setMenuItems(items);
                const uniqueCats = ['ALL', ...new Set(items.map(i => i.category || 'General'))];
                setCategories(uniqueCats);
            }

            if (ordersRes.data.success) {
                const tableOrders = (ordersRes.data.orders || []).filter(o => 
                    (o.table === tableId.toUpperCase() || o.tableNumber === tableId.toUpperCase()) && 
                    o.status !== 'completed' && o.status !== 'cancelled'
                );
                setActiveOrders(tableOrders);
            }
        } catch (err) {
            console.error('Failed to load table ordering data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`);
            if (res.data.success) {
                const tableOrders = (res.data.orders || []).filter(o => 
                    (o.table === tableId.toUpperCase() || o.tableNumber === tableId.toUpperCase()) && 
                    o.status !== 'completed' && o.status !== 'cancelled'
                );
                setActiveOrders(tableOrders);
            }
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

    const filteredItems = menuItems.filter(item => {
        const name = getItemName(item).toLowerCase();
        const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const activeUnbilledTotal = activeOrders.reduce((sum, ord) => sum + Number(ord.totalAmount || ord.total || 0), 0);

    const handleRequestBill = async () => {
        try {
            await axios.put(`${API_URL}/tables/${tableId.toUpperCase()}/status`, { status: 'BILL_REQUESTED' }).catch(() => {});
            Swal.fire({
                title: '🧾 Bill Requested!',
                text: `Your bill request has been sent to our cashier. Staff will present your Khaliya Bill Presenter Folder shortly!`,
                icon: 'success',
                confirmButtonColor: '#D4AF37',
                background: '#121620',
                color: '#FFF'
            });
            fetchData();
        } catch (err) {
            Swal.fire({ title: 'Bill Requested', text: 'Cashier has been notified of your bill request.', icon: 'info', confirmButtonColor: '#D4AF37' });
        }
    };

    const handleShowBillQr = () => {
        const upiString = `upi://pay?pa=khaliyarestaurant@upi&pn=Khaliya%20Restaurant&am=${activeUnbilledTotal}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

        Swal.fire({
            title: '💳 Dynamic Table Bill Payment',
            html: `
                <div style="text-align: center; color: #FFF;">
                    <div style="font-size: 0.9rem; color: #AAA; margin-bottom: 6px;">Table Ref: ${tableId.toUpperCase()}</div>
                    <div style="font-size: 1.6rem; font-weight: 900; color: #D4AF37; margin-bottom: 15px;">Pay ₹${activeUnbilledTotal}</div>
                    <div style="background: #FFF; padding: 15px; border-radius: 16px; display: inline-block; box-shadow: 0 0 25px rgba(212,175,55,0.4);">
                        <img src="${qrUrl}" alt="UPI Bill QR" style="width: 180px; height: 180px; display: block;" />
                    </div>
                    <div style="font-size: 0.8rem; color: #888; margin-top: 12px; font-weight: 700;">
                        Accepts GPay, PhonePe, Paytm, BHIM & UPI Apps
                    </div>
                </div>
            `,
            confirmButtonText: 'Done / Paid',
            confirmButtonColor: '#D4AF37',
            background: '#121620',
            color: '#FFF'
        });
    };

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
                        <div style="font-size: 0.85rem; color: #8A94A6; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-space-between;">
                            <span>Active Items Subtotal:</span>
                            <strong style="color: #FFF;">₹${tableActiveTotal}</strong>
                        </div>
                        <div style="font-size: 0.85rem; color: #8A94A6; margin-bottom: 6px; display: flex; justify-space-between;">
                            <span>CGST + SGST (5%):</span>
                            <strong style="color: #FFF;">₹${cgst + sgst}</strong>
                        </div>
                        <div style="font-size: 1.2rem; color: #D4AF37; font-weight: 900; border-top: 1px dashed rgba(212, 175, 55, 0.4); padding-top: 8px; margin-top: 8px; display: flex; justify-space-between;">
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
                // Update table status to OCCUPIED
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
            <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#D4AF37', marginBottom: '15px' }}></i>
                <p style={{ letterSpacing: '1px', color: '#888' }}>Loading Table Menu...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', paddingBottom: '120px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header Sticky Banner */}
            <div style={{ background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15), rgba(10, 13, 20, 1))', padding: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#D4AF37', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px' }}>
                            <i className="fas fa-[#000] fa-chair"></i> {tableInfo?.name || `Table ${tableId.toUpperCase()}`}
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#fff' }}>Khaliya Restaurant & Bar</h1>
                        <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>{tableInfo?.section || 'Indoor Dining'} • Quick Table QR Service</p>
                    </div>

                    {/* Language Switcher */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.08)', padding: '3px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {['en', 'hi', 'ar'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                style={{
                                    background: language === lang ? '#D4AF37' : 'transparent',
                                    color: language === lang ? '#000' : '#fff',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    fontWeight: '800',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
                {/* Active Orders Banner if any */}
                {activeOrders.length > 0 && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '15px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D4AF37', fontWeight: '800', fontSize: '0.95rem' }}>
                                <i className="fas fa-fire-burner fa-spin"></i> Active Table Session Orders ({activeOrders.length})
                            </div>
                            <button
                                onClick={handleRequestBillFromTable}
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    fontWeight: '900',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
                                }}
                            >
                                <i className="fas fa-receipt"></i> Request Bill / Pay
                            </button>
                        </div>
                        {activeOrders.map(ord => (
                            <div key={ord.id || ord._id} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: '700', color: '#fff' }}>Order #{ord.id || ord._id?.slice(-4)}</span>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{Array.isArray(ord.items) ? ord.items.map(i => `${i.name?.en || i.name} (x${i.quantity || 1})`).join(', ') : 'Kitchen items'}</div>
                                </div>
                                <span style={{ background: ord.status === 'preparing' ? '#f39c12' : '#2ecc71', color: '#000', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                    {ord.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#777' }}></i>
                    <input 
                        type="text"
                        placeholder="Search dishes, starters, beverages..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 12px 12px 42px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                background: activeCategory === cat ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                                color: activeCategory === cat ? '#000' : '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: '700',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredItems.map(item => {
                        const inCart = cart.find(c => c.id === item.id);
                        const price = getItemPrice(item);

                        return (
                            <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                                {/* Item Image */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#181e2b', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img 
                                        src={item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23121620'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-size='10' font-family='sans-serif'%3EKhaliya%3C/text%3E%3C/svg%3E"}
                                        alt={getItemName(item)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23121620'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-size='10' font-family='sans-serif'%3EKhaliya%3C/text%3E%3C/svg%3E";
                                        }}
                                    />
                                </div>

                                {/* Item Info */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 4px 0', color: '#fff' }}>{getItemName(item)}</h3>
                                    <p style={{ fontSize: '0.78rem', color: '#888', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {item.description?.[language] || item.description?.en || ''}
                                    </p>
                                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#D4AF37' }}>
                                        ₹{price}
                                    </div>
                                </div>

                                {/* Add / Qty Control */}
                                <div>
                                    {!inCart ? (
                                        <button
                                            onClick={() => addToCart(item)}
                                            style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            + ADD
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', borderRadius: '10px', overflow: 'hidden' }}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '28px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>-</button>
                                            <span style={{ color: '#fff', fontWeight: '900', padding: '0 6px', fontSize: '0.88rem' }}>{inCart.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '28px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>+</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Bottom Cart Bar */}
            {cart.length > 0 && (
                <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '560px', background: 'linear-gradient(135deg, #1f2738, #121620)', border: '2px solid #D4AF37', borderRadius: '20px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', zIndex: 999 }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', fontWeight: '700' }}>
                            {cartItemCount} Items Selected
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#D4AF37' }}>
                            ₹{cartTotal}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        style={{ background: 'linear-gradient(135deg, #D4AF37, #AA7C11)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        Review & Order <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            )}

            {/* Cart Drawer / Order Review Modal */}
            {isCartOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ background: '#121620', borderTop: '2px solid #D4AF37', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', maxWidth: '600px', margin: '0 auto', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                                <i className="fas fa-[#D4AF37] fa-utensils"></i> Order Summary ({tableInfo?.name || `Table ${tableId.toUpperCase()}`})
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {/* Cart Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#fff' }}>{getItemName(item)}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#D4AF37' }}>₹{getItemPrice(item)} each</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', borderRadius: '8px' }}>
                                        <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '28px', height: '28px', fontWeight: '900', cursor: 'pointer' }}>-</button>
                                        <span style={{ color: '#fff', fontWeight: '900', padding: '0 6px', fontSize: '0.85rem' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: '#D4AF37', width: '28px', height: '28px', fontWeight: '900', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Special Instructions */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', fontWeight: '700', marginBottom: '6px' }}>Special Kitchen Instructions (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Less spicy, serve drinks first..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '0.85rem' }}
                            />
                        </div>

                        {/* Total & Submit */}
                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', padding: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', color: '#fff' }}>Total Amount:</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#D4AF37' }}>₹{cartTotal}</span>
                        </div>

                        <button
                            onClick={handlePlaceDineInOrder}
                            disabled={isSubmitting}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #D4AF37, #AA7C11)', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer' }}
                        >
                            {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Sending Order to Kitchen...</> : '🔥 Send Order to Kitchen'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
