import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AdminProvider, useAdmin, CULINARY_CATEGORIES } from './AdminContext';
import ServiceModeToggle from '../components/ServiceModeToggle';
import ShiftReconciliationModal from '../components/ShiftReconciliationModal';
import CustomAdminSelect from '../components/CustomAdminSelect';
import '../assets/admin-style.css';

function AdminLayoutInner() {
    const {
        API_URL,
        orders,
        settings,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleStoreStatus,
        isModalOpen,
        setIsModalOpen,
        editingItem,
        setEditingItem,
        modalLang,
        setModalLang,
        isUploading,
        setIsUploading,
        handleImageUpload,
        handleConvertUrlToCloudinary,
        handleSaveMenu
    } = useAdmin();

    const location = useLocation();
    const navigate = useNavigate();
    const [mode, setMode] = React.useState('MANAGEMENT');
    const [isShiftModalOpen, setIsShiftModalOpen] = React.useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminSessionToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.get(`${API_URL}/auth/verify-admin-token`)
            .then(res => {
                if (!res.data.success) {
                    Swal.fire({
                        title: 'Session Expired',
                        text: 'Your session has expired. Please log in again.',
                        icon: 'warning',
                        confirmButtonColor: '#8E1C1C'
                    });
                    handleLogout();
                }
            })
            .catch(() => {});
    }, [API_URL, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminSessionToken');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/admin/login');
    };

    const pendingOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;

    const getBreadcrumbTitle = () => {
        const path = location.pathname;
        if (path.includes('/tables')) return 'Table Session Lifecycle & Interactive Floor Map';
        if (path.includes('/kitchen')) return 'Kitchen Display System (KDS) Live Monitor';
        if (path.includes('/billing')) return 'POS Billing Terminal & Digital Receipts';
        if (path.includes('/printers')) return '80mm Thermal Printer & KOT Routing Management';
        if (path.includes('/qr')) return 'Table Stand QR Code Generator & Printing';
        if (path.includes('/products')) return 'Product Creator & Culinary Catalog';
        if (path.includes('/inventory')) return 'Stock & Peak Surge Pricing Controller';
        if (path.includes('/orders')) return 'Live Kitchen Orders & Kanban';
        if (path.includes('/bookings')) return 'Table Reservations Manager';
        if (path.includes('/reviews')) return 'Customer Ratings & Reviews';
        return 'Executive Dashboard Overview';
    };

    return (
        <div className="admin-layout-wrapper">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && window.innerWidth <= 992 && (
                <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isSidebarOpen && window.innerWidth <= 992 ? 'mobile-open' : ''}`}>
                {/* Brand Section (Fixed at top) */}
                <div className="sidebar-brand">
                    <div className="sidebar-logo-icon">K</div>
                    {isSidebarOpen && (
                        <div className="sidebar-brand-text">
                            <span className="sidebar-brand-title">Khaliya</span>
                            <span className="sidebar-brand-sub">Command Center</span>
                        </div>
                    )}
                </div>

                {/* Navigation Menu Links (Scrollable middle pane) */}
                <nav className="sidebar-nav">
                        <NavLink 
                            to="/admin/dashboard" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive || location.pathname === '/admin' ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Dashboard"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-chart-pie"></i>
                                {isSidebarOpen && <span>Dashboard</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/products" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Product Catalog"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-utensils"></i>
                                {isSidebarOpen && <span>Product Catalog</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/inventory" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Stock & Surge Pricing"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-bolt"></i>
                                {isSidebarOpen && <span>Stock & Surge</span>}
                            </div>
                            {settings.isSurgeActive && (
                                <span className="sidebar-nav-badge" style={{ background: 'var(--admin-accent)' }}>SURGE</span>
                            )}
                        </NavLink>

                        <NavLink 
                            to="/admin/orders" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Live Orders"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-list-check"></i>
                                {isSidebarOpen && <span>All Orders Kanban</span>}
                            </div>
                            {pendingOrdersCount > 0 && (
                                <span className="sidebar-nav-badge">{pendingOrdersCount}</span>
                            )}
                        </NavLink>

                        <NavLink 
                            to="/admin/tables" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Floor Map & Tables"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-th"></i>
                                {isSidebarOpen && <span>Floor Map & Tables</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/kitchen" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Kitchen KDS"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-fire-burner"></i>
                                {isSidebarOpen && <span>Kitchen (KDS)</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/billing" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="POS Billing"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-calculator"></i>
                                {isSidebarOpen && <span>POS & Billing</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/printers" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Thermal Printers"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-print"></i>
                                {isSidebarOpen && <span>Thermal Printers</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/staff" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Staff Accounts & Roles"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-users-cog"></i>
                                {isSidebarOpen && <span>Staff Accounts</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/qr" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Table QR Generator"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-qrcode"></i>
                                {isSidebarOpen && <span>Table QR Stands</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/bookings" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Reservations"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-calendar-check"></i>
                                {isSidebarOpen && <span>Reservations</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/audit-logs" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Audit Trail & Security"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-shield-alt"></i>
                                {isSidebarOpen && <span>Security & Audit Logs</span>}
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/admin/reviews" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => { if (window.innerWidth <= 992) setIsSidebarOpen(false); }}
                            title="Feedback"
                        >
                            <div className="sidebar-nav-item-content">
                                <i className="fas fa-star"></i>
                                {isSidebarOpen && <span>Feedback</span>}
                            </div>
                        </NavLink>
                    </nav>



                {/* Sidebar Footer */}

                <div className="sidebar-footer">
                    {isSidebarOpen && (
                        <div className="sidebar-profile">
                            <div className="sidebar-profile-avatar">S</div>
                            <div className="sidebar-profile-info">
                                <span className="sidebar-profile-name">Shiv Kumar</span>
                                <span className="sidebar-profile-role">Administrator</span>
                            </div>
                        </div>
                    )}
                    <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
                        <i className="fas fa-sign-out-alt"></i>
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA (RIGHT SIDE) */}
            <div className="admin-content-wrapper">
                {/* Topbar Header */}
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Toggle Sidebar">
                            <i className={`fas ${isSidebarOpen ? 'fa-outdent' : 'fa-indent'}`}></i>
                        </button>
                        <div className="admin-page-breadcrumb">
                            <span className="breadcrumb-sub">Khaliya Sanctuary</span>
                            <h2 className="breadcrumb-title">{getBreadcrumbTitle()}</h2>
                        </div>
                    </div>

                    <div className="admin-topbar-right">
                        <ServiceModeToggle 
                            currentMode={mode} 
                            onToggleMode={(newMode) => {
                                setMode(newMode);
                                if (newMode === 'SERVICE') {
                                    navigate('/staff/waiter');
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
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>💰</span>
                            <span>Cash Shift</span>
                        </button>

                        <div className={`saas-status-toggle ${settings.isOpen ? 'open' : 'closed'}`} onClick={toggleStoreStatus} style={{ margin: 0, padding: '8px 14px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></div>
                            <span className="status-toggle-label" style={{ fontSize: '0.85rem' }}>{settings.isOpen ? 'Accepting Orders' : 'Store Closed'}</span>
                        </div>
                    </div>

                    <ShiftReconciliationModal 
                        isOpen={isShiftModalOpen} 
                        onClose={() => setIsShiftModalOpen(false)}
                        staffUser={{ id: 'ADM-001', name: 'Shiv Kumar (Admin)', role: 'MANAGER' }} 
                    />
                </header>

                <main className="admin-main-full">
                    <div style={{ padding: '30px' }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Global Product Creator & Edit Modal */}
            <AnimatePresence>
                {isModalOpen && editingItem && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="admin-modal-content">
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: 'var(--admin-text)' }}>{editingItem.id ? 'Edit Product' : 'Create New Product'}</h3>
                            <form onSubmit={handleSaveMenu}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <button type="button" onClick={() => setModalLang('en')} className={`action-btn ${modalLang === 'en' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', border: modalLang !== 'en' ? '1px solid var(--admin-border)' : 'none' }}>English</button>
                                    <button type="button" onClick={() => setModalLang('hi')} className={`action-btn ${modalLang === 'hi' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', border: modalLang !== 'hi' ? '1px solid var(--admin-border)' : 'none' }}>Hindi</button>
                                    <button type="button" onClick={() => setModalLang('ar')} className={`action-btn ${modalLang === 'ar' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', border: modalLang !== 'ar' ? '1px solid var(--admin-border)' : 'none' }}>Arabic</button>
                                </div>
                                <div className="admin-form-group">
                                    <label>Item Name ({modalLang.toUpperCase()})</label>
                                    <input type="text" className="admin-input" required={modalLang === 'en'} value={editingItem.name?.[modalLang] || ''} onChange={e => setEditingItem({...editingItem, name: {...editingItem.name, [modalLang]: e.target.value}})} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Description ({modalLang.toUpperCase()})</label>
                                    <textarea className="admin-textarea" value={editingItem.description?.[modalLang] || ''} onChange={e => setEditingItem({...editingItem, description: {...editingItem.description, [modalLang]: e.target.value}})}></textarea>
                                </div>
                                <div className="admin-form-row">
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                         <label>Price (₹)</label>
                                         <input type="text" inputMode="decimal" className="admin-input" required value={editingItem.price ? String(editingItem.price).replace(/[^\d.]/g, '') : ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})} />
                                    </div>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <CustomAdminSelect 
                                            options={CULINARY_CATEGORIES.filter(c => c !== 'All Categories')}
                                            value={editingItem.category || 'Appetizers & Starters'}
                                            onChange={val => setEditingItem({ ...editingItem, category: val })}
                                            placeholder="Select Category..."
                                            icon="fas fa-utensils"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-row" style={{ marginTop: '12px' }}>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Dietary Type</label>
                                        <CustomAdminSelect 
                                            options={[
                                                { label: '🟢 Pure Veg', value: 'veg' },
                                                { label: '🔴 Non-Veg', value: 'non-veg' }
                                            ]}
                                            value={editingItem.tags?.includes('non-veg') ? 'non-veg' : 'veg'}
                                            onChange={val => {
                                                let tags = (editingItem.tags || []).filter(t => t !== 'veg' && t !== 'non-veg');
                                                tags.push(val);
                                                setEditingItem({ ...editingItem, tags });
                                            }}
                                            placeholder="Select Dietary Type..."
                                            icon="fas fa-leaf"
                                        />
                                    </div>
                                    <div className="admin-form-group" style={{ flex: 1 }}>
                                        <label>Spice Level Indicator</label>
                                        <CustomAdminSelect 
                                            options={[
                                                { label: '🌱 Mild / Not Spicy (0 🌶️)', value: '' },
                                                { label: '🌶️ Mild Spicy (1 🌶️)', value: 'spicy-1' },
                                                { label: '🌶️🌶️ Medium Spicy (2 🌶️)', value: 'spicy-2' },
                                                { label: '🌶️🌶️🌶️ Fiery Hot (3 🌶️)', value: 'spicy-3' }
                                            ]}
                                            value={(editingItem.tags || []).find(t => t.startsWith('spicy-')) || ''}
                                            onChange={val => {
                                                let tags = (editingItem.tags || []).filter(t => !t.startsWith('spicy-'));
                                                if (val) tags.push(val);
                                                setEditingItem({ ...editingItem, tags });
                                            }}
                                            placeholder="Select Spice Level..."
                                            icon="fas fa-pepper-hot"
                                        />
                                    </div>
                                </div>
                                <div className="admin-form-group" style={{ marginTop: '15px' }}>
                                    <label>Image URL or Upload</label>
                                    <div className="modal-image-row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input 
                                                type="text" 
                                                className="admin-input" 
                                                placeholder="Paste online image URL (e.g. https://...)" 
                                                value={editingItem.image || ''} 
                                                onChange={e => setEditingItem({...editingItem, image: e.target.value})} 
                                            />
                                            <div style={{ position: 'relative', border: '2px dashed var(--admin-border)', borderRadius: '10px', padding: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'var(--transition)' }}>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                                {isUploading ? (
                                                    <span style={{ color: 'var(--admin-primary)', fontWeight: 'bold' }}><i className="fas fa-spinner fa-spin"></i> Uploading...</span>
                                                ) : (
                                                    <span style={{ color: 'var(--admin-text-muted)' }}><i className="fas fa-cloud-upload-alt"></i> Drag & Drop or Click to Upload</span>
                                                )}
                                            </div>
                                        </div>
                                        {editingItem.image && (
                                            <div style={{ width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)', flexShrink: 0, position: 'relative' }}>
                                                <img 
                                                    key={editingItem.image}
                                                    src={editingItem.image} 
                                                    alt="Preview" 
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Crect width='90' height='90' fill='%23121620'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-size='11' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                    }} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="admin-form-row modal-actions-row">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="action-btn btn-cancel" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="action-btn btn-primary" style={{ flex: 2 }} disabled={isUploading}>
                                        {isUploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading & Saving...</> : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminLayout() {
    return (
        <AdminProvider>
            <AdminLayoutInner />
        </AdminProvider>
    );
}
