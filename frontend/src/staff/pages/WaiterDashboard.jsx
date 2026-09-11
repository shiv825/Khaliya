import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function WaiterDashboard() {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSection, setFilterSection] = useState('ALL');

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{"name":"Duty Waiter","role":"WAITER"}');

    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 6000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [tablesRes, ordersRes] = await Promise.all([
                axios.get(`${API_URL}/tables`),
                axios.get(`${API_URL}/orders`)
            ]);

            const tablesList = Array.isArray(tablesRes.data) ? tablesRes.data : (tablesRes.data?.tables || []);
            setTables(tablesList);

            const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.orders || []);
            setOrders(ordersList);
        } catch (err) {
            console.error('Error fetching waiter live floor map:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveData = () => fetchData();

    // Helper to calculate unbilled total for a table session
    const getTableSubtotal = (tableId) => {
        const tOrders = orders.filter(o => 
            (o.table === tableId || o.tableNumber === tableId) && 
            o.status !== 'completed' && o.status !== 'cancelled'
        );
        let total = 0;
        tOrders.forEach(ord => {
            if (Array.isArray(ord.items)) {
                ord.items.forEach(i => {
                    total += Number(i.price || 0) * Number(i.quantity || 1);
                });
            }
        });
        const cgst = Math.round(total * 0.025);
        const sgst = Math.round(total * 0.025);
        return { subtotal: total, grandTotal: total + cgst + sgst };
    };

    // Confirm Cash Received from Folder
    const handleConfirmCashPayment = (table) => {
        const { grandTotal } = getTableSubtotal(table.id);

        Swal.fire({
            title: `💰 Confirm Cash Payment for ${table.name}`,
            html: `
                <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 16px; color: #FFF;">
                    <div style="font-size: 0.88rem; color: #8A94A6; margin-bottom: 6px;">
                        Guest: <strong style="color: #FFF;">${table.session?.guestName || 'Guest'}</strong>
                    </div>
                    <div style="font-size: 1.2rem; color: #FFD700; font-weight: 900; marginBottom: 14px;">
                        Grand Total Payable: ₹${grandTotal}
                    </div>
                    <label style="display: block; font-size: 0.82rem; color: #AAA; font-weight: 700; margin-bottom: 6px;">Cash Received in Bill Folder (₹)</label>
                    <input id="cash-tendered-input" type="number" value="${grandTotal}" placeholder="${grandTotal}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid #2ecc71; border-radius: 10px; color: #FFF; font-weight: 900; font-size: 1.1rem; text-align: right;" />
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '✓ Confirm Cash & Mark PAID',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2ecc71',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const cashInput = document.getElementById('cash-tendered-input')?.value || grandTotal;
                const changeDue = Math.max(0, Number(cashInput) - grandTotal);

                try {
                    const tableOrders = orders.filter(o => (o.table === table.id || o.tableNumber === table.id) && o.status !== 'completed');
                    const orderIds = tableOrders.map(o => o.id || o._id);

                    await axios.post(`${API_URL}/billing/pay`, {
                        tableId: table.id,
                        orderIds,
                        paymentMethod: 'CASH',
                        discount: 0,
                        totalPaid: grandTotal
                    });

                    Swal.fire({
                        title: '💳 Cash Payment Confirmed!',
                        html: `Bill marked <strong>PAID</strong>.<br/>Return Change to Guest: <strong style="color: #2ecc71; font-size: 1.2rem;">₹${changeDue}</strong>`,
                        icon: 'success',
                        confirmButtonColor: '#D4AF37',
                        background: '#121620',
                        color: '#FFF'
                    });

                    fetchLiveData();
                } catch (err) {
                    Swal.fire({ title: 'Error', text: 'Could not settle payment.', icon: 'error', background: '#121620', color: '#FFF' });
                }
            }
        });
    };

    // Release Table when guests depart
    const handleReleaseTable = async (tableId, tableName) => {
        Swal.fire({
            title: `Release ${tableName}?`,
            text: 'This will mark the table as CLEANING / AVAILABLE for the next guest.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '🟢 Release Table',
            cancelButtonText: 'Keep Occupied',
            confirmButtonColor: '#2ecc71',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await axios.put(`${API_URL}/tables/${tableId}/release`).catch(() => {});
                Swal.fire({ title: 'Table Released!', text: `${tableName} is now AVAILABLE.`, icon: 'success', background: '#121620', color: '#FFF', confirmButtonColor: '#D4AF37' });
                fetchLiveData();
            }
        });
    };

    // Fast Walk-In Seating Modal
    const handleWalkInSeat = (table) => {
        Swal.fire({
            title: `Seat Guest at ${table.name}`,
            html: `
                <div style="text-align: left;">
                    <label style="display: block; font-size: 0.82rem; color: #AAA; font-weight: 700; margin-bottom: 4px;">Guest Name</label>
                    <input id="walkin-name" type="text" placeholder="e.g. Rahul Sharma" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #FFF; margin-bottom: 12px;" />
                    <label style="display: block; font-size: 0.82rem; color: #AAA; font-weight: 700; margin-bottom: 4px;">Guest Count</label>
                    <input id="walkin-count" type="number" value="2" min="1" max="${table.capacity}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #FFF;" />
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Seat Guest Now',
            confirmButtonColor: '#D4AF37',
            background: '#121620',
            color: '#FFF'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const name = document.getElementById('walkin-name')?.value || 'Guest';
                const count = Number(document.getElementById('walkin-count')?.value || 2);
                await axios.post(`${API_URL}/tables/${table.id}/seat`, { guestName: name, guestCount: count }).catch(() => {});
                fetchLiveData();
            }
        });
    };

    // Handle Table Merging
    const handleMergeTablesModal = (primaryTable) => {
        const availableOtherTables = tables.filter(t => t.id !== primaryTable.id && t.status !== 'MERGED');
        
        const optionsHtml = availableOtherTables.map(t => 
            `<label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; padding: 6px 0; color: #FFF;">
                <input type="checkbox" class="merge-checkbox" value="${t.id}" /> ${t.name} (${t.capacity} Seats - ${t.status})
            </label>`
        ).join('');

        Swal.fire({
            title: `🔀 Merge Tables into ${primaryTable.name}`,
            html: `
                <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 14px; padding: 14px; max-height: 250px; overflow-y: auto;">
                    <div style="font-size: 0.82rem; color: #8A94A6; margin-bottom: 10px;">Select tables to combine with ${primaryTable.name}:</div>
                    ${optionsHtml || '<div style="color: #666;">No other tables available to merge</div>'}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '✓ Merge Tables',
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const checkboxes = document.querySelectorAll('.merge-checkbox:checked');
                const mergeTableIds = Array.from(checkboxes).map(cb => cb.value);

                if (mergeTableIds.length === 0) {
                    Swal.fire({ title: 'Notice', text: 'No secondary tables selected to merge.', icon: 'info', background: '#121620', color: '#FFF' });
                    return;
                }

                try {
                    await axios.post(`${API_URL}/tables/merge`, { primaryTableId: primaryTable.id, mergeTableIds });
                    Swal.fire({ title: 'Merged!', text: `Successfully combined tables into ${primaryTable.name}`, icon: 'success', background: '#121620', color: '#FFF', confirmButtonColor: '#2ECC71' });
                    fetchLiveData();
                } catch (err) {
                    Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message, icon: 'error', background: '#121620', color: '#FFF' });
                }
            }
        });
    };

    // Handle Split Merged Table
    const handleSplitTableModal = async (table) => {
        try {
            await axios.post(`${API_URL}/tables/split`, { primaryTableId: table.id });
            Swal.fire({ title: 'Split Complete!', text: `${table.name} has been disbanded back to standalone tables.`, icon: 'success', background: '#121620', color: '#FFF', confirmButtonColor: '#D4AF37' });
            fetchLiveData();
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message, icon: 'error', background: '#121620', color: '#FFF' });
        }
    };

    // Handle Split Bill Payment
    const handleSplitBillModal = (table) => {
        const { grandTotal } = getTableSubtotal(table.id);
        const defaultHalf = Math.round(grandTotal / 2);

        Swal.fire({
            title: `👥 Split Bill for ${table.name}`,
            html: `
                <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 14px; padding: 14px; color: #FFF; font-size: 0.88rem;">
                    <div style="font-weight: 800; color: #FFD700; font-size: 1.1rem; margin-bottom: 12px;">Total Bill: ₹${grandTotal}</div>
                    
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; font-size: 0.78rem; color: #AAA;">Person 1 Share (Cash)</label>
                        <input id="split-person-1" type="number" value="${defaultHalf}" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #FFF;" />
                    </div>

                    <div style="margin-bottom: 10px;">
                        <label style="display: block; font-size: 0.78rem; color: #AAA;">Person 2 Share (UPI / Card)</label>
                        <input id="split-person-2" type="number" value="${grandTotal - defaultHalf}" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #FFF;" />
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '✓ Complete Split Payment',
            confirmButtonColor: '#2ECC71',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const p1 = Number(document.getElementById('split-person-1')?.value || 0);
                const p2 = Number(document.getElementById('split-person-2')?.value || 0);

                if (p1 + p2 < grandTotal) {
                    Swal.fire({ title: 'Underpaid', text: `Sum of shares (₹${p1 + p2}) is less than total ₹${grandTotal}`, icon: 'warning', background: '#121620', color: '#FFF' });
                    return;
                }

                try {
                    const tableOrders = orders.filter(o => (o.table === table.id || o.tableNumber === table.id) && o.status !== 'completed');
                    const orderIds = tableOrders.map(o => o.id || o._id);

                    await axios.post(`${API_URL}/billing/split-pay`, {
                        tableId: table.id,
                        splits: [
                            { personName: 'Person 1', amount: p1, method: 'Cash' },
                            { personName: 'Person 2', amount: p2, method: 'UPI' }
                        ],
                        orderIds,
                        staffName: staffUser.name
                    });

                    Swal.fire({ title: 'Split Bill Settled!', text: `Bill settled with ${p1} Cash + ${p2} UPI`, icon: 'success', background: '#121620', color: '#FFF', confirmButtonColor: '#D4AF37' });
                    fetchLiveData();
                } catch (err) {
                    Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message, icon: 'error', background: '#121620', color: '#FFF' });
                }
            }
        });
    };

    const sections = ['ALL', ...new Set(tables.map(t => t.section || t.category || 'Main Hall'))];
    const filteredTables = tables.filter(t => filterSection === 'ALL' || (t.section || t.category || 'Main Hall') === filterSection);

    return (
        <div style={{ paddingBottom: '90px' }}>
            {/* Header Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-th" style={{ color: '#D4AF37' }}></i> Waiter Floor Map
                    </h1>
                    <div style={{ fontSize: '0.82rem', color: '#8A94A6' }}>
                        Logged in as: <strong style={{ color: '#FFD700' }}>{staffUser.name}</strong> ({staffUser.role})
                    </div>
                </div>

                {/* Section Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {sections.map(sec => (
                        <button
                            key={sec}
                            onClick={() => setFilterSection(sec)}
                            style={{
                                background: filterSection === sec ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                                color: filterSection === sec ? '#000' : '#FFF',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                padding: '6px 14px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {sec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Live Floor Map Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                {filteredTables.map(table => {
                    const isOccupied = table.status === 'OCCUPIED' || table.status === 'ORDERING' || table.status === 'DINING';
                    const isBillRequested = table.status === 'BILL_REQUESTED' || table.status === 'BILL_PRESENTED' || table.status === 'PAYMENT_PENDING';
                    const isAvailable = table.status === 'AVAILABLE';
                    const isCleaning = table.status === 'CLEANING';
                    const isMerged = table.status === 'MERGED';
                    const isGroupHost = Array.isArray(table.mergedTables) && table.mergedTables.length > 0;

                    const { grandTotal } = getTableSubtotal(table.id);

                    const statusBg = isBillRequested 
                        ? 'rgba(212, 175, 55, 0.18)' 
                        : isOccupied 
                        ? 'rgba(231, 76, 60, 0.15)' 
                        : isCleaning 
                        ? 'rgba(52, 152, 219, 0.15)' 
                        : isMerged
                        ? 'rgba(147, 51, 234, 0.15)'
                        : 'rgba(46, 204, 113, 0.12)';

                    const statusBorder = isBillRequested 
                        ? '#FFD700' 
                        : isOccupied 
                        ? '#e74c3c' 
                        : isCleaning 
                        ? '#3498db' 
                        : isMerged
                        ? '#A855F7'
                        : '#2ecc71';

                    return (
                        <div 
                            key={table.id}
                            style={{
                                background: '#121620',
                                border: `2px solid ${statusBorder}`,
                                borderRadius: '20px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isBillRequested ? '0 0 25px rgba(212, 175, 55, 0.4)' : '0 8px 24px rgba(0,0,0,0.4)'
                            }}
                        >
                            <div>
                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFF', margin: 0 }}>
                                            {table.name}
                                        </h3>
                                        {isGroupHost && (
                                            <span style={{ background: '#9333EA', color: '#FFF', fontSize: '0.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '8px' }}>
                                                MERGED GROUP
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ 
                                        background: statusBg, 
                                        border: `1px solid ${statusBorder}`, 
                                        color: statusBorder, 
                                        padding: '4px 10px', 
                                        borderRadius: '16px', 
                                        fontSize: '0.72rem', 
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}>
                                        {isBillRequested ? '💰 PAYMENT PENDING' : table.status}
                                    </span>
                                </div>

                                {/* Table Session Info */}
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', marginBottom: '14px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A94A6', marginBottom: '4px' }}>
                                        <span>Capacity:</span>
                                        <span style={{ color: '#FFF', fontWeight: '800' }}>
                                            {table.effectiveCapacity || table.capacity} Seats {isGroupHost ? `(${[table.id, ...table.mergedTables].join('+')})` : ''}
                                        </span>
                                    </div>
                                    {table.session?.guestName ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A94A6' }}>
                                            <span>Guest:</span>
                                            <span style={{ color: '#FFD700', fontWeight: '800' }}>{table.session.guestName}</span>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.78rem' }}>
                                            {isMerged ? `Merged into ${table.mergedInto}` : 'Vacant Table'}
                                        </div>
                                    )}
                                    {(isOccupied || isBillRequested) && grandTotal > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px', fontSize: '1.05rem', fontWeight: '900', color: '#FFD700' }}>
                                            <span>Current Tab:</span>
                                            <span>₹{grandTotal}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {isAvailable && (
                                    <>
                                        <button
                                            onClick={() => handleWalkInSeat(table)}
                                            style={{ flex: 2, background: 'linear-gradient(135deg, #D4AF37, #AA7C11)', color: '#000', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.82rem' }}
                                        >
                                            + Seat Guest
                                        </button>
                                        <button
                                            onClick={() => handleMergeTablesModal(table)}
                                            style={{ flex: 1, background: 'rgba(147, 51, 234, 0.2)', color: '#A855F7', border: '1px solid #A855F7', padding: '10px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem' }}
                                        >
                                            🔀 Merge
                                        </button>
                                    </>
                                )}

                                {isGroupHost && (
                                    <button
                                        onClick={() => handleSplitTableModal(table)}
                                        style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', border: '1px solid #EF4444', padding: '8px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.78rem', marginBottom: '4px' }}
                                    >
                                        Disband / Split Group
                                    </button>
                                )}

                                {(isOccupied || isBillRequested) && (
                                    <>
                                        <button
                                            onClick={() => handleConfirmCashPayment(table)}
                                            style={{ flex: 1, background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid #2ecc71', padding: '9px 4px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.76rem' }}
                                        >
                                            💰 Cash
                                        </button>

                                        <button
                                            onClick={() => handleSplitBillModal(table)}
                                            style={{ flex: 1, background: 'rgba(212, 175, 55, 0.15)', color: '#FFD700', border: '1px solid #D4AF37', padding: '9px 4px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.76rem' }}
                                        >
                                            👥 Split Bill
                                        </button>

                                        <button
                                            onClick={() => handleReleaseTable(table.id, table.name)}
                                            style={{ flex: 1, background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '9px 4px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.76rem' }}
                                        >
                                            🟢 Release
                                        </button>
                                    </>
                                )}

                                {isCleaning && (
                                    <button
                                        onClick={() => handleReleaseTable(table.id, table.name)}
                                        style={{ width: '100%', background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', border: '1px solid #3498db', padding: '10px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Mark Table Cleaned (Available)
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
