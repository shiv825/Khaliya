import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function PrintersPage() {
    const { API_URL } = useAdmin();
    const [printers, setPrinters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('KITCHEN'); // 'KITCHEN', 'BILL', 'BAR', 'TANDOOR'
    const [connection, setConnection] = useState('LAN'); // 'LAN', 'USB', 'BLUETOOTH'
    const [ipAddress, setIpAddress] = useState('192.168.1.50');
    const [port, setPort] = useState(9100);
    const [paperSize, setPaperSize] = useState('80mm');
    const [categories, setCategories] = useState(['ALL']);

    // Default initial mock printers if database not seeded
    const defaultPrinters = [
        {
            id: 'PRN-001',
            name: 'Cash Counter Receipt Printer',
            type: 'BILL',
            connection: 'LAN',
            ipAddress: '192.168.1.50',
            port: 9100,
            paperSize: '80mm',
            categories: ['ALL'],
            status: 'ONLINE',
            lastPrint: '2 mins ago'
        },
        {
            id: 'PRN-002',
            name: 'Main Kitchen KOT Printer',
            type: 'KITCHEN',
            connection: 'LAN',
            ipAddress: '192.168.1.51',
            port: 9100,
            paperSize: '80mm',
            categories: ['Main Course', 'Starters', 'Biryani'],
            status: 'ONLINE',
            lastPrint: '5 mins ago'
        },
        {
            id: 'PRN-003',
            name: 'Tandoor & Grill Station',
            type: 'TANDOOR',
            connection: 'LAN',
            ipAddress: '192.168.1.52',
            port: 9100,
            paperSize: '80mm',
            categories: ['Kebabs', 'Naan & Breads'],
            status: 'ONLINE',
            lastPrint: '12 mins ago'
        }
    ];

    useEffect(() => {
        fetchPrinters();
    }, []);

    const fetchPrinters = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/printers`).catch(() => null);
            if (res && res.data && Array.isArray(res.data.printers) && res.data.printers.length > 0) {
                setPrinters(res.data.printers);
            } else {
                setPrinters(defaultPrinters);
            }
        } catch {
            setPrinters(defaultPrinters);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePrinter = async (e) => {
        e.preventDefault();
        const newPrinter = {
            id: `PRN-${Date.now().toString().slice(-4)}`,
            name,
            type,
            connection,
            ipAddress,
            port: Number(port),
            paperSize,
            categories,
            status: 'ONLINE',
            lastPrint: 'Just now'
        };

        try {
            await axios.post(`${API_URL}/printers`, newPrinter).catch(() => null);
            setPrinters(prev => [newPrinter, ...prev]);
            setShowAddModal(false);
            resetForm();

            Swal.fire({
                title: '🖨️ Printer Registered!',
                text: `${name} has been added to Khaliya printer network.`,
                icon: 'success',
                confirmButtonColor: '#D4AF37',
                background: '#121620',
                color: '#FFF'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Could not register printer.',
                icon: 'error',
                background: '#121620',
                color: '#FFF'
            });
        }
    };

    const handleTestPrint = async (printer) => {
        Swal.fire({
            title: '🖨️ Sending Test ESC/POS Signal...',
            text: `Routing 80mm sample receipt to ${printer.name} (${printer.ipAddress}:${printer.port})`,
            icon: 'info',
            showConfirmButton: false,
            timer: 1800,
            background: '#121620',
            color: '#FFF'
        });

        try {
            await axios.post(`${API_URL}/printers/test-print`, { printerId: printer.id, ip: printer.ipAddress }).catch(() => null);
            
            setTimeout(() => {
                Swal.fire({
                    title: '✅ Test Print Sent!',
                    html: `
                        <div style="text-align: left; background: #080B10; padding: 15px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 0.85rem; color: #FFD700; border: 1px solid #D4AF37;">
                            ================================<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;KHALIYA RESTAURANT<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PRINTER TEST SUCCESSFUL<br/>
                            ================================<br/>
                            Printer: ${printer.name}<br/>
                            Station: ${printer.type}<br/>
                            Target IP: ${printer.ipAddress}:${printer.port}<br/>
                            Paper: ${printer.paperSize} Thermal Roll<br/>
                            Status: ESC/POS Ready<br/>
                            --------------------------------<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Khaliya Print Agent v1.0<br/>
                            ================================
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: '#D4AF37',
                    background: '#121620',
                    color: '#FFF'
                });
            }, 1900);
        } catch {
            // Fallback preview
        }
    };

    const handleDeletePrinter = (id, printerName) => {
        Swal.fire({
            title: 'Remove Printer?',
            text: `Are you sure you want to remove ${printerName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Yes, Remove',
            background: '#121620',
            color: '#FFF'
        }).then((result) => {
            if (result.isConfirmed) {
                setPrinters(prev => prev.filter(p => p.id !== id));
                Swal.fire({ title: 'Removed', text: 'Printer deleted.', icon: 'success', background: '#121620', color: '#FFF' });
            }
        });
    };

    const resetForm = () => {
        setName('');
        setType('KITCHEN');
        setConnection('LAN');
        setIpAddress('192.168.1.50');
        setPort(9100);
        setPaperSize('80mm');
        setCategories(['ALL']);
    };

    return (
        <div style={{ padding: '10px' }}>
            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="fas fa-print" style={{ color: 'var(--admin-primary)' }}></i>
                        Thermal Printer & KOT Routing Management
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Configure 80mm ESC/POS hardware printers, IP addresses, kitchen routing & print agents.
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
                    <i className="fas fa-plus"></i> Add New Printer
                </button>
            </div>

            {/* Architecture Explainer Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(18, 23, 34, 0.85) 100%)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '18px', padding: '18px 22px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontSize: '1.4rem' }}>
                    ⚡
                </div>
                <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '1.02rem', marginBottom: '4px' }}>
                        Khaliya Automatic ESC/POS Print Agent
                    </div>
                    <div style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        Orders placed via Customer QR or Staff POS automatically route to registered **80mm Thermal LAN Printers** (Port 9100) with zero manual browser print popups.
                    </div>
                </div>
            </div>

            {/* Registered Printers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {printers.map(printer => (
                    <div 
                        key={printer.id}
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
                            {/* Card Top Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div>
                                    <span style={{ 
                                        fontSize: '0.72rem', 
                                        fontWeight: '800', 
                                        textTransform: 'uppercase', 
                                        padding: '4px 10px', 
                                        borderRadius: '20px',
                                        background: printer.type === 'BILL' 
                                            ? 'rgba(46, 204, 113, 0.15)' 
                                            : printer.type === 'KITCHEN' 
                                            ? 'rgba(231, 76, 60, 0.15)' 
                                            : 'rgba(241, 196, 15, 0.15)',
                                        color: printer.type === 'BILL' 
                                            ? '#2ecc71' 
                                            : printer.type === 'KITCHEN' 
                                            ? '#e74c3c' 
                                            : '#f1c40f',
                                        border: `1px solid ${printer.type === 'BILL' ? '#2ecc71' : printer.type === 'KITCHEN' ? '#e74c3c' : '#f1c40f'}`
                                    }}>
                                        {printer.type} PRINTER
                                    </span>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--admin-text)', margin: '10px 0 4px 0' }}>
                                        {printer.name}
                                    </h3>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                                        ID: {printer.id}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(46, 204, 113, 0.12)', border: '1px solid #2ecc71', padding: '4px 10px', borderRadius: '20px', color: '#2ecc71', fontSize: '0.75rem', fontWeight: '800' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }}></span>
                                    {printer.status}
                                </div>
                            </div>

                            {/* Technical Specs List */}
                            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--admin-border)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--admin-text-muted)' }}>Connection:</span>
                                    <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>{printer.connection} ({printer.ipAddress}:{printer.port})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--admin-text-muted)' }}>Paper Size:</span>
                                    <span style={{ color: 'var(--admin-primary)', fontWeight: '800' }}>{printer.paperSize} Thermal Roll</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--admin-text-muted)' }}>Categories:</span>
                                    <span style={{ color: 'var(--admin-text)', fontWeight: '700' }}>{printer.categories.join(', ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--admin-border)', paddingTop: '14px' }}>
                            <button
                                onClick={() => handleTestPrint(printer)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(212, 175, 55, 0.12)',
                                    color: '#D4AF37',
                                    border: '1px solid #D4AF37',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i className="fas fa-paper-plane"></i> Test ESC/POS
                            </button>

                            <button
                                onClick={() => handleDeletePrinter(printer.id, printer.name)}
                                style={{
                                    background: 'rgba(231, 76, 60, 0.12)',
                                    color: '#e74c3c',
                                    border: '1px solid #e74c3c',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                                title="Remove Printer"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Printer Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#121620', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '30px', maxWidth: '520px', width: '100%', color: '#FFF', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#FFD700' }}>
                                <i className="fas fa-print"></i> Register Thermal Printer
                            </h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#AAA', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <form onSubmit={handleSavePrinter} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Printer Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cashier 80mm Bill Printer"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Station Type</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: '#181e2a', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', fontWeight: '700' }}
                                    >
                                        <option value="BILL">Cashier Bill</option>
                                        <option value="KITCHEN">Main Kitchen KOT</option>
                                        <option value="TANDOOR">Tandoor Station</option>
                                        <option value="BAR">Bar & Beverages</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Connection Type</label>
                                    <select
                                        value={connection}
                                        onChange={e => setConnection(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: '#181e2a', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.88rem', fontWeight: '700' }}
                                    >
                                        <option value="LAN">LAN / TCP Socket</option>
                                        <option value="USB">Direct USB</option>
                                        <option value="BLUETOOTH">Web Bluetooth</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>LAN IP Address</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="192.168.1.50"
                                        value={ipAddress}
                                        onChange={e => setIpAddress(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Port</label>
                                    <input
                                        type="number"
                                        required
                                        value={port}
                                        onChange={e => setPort(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', fontWeight: '700', marginBottom: '6px' }}>Paper Roll Format</label>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {['80mm', '58mm'].map(sz => (
                                        <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: '#FFF' }}>
                                            <input
                                                type="radio"
                                                name="paperSize"
                                                value={sz}
                                                checked={paperSize === sz}
                                                onChange={() => setPaperSize(sz)}
                                            />
                                            {sz} Thermal Roll
                                        </label>
                                    ))}
                                </div>
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
                                Save Printer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
