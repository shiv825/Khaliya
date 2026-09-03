import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';

export default function OrdersPage() {
    const { orders, menu, searchQuery, updateStatus } = useAdmin();

    const filteredOrders = orders.filter(o => o.id.includes(searchQuery) || (o.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const pendingOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;
    const outOfStockItems = menu.filter(m => m.available === false || m.inStock === false);
    const kitchenLoad = Math.min((pendingOrdersCount / 20) * 100, 100);

    return (
        <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="split-screen">
            <div className="split-left kanban-grid">
                {['received', 'preparing', 'ready'].map(status => (
                    <div 
                        key={status} 
                        className="kanban-column" 
                        style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', borderRadius: '15px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--admin-border)' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const orderId = e.dataTransfer.getData('orderId');
                            if (orderId) updateStatus('orders', orderId, status);
                        }}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: '1.2rem', textTransform: 'capitalize', color: 'var(--admin-text)' }}>
                            {status === 'received' ? 'New Orders 🛎️' : status === 'preparing' ? 'In Kitchen 🍳' : 'Ready for Pickup 📦'}
                        </h2>
                        {filteredOrders.filter(o => o.status === status).length === 0 ? (
                            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>No orders</p>
                        ) : (
                            filteredOrders.filter(o => o.status === status).map(o => (
                                <div 
                                    key={o.id} 
                                    className={`kanban-card status-${o.status}`}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('orderId', o.id)}
                                    style={{ cursor: 'grab' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {o.user?.name || 'Guest Customer'} 
                                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginLeft: '6px' }}>#{o.id.substring(0,8)}</span>
                                        </h3>
                                        <span className={`item-badge badge-${o.status === 'received' ? 'pending' : 'confirmed'}`}>{o.status.toUpperCase()}</span>
                                    </div>

                                    <div style={{ fontSize: '0.92rem', color: 'var(--admin-text)', marginTop: '12px' }}>
                                        {o.items?.map((i, idx) => {
                                            const isVeg = menu.find(m => m.name?.en === i.name || m.name === i.name)?.tags?.includes('veg');
                                            const isNonVeg = menu.find(m => m.name?.en === i.name || m.name === i.name)?.tags?.includes('non-veg');
                                            return (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px dashed var(--admin-border)' }}>
                                                    <span style={{ fontWeight: '800', color: 'var(--admin-primary)', minWidth: '24px' }}>{i.quantity}x</span> 
                                                    <span style={{ flex: 1 }}>{typeof i.name === 'object' ? i.name.en : i.name}</span>
                                                    {isVeg && <span title="Vegetarian">🌱</span>}
                                                    {isNonVeg && <span title="Non-Vegetarian">🍖</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="order-card-actions" style={{ marginTop: '15px' }}>
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

            <div className="split-right" style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ background: 'var(--admin-surface)', padding: '20px', borderRadius: '15px', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Kitchen Load Capacity</h3>
                    <div style={{ width: '100%', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${kitchenLoad}%`, height: '100%', background: kitchenLoad > 80 ? 'var(--admin-danger)' : 'var(--admin-primary)', borderRadius: 6, transition: 'width 0.5s' }}></div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>{kitchenLoad > 80 ? '⚠️ High Capacity Rush' : '✅ Normal Kitchen Velocity'}</p>
                </div>

                <div style={{ background: 'var(--admin-surface)', padding: '20px', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Stock Alert Summary</h3>
                    {outOfStockItems.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--admin-success)', margin: 0 }}>All menu items are currently in stock.</p>
                    ) : (
                        <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--admin-danger)', fontSize: '0.9rem' }}>
                            {outOfStockItems.map(m => <li key={m.id}>{typeof m.name === 'object' ? m.name.en : m.name}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
