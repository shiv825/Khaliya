import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function GalleryAndSocial() {
    const { t } = useLanguage();
    const [lightboxImg, setLightboxImg] = useState(null);

    const images = [
        { src: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&fit=crop', alt: 'Indian Dish' },
        { src: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&fit=crop', alt: 'Indian Decor' },
        { src: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&fit=crop', alt: 'Spices' },
        { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&fit=crop', alt: 'Dining Table' },
        { src: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&fit=crop', alt: 'Indian Food Spread' },
        { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&fit=crop', alt: 'Samosa' }
    ];

    return (
        <>
            <section id="social-feed" className="accent-section gsap-reveal">
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2>{t('social.title')}</h2>
                    <p>{t('social.sub')}</p>
                </div>
                <div className="instagram-grid">
                    <div className="insta-item"><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80" alt="Restaurant Interior" /></div>
                    <div className="insta-item"><img src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80" alt="Signature Biryani" /></div>
                    <div className="insta-item"><img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80" alt="Chef at Work" /></div>
                    <div className="insta-item"><img src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80" alt="Sizzling Kebabs" /></div>
                    <div className="insta-item"><img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80" alt="Happy Ambiance" /></div>
                    <div className="insta-item"><img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80" alt="Vibrant Spices" /></div>
                </div>
            </section>

            <section id="gallery" className="gsap-reveal" style={{ padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2>Our Culinary Canvas</h2>
                        <p>A visual journey through our exquisite dishes and warm ambiance.</p>
                    </div>

                    <div className="masonry-gallery">
                        {images.map((img, i) => (
                            <div key={i} className="masonry-item" onClick={() => setLightboxImg(img.src)} style={{ cursor: 'pointer' }}>
                                <img src={img.src} alt={img.alt} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {lightboxImg && (
                <div id="lightbox" className="lightbox active" onClick={() => setLightboxImg(null)} style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 100000, justifyContent: 'center', alignItems: 'center' }}>
                    <span className="lightbox-close" style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '40px', cursor: 'pointer' }}>&times;</span>
                    <img className="lightbox-content" src={lightboxImg} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                </div>
            )}
        </>
    );
}
