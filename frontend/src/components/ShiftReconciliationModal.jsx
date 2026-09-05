import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ShiftReconciliationModal({ isOpen, onClose, staffUser }) {
    const [activeShift, setActiveShift] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [openingFloat, setOpeningFloat] = useState(5000);
    const [actualCash, setActualCash] = useState('');
    const [notes, setNotes] = useState('');
    const [managerPin, setManagerPin] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        if (isOpen) {
            fetchActiveShift();
        }
    }, [isOpen]);

    const fetchActiveShift = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/shifts/active`);
            if (res.data.success) {
                setActiveShift(res.data.activeShift);
            }
        } catch (err) {
            console.error('Error fetching active shift:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/shifts/open`, {
                staffId: staffUser?.id || 'STF-002',
                staffName: staffUser?.name || 'Cashier',
                openingFloat: Number(openingFloat)
            });

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Shift Opened!',
                    text: `Cash Drawer registered with opening float ₹${openingFloat}`,
                    background: '#121620',
                    color: '#FFF',
                    confirmButtonColor: '#2ecc71'
                });
                setActiveShift(res.data.shift);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error Opening Shift',
                text: err.response?.data?.message || err.message,
                background: '#121620',
                color: '#FFF'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseShift = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/shifts/close`, {
                shiftId: activeShift?.id,
                actualCash: Number(actualCash),
                notes,
                managerPin
            });

            if (res.data.success) {
                const shift = res.data.shift;
                const isVariance = shift.variance !== 0;

                Swal.fire({
                    icon: isVariance ? 'warning' : 'success',
                    title: 'Shift Closed & Reconciled',
                    html: `
                        <div style="text-align: left; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 14px; color: #FFF; font-size: 0.9rem;">
                            <div>Expected Cash: <strong style="color:#FFD700;">₹${shift.expectedCash}</strong></div>
                            <div>Actual Cash Counted: <strong style="color:#FFF;">₹${shift.actualCash}</strong></div>
                            <div style="margin-top: 6px; font-weight: 800; color: ${shift.variance < 0 ? '#EF4444' : shift.variance > 0 ? '#3B82F6' : '#2ECC71'};">
                                Variance / Discrepancy: ${shift.variance > 0 ? '+' : ''}₹${shift.variance}
                            </div>
                        </div>
                    `,
                    background: '#121620',
                    color: '#FFF',
                    confirmButtonColor: '#D4AF37'
                });

                setActiveShift(null);
                setActualCash('');
                setNotes('');
                onClose();
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to Close Shift',
                text: err.response?.data?.message || err.message,
                background: '#121620',
                color: '#FFF'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div style={{
                background: '#121620',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '520px',
                padding: '28px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
                color: '#FFF',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFF',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        fontWeight: 900
                    }}
                >
                    ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '1.8rem', background: 'rgba(212,175,55,0.15)', padding: '10px 14px', borderRadius: '16px' }}>
                        💰
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#FFD700' }}>
                            Cash Drawer & Shift Reconciliation
                        </h2>
                        <span style={{ fontSize: '0.82rem', color: '#8A94A6' }}>
                            {activeShift ? `Active Shift: ${activeShift.id}` : 'No shift currently open'}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#8A94A6' }}>
                        Loading shift status...
                    </div>
                ) : !activeShift ? (
                    /* OPEN SHIFT FORM */
                    <form onSubmit={handleOpenShift}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.84rem', color: '#AAA', fontWeight: 700, marginBottom: '8px' }}>
                                Opening Cash Float (₹)
                            </label>
                            <input
                                type="number"
                                required
                                value={openingFloat}
                                onChange={(e) => setOpeningFloat(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '12px',
                                    color: '#2ecc71',
                                    fontSize: '1.2rem',
                                    fontWeight: 900,
                                    boxSizing: 'border-box'
                                }}
                            />
                            <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px', marginBottom: 0 }}>
                                Initial cash placed in drawer at the start of shift for change.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#FFF',
                                fontWeight: 900,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(46, 204, 113, 0.3)'
                            }}
                        >
                            {submitting ? 'Opening Shift...' : '✓ Open Shift & Register Float'}
                        </button>
                    </form>
                ) : (
                    /* CLOSE SHIFT FORM */
                    <form onSubmit={handleCloseShift}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#8A94A6' }}>Opened At</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#8A94A6' }}>Opening Float</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2ECC71' }}>₹{activeShift.openingFloat}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.84rem', color: '#AAA', fontWeight: 700, marginBottom: '6px' }}>
                                Actual Cash Counted in Drawer (₹)
                            </label>
                            <input
                                type="number"
                                required
                                placeholder="Enter total cash in drawer"
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(212, 175, 55, 0.4)',
                                    borderRadius: '12px',
                                    color: '#FFD700',
                                    fontSize: '1.2rem',
                                    fontWeight: 900,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.84rem', color: '#AAA', fontWeight: 700, marginBottom: '6px' }}>
                                Manager PIN (Required for Overrides/Discrepancy)
                            </label>
                            <input
                                type="password"
                                maxLength={6}
                                placeholder="Manager PIN (e.g. 4567)"
                                value={managerPin}
                                onChange={(e) => setManagerPin(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#FFF',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.84rem', color: '#AAA', fontWeight: 700, marginBottom: '6px' }}>
                                Shift Closing Notes / Discrepancy Reason
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Optional notes for manager review..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#FFF',
                                    fontSize: '0.88rem',
                                    resize: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#FFF',
                                fontWeight: 900,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            {submitting ? 'Reconciling & Closing...' : '🔒 Reconcile & Close Shift'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
