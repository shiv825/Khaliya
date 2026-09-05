import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        fetchAuditLogs();
        const interval = setInterval(fetchAuditLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const res = await axios.get(`${API_URL}/audit-logs`);
            if (res.data.success) {
                setLogs(res.data.logs || []);
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            (log.staffName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'SHIFT_OPENED': return { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ECC71', border: '#2ECC71' };
            case 'SHIFT_CLOSED': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: '#EF4444' };
            case 'SPLIT_BILL_SETTLED': return { bg: 'rgba(212, 175, 55, 0.15)', text: '#FFD700', border: '#D4AF37' };
            case 'PRICE_OVERRIDE': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: '#A855F7' };
            case 'ORDER_CANCELLED': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: '#F59E0B' };
            default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6' };
        }
    };

    return (
        <div style={{ color: '#FFF', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', fontWeight: 900, color: '#FFD700', margin: 0 }}>
                        🚨 Restaurant Security & Audit Logs
                    </h1>
                    <p style={{ color: '#8A94A6', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                        Real-time immutable audit trail of sensitive staff actions, cash drawer shifts, and bill overrides.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Search logs by staff, action, or details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '12px',
                            color: '#FFF',
                            fontSize: '0.88rem',
                            minWidth: '280px'
                        }}
                    />

                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '12px',
                            color: '#FFD700',
                            fontWeight: 700,
                            fontSize: '0.88rem'
                        }}
                    >
                        <option value="ALL">All Actions</option>
                        <option value="SHIFT_OPENED">Shift Opened</option>
                        <option value="SHIFT_CLOSED">Shift Closed</option>
                        <option value="SPLIT_BILL_SETTLED">Split Bill Settled</option>
                        <option value="PRICE_OVERRIDE">Price Override</option>
                        <option value="ORDER_CANCELLED">Order Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A94A6' }}>
                    Loading audit trail...
                </div>
            ) : filteredLogs.length === 0 ? (
                <div style={{
                    background: '#121620',
                    border: '1px dashed rgba(212, 175, 55, 0.3)',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#8A94A6'
                }}>
                    No audit logs recorded for this criteria.
                </div>
            ) : (
                <div style={{
                    background: '#121620',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#8A94A6', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th style={{ padding: '14px 18px' }}>Timestamp</th>
                                <th style={{ padding: '14px 18px' }}>Staff Member</th>
                                <th style={{ padding: '14px 18px' }}>Action Type</th>
                                <th style={{ padding: '14px 18px' }}>Operational Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, idx) => {
                                const badgeStyle = getActionBadgeColor(log.action);
                                return (
                                    <tr key={log.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                        <td style={{ padding: '14px 18px', color: '#8A94A6', whiteSpace: 'nowrap' }}>
                                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                        </td>
                                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#FFF' }}>
                                            👤 {log.staffName || 'System Staff'}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.76rem',
                                                fontWeight: 800,
                                                background: badgeStyle.bg,
                                                color: badgeStyle.text,
                                                border: `1px solid ${badgeStyle.border}`
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 18px', color: '#CBD5E1' }}>
                                            {log.details}
                                            {log.notes && (
                                                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px', fontStyle: 'italic' }}>
                                                    Note: "{log.notes}"
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
