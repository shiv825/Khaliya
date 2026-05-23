import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import FeaturedSpecials from '../FeaturedSpecials';
import masterMenu from '../../data/menu.json';

/**
 * NativeHome Component
 * Redesigned with "Gold & Charcoal" Luxury Theme for a premium PWA experience.
 */
export default function NativeHome({ setActiveTab }) {
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    let user = { name: 'Guest' };
    try {
        if (storedUserStr) user = JSON.parse(storedUserStr);
    } catch (e) {
        console.warn('⚠️ [NativeHome] User data corrupted, resetting to guest');
    }
    const firstName = (user && user.name) ? user.name.split(' ')[0] : 'Guest';
    const { t, language = 'en' } = useLanguage();
    const { addToCart } = useCart();

    // Get popular items from Master Menu (Bestsellers / Featured)
    const popularItems = Array.isArray(masterMenu) ? masterMenu.slice(0, 8).map(item => ({
        id: item.name?.en || Math.random().toString(),
        name: item.name?.en || 'Menu Item',
        price: item.price ? item.price.replace('₹', '') : '150',
        image: item.image,
        tag: item.tags?.includes('spicy-2') ? "Bestseller" : "Must Try"
    })) : [];


    const offers = [
        { id: 1, title: "20% OFF", desc: "First Order", code: "WELCOME20", bg: "rgba(245, 158, 11, 0.1)", color: "var(--primary-color)" },
        { id: 2, title: "FREE DESSERT", desc: "Above ₹1000", code: "SWEET", bg: "rgba(99, 102, 241, 0.1)", color: "var(--secondary-color)" }
    ];

    const reviews = [
        { id: 1, name: "Rahul S.", rating: 5, text: "Best Butter Chicken in town! Totally recommend it." },
        { id: 2, name: "Priya M.", rating: 5, text: "The booking process was so smooth. Loved the ambiance!" }
    ];

    return (
        <div className="native-home">
            {/* Header Section */}
            <motion.div
                className="native-header"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ 
                    padding: '40px 20px 30px', 
                    background: 'var(--indigo-gradient)',
                    borderRadius: '0 0 35px 35px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                    marginBottom: '20px'
                }}
            >
                <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="greeting">
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', margin: 0, color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            Dhanyavad, {firstName}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Explore Khaliya Sanctuary</p>
                    </div>
                    <motion.div
                        className="user-avatar"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab('profile')}
                        style={{ 
                            background: 'var(--bg-surface)', 
                            padding: '4px', 
                            borderRadius: '50%', 
                            boxShadow: 'var(--shadow-sm)',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Guest')}&background=8E1C1C&color=ffffff`} 
                            alt="User" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions - Light Glassmorphism */}
            <div className="native-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '25px 0' }}>
                {[
                    { id: 'menu', icon: 'fa-utensils', label: 'Menu' },
                    { id: 'book', icon: 'fa-calendar-alt', label: 'Reserve' },
                    { id: 'profile', icon: 'fa-crown', label: 'Loyalty' },
                    { id: 'location', icon: 'fa-map-pin', label: 'Visit' }
                ].map((action) => (
                    <motion.div 
                        key={action.id}
                        className="action-circle" 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => {
                            if (action.id === 'location') {
                                setIsVisitModalOpen(true);
                            } else {
                                setActiveTab(action.id);
                            }
                        }}
                        style={{ textAlign: 'center' }}
                    >
                        <div className="icon-wrapper futuristic-glass" style={{ 
                            width: '65px', height: '65px', borderRadius: '20px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px', color: 'var(--primary-color)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <i className={`fas ${action.icon}`} style={{ fontSize: '1.4rem' }}></i>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase' }}>{action.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Hero Card - Refined Light Aesthetic */}
            <motion.div
                className="native-hero-card"
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('book')}
                style={{ 
                    borderRadius: '30px', padding: '30px', marginBottom: '35px', 
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)'
                }}
            >
                <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>Curated Dining</h3>
                    <p style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '20px', fontWeight: '500' }}>Host your moments in our royal sanctuary.</p>
                    <button className="native-btn-primary" style={{ 
                        backgroundColor: 'var(--primary-color)', 
                        color: '#FFF', border: 'none', padding: '12px 24px', 
                        borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}>Reserve Now</button>
                </div>
                <i className="fas fa-gem" style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', opacity: 0.05, fontSize: '6rem', color: 'var(--primary-color)' }}></i>
            </motion.div>

            {/* Synced Specials */}
            <div className="native-section synced-specials" style={{ marginBottom: '40px' }}>
                <div className="section-header" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)' }}>Chef's Recommendations</h3>
                </div>
                <FeaturedSpecials isNative={true} />
            </div>

            {/* Offers Slider - Luxury Voucher Aesthetic */}
            <div className="native-section" style={{ marginBottom: '40px' }}>
                <div className="section-header" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)' }}>Elite Perks</h3>
                </div>
                <div className="horizontal-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                    {offers.map((offer, idx) => (
                        <motion.div 
                            key={offer.id} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ 
                                minWidth: '280px', padding: '30px', borderRadius: '30px', 
                                background: `linear-gradient(135deg, var(--bg-surface) 0%, ${offer.bg} 100%)`, 
                                border: `1px solid ${offer.color}33`,
                                position: 'relative', boxShadow: 'var(--shadow-md)',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: '50%', right: '-20px', width: '40px', height: '40px', background: 'var(--bg-body)', borderRadius: '50%', transform: 'translateY(-50%)' }}></div>
                            <div style={{ position: 'absolute', top: '50%', left: '-20px', width: '40px', height: '40px', background: 'var(--bg-body)', borderRadius: '50%', transform: 'translateY(-50%)' }}></div>
                            
                            <h3 style={{ margin: 0, color: offer.color, fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{offer.title}</h3>
                            <p style={{ margin: '8px 0 20px 0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '700' }}>{offer.desc}</p>
                            <button style={{ 
                                background: offer.color, color: '#FFF', border: 'none', 
                                padding: '10px 20px', borderRadius: '50px', fontWeight: '800', 
                                fontSize: '0.8rem', textTransform: 'uppercase' 
                            }}>
                                {offer.code}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Popular Items */}
            <div className="native-section" style={{ marginBottom: '40px' }}>
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)' }}>Must Try</h3>
                    <span style={{ fontSize: '1rem', color: 'var(--primary-color)', fontWeight: '800', borderBottom: '2px solid' }} onClick={() => setActiveTab('menu')}>See All</span>
                </div>
                <div className="horizontal-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {popularItems.map(item => (
                        <div key={item.id} className="food-card-mini futuristic-glass" style={{ 
                            minWidth: '180px', borderRadius: '24px', overflow: 'hidden', 
                            border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ height: '140px', position: 'relative' }}>
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop' }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div className="add-btn" onClick={() => {
                                    addToCart({ ...item, price: `₹${item.price}` });
                                    Swal.fire({ title: 'Added!', text: `${item.name} added`, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                }} style={{ 
                                    position: 'absolute', bottom: '-18px', right: '15px', 
                                    width: '38px', height: '38px', borderRadius: '50%',
                                    backgroundColor: 'var(--primary-color)', color: '#FFF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(142, 28, 28, 0.3)',
                                    cursor: 'pointer'
                                }}>
                                    <i className="fas fa-plus"></i>
                                </div>
                            </div>
                            <div style={{ padding: '25px 15px 15px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                <span style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '1.1rem' }}>₹{item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '100px' }}></div>

            {/* Visit Modal */}
            <AnimatePresence>
                {isVisitModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            style={{
                                backgroundColor: 'var(--bg-surface)',
                                borderRadius: '30px',
                                width: '100%',
                                maxWidth: '400px',
                                padding: '30px 25px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                border: '1px solid var(--border-color)',
                                position: 'relative'
                            }}
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setIsVisitModalOpen(false)}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(0,0,0,0.05)',
                                    border: 'none',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-dark)',
                                    fontSize: '1.1rem',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                            >
                                <i className="fas fa-times"></i>
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(155, 27, 48, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 12px',
                                    color: 'var(--primary-color)'
                                }}>
                                    <i className="fas fa-map-marked-alt" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text-dark)', margin: '0 0 5px 0' }}>
                                    {language === 'hi' ? 'खालिया रेस्टोरेंट' : language === 'ar' ? 'مطعم خاليا' : 'Visit Khaliya'}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                    {language === 'hi' ? 'हम आपका स्वागत करने के लिए उत्सुक हैं!' : language === 'ar' ? 'يسعدنا استضافتك في مطعمنا!' : 'We would love to host you!'}
                                </p>
                            </div>

                            {/* Map iframe */}
                            <div style={{ 
                                borderRadius: '20px', 
                                overflow: 'hidden', 
                                height: '160px', 
                                border: '1px solid var(--border-color)',
                                marginBottom: '20px',
                                position: 'relative'
                            }}>
                                <iframe
                                    title="Khaliya Restaurant Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.003975762078!2d88.3347072!3d22.6108169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02798f090d80c9%3A0xe104332b4b47ea87!2sKhaliya%20Restaurant!5e0!3m2!1sen!2sin!4v1714902123955!5m2!1sen!2sin"
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                ></iframe>
                            </div>

                            {/* Location Details */}
                            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginTop: '2px' }}></i>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '2px' }}>{t('contact.addressLabel') || 'Address'}</strong>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{t('contact.addressContent')}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <i className="fas fa-clock" style={{ color: 'var(--primary-color)', fontSize: '1rem', marginTop: '2px' }}></i>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '2px' }}>{t('hours.title') || 'Hours'}</strong>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                            {t('contact.hoursContent')}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <i className="fas fa-phone-alt" style={{ color: 'var(--primary-color)', fontSize: '1rem', marginTop: '2px' }}></i>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '2px' }}>{t('contact.phoneLabel') || 'Phone'}</strong>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>+91 82527 31784</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <a 
                                    href="tel:+918252731784"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '14px',
                                        border: '1.5px solid var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        textDecoration: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-phone-alt"></i> {language === 'hi' ? 'कॉल करें' : language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                                </a>
                                <a 
                                    href="https://www.google.com/maps/dir/?api=1&destination=22.6108,88.3370" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '14px',
                                        backgroundColor: 'var(--primary-color)',
                                        color: '#FFF',
                                        textDecoration: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 12px rgba(155, 27, 48, 0.2)'
                                    }}
                                >
                                    <i className="fas fa-directions"></i> {language === 'hi' ? 'दिशा-निर्देश' : language === 'ar' ? 'الاتجاهات' : 'Directions'}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
