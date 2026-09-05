import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ServiceModeToggle from '../components/ServiceModeToggle';
import ShiftReconciliationModal from '../components/ShiftReconciliationModal';

export default function StaffLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState('SERVICE');
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

    const staffToken = localStorage.getItem('staffSessionToken');
    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{"name":"Duty Staff","role":"WAITER"}');

    useEffect(() => {
        if (!staffToken && !location.pathname.includes('/staff/login')) {
            navigate('/staff/login');
        }
    }, [staffToken, location.pathname, navigate]);

    const handleLogout = () => {
        Swal.fire({
            title: 'Staff Logout?',
            text: 'Are you sure you want to end your active shift session?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Logout',
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#475569',
            background: '#121620',
            color: '#FFF'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('staffSessionToken');
                localStorage.removeItem('staffUser');
                navigate('/staff/login');
            }
        });
    };

    if (location.pathname === '/staff/login') {
        return <Outlet />;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#070A0E', color: '#FFF', fontFamily: 'Outfit, sans-serif', padding: '15px' }}>
            {/* Top Staff Navigation Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(145deg, rgba(20, 24, 34, 0.95), rgba(8, 11, 16, 0.98))', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', padding: '12px 20px', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #AA7C11)', color: '#000', fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        K
                    </div>
                    <div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: '800', color: '#FFF', lineHeight: '1.1' }}>Khaliya Staff</div>
                        <div style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: '700', letterSpacing: '1px' }}>
                            {staffUser.name} • <span style={{ color: '#2ecc71' }}>{staffUser.role}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <ServiceModeToggle 
                        currentMode={mode} 
                        onToggleMode={(newMode) => {
                            setMode(newMode);
                            if (newMode === 'MANAGEMENT') {
                                navigate('/admin/dashboard');
                            }
                        }} 
                    />

                    <button
                        onClick={() => setIsShiftModalOpen(true)}
                        style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            color: '#FFD700',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            borderRadius: '20px',
                            padding: '6px 14px',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                        }}
                    >
                        💰 Shift Cash
                    </button>

                    <Link to="/staff/kitchen" style={{ textDecoration: 'none', background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-fire-burner"></i> KDS
                    </Link>
                    <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#AAA', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
                        <i className="fas fa-sign-out-alt"></i> Exit
                    </button>
                </div>

                <ShiftReconciliationModal 
                    isOpen={isShiftModalOpen} 
                    onClose={() => setIsShiftModalOpen(false)}
                    staffUser={staffUser} 
                />
            </div>

            {/* Main Content Area */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <Outlet />
            </div>

            {/* Persistent Mobile Tablet Quick Action Dock Bar */}
            <div style={{ position: 'fixed', bottom: '15px', left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: '580px', background: 'rgba(18, 23, 34, 0.96)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(212, 175, 55, 0.45)', borderRadius: '24px', padding: '10px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.85)', zIndex: 999 }}>
                <Link to="/staff/waiter" style={{ textDecoration: 'none', color: location.pathname === '/staff/waiter' ? '#FFD700' : '#8A94A6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                    <i className="fas fa-th" style={{ fontSize: '1.2rem' }}></i>
                    Floor Map
                </Link>

                <Link to="/admin/billing" style={{ textDecoration: 'none', color: '#8A94A6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                    <i className="fas fa-calculator" style={{ fontSize: '1.2rem' }}></i>
                    POS Billing
                </Link>

                <Link to="/staff/kitchen" style={{ textDecoration: 'none', color: location.pathname === '/staff/kitchen' ? '#FFD700' : '#8A94A6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                    <i className="fas fa-fire-burner" style={{ fontSize: '1.2rem' }}></i>
                    Kitchen KDS
                </Link>

                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#e74c3c', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>
                    <i className="fas fa-power-off" style={{ fontSize: '1.2rem' }}></i>
                    Logout
                </button>
            </div>
        </div>
    );
}
