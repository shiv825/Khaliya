import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';

export default function ReviewsPage() {
    const { reviews } = useAdmin();

    return (
        <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: '1.8rem', fontWeight: 800 }}>Customer Ratings & Feedback</h2>
            {reviews.length === 0 ? (
                <div style={{ padding: '40px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '15px', border: '1px solid var(--admin-border)' }}>
                    No feedback or reviews submitted yet.
                </div>
            ) : (
                reviews.map(r => (
                    <div key={r.id} className="futuristic-row" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--admin-text)' }}>{r.name || 'Guest Customer'}</h3>
                            <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>{new Date(r.date || r.id).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 10, border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}>
                            "{r.text}"
                        </p>
                    </div>
                ))
            )}
        </motion.div>
    );
}
