import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Testimonials() {
    const { t } = useLanguage();

    return (
        <section id="testimonials" className="accent-section" style={{ background: 'var(--bg-light)' }} data-aos="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2>{t('testimonials.title')}</h2>
                <p style={{ color: 'var(--text-light)', maxWidth: '700px', margin: '0 auto' }}>
                    {t('testimonials.sub')}
                </p>
            </div>

            <div className="testimonials-grid">
                {/* Testimonial 1 */}
                <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
                    <i className="fas fa-quote-right quote"></i>
                    <div className="testimonial-stars">
                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                    <p className="testimonial-text">{t('testimonials.text1')}</p>
                    <div className="testimonial-author">
                        <div className="author-info">
                            <h4>{t('testimonials.author1')}</h4>
                            <span>{t('testimonials.status1')}</span>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
                    <i className="fas fa-quote-right quote"></i>
                    <div className="testimonial-stars">
                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                    <p className="testimonial-text">{t('testimonials.text2')}</p>
                    <div className="testimonial-author">
                        <div className="author-info">
                            <h4>{t('testimonials.author2')}</h4>
                            <span>{t('testimonials.status2')}</span>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="testimonial-card" data-aos="fade-up" data-aos-delay="300">
                    <i className="fas fa-quote-right quote"></i>
                    <div className="testimonial-stars">
                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                    <p className="testimonial-text">{t('testimonials.text3')}</p>
                    <div className="testimonial-author">
                        <div className="author-info">
                            <h4>{t('testimonials.author3')}</h4>
                            <span>{t('testimonials.status3')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
