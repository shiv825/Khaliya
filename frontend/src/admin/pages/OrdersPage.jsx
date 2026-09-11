import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';

export default function OrdersPage() {
    const { orders, menu, searchQuery, setSearchQuery, updateStatus, updateOrderStatus } = useAdmin();
    const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');

    const handleUpdateStatus = (id, newStatus) => {
        if (updateOrderStatus) {
            updateOrderStatus(id, newStatus);
        } else {
            updateStatus('orders', id, newStatus);
        }
    };

    // Filter orders by search & order type
    const filteredOrders = orders.filter(o => {
        const orderIdStr = String(o.id || o._id || '');
        const custName = String(o.user?.name || o.customerName || '').toLowerCase();
        const tableStr = String(o.table || o.tableNumber || '').toLowerCase();
        const search = searchQuery.toLowerCase();

        const matchesSearch = !search || 
            orderIdStr.toLowerCase().includes(search) || 
            custName.includes(search) || 
            tableStr.includes(search);

        const isDineIn = Boolean(o.table || o.tableNumber || o.orderType === 'dine-in');
        const matchesType = orderTypeFilter === 'ALL' ? true :
                            orderTypeFilter === 'DINE_IN' ? isDineIn :
                            !isDineIn;

        return matchesSearch && matchesType;
    });

    const getElapsedTime = (createdAt) => {
        if (!createdAt) return 'Just now';
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffMins = Math.floor((now - start) / 60000);
        if (diffMins < 1) return 'Just now';
        return `${diffMins} min ago`;
    };

    const getOrderTotal = (o) => {
        if (o.total !== undefined) return o.total;
        if (o.totalAmount !== undefined) return o.totalAmount;
        if (Array.isArray(o.items)) {
            return o.items.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
        }
        return 0;
    };

    return (
        <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Top Toolbar Header with Search & Filter */}
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '18px', padding: '18px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            <i className="fas fa-list-check" style={{ color: 'var(--admin-primary)', marginRight: '10px' }}></i>
                            Live Orders Command Hub & Kanban
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--admin-text-muted)', fontSize: '0.88rem' }}>
                            Drag and drop or click to dispatch live kitchen tickets across preparation stages.
                        </p>
                    </div>

                    {/* Order Type Filter Pills */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'ALL', label: 'All Orders' },
                            { id: 'DINE_IN', label: 'Dine-In Tables 🍽️' },
                            { id: 'TAKEAWAY', label: 'Takeaway / Online 🛍️' }
                        ].map(tf => (
                            <button
                                key={tf.id}
                                onClick={() => setOrderTypeFilter(tf.id)}
                                style={{
                                    background: orderTypeFilter === tf.id ? 'var(--admin-primary)' : 'rgba(255,255,255,0.04)',
                                    color: orderTypeFilter === tf.id ? '#000' : 'var(--admin-text)',
                                    border: '1px solid var(--admin-border)',
                                    padding: '8px 16px',
                                    borderRadius: '18px',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Instant Search Input Bar */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)', fontSize: '1rem' }}></i>
                    <input 
                        type="text"
                        placeholder="Search orders instantly by customer name, Order #, or Table (e.g. T01, Shiv, #104)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1.5px solid var(--admin-border)',
                            borderRadius: '14px',
                            padding: '12px 42px 12px 46px',
                            color: 'var(--admin-text)',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* 3-Column Full-Width Kanban Board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {['received', 'preparing', 'ready'].map(status => {
                    const statusOrders = filteredOrders.filter(o => o.status === status);

                    return (
                        <div 
                            key={status} 
                            className="kanban-column" 
                            style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '18px', borderRadius: '20px', background: 'var(--admin-surface)', border: `1px solid ${status === 'received' ? '#f1c40f' : status === 'preparing' ? '#e67e22' : '#2ecc71'}`, minHeight: '500px' }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const orderId = e.dataTransfer.getData('orderId');
                                if (orderId) handleUpdateStatus(orderId, status);
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', borderBottom: `2px solid ${status === 'received' ? '#f1c40f' : status === 'preparing' ? '#e67e22' : '#2ecc71'}`, paddingBottom: '10px' }}>
                                <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: '1.15rem', fontWeight: '900', color: status === 'received' ? '#f1c40f' : status === 'preparing' ? '#e67e22' : '#2ecc71' }}>
                                    {status === 'received' ? '🛎️ NEW ORDERS' : status === 'preparing' ? '🍳 IN KITCHEN' : '📦 READY TO SERVE'}
                                </h2>
                                <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', color: 'var(--admin-text)' }}>
                                    {statusOrders.length}
                                </span>
                            </div>

                            {statusOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '50px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    No tickets in this stage
                                </div>
                            ) : (
                                statusOrders.map(o => {
                                    const orderIdDisplay = String(o.id || o._id).slice(-4);
                                    const tableNo = o.table || o.tableNumber;
                                    const totalAmt = getOrderTotal(o);

                                    return (
                                        <div 
                                            key={o.id || o._id} 
                                            className={`kanban-card status-${o.status}`}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('orderId', o.id || o._id)}
                                            style={{ cursor: 'grab', background: '#161B26', border: '1px solid var(--admin-border)', borderRadius: '14px', padding: '16px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}
                                        >
                                            {/* Ticket Header */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--admin-text)' }}>
                                                            #{o.orderNo || o.invoiceNo || orderIdDisplay}
                                                        </span>
                                                        <span style={{ background: 'rgba(255,255,255,0.1)', color: '#AAA', padding: '1px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 900 }}>
                                                            {sequenceType}
                                                        </span>
                                                        {o.invoiceNo && o.orderNo && o.invoiceNo !== o.orderNo && (
                                                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', border: '1px solid #3B82F6', padding: '1px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 900 }}>
                                                                {o.orderNo}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#e74c3c', marginTop: '2px', fontWeight: '700' }}>
                                                        <i className="fas fa-clock"></i> {getElapsedTime(o.createdAt)}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--admin-text)', marginTop: '4px' }}>
                                                        {o.user?.name || o.customerName || 'Guest Customer'}
                                                    </div>
                                                </div>

                                                {/* Table Badge or Takeaway Badge */}
                                                {tableNo ? (
                                                    <span style={{ background: '#D4AF37', color: '#000', padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>
                                                        <i className="fas fa-chair"></i> {tableNo}
                                                    </span>
                                                ) : (
                                                    <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#EAB308', border: '1px solid #EAB308', padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>
                                                        📦 {sequenceType === 'KHL' ? 'ONLINE' : 'PICKUP'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {o.notes && (
                                                <div style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#ff6b6b', border: '1px solid rgba(231, 76, 60, 0.3)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '10px' }}>
                                                    <i className="fas fa-exclamation-circle"></i> NOTE: {o.notes}
                                                </div>
                                            )}

                                            {/* Items */}
                                            <div style={{ fontSize: '0.88rem', color: 'var(--admin-text)', marginTop: '8px', borderTop: '1px dashed var(--admin-border)', borderBottom: '1px dashed var(--admin-border)', padding: '8px 0' }}>
                                                {Array.isArray(o.items) && o.items.map((i, idx) => {
                                                    const itemName = typeof i.name === 'object' ? (i.name.en || i.name.hi || 'Item') : i.name;
                                                    const matchedMenuItem = menu.find(m => (typeof m.name === 'object' ? m.name.en : m.name) === itemName);
                                                    const isVeg = matchedMenuItem?.isVeg !== false;

                                                    return (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
                                                            <span style={{ fontWeight: '900', color: 'var(--admin-primary)', minWidth: '22px' }}>{i.quantity || 1}x</span> 
                                                            <span style={{ flex: 1, fontWeight: '700' }}>{itemName}</span>
                                                            <span style={{ fontSize: '0.75rem' }}>{isVeg ? '🌱' : '🍖'}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Total Amount & Payment Status */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>
                                                    Payment: <span style={{ color: o.paymentStatus === 'paid' ? '#2ecc71' : '#f1c40f' }}>{o.paymentStatus || 'unpaid'}</span>
                                                </span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--admin-primary)' }}>
                                                    ₹{totalAmt}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="order-card-actions" style={{ marginTop: '12px' }}>
                                                {o.status === 'received' && (
                                                    <button onClick={() => handleUpdateStatus(o.id || o._id, 'preparing')} className="action-btn btn-primary" style={{ width: '100%' }}>
                                                        🔥 Start Cooking
                                                    </button>
                                                )}
                                                {o.status === 'preparing' && (
                                                    <button onClick={() => handleUpdateStatus(o.id || o._id, 'ready')} className="action-btn btn-confirm" style={{ width: '100%' }}>
                                                        ✅ Mark Ready
                                                    </button>
                                                )}
                                                {o.status === 'ready' && (
                                                    <button onClick={() => handleUpdateStatus(o.id || o._id, 'completed')} className="action-btn btn-complete" style={{ width: '100%' }}>
                                                        🛎️ Serve / Complete
                                                    </button>
                                                )}
                                                {(o.status === 'received' || o.status === 'preparing') && (
                                                    <button onClick={() => handleUpdateStatus(o.id || o._id, 'cancelled')} className="action-btn btn-cancel" style={{ width: '100%', marginTop: '6px' }}>
                                                        Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
