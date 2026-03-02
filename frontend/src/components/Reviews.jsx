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

    const fetchReviews = () => {
        axios.get('http://localhost:5000/api/reviews')
            .then(res => setReviews(res.data || []))
            .catch(err => console.error('Error fetching reviews:', err));
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.rating || !formData.text) return;

        axios.post('http://localhost:5000/api/reviews', {
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
        <section id="reviews" className="accent-section" style={{ marginTop: '2rem' }} data-aos="fade-up" data-aos-duration="700" data-aos-delay="100">
            <h2>{t('reviews.title')}</h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '900px', margin: '0 auto 1rem auto', textAlign: 'center' }}>
                {t('reviews.instruction')}
            </p>

            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder={t('reviews.namePlaceholder')} style={{ padding: '0.8rem', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <label style={{ fontWeight: 700 }}>{t('reviews.ratingLabel')}</label>
                        <select name="rating" value={formData.rating} onChange={handleChange} required style={{ padding: '0.7rem', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                            <option value="">{t('reviews.selectRating')}</option>
                            <option value="5">★★★★★ 5</option>
                            <option value="4">★★★★ 4</option>
                            <option value="3">★★★ 3</option>
                            <option value="2">★★ 2</option>
                            <option value="1">★ 1</option>
                        </select>
                    </div>
                    <textarea name="text" rows="4" value={formData.text} onChange={handleChange} placeholder={t('reviews.textPlaceholder')} required style={{ padding: '0.8rem', border: '1px solid var(--border-light)', borderRadius: '8px' }}></textarea>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button type="submit" className="btn">{t('reviews.postButton')}</button>
                        <button type="button" onClick={handleClear} className="btn" style={{ background: '#dc3545' }}>{t('reviews.clearButton')}</button>
                    </div>
                </form>

                <div style={{ marginTop: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.6rem 0' }}>{t('reviews.myReviews')}</h3>
                    <div style={{ display: 'block', gap: '0.6rem' }}>
                        {reviews.length === 0 ? (
                            <p style={{ color: '#999' }}>{t('reviews.none')}</p>
                        ) : (
                            reviews.map((rev, i) => (
                                <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                                    <strong>{rev.name || 'Anonymous'}</strong> - {'★'.repeat(parseInt(rev.rating) || 5)}
                                    <p style={{ margin: '5px 0' }}>{rev.text}</p>
                                    <small style={{ color: '#999' }}>{new Date(rev.date).toLocaleDateString()}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
