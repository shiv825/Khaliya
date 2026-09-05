import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function ReviewsPage() {
    const { reviews, API_URL, fetchData } = useAdmin();
    const [searchQuery, setSearchQuery] = useState('');
    const [starFilter, setStarFilter] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New Feedback Form State
    const [newReview, setNewReview] = useState({
        name: '',
        rating: 5,
        text: ''
    });

    // Rating Analytics Computation
    const totalReviews = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avgRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : '5.0';

    const countByStar = (star) => reviews.filter(r => (Number(r.rating) || 5) === star).length;
    const starCounts = {
        5: countByStar(5),
        4: countByStar(4),
        3: countByStar(3),
        2: countByStar(2),
        1: countByStar(1)
    };

    // Filtered Reviews
    const filteredReviews = reviews.filter(r => {
        const rRating = Number(r.rating) || 5;
        const matchesStar = starFilter === 'ALL' || rRating === Number(starFilter);
        const queryLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (r.name && r.name.toLowerCase().includes(queryLower)) ||
            (r.text && r.text.toLowerCase().includes(queryLower));
        return matchesStar && matchesSearch;
    });

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!newReview.name || !newReview.text) {
            Swal.fire('Required Fields', 'Please fill in reviewer name and feedback comment.', 'warning');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/reviews`, {
                name: newReview.name,
                rating: Number(newReview.rating) || 5,
                text: newReview.text,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            });

            if (res.data) {
                Swal.fire({
                    title: 'Feedback Logged!',
                    text: 'Thank you for recording customer feedback.',
                    icon: 'success',
                    background: '#121620',
                    color: '#FFF',
                    confirmButtonColor: '#D4AF37'
                });
                setIsAddModalOpen(false);
                setNewReview({ name: '', rating: 5, text: '' });
                if (fetchData) fetchData();
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to save review', 'error');
        }
    };

    const handleDeleteReview = async (id, name) => {
        const confirm = await Swal.fire({
            title: 'Delete Review?',
            text: `Are you sure you want to delete feedback from ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            background: '#121620',
            color: '#FFF'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/reviews/${id}`);
                Swal.fire({ title: 'Deleted!', text: 'Review has been removed.', icon: 'success', timer: 1500, showConfirmButton: false });
                if (fetchData) fetchData();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete review.', 'error');
            }
        }
    };

    const renderStars = (ratingNum) => {
        const stars = [];
        const num = Number(ratingNum) || 5;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`fas fa-star`}
                    style={{ color: i <= num ? '#f1c40f' : 'rgba(255,255,255,0.15)', marginRight: '3px', fontSize: '0.95rem' }}
                ></i>
            );
        }
        return stars;
    };

    return (
        <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '5px' }}>
            {/* Header & Add Feedback Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-star" style={{ color: 'var(--admin-primary)' }}></i>
                        Customer Ratings & Feedback
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Real-time dining feedback, sentiment distribution analytics & customer review log.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                        color: '#000',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                >
                    <i className="fas fa-pen"></i> + Add Manual Feedback
                </button>
            </div>

            {/* Rating Breakdown & Analytics Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                {/* Score Summary Box */}
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '22px', display: 'flex', alignItems: 'center', gap: '22px' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid var(--admin-border)', paddingRight: '22px' }}>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--admin-primary)', lineHeight: '1' }}>{avgRating}</div>
                        <div style={{ margin: '6px 0' }}>{renderStars(Math.round(Number(avgRating)))}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                            Based on {totalReviews} Reviews
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--admin-text)', marginBottom: '10px' }}>
                            Rating Highlights
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2ecc71' }}>
                                <span><i className="fas fa-thumbs-up" style={{ marginRight: '6px' }}></i> 5-Star Reviews:</span>
                                <strong>{starCounts[5]}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3498db' }}>
                                <span><i className="fas fa-smile" style={{ marginRight: '6px' }}></i> 4-Star Reviews:</span>
                                <strong>{starCounts[4]}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c' }}>
                                <span><i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i> Needs Attention (&le;3 Stars):</span>
                                <strong>{starCounts[1] + starCounts[2] + starCounts[3]}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution Bar Chart */}
                <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '20px', padding: '22px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--admin-text)', margin: '0 0 12px 0' }}>
                        Star Distribution Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = starCounts[star];
                            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                                    <span style={{ width: '45px', fontWeight: '800', color: 'var(--admin-text)' }}>{star} ★</span>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, background: star >= 4 ? '#2ecc71' : star === 3 ? '#f1c40f' : '#e74c3c', height: '100%', borderRadius: '10px', transition: 'width 0.4s' }}></div>
                                    </div>
                                    <span style={{ width: '35px', textAlign: 'right', color: 'var(--admin-text-muted)', fontWeight: '700' }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Instant Search Bar & Star Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}></i>
                    <input
                        type="text"
                        placeholder="Search reviewer name or feedback keyword..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            background: 'var(--admin-surface)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '12px',
                            color: 'var(--admin-text)',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['ALL', '5', '4', '3', '2', '1'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStarFilter(st)}
                            style={{
                                background: starFilter === st ? 'var(--admin-primary)' : 'var(--admin-surface)',
                                color: starFilter === st ? '#000' : 'var(--admin-text)',
                                border: `1px solid ${starFilter === st ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                padding: '8px 14px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {st === 'ALL' ? 'All Feedback' : `${st} ★`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews Cards List */}
            {filteredReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
                    <i className="fas fa-comment-slash" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4, display: 'block' }}></i>
                    No customer feedback matching your filter criteria.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {filteredReviews.map((r, idx) => {
                        const dateStr = r.date ? new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent Guest';

                        return (
                            <div
                                key={r.id || idx}
                                style={{
                                    background: 'var(--admin-surface)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '18px',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justify: 'space-between',
                                    gap: '15px'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                                                {(r.name || 'G')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--admin-text)' }}>
                                                    {r.name || 'Guest Customer'}
                                                </h3>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{dateStr}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteReview(r.id, r.name || 'Guest')}
                                            style={{ background: 'transparent', color: 'var(--admin-text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.7 }}
                                            title="Delete Review"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        {renderStars(r.rating || 5)}
                                    </div>

                                    <p style={{ margin: 0, fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '12px', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        "{r.text}"
                                    </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed var(--admin-border)', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                                    <span><i className="fas fa-check-circle" style={{ color: '#2ecc71', marginRight: '4px' }}></i> Verified Dining Review</span>
                                    <span style={{ color: 'var(--admin-primary)', fontWeight: '800' }}>Khaliya Member</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Manual Feedback Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ background: '#121620', border: '2px solid var(--admin-primary)', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '25px', color: '#FFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-primary)' }}>
                                <i className="fas fa-pen" style={{ marginRight: '8px' }}></i> Add Customer Feedback
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.2rem', cursor: 'pointer' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Guest Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    value={newReview.name}
                                    onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Star Rating</label>
                                <select
                                    value={newReview.rating}
                                    onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', fontWeight: '800' }}
                                >
                                    <option value="5" style={{ background: '#121620', color: '#FFF' }}>5 Stars - Outstanding</option>
                                    <option value="4" style={{ background: '#121620', color: '#FFF' }}>4 Stars - Very Good</option>
                                    <option value="3" style={{ background: '#121620', color: '#FFF' }}>3 Stars - Average</option>
                                    <option value="2" style={{ background: '#121620', color: '#FFF' }}>2 Stars - Needs Improvement</option>
                                    <option value="1" style={{ background: '#121620', color: '#FFF' }}>1 Star - Poor</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Customer Feedback Comment *</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Enter customer feedback or survey response..."
                                    value={newReview.text}
                                    onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--admin-border)', borderRadius: '10px', color: '#FFF', resize: 'vertical' }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '10px',
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Customer Feedback
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

