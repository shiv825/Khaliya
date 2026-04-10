import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Reviews() {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [formData, setFormData] = useState({ name: '', rating: '', text: '' });

    useEffect(() => {
        fetchReviews();
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchReviews = () => {
        axios.get(`${API_URL}/api/reviews`, { timeout: 5000 })
            .then(res => setReviews(res.data || []))
            .catch(err => console.error('Error fetching reviews:', err));
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.rating || !formData.text) return;

        axios.post(`${API_URL}/api/reviews`, {
            ...formData,
            date: new Date().toISOString()
        })
            .then(() => {
                setFormData({ name: '', rating: '', text: '' });
                fetchReviews(); // Refresh reviews
            })
            .catch(err => console.error('Error saving review:', err));
    };

    const handleClear = () => {
        // Note: since it's global now, 'clearing' might only clear local view or require an admin endpoint.
        // For now, we'll just clear the UI temporarily or avoid adding a destructive global clear button for regular users.
        setReviews([]);
    };

    return (
        <section id="reviews" className="accent-section" style={{ padding: '6rem 1.5rem' }} data-aos="fade-up">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontSize: '2.8rem' }}>{t('reviews.title')}</h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center', fontSize: '1.15rem' }}>
                {t('reviews.instruction')}
            </p>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'var(--bg-surface)', padding: '2.5rem', borderRadius: '30px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                        <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder={t('reviews.namePlaceholder')} style={{ padding: '15px 20px', border: '1px solid var(--border-color)', borderRadius: '15px', background: 'var(--bg-body)', color: 'var(--text-dark)', outline: 'none' }} />
                        <select name="rating" value={formData.rating} onChange={handleChange} required style={{ padding: '15px 20px', border: '1px solid var(--border-color)', borderRadius: '15px', background: 'var(--bg-body)', color: 'var(--text-dark)', outline: 'none', fontWeight: '700' }}>
                            <option value="">{t('reviews.selectRating')}</option>
                            <option value="5">★★★★★ 5</option>
                            <option value="4">★★★★ 4</option>
                            <option value="3">★★★ 3</option>
                            <option value="2">★★ 2</option>
                            <option value="1">★ 1</option>
                        </select>
                    </div>
                    <textarea name="text" rows="4" value={formData.text} onChange={handleChange} placeholder={t('reviews.textPlaceholder')} required style={{ padding: '15px 20px', border: '1px solid var(--border-color)', borderRadius: '15px', background: 'var(--bg-body)', color: 'var(--text-dark)', outline: 'none', resize: 'none' }}></textarea>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '15px 30px', borderRadius: '50px', fontWeight: '800', flex: 2 }}>{t('reviews.postButton')}</button>
                        <button type="button" onClick={handleClear} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '15px 30px', borderRadius: '50px', fontWeight: '800', flex: 1 }}>{t('reviews.clearButton')}</button>
                    </div>
                </form>

                <div style={{ marginTop: '4rem' }}>
                    <h3 style={{ margin: '0 0 2rem 0', textAlign: 'center', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>{t('reviews.myReviews')}</h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {reviews.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: '25px', border: '1px dashed var(--border-color)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>{t('reviews.none')}</p>
                            </div>
                        ) : (
                            reviews.map((rev, i) => (
                                <div key={i} className="testimonial-card" style={{ padding: '2rem', borderRadius: '25px', marginBottom: '0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                        <strong style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>{rev.name || 'Anonymous'}</strong>
                                        <span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{'★'.repeat(parseInt(rev.rating) || 5)}</span>
                                    </div>
                                    <p style={{ margin: '0 0 1.2rem 0', color: 'var(--text-dark)', fontSize: '1.1rem', lineHeight: '1.7', fontStyle: 'italic' }}>"{rev.text}"</p>
                                    <small style={{ color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{new Date(rev.date).toLocaleDateString()}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
