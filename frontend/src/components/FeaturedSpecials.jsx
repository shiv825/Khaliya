import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function FeaturedSpecials({ isNative = false }) {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();
    const [specialsList, setSpecialsList] = useState([]);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    // Royal fallback items if offline
    const fallbackSpecials = [
        {
            id: 'spec-biryani',
            category: 'Main Course',
            name: { en: "Royal Awadhi Chicken Biryani", hi: "शाही अवधी चिकन बिरयानी", ar: "برياني دجاج ملكي أوادي" },
            description: { en: "Long-grain basmati rice cooked dum-style with marinated chicken, saffron, and whole spices.", hi: "मैरीनेट किए गए चिकन के साथ दम स्टाइल में पकाया गया बासमती चावल।", ar: "أرز بسمتي فاخر مطبوخ على طريقة الدوم مع دجاج متبل بالزعفران." },
            price: "₹450",
            image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443774/khaliya_restaurant/product_1780141127512.jpg",
            badge: "👑 Royal Signature",
            tags: ["non-veg", "spicy-2"],
            available: true
        },
        {
            id: 'spec-butterchicken',
            category: 'Main Course',
            name: { en: "Chef's Signature Butter Chicken", hi: "शेफ का सिग्नेचर बटर चिकन", ar: "دجاج بالزبدة بتوقيع الشيف" },
            description: { en: "Tender boneless chicken slow-simmered in velvety tomato, butter, and cashew nut cream gravy.", hi: "मखमली टमाटर, मक्खन और काजू क्रीम की ग्रेवी में पकाया गया चिकन।", ar: "قطع دجاج طرية مطبوخة في مرق الطماطم والقشطة والغني بالزبدة." },
            price: "₹450",
            image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443777/khaliya_restaurant/product_1780141129390.jpg",
            badge: "★ House Favorite",
            tags: ["non-veg", "spicy-1"],
            available: true
        },
        {
            id: 'spec-roganjosh',
            category: 'Main Course',
            name: { en: "Kashmiri Lamb Rogan Josh", hi: "कश्मीरी लैम्ब रोगन जोश", ar: "لحم روجان جوش كشميري" },
            description: { en: "Slow-braised tender lamb simmered with Kashmiri red chilies, saffron, and aromatic spices.", hi: "कश्मीरी लाल मिर्च और सुगंधित मसालों के साथ पकाया गया मेमना।", ar: "قطع لحم طرية مطبوخة ببطء مع الفلفل الأحمر الكشميري والزعفران." },
            price: "₹520",
            image: "https://res.cloudinary.com/mbib5dog/image/upload/v1788443783/khaliya_restaurant/product_1780141136038.jpg",
            badge: "✨ Master Creation",
            tags: ["non-veg", "spicy-3"],
            available: true
        }
    ];

    useEffect(() => {
        let isMounted = true;
        
        const fetchSpecials = async () => {
            try {
                const res = await axios.get(`${API_URL}/menu?t=${Date.now()}`);
                if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
                    const menu = res.data;

                    const signatureKeywords = [
                        { key: 'biryani', badge: '👑 Royal Signature' },
                        { key: 'butter chicken', badge: '★ House Favorite' },
                        { key: 'rogan josh', badge: '✨ Master Creation' },
                        { key: 'paneer butter', badge: '★ House Favorite' },
                        { key: 'tandoori chicken', badge: '🔥 Charcoal Grilled' },
                        { key: 'dal makhani', badge: '✨ Chef Special' }
                    ];

                    let matched = [];
                    signatureKeywords.forEach(sig => {
                        const item = menu.find(m => {
                            const nameEn = (typeof m.name === 'object' ? m.name.en : m.name || '').toLowerCase();
                            const itemId = String(m.id || m._id || m.name?.en || Math.random());
                            const alreadyMatched = matched.some(x => String(x.id) === itemId);
                            return nameEn.includes(sig.key) && !alreadyMatched;
                        });

                        if (item) {
                            const cleanId = String(item.id || item._id || item.name?.en || `sig-${matched.length}`);
                            matched.push({
                                ...item,
                                id: cleanId,
                                badge: sig.badge,
                                price: String(item.effectivePrice || item.price).includes('₹') ? (item.effectivePrice || item.price) : `₹${item.effectivePrice || item.price}`
                            });
                        }
                    });

                    if (matched.length < 3) {
                        const extra = menu.filter(m => {
                            const itemId = String(m.id || m._id || m.name?.en);
                            return !matched.some(x => String(x.id) === itemId) && m.image;
                        }).slice(0, 3 - matched.length);

                        extra.forEach(m => {
                            const cleanId = String(m.id || m._id || m.name?.en || `extra-${matched.length}`);
                            matched.push({
                                ...m,
                                id: cleanId,
                                badge: '★ Chef Special',
                                price: String(m.effectivePrice || m.price).includes('₹') ? (m.effectivePrice || m.price) : `₹${m.effectivePrice || m.price}`
                            });
                        });
                    }

                    setSpecialsList(matched.slice(0, 3));
                } else {
                    setSpecialsList(fallbackSpecials);
                }
            } catch (err) {
                console.warn('Failed to load menu API for specials, using fallbacks:', err.message);
                if (isMounted) setSpecialsList(fallbackSpecials);
            }
        };

        fetchSpecials();
        return () => { isMounted = false; };
    }, [API_URL]);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') {
            return field[language] || field.en || '';
        }
        return field || '';
    };

    const isVeg = (tags) => Array.isArray(tags) && tags.includes('veg') && !tags.includes('non-veg');

    const displayItems = specialsList.length >= 3 ? specialsList : fallbackSpecials;

    return (
        <section className={`featured-specials ${isNative ? 'native-view' : 'section'}`} style={{ padding: isNative ? '1rem 0' : '6rem 1.5rem', background: 'transparent', position: 'relative' }}>
            {/* Header */}
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '4.5rem', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '6px 20px', borderRadius: '50px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)' }}
                >
                    <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                    <span style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
                        ROYAL CULINARY SELECTION
                    </span>
                    <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✦</span>
                </motion.div>

                <motion.h2 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    style={{ 
                        color: '#FFFFFF', 
                        fontFamily: "'Cinzel', 'Playfair Display', serif", 
                        fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        marginBottom: '18px'
                    }}
                >
                    Chef's Featured <span style={{ background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Specials</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    style={{ color: '#CBD5E1', maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.75' }}
                >
                    Handcrafted signature creations prepared with royal court recipes, hand-ground heritage spices, and slow dum-pukht traditions.
                </motion.p>
            </div>

            {/* Specials Grid */}
            <div className="specials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', maxWidth: '100%', width: '100%', padding: '0 3vw', position: 'relative', zIndex: 1 }}>
                {displayItems.map((item, index) => {
                    const veg = isVeg(item.tags);

                    return (
                        <motion.div
                            key={item.id || `item-${index}`}
                            className="special-card"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.8 }}
                            whileHover={{ 
                                y: -12, 
                                boxShadow: '0 30px 70px rgba(0,0,0,0.9), 0 0 45px rgba(212, 175, 55, 0.35), inset 0 1px 2px rgba(255, 215, 0, 0.5)',
                                borderColor: '#FFD700'
                            }}
                            style={{
                                borderRadius: '26px',
                                overflow: 'hidden',
                                border: '1.5px solid rgba(212, 175, 55, 0.45)',
                                background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.14) 0%, rgba(18, 23, 34, 0.72) 40%, rgba(7, 10, 14, 0.88) 100%)',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255, 215, 0, 0.35), 0 0 25px rgba(212, 175, 55, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                        >
                            {/* Image Container with Zoom & Gradient Vignette */}
                            <div className="special-image" style={{ height: '265px', position: 'relative', overflow: 'hidden' }}>
                                <motion.img 
                                    src={item.image} 
                                    alt={getLocalized(item.name)} 
                                    whileHover={{ scale: 1.09 }}
                                    transition={{ duration: 0.6 }}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover', 
                                        filter: 'contrast(1.08) brightness(1.02)' 
                                    }} 
                                />

                                {/* Bottom Dark Vignette Gradient */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, rgba(7, 10, 14, 0.95) 0%, rgba(7, 10, 14, 0.3) 60%, transparent 100%)'
                                }} />

                                {/* Dietary Tag */}
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    left: '16px',
                                    background: 'rgba(10, 14, 22, 0.85)',
                                    border: `1px solid ${veg ? '#22C55E' : '#EF4444'}`,
                                    backdropFilter: 'blur(12px)',
                                    color: veg ? '#4ADE80' : '#F87171',
                                    padding: '5px 14px',
                                    borderRadius: '30px',
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    letterSpacing: '0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: veg ? '#22C55E' : '#EF4444' }}></span>
                                    {veg ? 'VEG' : 'NON-VEG'}
                                </div>

                                {/* Special Gold Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 100%)',
                                    color: '#070A0E',
                                    padding: '6px 16px',
                                    borderRadius: '30px',
                                    fontSize: '0.75rem',
                                    fontWeight: '900',
                                    letterSpacing: '0.8px',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.4), 0 0 15px rgba(212, 175, 55, 0.4)'
                                }}>
                                    {item.badge || "★ Bestseller"}
                                </div>
                            </div>

                            {/* Inner Frosted Gold Glass Details */}
                            <div className="special-info" style={{ 
                                padding: '28px 24px', 
                                flex: 1, 
                                display: 'flex', 
                                flexDirection: 'column',
                                background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.04) 0%, rgba(10, 14, 22, 0.75) 100%)',
                                backdropFilter: 'blur(16px)'
                            }}>
                                {/* Gold Serif Headline */}
                                <h3 style={{ 
                                    fontSize: '1.55rem', 
                                    marginBottom: '12px', 
                                    background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: "'Cinzel', 'Playfair Display', serif", 
                                    fontWeight: '800',
                                    letterSpacing: '0.5px',
                                    lineHeight: '1.2',
                                    filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.25))'
                                }}>
                                    {getLocalized(item.name)}
                                </h3>

                                <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '24px', flex: 1, fontWeight: '400' }}>
                                    {getLocalized(item.description)}
                                </p>

                                {/* Price & Order Button */}
                                <div className="special-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '18px', borderTop: '1px solid rgba(212, 175, 55, 0.25)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#D4AF37', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Royal Price</div>
                                        <span style={{ fontSize: '1.85rem', fontWeight: '900', color: '#FFD700', fontFamily: "'Cinzel', serif", textShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}>{item.price}</span>
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(212, 175, 55, 0.55)' }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ 
                                            padding: '13px 26px', 
                                            fontSize: '0.85rem',
                                            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
                                            color: '#070A0E',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '900',
                                            letterSpacing: '0.8px',
                                            textTransform: 'uppercase',
                                            cursor: item.available === false ? 'not-allowed' : 'pointer',
                                            opacity: item.available === false ? 0.5 : 1,
                                            boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        disabled={item.available === false}
                                        onClick={() => {
                                            if (item.available === false) return;
                                            addToCart(item);
                                            Swal.fire({
                                                title: 'Royal Selection!',
                                                text: `${getLocalized(item.name)} added to your order`,
                                                icon: 'success',
                                                toast: true,
                                                position: 'top-end',
                                                showConfirmButton: false,
                                                timer: 3000,
                                                background: '#0F141E',
                                                color: '#FFF',
                                                iconColor: '#FFD700'
                                            });
                                        }}
                                    >
                                        <i className="fas fa-plus" style={{ fontSize: '0.8rem' }}></i> {item.available === false ? t('common.outOfStock', 'Out of Stock') : 'Add To Order'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
