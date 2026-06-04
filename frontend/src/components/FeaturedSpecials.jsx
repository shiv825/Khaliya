import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function FeaturedSpecials({ isNative = false }) {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();
    const [liveMenu, setLiveMenu] = useState([]);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    useEffect(() => {
        let isMounted = true;
        
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${API_URL}/menu?t=${Date.now()}`);
                if (isMounted && Array.isArray(res.data)) {
                    setLiveMenu(res.data);
                }
            } catch (err) {
                console.warn('Failed to fetch specials menu:', err.message);
            }
        };

        fetchMenu();

        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        const evtSource = new EventSource(sseUrl);
        
        evtSource.onmessage = (e) => {
            try {
                const update = JSON.parse(e.data);
                if (update.type === 'menu' && isMounted) {
                    setLiveMenu(update.data);
                }
            } catch (err) {
                console.error("SSE menu parsing error in specials:", err);
            }
        };

        return () => {
            isMounted = false;
            evtSource.close();
        };
    }, [API_URL]);

    const baseSpecials = [
        {
            id: 'spec-1',
            name: {
                en: "Chef's Signature Butter Chicken",
                hi: "शेफ का सिग्नेचर बटर चिकन",
                ar: "دجاج بالزبدة بتوقيع الشيف"
            },
            description: {
                en: "Our legendary boneless chicken, slow-cooked in a velvety tomato-cream sauce with secret spices.",
                hi: "गुप्त मसालों के साथ मखमली टमाटर-क्रीम सॉस में धीमी गति से पकाया गया हमारा शानदार बोनलेस चिकन।",
                ar: "دجاجنا الأسطوري المخلي من العظم، مطبوخ ببطء في صلصة طماطم كريمية مخملية مع بهارات سرية."
            },
            price: "₹450",
            image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
            badge: "Bestseller"
        },
        {
            id: 'spec-2',
            name: {
                en: "Royal Lamb Rogan Josh",
                hi: "रॉयल लैम्ब रोगन जोश",
                ar: "لحم روجان جوش ملكي"
            },
            description: {
                en: "Tender chunks of lamb simmered in a Kashmiri-style aromatic curry with saffron and ginger.",
                hi: "केसर और अदरक के साथ कश्मीरी शैली की सुगंधित करी में मेमने के नरम टुकड़े सिमटाए गए।",
                ar: "قطع لحم ضأن طرية مطبوخة في كاري عطري على طراز كشمير مع الزعفران والزنجبيل."
            },
            price: "₹520",
            image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&q=80",
            badge: "House Special"
        },
        {
            id: 'spec-3',
            name: {
                en: "Imperial Paneer Lababdar",
                hi: "शाही पनीर लबाबदार",
                ar: "بانيير لبابدار إمبراطوري"
            },
            description: {
                en: "Rich and luscious cottage cheese chunks in a thick, chunky tomato-onion gravy with hints of melon.",
                hi: "खरबूजे के संकेतों के साथ गाढ़े, चंकी टमाटर-प्याज की ग्रेवी में समृद्ध और रसीले पनीर के टुकड़े।",
                ar: "قطع جبنة قريش غنية ولذيذة في مرق سميك من الطماطم والبصل مع لمحات من البطيخ."
            },
            price: "₹380",
            image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
            badge: "Chef's Pick"
        }
    ];

    const specials = baseSpecials.map(special => {
        let searchKeyword = "";
        if (special.id === 'spec-1') searchKeyword = "Butter Chicken";
        else if (special.id === 'spec-2') searchKeyword = "Rogan Josh";
        else if (special.id === 'spec-3') searchKeyword = "Paneer";

        const matchedItem = liveMenu.find(item => {
            const itemName = (typeof item.name === 'object' ? item.name.en : item.name || '').toLowerCase();
            return itemName.includes(searchKeyword.toLowerCase());
        });

        if (matchedItem) {
            return {
                ...special,
                id: matchedItem.id || special.id,
                name: typeof matchedItem.name === 'object' ? matchedItem.name : { en: matchedItem.name },
                description: typeof matchedItem.description === 'object' ? matchedItem.description : { en: matchedItem.description },
                price: String(matchedItem.price).includes('₹') ? matchedItem.price : `₹${matchedItem.price}`,
                image: matchedItem.image || special.image,
                available: matchedItem.available !== false,
                tags: matchedItem.tags
            };
        }
        return special;
    });

    const getLocalized = (field) => {
        if (field && typeof field === 'object') {
            return field[language] || field.en || '';
        }
        return field || '';
    };

    return (
        <section className={`featured-specials ${isNative ? 'native-view' : 'section'}`} style={{ padding: isNative ? '1rem 0' : '6rem 1rem' }}>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontSize: '3rem' }}
                >
                    {t('specials.title', 'Chef\'s Featured Specials')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    style={{ color: 'var(--text-light)', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem' }}
                >
                    {t('specials.sub', 'Our most curated dishes, prepared with passion and the finest authentic ingredients.')}
                </motion.p>
            </div>

            <div className="specials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {specials.map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="special-card futuristic-glass"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ boxShadow: 'var(--shadow-lg)', filter: 'brightness(1.1)' }}
                        style={{
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            transition: 'var(--transition)'
                        }}
                    >
                        <div className="special-image" style={{ height: '260px', position: 'relative', overflow: 'hidden' }}>
                            <img src={item.image} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="special-badge shadow-lg" style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                                color: '#FFFFFF',
                                padding: '6px 18px',
                                borderRadius: '30px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>
                                {item.badge}
                            </div>
                        </div>
                         <div className="special-info" style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>{getLocalized(item.name)}</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px', flex: 1 }}>
                                {getLocalized(item.description)}
                            </p>
                            <div className="special-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)' }}>{item.price}</span>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ 
                                        padding: '10px 24px', 
                                        fontSize: '0.85rem',
                                        opacity: item.available === false ? 0.5 : 1,
                                        cursor: item.available === false ? 'not-allowed' : 'pointer'
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
                                            background: 'var(--bg-surface)',
                                            color: 'var(--text-dark)',
                                            iconColor: 'var(--primary-color)'
                                        });
                                    }}
                                >
                                    <i className="fas fa-plus"></i> {item.available === false ? t('common.outOfStock', 'Out of Stock') : t('common.orderNow', 'Add to Selection')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
