import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getBillReceiptEmailTemplate } from '../../utils/emailTemplates';


export default function BillingPage() {
    const { tables, orders, API_URL, fetchTables, fetchOrders } = useAdmin();
    const [selectedTableId, setSelectedTableId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
    const [isSettling, setIsSettling] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [printMode, setPrintMode] = useState('BILL'); // 'BILL' or 'KOT'
    const [cashReceived, setCashReceived] = useState('');
    
    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState('ALL');
    const [activeTab, setActiveTab] = useState('POS'); // 'POS' or 'HISTORY'
    const [settledHistory, setSettledHistory] = useState([]);

    // Calculate unbilled total for a table
    const getTableUnbilledInfo = (tableId) => {
        const tOrders = orders.filter(o => 
            tableId && 
            (o.table === tableId || o.tableNumber === tableId) && 
            o.status !== 'completed' && 
            o.status !== 'cancelled'
        );
        let count = 0;
        let subtotal = 0;
        tOrders.forEach(ord => {
            if (Array.isArray(ord.items)) {
                ord.items.forEach(i => {
                    const price = Number(i.price || 0);
                    const qty = Number(i.quantity || 1);
                    count += qty;
                    subtotal += price * qty;
                });
            }
        });
        return { orderCount: tOrders.length, itemCount: count, subtotal };
    };

    // Filtered tables list
    const filteredTables = tables.filter(t => {
        const matchesSection = selectedSection === 'ALL' || t.category === selectedSection;
        const queryLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
            t.name.toLowerCase().includes(queryLower) ||
            t.id.toLowerCase().includes(queryLower) ||
            (t.session?.guestName && t.session.guestName.toLowerCase().includes(queryLower));
        return matchesSection && matchesSearch;
    });

    // Active occupied/bill-requested tables
    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED');
    const totalPendingUnbilledAmount = occupiedTables.reduce((acc, t) => acc + getTableUnbilledInfo(t.id).subtotal, 0);

    const selectedTable = tables.find(t => t.id === selectedTableId);
    
    // Active orders for selected table
    const tableOrders = orders.filter(o => 
        selectedTableId && 
        (o.table === selectedTableId || o.tableNumber === selectedTableId) && 
        o.status !== 'completed' && 
        o.status !== 'cancelled'
    );

    // Consolidated itemized items across all orders for this table session
    const consolidatedItems = [];
    tableOrders.forEach(ord => {
        if (Array.isArray(ord.items)) {
            ord.items.forEach(i => {
                const nameStr = typeof i.name === 'object' ? (i.name.en || i.name.hi || 'Item') : (i.name || 'Item');
                const price = Number(i.price || 0);
                const qty = Number(i.quantity || 1);
                
                const existing = consolidatedItems.find(ci => ci.name === nameStr && ci.price === price);
                if (existing) {
                    existing.quantity += qty;
                    existing.total += price * qty;
                } else {
                    consolidatedItems.push({ name: nameStr, price, quantity: qty, total: price * qty });
                }
            });
        }
    });

    const [advanceDeposit, setAdvanceDeposit] = useState(0);

    const subtotal = consolidatedItems.reduce((sum, item) => sum + item.total, 0);
    
    // Discount computation
    let calculatedDiscount = 0;
    if (discountType === 'percent') {
        calculatedDiscount = Math.round((subtotal * (Number(discountAmount) || 0)) / 100);
    } else {
        calculatedDiscount = Number(discountAmount) || 0;
    }
    calculatedDiscount = Math.min(subtotal, Math.max(0, calculatedDiscount));

    const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
    const cgst = Math.round(taxableAmount * 0.025); // 2.5% CGST
    const sgst = Math.round(taxableAmount * 0.025); // 2.5% SGST
    const totalGst = cgst + sgst;
    const depositCredit = Number(advanceDeposit) || 0;
    const grandTotal = Math.max(0, taxableAmount + totalGst - depositCredit);

    const upiQrString = `upi://pay?pa=khaliyarestaurant@upi&pn=Khaliya%20Restaurant&am=${grandTotal}&cu=INR`;
    const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiQrString)}&color=000000&bgcolor=ffffff`;


    const handleSettleAndPrint = async () => {
        if (!selectedTableId || tableOrders.length === 0) {
            Swal.fire({ 
                title: 'Select Table', 
                text: 'Please select an occupied table with active orders to proceed with billing.', 
                icon: 'warning',
                background: '#121620',
                color: '#FFF',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

        setIsSettling(true);
        const orderIds = tableOrders.map(o => o.id || o._id);

        try {
            const res = await axios.post(`${API_URL}/billing/pay`, {
                tableId: selectedTableId,
                orderIds,
                paymentMethod,
                discount: calculatedDiscount,
                totalPaid: grandTotal
            });

            if (res.data.success) {
                const receiptInfo = {
                    receiptNo: `REC-${Date.now().toString().slice(-6)}`,
                    tableName: selectedTable?.name || selectedTableId,
                    guestName: selectedTable?.session?.guestName || 'Guest',
                    date: new Date().toLocaleString(),
                    items: [...consolidatedItems],
                    subtotal,
                    cgst,
                    sgst,
                    totalGst,
                    discount: calculatedDiscount,
                    grandTotal,
                    paymentMethod: paymentMethod.toUpperCase()
                };

                setReceiptData(receiptInfo);
                setSettledHistory(prev => [receiptInfo, ...prev]);

                Swal.fire({
                    title: '💳 Bill Settled Successfully!',
                    text: `${selectedTable?.name || selectedTableId} has been moved to CLEANING status. Thermal receipt generating...`,
                    icon: 'success',
                    confirmButtonColor: '#D4AF37',
                    background: '#121620',
                    color: '#FFF'
                });

                if (fetchTables) fetchTables();
                if (fetchOrders) fetchOrders();

                setShowReceiptModal(true);
                setTimeout(() => window.print(), 600);
            }
        } catch (err) {
            Swal.fire({ 
                title: 'Payment Failed', 
                text: err.response?.data?.message || err.message || 'Error processing billing settlement.', 
                icon: 'error',
                background: '#121620',
                color: '#FFF',
                confirmButtonColor: '#e74c3c'
            });
        } finally {
            setIsSettling(false);
        }
    };

    const handleApplyDiscountPreset = (val, type = 'flat') => {
        setDiscountType(type);
        setDiscountAmount(val);
    };

    const handleEmailReceipt = (rec) => {
        const emailData = getBillReceiptEmailTemplate({ bill: rec, order: { customerName: rec.guestName, items: rec.items } });
        
        Swal.fire({
            title: '✨ Premium Digital Receipt Email',
            html: `
                <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 20px; color: #FFF; max-height: 420px; overflow-y: auto; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">
                    <div style="margin-bottom: 12px; font-size: 0.85rem; color: #8A94A6; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                        <strong style="color: #D4AF37;">Bill Ref:</strong> ${rec.receiptNo} | <strong style="color: #D4AF37;">Guest:</strong> ${rec.guestName}
                    </div>
                    <iframe srcdoc="${emailData.html.replace(/"/g, '&quot;')}" style="width: 100%; height: 320px; border: none; border-radius: 12px; background: #0B0E14;"></iframe>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '📋 Copy Receipt HTML',
            cancelButtonText: 'Close',
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF',
            width: '650px'
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(emailData.html);
                Swal.fire({ title: 'Copied!', text: 'Receipt HTML template copied to clipboard.', icon: 'success', background: '#121620', color: '#FFF', confirmButtonColor: '#D4AF37' });
            }
        });
    };

    return (
        <div style={{ padding: '5px' }}>
            {/* Header & Tab Toggle */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-calculator" style={{ color: 'var(--admin-primary)' }}></i>
                        POS Billing & Digital Checkout Terminal
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Real-time table tab consolidation, 5% GST computation (CGST+SGST), UPI QR generator & 80mm thermal receipt print.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setActiveTab('POS')}
                        style={{
                            background: activeTab === 'POS' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'POS' ? '#000' : 'var(--admin-text)',
                            border: `1px solid ${activeTab === 'POS' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className="fas fa-cash-register"></i> POS Terminal
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        style={{
                            background: activeTab === 'HISTORY' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'HISTORY' ? '#000' : 'var(--admin-text)',
                            border: `1px solid ${activeTab === 'HISTORY' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className="fas fa-history"></i> Settled Receipts ({settledHistory.length})
                    </button>
                </div>
            </div>

            {/* Print Stylesheet for Thermal 80mm Receipt */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .admin-layout-wrapper { display: block !important; }
                    .admin-sidebar, .admin-topbar { display: none !important; }
                    .thermal-receipt { display: block !important; width: 80mm !important; margin: 0 auto !important; padding: 10px !important; color: #000 !important; background: #fff !important; font-family: 'Courier New', monospace !important; }
                }
                .thermal-receipt { display: none; }
            `}</style>

            {/* Quick KPI Bar */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '22px' }}>
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Occupied / Unbilled Tabs</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-text)' }}>{occupiedTables.length} Tables</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-coins"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Unbilled Pipeline</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#D4AF37' }}>₹{totalPendingUnbilledAmount}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Session Receipts Settled</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2ecc71' }}>{settledHistory.length} Bills</div>
                    </div>
                </div>
            </div>

            {activeTab === 'POS' ? (
                /* Main POS Billing Layout */
                <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
                    {/* Left Column: Instant Table Search & Grid */}
                    <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-chair" style={{ color: '#D4AF37' }}></i> Select Table Session
                            </h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-primary)', fontWeight: '800' }}>
                                {filteredTables.length} Tables
                            </span>
                        </div>

                        {/* Search & Section Filter Bar */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                                <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}></i>
                                <input
                                    type="text"
                                    placeholder="Search table or guest name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 36px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '10px',
                                        color: 'var(--admin-text)',
                                        fontSize: '0.88rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <select
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                                style={{
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '10px',
                                    color: 'var(--admin-text)',
                                    fontSize: '0.88rem',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="ALL" style={{ background: '#181e2a', color: '#fff' }}>All Floors</option>
                                <option value="Ground Hall" style={{ background: '#181e2a', color: '#fff' }}>Ground Hall</option>
                                <option value="Rooftop Terrace" style={{ background: '#181e2a', color: '#fff' }}>Rooftop Terrace</option>
                                <option value="VIP Private Booths" style={{ background: '#181e2a', color: '#fff' }}>VIP Booths</option>
                            </select>
                        </div>

                        {/* Interactive Table Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
                            {filteredTables.map(t => {
                                const isOccupied = t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED';
                                const isSelected = selectedTableId === t.id;
                                const unbilledInfo = getTableUnbilledInfo(t.id);

                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTableId(t.id)}
                                        style={{
                                            background: isSelected 
                                                ? 'var(--admin-primary)' 
                                                : t.status === 'BILL_REQUESTED'
                                                ? 'rgba(241, 196, 15, 0.18)'
                                                : isOccupied 
                                                ? 'rgba(231, 76, 60, 0.15)' 
                                                : 'rgba(255,255,255,0.03)',
                                            color: isSelected 
                                                ? '#000' 
                                                : t.status === 'BILL_REQUESTED'
                                                ? '#f1c40f'
                                                : isOccupied 
                                                ? '#e74c3c' 
                                                : 'var(--admin-text-muted)',
                                            border: `2px solid ${
                                                isSelected 
                                                    ? 'var(--admin-primary)' 
                                                    : t.status === 'BILL_REQUESTED'
                                                    ? '#f1c40f'
                                                    : isOccupied 
                                                    ? '#e74c3c' 
                                                    : 'var(--admin-border)'
                                            }`,
                                            borderRadius: '14px',
                                            padding: '12px 10px',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s linear',
                                            boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '1rem', fontWeight: '900' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', marginTop: '3px', opacity: 0.9 }}>
                                            {t.status.replace('_', ' ')}
                                        </div>
                                        {isOccupied && (
                                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.15)', fontSize: '0.78rem', fontWeight: '900' }}>
                                                ₹{unbilledInfo.subtotal}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Itemized Order Breakdown for Selected Table */}
                        {selectedTableId ? (
                            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                    <div>
                                        <span style={{ fontWeight: '900', color: 'var(--admin-text)', fontSize: '1rem' }}>
                                            {selectedTable?.name} Tab Breakdown
                                        </span>
                                        {selectedTable?.session?.guestName && (
                                            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                                                Guest: <strong style={{ color: 'var(--admin-primary)' }}>{selectedTable.session.guestName}</strong>
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-primary)', background: 'rgba(212, 175, 55, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                                        {tableOrders.length} Order(s)
                                    </span>
                                </div>

                                {consolidatedItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '25px 0', fontSize: '0.9rem' }}>
                                        <i className="fas fa-receipt" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', opacity: 0.4 }}></i>
                                        No active unpaid orders found for this table.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {consolidatedItems.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px dashed rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                                                <div>
                                                    <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>{item.name}</span>
                                                    <span style={{ color: 'var(--admin-text-muted)', marginLeft: '6px', fontSize: '0.8rem' }}>x{item.quantity}</span>
                                                </div>
                                                <span style={{ fontWeight: '800', color: 'var(--admin-text)' }}>₹{item.total}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '30px 10px', border: '1px dashed var(--admin-border)', borderRadius: '16px' }}>
                                <i className="fas fa-hand-pointer" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', color: 'var(--admin-primary)', opacity: 0.8 }}></i>
                                Select an occupied table above to view itemized order list and proceed with settlement.
                            </div>
                        )}
                    </div>

                    {/* Right Column: Checkout Summary & Payment Methods */}
                    <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--admin-text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-receipt" style={{ color: 'var(--admin-primary)' }}></i> Payment & Settle
                            </h2>

                            {/* Discount Presets */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Quick Discount Presets</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button onClick={() => handleApplyDiscountPreset(0, 'flat')} style={{ background: discountAmount == 0 ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)', color: discountAmount == 0 ? '#000' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>None</button>
                                    <button onClick={() => handleApplyDiscountPreset(5, 'percent')} style={{ background: discountAmount == 5 && discountType === 'percent' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)', color: discountAmount == 5 && discountType === 'percent' ? '#000' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>5% Off</button>
                                    <button onClick={() => handleApplyDiscountPreset(10, 'percent')} style={{ background: discountAmount == 10 && discountType === 'percent' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)', color: discountAmount == 10 && discountType === 'percent' ? '#000' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>10% Off</button>
                                    <button onClick={() => handleApplyDiscountPreset(50, 'flat')} style={{ background: discountAmount == 50 && discountType === 'flat' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)', color: discountAmount == 50 && discountType === 'flat' ? '#000' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>₹50 Off</button>
                                    <button onClick={() => handleApplyDiscountPreset(100, 'flat')} style={{ background: discountAmount == 100 && discountType === 'flat' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)', color: discountAmount == 100 && discountType === 'flat' ? '#000' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>₹100 Off</button>
                                </div>
                            </div>

                            {/* Bill Totals Box */}
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <span>Subtotal:</span>
                                    <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>₹{subtotal}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Discount:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <select 
                                            value={discountType} 
                                            onChange={e => setDiscountType(e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text)', padding: '4px', fontSize: '0.75rem', fontWeight: '800' }}
                                        >
                                            <option value="flat" style={{ background: '#181e2a', color: '#fff' }}>₹ Flat</option>
                                            <option value="percent" style={{ background: '#181e2a', color: '#fff' }}>% Percent</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            value={discountAmount}
                                            onChange={e => setDiscountAmount(e.target.value)}
                                            style={{ width: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '5px', color: 'var(--admin-text)', textAlign: 'right', fontWeight: '800', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                {calculatedDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2ecc71', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '700' }}>
                                        <span>Discount Deducted:</span>
                                        <span>-₹{calculatedDiscount}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', marginBottom: '4px', fontSize: '0.85rem' }}>
                                    <span>CGST (2.5%):</span>
                                    <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>₹{cgst}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', marginBottom: '12px', fontSize: '0.85rem' }}>
                                    <span>SGST (2.5%):</span>
                                    <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>₹{sgst}</span>
                                </div>

                                {/* Advance Booking Deposit Credit Deduction */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', paddingTop: '8px', borderTop: '1px dashed var(--admin-border)' }}>
                                    <span style={{ color: '#2ecc71', fontSize: '0.88rem', fontWeight: '800' }}>Advance Deposit Credit:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ color: '#2ecc71', fontWeight: '800' }}>-₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={advanceDeposit}
                                            onChange={e => setAdvanceDeposit(e.target.value)}
                                            placeholder="0"
                                            style={{ width: '80px', background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', borderRadius: '8px', padding: '4px', color: '#2ecc71', textAlign: 'right', fontWeight: '900', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '2px solid var(--admin-primary)' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--admin-text)' }}>Grand Payable:</span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-primary)' }}>₹{grandTotal}</span>
                                </div>
                            </div>


                            {/* Payment Method Selector */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '8px' }}>Select Payment Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {[
                                        { id: 'cash', label: 'Cash', icon: 'fa-money-bill-wave' },
                                        { id: 'upi', label: 'UPI / QR', icon: 'fa-qrcode' },
                                        { id: 'card', label: 'Card / POS', icon: 'fa-credit-card' }
                                    ].map(pm => (
                                        <button
                                            key={pm.id}
                                            onClick={() => setPaymentMethod(pm.id)}
                                            style={{
                                                background: paymentMethod === pm.id ? 'var(--admin-primary)' : 'rgba(255,255,255,0.03)',
                                                color: paymentMethod === pm.id ? '#000' : 'var(--admin-text)',
                                                border: `1px solid ${paymentMethod === pm.id ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                                padding: '12px 6px',
                                                borderRadius: '12px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.82rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <i className={`fas ${pm.icon}`} style={{ fontSize: '1.1rem' }}></i>
                                            {pm.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Cash Received & Change Calculator */}
                            {paymentMethod === 'cash' && grandTotal > 0 && (
                                <div style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', padding: '15px', borderRadius: '16px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: '800' }}>Cash Tendered / Received:</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ color: '#2ecc71', fontWeight: '900' }}>₹</span>
                                            <input
                                                type="number"
                                                placeholder={grandTotal}
                                                value={cashReceived}
                                                onChange={e => setCashReceived(e.target.value)}
                                                style={{ width: '110px', background: 'rgba(0,0,0,0.4)', border: '1px solid #2ecc71', borderRadius: '8px', padding: '6px 10px', color: '#FFF', textAlign: 'right', fontWeight: '900', fontSize: '1rem', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    {Number(cashReceived) > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed rgba(46, 204, 113, 0.4)', fontSize: '0.92rem', fontWeight: '900' }}>
                                            <span style={{ color: '#CBD5E1' }}>Change Due to Return:</span>
                                            <span style={{ color: Number(cashReceived) >= grandTotal ? '#2ecc71' : '#e74c3c', fontSize: '1.2rem' }}>
                                                ₹{Math.max(0, Number(cashReceived) - grandTotal)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dynamic UPI QR Code Display */}
                            {paymentMethod === 'upi' && grandTotal > 0 && (
                                <div style={{ background: '#FFF', padding: '15px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px', color: '#000' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '8px' }}>SCAN UPI QR TO PAY ₹{grandTotal}</div>
                                    <img src={upiQrImageUrl} alt="UPI QR" style={{ width: '150px', height: '150px', margin: '0 auto', display: 'block', borderRadius: '8px' }} />
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '6px', fontWeight: '700' }}>Accepts GPay, PhonePe, Paytm, BHIM</div>
                                </div>
                            )}
                        </div>

                        {/* Settle & Print Action Button */}
                        <button
                            onClick={handleSettleAndPrint}
                            disabled={isSettling || !selectedTableId || consolidatedItems.length === 0}
                            style={{
                                width: '100%',
                                background: isSettling || !selectedTableId || consolidatedItems.length === 0
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                                color: isSettling || !selectedTableId || consolidatedItems.length === 0 ? 'var(--admin-text-muted)' : '#000',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '1.05rem',
                                cursor: isSettling || !selectedTableId || consolidatedItems.length === 0 ? 'not-allowed' : 'pointer',
                                boxShadow: isSettling || !selectedTableId || consolidatedItems.length === 0 ? 'none' : '0 4px 15px rgba(212, 175, 55, 0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isSettling ? (
                                <><i className="fas fa-spinner fa-spin"></i> Settling Bill & Releasing Table...</>
                            ) : (
                                <><i className="fas fa-print" style={{ marginRight: '8px' }}></i> Settle Bill & Print 80mm Receipt</>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                /* Settled Bills History Tab */
                <div className="no-print" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '22px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--admin-text)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-history" style={{ color: 'var(--admin-primary)' }}></i> Today's Settled Bills History
                    </h2>

                    {settledHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '50px 0' }}>
                            <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4, display: 'block' }}></i>
                            No settled receipts recorded in this session yet. Complete checkout settlements on the POS terminal.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {settledHistory.map((rec, idx) => (
                                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--admin-border)', borderRadius: '14px', padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                                        <span style={{ fontWeight: '900', color: 'var(--admin-primary)' }}>{rec.receiptNo}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{rec.date}</span>
                                    </div>
                                    <div style={{ fontSize: '0.88rem', color: 'var(--admin-text)', fontWeight: '800', marginBottom: '6px' }}>
                                        Table: {rec.tableName} ({rec.guestName})
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '10px' }}>
                                        Items: {rec.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed var(--admin-border)' }}>
                                        <span style={{ fontWeight: '900', color: '#2ecc71' }}>Paid ₹{rec.grandTotal} ({rec.paymentMethod})</span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => handleEmailReceipt(rec)}
                                                style={{
                                                    background: 'rgba(212, 175, 55, 0.15)',
                                                    color: '#D4AF37',
                                                    border: '1px solid #D4AF37',
                                                    borderRadius: '8px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '800',
                                                    cursor: 'pointer'
                                                }}
                                                title="View & Email Digital Receipt"
                                            >
                                                <i className="fas fa-envelope"></i> Email Receipt
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReceiptData(rec);
                                                    setPrintMode('BILL');
                                                    setTimeout(() => window.print(), 300);
                                                }}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    color: 'var(--admin-text)',
                                                    border: '1px solid var(--admin-border)',
                                                    borderRadius: '8px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '800',
                                                    cursor: 'pointer'
                                                }}
                                                title="Print 80mm Customer Thermal Bill"
                                            >
                                                <i className="fas fa-print"></i> Bill
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReceiptData(rec);
                                                    setPrintMode('KOT');
                                                    setTimeout(() => window.print(), 300);
                                                }}
                                                style={{
                                                    background: 'rgba(231, 76, 60, 0.15)',
                                                    color: '#e74c3c',
                                                    border: '1px solid #e74c3c',
                                                    borderRadius: '8px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: '800',
                                                    cursor: 'pointer'
                                                }}
                                                title="Print 80mm Kitchen Order Ticket (KOT)"
                                            >
                                                <i className="fas fa-fire"></i> KOT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Printable Thermal Receipt & KOT (Hidden on screen, rendered into layout when window.print() is called) */}
            {receiptData && (
                <div className="thermal-receipt">
                    {printMode === 'KOT' ? (
                        /* Kitchen Order Ticket (KOT) 80mm Slip */
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>*** KITCHEN ORDER TICKET ***</h2>
                                <p style={{ margin: '4px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>KHALIYA ROYAL KITCHEN</p>
                                <p style={{ margin: '2px 0', fontSize: '0.8rem' }}>KOT Ref: KOT-{Date.now().toString().slice(-4)}</p>
                                <p style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>TABLE: {receiptData.tableName}</p>
                                <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>Time: {receiptData.date}</p>
                                <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>Server: POS Terminal</p>
                            </div>
                            <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '8px 0', margin: '8px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '1px dashed #000', paddingBottom: '4px', marginBottom: '6px' }}>
                                    <span>ITEM DESCRIPTION</span>
                                    <span>QTY</span>
                                </div>
                                {receiptData.items.map((it, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '6px' }}>
                                        <span>{it.name}</span>
                                        <span style={{ fontSize: '1.1rem' }}>x{it.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                === URGENT PREPARATION ===<br />
                                Khaliya Kitchen System v1.0
                            </div>
                        </div>
                    ) : (
                        /* Single All-In-One 80mm Payment Bill & Receipt with Dynamic UPI QR */
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', letterSpacing: '1px' }}>KHALIYA</h2>
                                <p style={{ margin: '2px 0', fontSize: '0.78rem', letterSpacing: '2px', fontWeight: 'bold' }}>INDIAN RESTAURANT</p>
                                <p style={{ margin: '4px 0 2px 0', fontSize: '0.75rem' }}>Bill No: {receiptData.receiptNo}</p>
                                <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>Date: {receiptData.date}</p>
                                <p style={{ margin: '2px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>Table: {receiptData.tableName} ({receiptData.guestName})</p>
                            </div>

                            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '8px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                    <span>ITEM</span>
                                    <span>QTY</span>
                                    <span>AMOUNT</span>
                                </div>
                                <div style={{ borderTop: '1px dotted #000', marginBottom: '6px' }}></div>
                                {receiptData.items.map((it, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <span style={{ flex: 1, paddingRight: '4px' }}>{it.name}</span>
                                        <span style={{ width: '30px', textAlign: 'center' }}>x{it.quantity}</span>
                                        <span style={{ width: '60px', textAlign: 'right' }}>₹{it.total}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ fontSize: '0.8rem', textAlign: 'right', borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>₹{receiptData.subtotal}</span></div>
                                {receiptData.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount:</span><span>-₹{receiptData.discount}</span></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CGST (2.5%):</span><span>₹{receiptData.cgst}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SGST (2.5%):</span><span>₹{receiptData.sgst}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', marginTop: '4px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                                    <span>TOTAL:</span>
                                    <span>₹{receiptData.grandTotal}</span>
                                </div>
                            </div>

                            {/* Embedded Dynamic UPI QR Code for Thermal Paper */}
                            <div style={{ textAlign: 'center', margin: '10px 0', border: '1px solid #000', padding: '10px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>SCAN TO PAY ₹{receiptData.grandTotal}</div>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=khaliyarestaurant@upi&pn=Khaliya%20Restaurant&am=${receiptData.grandTotal}&tr=${receiptData.receiptNo}&cu=INR`)}&color=000000&bgcolor=ffffff`}
                                    alt="Dynamic UPI QR" 
                                    style={{ width: '120px', height: '120px', margin: '0 auto', display: 'block' }} 
                                />
                                <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold' }}>Bill Ref: {receiptData.receiptNo}</div>
                            </div>

                            <div style={{ fontSize: '0.75rem', textAlign: 'center', margin: '8px 0' }}>
                                Cash / UPI / Card Accepted<br />
                                <strong>Payment Status: {receiptData.paymentMethod ? `PAID VIA ${receiptData.paymentMethod}` : 'PENDING'}</strong>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', borderTop: '1px dashed #000', paddingTop: '8px' }}>
                                THANK YOU FOR DINING WITH KHALIYA!<br />PLEASE VISIT AGAIN
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

