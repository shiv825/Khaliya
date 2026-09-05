import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';

export default function KitchenPage() {
    const { orders, updateOrderStatus, searchQuery, setSearchQuery } = useAdmin();
    const [filterType, setFilterType] = useState('ALL');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [prevOrderCount, setPrevOrderCount] = useState(0);
    const [completedItemsMap, setCompletedItemsMap] = useState({}); // { orderId_itemIdx: true }

    // Web Audio Synthesizer chime for kitchen bell
    const playKitchenChime = () => {
        if (!soundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.error('Audio play blocked or unavailable', e);
        }
    };

    // Active non-completed kitchen orders
    const kitchenOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

    useEffect(() => {
        const receivedCount = kitchenOrders.filter(o => o.status === 'received').length;
        if (receivedCount > prevOrderCount) {
            playKitchenChime();
        }
        setPrevOrderCount(receivedCount);
    }, [orders]);

    const toggleItemCompleted = (orderId, idx) => {
        const key = `${orderId}_${idx}`;
        setCompletedItemsMap(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const filteredOrders = kitchenOrders.filter(o => {
        const isDineIn = Boolean(o.table || o.tableNumber || o.orderType === 'dine-in');
        const matchesType = filterType === 'ALL' ? true :
                            filterType === 'DINE-IN' ? isDineIn :
                            !isDineIn;

        const orderIdStr = String(o.id || o._id || '');
        const tableStr = String(o.table || o.tableNumber || '').toLowerCase();
        const search = searchQuery.toLowerCase();

        const matchesSearch = !search || 
            orderIdStr.toLowerCase().includes(search) || 
            tableStr.includes(search) ||
            (Array.isArray(o.items) && o.items.some(i => (typeof i.name === 'object' ? i.name.en : i.name).toLowerCase().includes(search)));

        return matchesType && matchesSearch;
    });

    const receivedOrders = filteredOrders.filter(o => o.status === 'received');
    const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
    const readyOrders = filteredOrders.filter(o => o.status === 'ready');

    const getElapsedTimeInfo = (createdAt) => {
        if (!createdAt) return { text: 'Just now', isUrgent: false };
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffMins = Math.floor((now - start) / 60000);
        if (diffMins < 1) return { text: 'Just now', isUrgent: false };
        return { text: `${diffMins} min ago`, isUrgent: diffMins >= 15 };
    };

    const handleReprintKot = async (orderId, invoiceNo) => {
        try {
            const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
            const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
            const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

            await axios.post(`${API_URL}/orders/${orderId}/reprint-kot`);
            Swal.fire({
                icon: 'success',
                title: 'KOT Reprint Dispatched!',
                text: `Sent *** REPRINT *** ticket for Order #${invoiceNo || orderId} to Kitchen Printer`,
                background: '#121620',
                color: '#FFF',
                confirmButtonColor: '#D4AF37'
            });
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Could not reprint KOT.', icon: 'error', background: '#121620', color: '#FFF' });
        }
    };

    const renderKitchenCard = (order, nextStatus, nextLabel, nextBg) => {
        const isTable = order.table || order.tableNumber;
        const orderId = order.id || order._id;
        const timeInfo = getElapsedTimeInfo(order.createdAt);

        return (
            <div
                key={orderId}
                style={{
                    background: '#161B26',
                    border: `2px solid ${order.status === 'received' ? '#f1c40f' : order.status === 'preparing' ? '#e67e22' : '#2ecc71'}`,
                    borderRadius: '18px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    marginBottom: '15px'
                }}
            >
                <div>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFF' }}>
                                #{order.invoiceNo || String(orderId).slice(-4)}
                            </span>
                            {isTable ? (
                                <span style={{ marginLeft: '10px', background: '#D4AF37', color: '#000', padding: '3px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '900' }}>
                                    <i className="fas fa-chair"></i> {order.table || order.tableNumber}
                                </span>
                            ) : (
                                <span style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.1)', color: '#CCC', padding: '3px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800' }}>
                                    TAKEOUT
                                </span>
                            )}
                        </div>

                        <span style={{ fontSize: '0.78rem', color: timeInfo.isUrgent ? '#ff4d4d' : '#888', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', background: timeInfo.isUrgent ? 'rgba(255,77,77,0.15)' : 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
                            <i className="fas fa-clock"></i> {timeInfo.text}
                        </span>
                    </div>

                    {/* Customer & Notes */}
                    {order.notes && (
                        <div style={{ background: 'rgba(231, 76, 60, 0.18)', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#ff6b6b', padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', marginBottom: '12px' }}>
                            <i className="fas fa-exclamation-triangle"></i> NOTE: {order.notes}
                        </div>
                    )}

                    {/* Item Checklist */}
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', borderBottom: '1px dashed rgba(255,255,255,0.12)', padding: '10px 0', margin: '10px 0' }}>
                        {Array.isArray(order.items) && order.items.map((item, idx) => {
                            const itemKey = `${orderId}_${idx}`;
                            const isDone = Boolean(completedItemsMap[itemKey]);
                            const itemName = typeof item.name === 'object' ? (item.name.en || item.name.hi || 'Item') : item.name;
                            const isHeld = item.fireStatus === 'HELD';
                            const specialNote = item.specialInstructions || item.note;

                            return (
                                <div 
                                    key={idx} 
                                    style={{ marginBottom: '10px', opacity: isDone ? 0.4 : isHeld ? 0.6 : 1, transition: 'var(--transition)' }}
                                >
                                    <div 
                                        onClick={() => toggleItemCompleted(orderId, idx)}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textDecoration: isDone ? 'line-through' : 'none' }}
                                    >
                                        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: '#D4AF37', fontSize: '1.15rem' }}>{item.quantity || 1}x</span>
                                            {itemName}
                                            {isHeld && (
                                                <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#EAB308', border: '1px solid #EAB308', fontSize: '0.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '8px' }}>
                                                    ⏸ HELD
                                                </span>
                                            )}
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: isDone ? '#2ecc71' : 'rgba(255,255,255,0.3)' }}>
                                            <i className={`fas ${isDone ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                        </span>
                                    </div>

                                    {/* Prominent Cooking Special Instructions Tag */}
                                    {specialNote && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid #EF4444',
                                            color: '#FF6B6B',
                                            fontSize: '0.78rem',
                                            fontWeight: 900,
                                            padding: '3px 8px',
                                            borderRadius: '8px',
                                            marginTop: '4px',
                                            textTransform: 'uppercase'
                                        }}>
                                            <span>⚠️</span>
                                            <span>{specialNote}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {/* Status Advancement Action Button */}
                    {nextStatus && (
                        <button
                            onClick={() => updateOrderStatus(orderId, nextStatus)}
                            style={{
                                flex: 2,
                                background: nextBg,
                                color: '#000',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '12px',
                                fontWeight: '900',
                                fontSize: '0.92rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}
                        >
                            {nextLabel}
                        </button>
                    )}

                    <button
                        onClick={() => handleReprintKot(orderId, order.invoiceNo)}
                        title="Reprint Kitchen Ticket"
                        style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.06)',
                            color: '#FFF',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '12px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                        }}
                    >
                        🖨️ Reprint
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '5px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0 }}>
                        <i className="fas fa-fire-burner" style={{ color: '#e67e22', marginRight: '10px' }}></i>
                        Kitchen Display System (KDS) Monitor
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Real-time high-contrast chef ticket monitor with acoustic chime alerts and item checkoff.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        style={{
                            background: soundEnabled ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: soundEnabled ? '#2ecc71' : '#888',
                            border: '1px solid var(--admin-border)',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className={`fas ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
                        {soundEnabled ? 'Chime ON' : 'Chime OFF'}
                    </button>

                    <button
                        onClick={playKitchenChime}
                        style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', border: '1px solid #D4AF37', padding: '10px 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                    >
                        <i className="fas fa-bell"></i> Test Chime
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '18px', padding: '16px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)' }}></i>
                    <input
                        type="text"
                        placeholder="Search kitchen tickets by dish, table #, or order ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '10px 38px 10px 40px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>×</button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['ALL', 'DINE-IN', 'TAKEAWAY'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            style={{
                                background: filterType === type ? 'var(--admin-primary)' : 'rgba(255,255,255,0.04)',
                                color: filterType === type ? '#000' : 'var(--admin-text)',
                                border: '1px solid var(--admin-border)',
                                padding: '8px 16px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3-Column Full-Width KDS Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Column 1: NEW / RECEIVED */}
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '18px', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #f1c40f', paddingBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f1c40f', margin: 0 }}>
                            <i className="fas fa-bell"></i> NEW ORDERS ({receivedOrders.length})
                        </h2>
                    </div>

                    {receivedOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '50px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            No pending new orders
                        </div>
                    ) : (
                        receivedOrders.map(o => renderKitchenCard(o, 'preparing', '🔥 Start Preparing', 'linear-gradient(135deg, #f1c40f, #f39c12)'))
                    )}
                </div>

                {/* Column 2: PREPARING */}
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '18px', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #e67e22', paddingBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#e67e22', margin: 0 }}>
                            <i className="fas fa-fire"></i> IN PREPARATION ({preparingOrders.length})
                        </h2>
                    </div>

                    {preparingOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '50px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            No orders currently cooking
                        </div>
                    ) : (
                        preparingOrders.map(o => renderKitchenCard(o, 'ready', '✅ Mark Dish Ready', 'linear-gradient(135deg, #e67e22, #d35400)'))
                    )}
                </div>

                {/* Column 3: READY TO SERVE */}
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '18px', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #2ecc71', paddingBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#2ecc71', margin: 0 }}>
                            <i className="fas fa-check-circle"></i> READY TO SERVE ({readyOrders.length})
                        </h2>
                    </div>

                    {readyOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '50px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            No orders waiting to be served
                        </div>
                    ) : (
                        readyOrders.map(o => renderKitchenCard(o, 'completed', '🛎️ Served / Complete', 'linear-gradient(135deg, #2ecc71, #27ae60)'))
                    )}
                </div>
            </div>
        </div>
    );
}
