import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';

export default function TablesPage() {
    const { tables, seatCustomer, changeTableStatus, releaseTable, orders, addTable, updateTable, deleteTable, searchQuery, setSearchQuery } = useAdmin();
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedSection, setSelectedSection] = useState('ALL');
    
    // Modals
    const [seatModalOpen, setSeatModalOpen] = useState(false);
    const [selectedTableForSeating, setSelectedTableForSeating] = useState(null);
    const [walkInForm, setWalkInForm] = useState({ guestName: '', phone: '', guestCount: 2 });

    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [tableForm, setTableForm] = useState({ id: '', name: '', capacity: 4, section: 'Main Hall' });

    // Section options
    const availableSections = ['Indoor', 'Main Hall', 'Window View', 'VIP Lounge', 'Family Patio', 'Outdoor Terrace', 'Rooftop Lounge'];
    const allSectionsInUse = ['ALL', ...new Set(tables.map(t => t.section || t.category || 'Indoor'))];

    // Metrics
    const totalTables = tables.length;
    const availableCount = tables.filter(t => t.status === 'AVAILABLE').length;
    const occupiedCount = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length;
    const reservedCount = tables.filter(t => t.status === 'RESERVED').length;
    const cleaningCount = tables.filter(t => t.status === 'CLEANING').length;

    // Filter Logic with Search
    const filteredTables = tables.filter(t => {
        const matchesStatus = filterStatus === 'ALL' ? true :
            filterStatus === 'OCCUPIED' ? (t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED') :
            t.status === filterStatus;

        const secName = t.section || t.category || 'Indoor';
        const matchesSection = selectedSection === 'ALL' ? true : secName === selectedSection;

        const search = searchQuery.toLowerCase();
        const matchesSearch = !search || 
            t.name.toLowerCase().includes(search) || 
            t.id.toLowerCase().includes(search) || 
            secName.toLowerCase().includes(search) ||
            (t.session?.guestName || '').toLowerCase().includes(search);

        return matchesStatus && matchesSection && matchesSearch;
    });

    const getStatusColor = (status, hasUpcomingReservation) => {
        if (hasUpcomingReservation && status === 'AVAILABLE') {
            return { bg: 'rgba(241, 196, 15, 0.18)', border: '#f1c40f', text: '#f1c40f', icon: 'fa-clock', glow: '0 0 20px rgba(241, 196, 15, 0.3)' };
        }
        switch (status) {
            case 'AVAILABLE': return { bg: 'rgba(46, 204, 113, 0.12)', border: 'rgba(46, 204, 113, 0.5)', text: '#2ecc71', icon: 'fa-check-circle', glow: '0 0 20px rgba(46, 204, 113, 0.2)' };
            case 'RESERVED': return { bg: 'rgba(241, 196, 15, 0.12)', border: 'rgba(241, 196, 15, 0.5)', text: '#f1c40f', icon: 'fa-bookmark', glow: '0 0 20px rgba(241, 196, 15, 0.2)' };
            case 'OCCUPIED': return { bg: 'rgba(231, 76, 60, 0.12)', border: 'rgba(231, 76, 60, 0.5)', text: '#e74c3c', icon: 'fa-user-friends', glow: '0 0 20px rgba(231, 76, 60, 0.2)' };
            case 'BILL_REQUESTED': return { bg: 'rgba(155, 89, 182, 0.15)', border: 'rgba(155, 89, 182, 0.6)', text: '#9b59b6', icon: 'fa-receipt', glow: '0 0 25px rgba(155, 89, 182, 0.3)' };
            case 'CLEANING': return { bg: 'rgba(52, 152, 219, 0.12)', border: 'rgba(52, 152, 219, 0.5)', text: '#3498db', icon: 'fa-broom', glow: '0 0 20px rgba(52, 152, 219, 0.2)' };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--admin-border)', text: 'var(--admin-text)', icon: 'fa-info-circle', glow: 'none' };
        }
    };

    const handleOpenAddModal = () => {
        const nextId = `T${String(tables.length + 1).padStart(2, '0')}`;
        setEditingTable(null);
        setTableForm({ id: nextId, name: `Table ${tables.length + 1}`, capacity: 4, section: 'Main Hall' });
        setTableModalOpen(true);
    };

    const handleOpenEditModal = (table) => {
        setEditingTable(table);
        setTableForm({ id: table.id, name: table.name, capacity: table.capacity, section: table.section || table.category || 'Main Hall' });
        setTableModalOpen(true);
    };

    const handleSaveTableSubmit = async (e) => {
        e.preventDefault();
        if (editingTable) {
            const ok = await updateTable(editingTable.id, { name: tableForm.name, capacity: tableForm.capacity, section: tableForm.section });
            if (ok) setTableModalOpen(false);
        } else {
            const ok = await addTable(tableForm);
            if (ok) setTableModalOpen(false);
        }
    };

    const handleDeleteTableConfirm = (table) => {
        if (table.status !== 'AVAILABLE') {
            Swal.fire({ title: 'Cannot Delete Table', text: 'Table must be in AVAILABLE status before deleting.', icon: 'warning' });
            return;
        }

        Swal.fire({
            title: `Delete ${table.name}?`,
            text: `This action will permanently remove ${table.id} from the floor map and QR system.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#444',
            confirmButtonText: 'Yes, Delete Table'
        }).then(result => {
            if (result.isConfirmed) {
                deleteTable(table.id);
            }
        });
    };

    const handleOpenSeatModal = (table) => {
        setSelectedTableForSeating(table);
        setWalkInForm({ guestName: '', phone: '', guestCount: table.capacity || 2 });
        setSeatModalOpen(true);
    };

    const handleSeatSubmit = (e) => {
        e.preventDefault();
        if (!selectedTableForSeating) return;
        seatCustomer(selectedTableForSeating.id, walkInForm);
        setSeatModalOpen(false);
    };

    const handleViewTableOrders = (table) => {
        const tableOrders = orders.filter(o => o.table === table.id || o.tableNumber === table.id);
        if (tableOrders.length === 0) {
            Swal.fire({
                title: `${table.name} (${table.id})`,
                text: 'No active orders placed for this table session yet.',
                icon: 'info',
                background: '#161B26',
                color: '#FFF'
            });
            return;
        }

        const itemsHtml = tableOrders.map(o => `
            <div style="text-align:left; background:rgba(255,255,255,0.03); padding:10px; margin-bottom:8px; border-radius:8px;">
                <div style="font-weight:bold; color:#D4AF37;">Order #${o.id || o._id} — ₹${o.total || o.totalAmount || 0}</div>
                <div style="font-size:0.85rem; color:#CCC;">Items: ${Array.isArray(o.items) ? o.items.map(i => `${i.name?.en || i.name} x${i.quantity || 1}`).join(', ') : 'Details in orders'}</div>
            </div>
        `).join('');

        Swal.fire({
            title: `${table.name} Active Session Orders`,
            html: itemsHtml,
            background: '#161B26',
            color: '#FFF',
            confirmButtonColor: '#D4AF37'
        });
    };

    return (
        <div style={{ padding: '5px' }}>
            {/* Header Title & Add Table Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0 }}>
                        <i className="fas fa-th" style={{ color: 'var(--admin-primary)', marginRight: '10px' }}></i>
                        Interactive Table Floor Map & Occupancy Hub
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Real-time floor layout monitoring, time-slot reservation locks, walk-in seating, and POS billing.
                    </p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    style={{
                        background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                        color: '#000',
                        border: 'none',
                        padding: '12px 22px',
                        borderRadius: '14px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.95rem',
                        boxShadow: '0 5px 20px rgba(212, 175, 55, 0.35)'
                    }}
                >
                    <i className="fas fa-plus-circle"></i> Add New Table
                </button>
            </div>

            {/* Metrics Counter Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '22px' }}>
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Available</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-text)' }}>{availableCount} <span style={{ fontSize: '0.85rem', color: '#888' }}>/ {totalTables}</span></div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-user-friends"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Occupied</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-text)' }}>{occupiedCount}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-bookmark"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Reserved</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-text)' }}>{reservedCount}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <i className="fas fa-broom"></i>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Cleaning Needed</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-text)' }}>{cleaningCount}</div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar: Search, Status & Section Mapping */}
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '18px', padding: '18px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Instant Search Bar */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-primary)', fontSize: '1rem' }}></i>
                    <input 
                        type="text"
                        placeholder="Instant search table by ID, name, floor section, or guest name (e.g. T01, Main Hall, Shiv)..."
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

                {/* Section & Status Filter Pills */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '6px' }}>
                    {/* Floor Section Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--admin-primary)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                            <i className="fas fa-layer-group"></i> Sections:
                        </span>
                        {allSectionsInUse.map(sec => {
                            const count = sec === 'ALL' ? totalTables : tables.filter(t => (t.section || t.category || 'Indoor') === sec).length;

                            return (
                                <button
                                    key={sec}
                                    onClick={() => setSelectedSection(sec)}
                                    style={{
                                        background: selectedSection === sec ? 'var(--admin-primary)' : 'rgba(255,255,255,0.04)',
                                        color: selectedSection === sec ? '#000' : 'var(--admin-text)',
                                        border: '1px solid var(--admin-border)',
                                        padding: '6px 14px',
                                        borderRadius: '16px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {sec === 'ALL' ? `All (${totalTables})` : `${sec} (${count})`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Status Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                            <i className="fas fa-filter"></i> Status:
                        </span>
                        {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                style={{
                                    background: filterStatus === st ? 'rgba(255,255,255,0.15)' : 'transparent',
                                    color: filterStatus === st ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                                    border: `1px solid ${filterStatus === st ? 'var(--admin-text)' : 'transparent'}`,
                                    padding: '6px 14px',
                                    borderRadius: '16px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floor Map Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
                {filteredTables.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
                        <i className="fas fa-search-minus" style={{ fontSize: '2.2rem', color: 'var(--admin-primary)', marginBottom: '12px', display: 'block' }}></i>
                        No dining tables found matching your active filters.
                    </div>
                ) : (
                    filteredTables.map(table => {
                        const upcomingRes = Array.isArray(table.upcomingReservations) && table.upcomingReservations.length > 0 ? table.upcomingReservations[0] : null;
                        const styleInfo = getStatusColor(table.status, Boolean(upcomingRes));

                        return (
                            <div 
                                key={table.id}
                                style={{
                                    background: 'var(--admin-surface)',
                                    border: `2px solid ${styleInfo.border}`,
                                    borderRadius: '22px',
                                    padding: '22px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justify: 'space-between',
                                    boxShadow: styleInfo.glow,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'var(--transition)'
                                }}
                            >
                                {/* Table Card Header & Actions */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-text)' }}>
                                            {table.name} <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700' }}>({table.id})</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => handleOpenEditModal(table)}
                                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Edit Table Configuration"
                                            >
                                                <i className="fas fa-pen" style={{ fontSize: '0.8rem' }}></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTableConfirm(table)}
                                                style={{ background: 'rgba(231, 76, 60, 0.12)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#e74c3c', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Delete Table"
                                            >
                                                <i className="fas fa-trash" style={{ fontSize: '0.8rem' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status & Section Badges */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: styleInfo.bg, border: `1px solid ${styleInfo.border}`, color: styleInfo.text, padding: '5px 12px', borderRadius: '18px', fontSize: '0.8rem', fontWeight: '900' }}>
                                            <i className={`fas ${styleInfo.icon}`}></i>
                                            {table.status.replace('_', ' ')}
                                        </div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: '800', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--admin-primary)', padding: '5px 12px', borderRadius: '18px' }}>
                                            <i className="fas fa-layer-group"></i> {table.section || table.category || 'Indoor'}
                                        </span>
                                    </div>

                                    {/* Upcoming Reservation Pill if scheduled today */}
                                    {upcomingRes && (
                                        <div style={{ background: 'rgba(241, 196, 15, 0.15)', border: '1px solid #f1c40f', color: '#f1c40f', borderRadius: '12px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span><i className="fas fa-calendar-check" style={{ marginRight: '6px' }}></i> Res @ {upcomingRes.time}</span>
                                            <span>{upcomingRes.name} ({upcomingRes.guests}p)</span>
                                        </div>
                                    )}

                                    {/* Capacity & Session Details Box */}
                                    <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '14px', padding: '14px', fontSize: '0.88rem', marginBottom: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', marginBottom: '6px' }}>
                                            <span>Seating Capacity:</span>
                                            <span style={{ color: 'var(--admin-text)', fontWeight: '800' }}><i className="fas fa-chair" style={{ color: 'var(--admin-primary)' }}></i> {table.capacity} Seats</span>
                                        </div>

                                        {table.session ? (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', marginBottom: '6px' }}>
                                                    <span>Guest Session:</span>
                                                    <span style={{ color: 'var(--admin-primary)', fontWeight: '900' }}>{table.session.guestName} ({table.session.guestCount}p)</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)' }}>
                                                    <span>Seated Time:</span>
                                                    <span style={{ color: '#CCC', fontWeight: '700' }}>{new Date(table.session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ color: 'var(--admin-text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                                                No active guest session
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {table.status === 'AVAILABLE' && (
                                        <button 
                                            onClick={() => handleOpenSeatModal(table)}
                                            style={{ flex: 1, background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}
                                        >
                                            <i className="fas fa-user-plus"></i> Seat Guest
                                        </button>
                                    )}

                                    {(table.status === 'OCCUPIED' || table.status === 'BILL_REQUESTED') && (
                                        <>
                                            <button 
                                                onClick={() => handleViewTableOrders(table)}
                                                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', padding: '10px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                                            >
                                                <i className="fas fa-list"></i> Orders
                                            </button>

                                            <button 
                                                onClick={() => navigate('/admin/billing')}
                                                style={{ flex: 1, background: 'rgba(212, 175, 55, 0.2)', color: 'var(--admin-primary)', border: '1px solid var(--admin-primary)', padding: '10px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
                                                title="Open Checkout Terminal"
                                            >
                                                <i className="fas fa-calculator"></i> POS Bill
                                            </button>

                                            {table.status === 'OCCUPIED' && (
                                                <button 
                                                    onClick={() => changeTableStatus(table.id, 'BILL_REQUESTED')}
                                                    style={{ width: '100%', background: 'rgba(155, 89, 182, 0.2)', color: '#9b59b6', border: '1px solid rgba(155, 89, 182, 0.4)', padding: '10px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem', marginTop: '6px' }}
                                                >
                                                    <i className="fas fa-receipt"></i> Request Bill
                                                </button>
                                            )}

                                            {table.status === 'BILL_REQUESTED' && (
                                                <button 
                                                    onClick={() => changeTableStatus(table.id, 'CLEANING')}
                                                    style={{ width: '100%', background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.4)', padding: '10px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem', marginTop: '6px' }}
                                                >
                                                    <i className="fas fa-broom"></i> Move to Clean
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {table.status === 'CLEANING' && (
                                        <button 
                                            onClick={() => releaseTable(table.id)}
                                            style={{ flex: 1, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(46,204,113,0.3)' }}
                                        >
                                            <i className="fas fa-check-double"></i> Release Table
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal: Add or Edit Table */}
            {tableModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content" style={{ maxWidth: '480px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: 'var(--admin-text)' }}>
                                {editingTable ? `Edit ${editingTable.id}` : '➕ Add New Dining Table'}
                            </h2>
                            <button onClick={() => setTableModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <form onSubmit={handleSaveTableSubmit}>
                            <div className="admin-form-group">
                                <label>Table ID (e.g. T09, T10, VIP1)</label>
                                <input 
                                    type="text" 
                                    className="admin-input" 
                                    placeholder="T09" 
                                    value={tableForm.id}
                                    onChange={e => setTableForm({ ...tableForm, id: e.target.value })}
                                    disabled={Boolean(editingTable)}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Table Display Name</label>
                                <input 
                                    type="text" 
                                    className="admin-input" 
                                    placeholder="Table 09" 
                                    value={tableForm.name}
                                    onChange={e => setTableForm({ ...tableForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="admin-form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="admin-form-group" style={{ flex: 1 }}>
                                    <label>Seating Capacity</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="30"
                                        className="admin-input" 
                                        value={tableForm.capacity}
                                        onChange={e => setTableForm({ ...tableForm, capacity: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="admin-form-group" style={{ flex: 1 }}>
                                    <label>Floor Section Mapping</label>
                                    <select 
                                        className="admin-select"
                                        value={tableForm.section}
                                        onChange={e => setTableForm({ ...tableForm, section: e.target.value })}
                                    >
                                        {availableSections.map(sec => (
                                            <option key={sec} value={sec}>{sec}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setTableModalOpen(false)} className="action-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text)' }}>Cancel</button>
                                <button type="submit" className="action-btn btn-primary" style={{ flex: 1 }}>{editingTable ? 'Save Changes' : 'Create Table'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Seat Walk-In Guest */}
            {seatModalOpen && selectedTableForSeating && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content" style={{ maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: 'var(--admin-text)' }}>
                                Seat Walk-In — {selectedTableForSeating.name}
                            </h2>
                            <button onClick={() => setSeatModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {/* Safe Dining Window Alert if table has an upcoming reservation */}
                        {Array.isArray(selectedTableForSeating.upcomingReservations) && selectedTableForSeating.upcomingReservations.length > 0 && (
                            <div style={{ background: 'rgba(241, 196, 15, 0.15)', border: '1px solid #f1c40f', color: '#f1c40f', borderRadius: '12px', padding: '12px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '18px' }}>
                                <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i>
                                Notice: Scheduled reservation today for <strong>{selectedTableForSeating.upcomingReservations[0].name}</strong> at <strong>{selectedTableForSeating.upcomingReservations[0].time}</strong>. Ensure walk-in completes dining within remaining window.
                            </div>
                        )}

                        <form onSubmit={handleSeatSubmit}>
                            <div className="admin-form-group">
                                <label>Guest Name</label>
                                <input 
                                    type="text" 
                                    className="admin-input" 
                                    placeholder="Enter guest name..." 
                                    value={walkInForm.guestName}
                                    onChange={e => setWalkInForm({ ...walkInForm, guestName: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Phone Number (Optional)</label>
                                <input 
                                    type="tel" 
                                    className="admin-input" 
                                    placeholder="+91 98765 43210" 
                                    value={walkInForm.phone}
                                    onChange={e => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Party Size (Number of Guests)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="20"
                                    className="admin-input" 
                                    value={walkInForm.guestCount}
                                    onChange={e => setWalkInForm({ ...walkInForm, guestCount: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setSeatModalOpen(false)} className="action-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text)' }}>Cancel</button>
                                <button type="submit" className="action-btn btn-primary" style={{ flex: 1 }}>Confirm & Seat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

