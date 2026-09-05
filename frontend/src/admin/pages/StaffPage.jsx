import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function StaffPage() {
    const { API_URL } = useAdmin();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [role, setRole] = useState('WAITER'); // 'WAITER', 'CASHIER', 'KITCHEN', 'MANAGER'
    const [pin, setPin] = useState('');
    const [phone, setPhone] = useState('');
    const [shift, setShift] = useState('Full Day');

    const [dailyPinInfo, setDailyPinInfo] = useState(null);
    const [sendingPin, setSendingPin] = useState(false);

    useEffect(() => {
        fetchStaff();
        fetchDailyPin();
    }, []);

    const fetchDailyPin = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/daily-pin`);
            if (res.data.success) {
                setDailyPinInfo(res.data);
            }
        } catch (err) {
            console.error('Error fetching daily PIN:', err);
        }
    };

    const handleSendDailyPinEmail = async () => {
        setSendingPin(true);
        try {
            const res = await axios.post(`${API_URL}/auth/send-daily-pin`, { email: 'shivkumarrdn7@gmail.com' });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Daily PIN Emailed!',
                    text: `Today's rotating Security PIN (${res.data.dailyPin}) sent to manager email.`,
                    background: '#121620',
                    color: '#FFF',
                    confirmButtonColor: '#D4AF37'
                });
            }
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Could not send daily PIN email.', icon: 'error', background: '#121620', color: '#FFF' });
        } finally {
            setSendingPin(false);
        }
    };

    const getRoleBadgeStyle = (r) => {
        switch (r) {
            case 'MANAGER': return { bg: 'rgba(241, 196, 15, 0.15)', border: '#f1c40f', color: '#f1c40f' };
            case 'CASHIER': return { bg: 'rgba(46, 204, 113, 0.15)', border: '#2ecc71', color: '#2ecc71' };
            case 'KITCHEN': return { bg: 'rgba(231, 76, 60, 0.15)', border: '#e74c3c', color: '#e74c3c' };
            default: return { bg: 'rgba(212, 175, 55, 0.15)', border: '#D4AF37', color: '#D4AF37' };
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="fas fa-users-cog" style={{ color: 'var(--admin-primary)' }}></i>
                        Staff Accounts & Role-Based Access Control (RBAC)
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Manage restaurant employee accounts, assign roles (Waiter, Cashier, Kitchen, Manager), and generate 4-digit PINs.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                        color: '#000',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                >
                    <i className="fas fa-user-plus"></i> Add New Staff Member
                </button>
            </div>

            {/* Daily Auto-Rotating PIN Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 24, 34, 0.98))',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '20px',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '2rem', background: 'rgba(212,175,55,0.15)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.3)' }}>
                        🔒
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#FFD700' }}>
                                Daily Auto-Rotating Manager Security PIN
                            </h3>
                            <span style={{ background: '#2ECC71', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '2px 8px', borderRadius: '10px' }}>
                                ACTIVE TODAY
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#8A94A6' }}>
                            Prevents static PIN sharing. Automatically rotates every midnight at 00:00.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {dailyPinInfo && (
                        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px dashed #D4AF37', borderRadius: '14px', padding: '8px 18px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8A94A6', textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Manager PIN</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFD700', letterSpacing: '4px' }}>{dailyPinInfo.dailyPin}</div>
                        </div>
                    )}

                    <button
                        onClick={handleSendDailyPinEmail}
                        disabled={sendingPin}
                        style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#3B82F6',
                            border: '1px solid #3B82F6',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="fas fa-paper-plane"></i>
                        {sendingPin ? 'Dispatching...' : '📧 Email Today\'s PIN'}
                    </button>
                </div>
            </div>

            {/* Staff Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {staffList.map(staff => {
                    const badge = getRoleBadgeStyle(staff.role);

                    return (
                        <div 
                            key={staff.id}
                            style={{ 
                                background: 'var(--admin-surface)', 
                                border: '1px solid var(--admin-border)', 
                                borderRadius: '20px', 
                                padding: '22px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <div>
                                        <span style={{ 
                                            fontSize: '0.72rem', 
                                            fontWeight: '900', 
                                            textTransform: 'uppercase', 
                                            padding: '4px 10px', 
                                            borderRadius: '20px',
                                            background: badge.bg,
                                            color: badge.color,
                                            border: `1px solid ${badge.border}`
                                        }}>
                                            {staff.role}
                                        </span>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--admin-text)', margin: '10px 0 4px 0' }}>
                                            {staff.name}
                                        </h3>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                                            ID: <strong style={{ color: '#FFF' }}>{staff.id}</strong> | Phone: {staff.phone}
                                        </div>
                                    </div>

                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '1.1rem', fontWeight: '900' }}>
                                        {staff.name.charAt(0)}
                                    </div>
                                </div>

                                {/* Security Details */}
                                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--admin-border)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                        <span style={{ color: 'var(--admin-text-muted)' }}>Login PIN:</span>
                                        <span style={{ color: 'var(--admin-primary)', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '2px' }}>{staff.pin}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--admin-text-muted)' }}>Active Shift:</span>
                                        <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>{staff.shift}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border)', paddingTop: '14px' }}>
                                <span style={{ color: '#2ecc71', fontSize: '0.78rem', fontWeight: '800' }}>
                                    ● {staff.status}
                                </span>
                                <button
                                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                    style={{
                                        background: 'rgba(231, 76, 60, 0.12)',
                                        color: '#e74c3c',
                                        border: '1px solid #e74c3c',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        fontSize: '0.78rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fas fa-trash-alt"></i> Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#121620', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '30px', maxWidth: '480px', width: '100%', color: '#FFF', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#FFD700' }}>
                                <i className="fas fa-user-plus"></i> Add Staff Account
                            </h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#AAA', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Vikram Singh"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Role</label>
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: '#181e2a', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', fontWeight: '700' }}
                                    >
                                        <option value="WAITER">Waiter</option>
                                        <option value="CASHIER">Cashier</option>
                                        <option value="KITCHEN">Kitchen / Cook</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>4-Digit PIN</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={4}
                                        placeholder="e.g. 5678"
                                        value={pin}
                                        onChange={e => setPin(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFD700', fontWeight: '900', fontSize: '1rem', textAlign: 'center', letterSpacing: '3px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+91 9876543210"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    marginTop: '10px',
                                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                }}
                            >
                                Register Staff Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
