import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import AiMatchmaker from './AiMatchmaker';

export default function Menu() {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();

    const getFallbackMenu = () => [
        {
                "category": "Appetizer",
                "name": {
                        "en": "Samosa (4 pcs)",
                        "hi": "समोसा (4 पीसी)",
                        "ar": "سمبوسة (4 قطع)"
                },
                "description": {
                        "en": "Crispy fried pastry with spiced potato and pea filling.",
                        "hi": "मसालेदार आलू और मटर भराव के साथ कुरकुरा तला हुआ पेस्ट्री।",
                        "ar": "فطيرة مقرمشة محشوة بالبطاطس المتبلة والبازلاء."
                },
                "price": "₹150",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/samosa.jpg"
        },
        {
                "category": "Appetizer",
                "name": {
                        "en": "Paneer Tikka",
                        "hi": "पनीर टिक्का",
                        "ar": "بانيयर تيكا"
                },
                "description": {
                        "en": "Cubed cottage cheese marinated in yogurt and spices, grilled in tandoor.",
                        "hi": "दही और मसालों में मैरीनेट किया हुआ पनीर, तंदूर में ग्रिल किया हुआ।",
                        "ar": "مكعبات جبنة القريش المتبلة بالزبادي والبهارات والمشوية في التنور."
                },
                "price": "₹320",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/paneer-tikka.jpg"
        },
        {
                "category": "Appetizer",
                "name": {
                        "en": "Tandoori Chicken (Half)",
                        "hi": "तंदूरी चिकन (आधा)",
                        "ar": "دجاج تندوري (نصف)"
                },
                "description": {
                        "en": "Classic tandoori chicken marinated in secret spices and grilled to perfection.",
                        "hi": "क्लासिक तंदूरी चिकन गुप्त मसालों में मैरीनेट किया हुआ और पूर्णता के साथ ग्रिल किया हुआ।",
                        "ar": "دجاج تندوري كلاسيكي متبل بالبهارات السرية ومشوي بإتقان."
                },
                "price": "₹420",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "/menu-images/tandoori-chicken.jpg"
        },
        {
                "category": "Appetizer",
                "name": {
                        "en": "Hara Bhara Kabab (6 pcs)",
                        "hi": "हरा भरा कबाब (6 पीसी)",
                        "ar": "هارा بهारा कबाब (6 قطع)"
                },
                "description": {
                        "en": "Healthy spinach and green pea patties with traditional herbs and spices.",
                        "hi": "पारंपरिक जड़ी-बूटियों और मसालों के साथ स्वस्थ पालक और हरी मटर के पैटीज़।",
                        "ar": "فطائر السبانخ والبازلاء الخضراء الصحية مع الأعشاب والبهارات التقليدية."
                },
                "price": "₹220",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/hara-bhara.jpg"
        },
        {
                "category": "Appetizer",
                "name": {
                        "en": "Fish Amritsari",
                        "hi": "फिश अमृतसरी",
                        "ar": "سمك أمरीتساري"
                },
                "description": {
                        "en": "Golden fried fish fillets flavored with carom seeds and authentic spices.",
                        "hi": "अजवाइन और प्रामाणिक मसालों के साथ सुनहरे तले हुए मछली के टुकड़े।",
                        "ar": "شرائح سمك مقلية ذهبية بنكهة بذور الكروم والبهارات الأصلية."
                },
                "price": "₹350",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "/menu-images/fish-amritsari.jpg"
        },
        {
                "category": "Appetizer",
                "name": {
                        "en": "Chili Paneer",
                        "hi": "चिली पनीर",
                        "ar": "تشيلي بانير"
                },
                "description": {
                        "en": "Indo-Chinese style spicy cottage cheese with bell peppers and onions.",
                        "hi": "शिमला मिर्च और प्याज के साथ इंडो-चाइनीज स्टाइल का मसालेदार पनीर।",
                        "ar": "جبنة قريش حارة على الطريقة الهندية الصينية مع فلفل رومي وبصل."
                },
                "price": "₹280",
                "tags": [
                        "veg",
                        "spicy-2"
                ],
                "image": "/menu-images/chili-paneer.jpg"
        },
        {
                "category": "Appetizer",
                "name": {
                        "en": "Chicken 65",
                        "hi": "चिकन 65",
                        "ar": "دجاج 65"
                },
                "description": {
                        "en": "Spicy, deep-fried chicken dish originating from Chennai, India.",
                        "hi": "चेन्नई, भारत से उत्पन्न मसालेदार, गहरे तले हुए चिकन डिश।",
                        "ar": "طبق دجاج مقلي حار من تشيناي، الهند."
                },
                "price": "₹310",
                "tags": [
                        "non-veg",
                        "spicy-3"
                ],
                "image": "/menu-images/chicken-65.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Chicken Biryani",
                        "hi": "चिकन बिरयानी",
                        "ar": "دجاج برياني"
                },
                "description": {
                        "en": "Fragrant basmati rice cooked with marinated chicken and aromatic spices.",
                        "hi": "सुगंधित बासमती चावल मैरीनेट किए हुए चिकन और सुगंधित मसालों के साथ पकाया जाता है।",
                        "ar": "أرز بسمتي عطري مطبوخ مع دجاج متبل وبهارات عطرية."
                },
                "price": "₹450",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "/menu-images/chicken-biryani.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Butter Chicken",
                        "hi": "बटर चिकन",
                        "ar": "دجاج بالزبدة"
                },
                "description": {
                        "en": "Succulent chicken in rich, buttery tomato cream sauce. House specialty.",
                        "hi": "समृद्ध, मलाईदार टमाटर क्रीम सॉस में रसीला चिकन। हाउस स्पेशलिटी।",
                        "ar": "دجاج طري في صلصة طماطم بالزبدة والقشطة الغنية."
                },
                "price": "₹400",
                "tags": [
                        "non-veg",
                        "spicy-1"
                ],
                "image": "/menu-images/butter-chicken.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Chicken Tikka Masala",
                        "hi": "चिकन टिक्का मसाला",
                        "ar": "دجاج تيكا ماسالا"
                },
                "description": {
                        "en": "Tender chicken in creamy tomato sauce with aromatic spices.",
                        "hi": "सुगंधित मसालों के साथ मलाईदार टमाटर सॉस में नरम चिकन।",
                        "ar": "دجاج طري في صلصة طماطم كريمية مع بهارات عطرية."
                },
                "price": "₹380",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "/menu-images/tikka-masala.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Paneer Butter Masala",
                        "hi": "पनीर बटर मसाला",
                        "ar": "بانيयर بوتر ماسالا"
                },
                "description": {
                        "en": "Soft cottage cheese in rich tomato butter gravy. Vegetarian favorite.",
                        "hi": "समृद्ध टमाटर बटर ग्रेवी में नरम पनीर। शाकाहारी पसंदीदा।",
                        "ar": "جبنة قريش ناعمة في مرق الزبدة الغني بالطमाطم."
                },
                "price": "₹320",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/paneer-butter.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Dal Makhani",
                        "hi": "दाल मखनी",
                        "ar": "دال ماخاني"
                },
                "description": {
                        "en": "Creamy black lentils slow-cooked with butter, cream, and aromatic spices.",
                        "hi": "मक्खन, क्रीम और सुगंधित मसालों के साथ धीमी आंच पर पकाए गए मलाईदार काले उड़द।",
                        "ar": "عدس أسود كريمي مطبوخ ببطء مع الزبدة والقشطة والبهارات العطرية."
                },
                "price": "₹280",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/dal-makhani.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Lamb Rogan Josh",
                        "hi": "लैम्ब रोगन जोश",
                        "ar": "لحم روجان جوش"
                },
                "description": {
                        "en": "Tender lamb cooked in aromatic spice blend with tomato and yogurt sauce.",
                        "hi": "टमाटर और दही की सॉस के साथ सुगंधित मसाले के मिश्रण में पका हुआ नरम मेमना।",
                        "ar": "لحم طري مطبوخ بمزيج بهارات عطرية مع صلصة الطماطم والزبادي."
                },
                "price": "₹450",
                "tags": [
                        "non-veg",
                        "spicy-3"
                ],
                "image": "/menu-images/lamb-rogan.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Malai Kofta",
                        "hi": "मलाई कोफ्ता",
                        "ar": "ملاي كفتة"
                },
                "description": {
                        "en": "Soft cottage cheese and potato dumplings in a rich, creamy white gravy.",
                        "hi": "समृद्ध, मलाईदार सफेद ग्रेवी में नरम पनीर और आलू के कोफ्ते।",
                        "ar": "كفتة الجبنة والبطاطس الناعمة في مرق أبيض كريمي غني."
                },
                "price": "₹340",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/malai-kofta.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Palak Paneer",
                        "hi": "पालक पनीर",
                        "ar": "بالاك بانير"
                },
                "description": {
                        "en": "Cottage cheese cubes in a thick, spiced spinach puree. Nutritious.",
                        "hi": "गाढ़ा, मसालेदार पालक प्यूरी में पनीर के टुकड़े। पौष्टिक।",
                        "ar": "مكعبات جبنة القريش في هريس السبانخ الكثيف والمتبل. مغذية."
                },
                "price": "₹310",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "/menu-images/palak-paneer.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Kadai Chicken",
                        "hi": "कढ़ाई चिकन",
                        "ar": "كاداي دجاج"
                },
                "description": {
                        "en": "Spicy chicken curry cooked with bell peppers, tomatoes, and ground spices.",
                        "hi": "शिमला मिर्च, टमाटर और पिसे हुए मसालों के साथ मसालेदार चिकन करी।",
                        "ar": "كاري الدجاج الحار المطبوخ مع الفلفل الرومي والطماطم والبهارات المطحونة."
                },
                "price": "₹390",
                "tags": [
                        "non-veg",
                        "spicy-3"
                ],
                "image": "/menu-images/kadai-chicken.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Goan Fish Curry",
                        "hi": "गोअन फिश करी",
                        "ar": "كاري سمك غوان"
                },
                "description": {
                        "en": "Coconut-based tangy fish curry prepared with tamarind and fresh catch.",
                        "hi": "इमली और ताजी मछली के साथ तैयार नारियल आधारित तीखी मछली करी।",
                        "ar": "كاري السمك اللاذع بجوز الهند المعد بالتمر الهندي والصيد الطازج."
                },
                "price": "₹460",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "/menu-images/goan-fish.jpg"
        },
        {
                "category": "Main Course",
                "name": {
                        "en": "Chana Masala",
                        "hi": "चना मसाला",
                        "ar": "شانا ماسالا"
                },
                "description": {
                        "en": "Classic chickpea curry cooked with tangy tomato and onion gravy.",
                        "hi": "खट्टे टमाटर और प्याज की ग्रेवी के साथ पकाए गए क्लासिक चना करी।",
                        "ar": "كاري الحمص الكلاسيكي المطبوخ مع مرق الطماطم والبصل اللاذع."
                },
                "price": "₹260",
                "tags": [
                        "veg",
                        "spicy-2"
                ],
                "image": "/menu-images/chana-masala.jpg"
        },
        {
                "category": "Bread",
                "name": {
                        "en": "Garlic Naan",
                        "hi": "गार्लिक नान",
                        "ar": "خبز النان بالثوم"
                },
                "description": {
                        "en": "Traditional Indian bread baked in clay oven with fresh garlic and butter.",
                        "hi": "ताजा लहसुन और मक्खन के साथ मिट्टी के ओवन में पकी हुई पारंपरिक भारतीय रोटी।",
                        "ar": "خبز هندي تقليدي مخبوز في فرن الطين مع الثوم الطازج والزبدة."
                },
                "price": "₹80",
                "tags": [
                        "veg"
                ],
                "image": "/menu-images/garlic-naan.jpg"
        },
        {
                "category": "Dessert",
                "name": {
                        "en": "Gulab Jamun",
                        "hi": "गुलाब जामुन",
                        "ar": "جولاب جامون"
                },
                "description": {
                        "en": "Soft milk-based dumplings soaked in rose and cardamom syrup.",
                        "hi": "गुलाब और इलायची की चाशनी में भिगोए हुए नरम दूध के पेड़े।",
                        "ar": "زلابية ناعمة مبنية على الحليب منقوعة في شراب الورد والهيل."
                },
                "price": "₹120",
                "tags": [
                        "veg"
                ],
                "image": "/menu-images/gulab-jamun.jpg"
        },
        {
                "category": "Beverage",
                "name": {
                        "en": "Mango Lassi",
                        "hi": "मैंगो लस्सी",
                        "ar": "मानजो लاسی"
                },
                "description": {
                        "en": "Sweet and creamy yogurt-based drink made with fresh mangoes.",
                        "hi": "ताजे आम से बना मीठा और मलाईदार दही आधारित पेय।",
                        "ar": "مشروب حلو وكريمي قائم على الزبادي ومصنوع من المانجو الطازج."
                },
                "price": "₹150",
                "tags": [
                        "veg"
                ],
                "image": "/menu-images/mango-lassi.jpg"
        }
    ];

    const [menuItems, setMenuItems] = useState(getFallbackMenu());
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');
    const [showMatchmaker, setShowMatchmaker] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        axios.get(`${API_URL}/api/menu`, { timeout: 5000 })
            .then(res => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => {
                console.error('Error fetching menu, using fallback:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const getLocalized = (field) => {
        if (field && typeof field === 'object') {
            return field[language] || field.en || '';
        }
        return field || '';
    };

    let displayedMenu = [...menuItems];

    if (filter !== 'All') {
        if (filter === 'Bread') {
            displayedMenu = displayedMenu.filter(item => item.category === 'Bread' || item.category === 'Rice');
        } else {
            displayedMenu = displayedMenu.filter(item => item.category === filter);
        }
    }

    if (search) {
        displayedMenu = displayedMenu.filter(item => {
            const name = getLocalized(item.name).toLowerCase();
            const desc = getLocalized(item.description).toLowerCase();
            return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
        });
    }

    if (sort === 'price-low') {
        displayedMenu.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    } else if (sort === 'price-high') {
        displayedMenu.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
    } else if (sort === 'popular') {
        displayedMenu.sort((a, b) => getLocalized(b.description).length - getLocalized(a.description).length);
    }

    return (
        <section id="menu" data-aos="fade-up" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem', position: 'relative', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>{t('menu.title')}</h2>
                <button 
                    onClick={() => setShowMatchmaker(true)}
                    className="btn btn-primary"
                    style={{ position: 'absolute', right: '0', padding: '12px 25px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', color: '#fff', border: 'none', boxShadow: '0 10px 20px rgba(142, 28, 28, 0.2)', fontWeight: '700', cursor: 'pointer', zIndex: 10 }}
                >
                    <i className="fas fa-magic"></i> {t('menu.curate', 'Curate for me')}
                </button>
            </div>
            {showMatchmaker && <AiMatchmaker onClose={() => setShowMatchmaker(false)} />}

            <div className="menu-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center', padding: '0 1.5rem' }}>
                <div className="search-box" style={{ position: 'relative', flex: '1 1 350px', maxWidth: '600px' }}>
                    <input 
                        type="text" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder={t('menu.searchPlaceholder')} 
                        style={{ 
                            width: '100%', 
                            padding: '16px 20px 16px 55px', 
                            borderRadius: '50px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-glass)', 
                            backdropFilter: 'blur(10px)',
                            color: 'var(--text-dark)', 
                            fontSize: '1rem',
                            transition: 'var(--transition)',
                            outline: 'none',
                            boxShadow: 'var(--shadow-sm)'
                        }} 
                    />
                    <i className="fas fa-search" style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)', fontSize: '1.1rem' }}></i>
                </div>
                <div className="sort-box" style={{ flex: '0 1 auto' }}>
                    <select 
                        value={sort} 
                        onChange={e => setSort(e.target.value)} 
                        style={{ 
                            padding: '16px 35px', 
                            borderRadius: '50px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-glass)', 
                            backdropFilter: 'blur(10px)',
                            color: 'var(--text-dark)', 
                            cursor: 'pointer', 
                            fontSize: '0.95rem',
                            outline: 'none',
                            appearance: 'none',
                            backgroundImage: 'linear-gradient(45deg, transparent 50%, var(--primary-color) 50%), linear-gradient(135deg, var(--primary-color) 50%, transparent 50%)',
                            backgroundPosition: 'calc(100% - 25px) calc(1em + 5px), calc(100% - 20px) calc(1em + 5px)',
                            backgroundSize: '5px 5px, 5px 5px',
                            backgroundRepeat: 'no-repeat',
                            fontWeight: '600'
                        }}
                    >
                        <option value="default" style={{ background: 'var(--bg-surface)' }}>{t('menu.sortDefault')}</option>
                        <option value="price-low" style={{ background: 'var(--bg-surface)' }}>{t('menu.sortLow')}</option>
                        <option value="price-high" style={{ background: 'var(--bg-surface)' }}>{t('menu.sortHigh')}</option>
                        <option value="popular" style={{ background: 'var(--bg-surface)' }}>{t('menu.sortPopular')}</option>
                    </select>
                </div>
            </div>

            <div className="menu-filters" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
                {['All', 'Appetizer', 'Main Course', 'Bread', 'Dessert', 'Beverage'].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`btn menu-filter-btn ${filter === cat ? 'active' : ''}`}>
                        {t(cat === 'All' ? 'menu.catAll' : cat === 'Appetizer' ? 'menu.catAppetizer' : cat === 'Main Course' ? 'menu.catMain' : cat === 'Bread' ? 'menu.catBread' : cat === 'Dessert' ? 'menu.catDessert' : 'menu.catBeverage')}
                    </button>
                ))}
            </div>

            <div id="menu-container" className="menu">
                {loading ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '4rem', color: 'var(--accent-color)' }}>
                        <i className="fas fa-spinner fa-spin fa-3x"></i>
                    </div>
                ) : (
                    displayedMenu.map((item, index) => (
                        <div key={index} className="menu-item" data-aos="fade-up" data-aos-delay={(index % 4) * 100} style={{ 
                            background: 'var(--bg-surface)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-lg)',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            transition: 'var(--transition)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            {item.image && (
                                <div className="menu-item-image" style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: '15px', marginBottom: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                    <img loading="lazy" src={item.image} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </div>
                            )}
                            <div className="menu-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className="category" style={{ letterSpacing: '1.5px', fontWeight: '700', fontSize: '0.75rem', color: 'var(--accent-light)' }}>{getLocalized(item.category)}</span>
                                <div className="menu-item-tags" style={{ display: 'flex', gap: '8px' }}>
                                    {item.tags && item.tags.map(tag => {
                                        if (tag === 'veg') return <span key={tag} className="tag tag-veg" title="Vegetarian" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,0,0.3))' }}>🌱</span>;
                                        if (tag === 'non-veg') return <span key={tag} className="tag tag-nonveg" title="Non-Vegetarian" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.3))' }}>🍖</span>;
                                        if (tag === 'spicy-1') return <span key={tag} className="tag tag-spicy" title="Mild Spicy">🌶️</span>;
                                        if (tag === 'spicy-2') return <span key={tag} className="tag tag-spicy">🌶️🌶️</span>;
                                        if (tag === 'spicy-3') return <span key={tag} className="tag tag-spicy">🌶️🌶️🌶️</span>;
                                        return null;
                                    })}
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>{getLocalized(item.name)}</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: '1.6', flex: 1 }}>{getLocalized(item.description)}</p>
                            <div className="menu-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div className="price" style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.4rem' }}>{item.price}</div>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: '30px' }}
                                    onClick={() => {
                                        addToCart(item);
                                        Swal.fire({
                                            title: 'Selection Added',
                                            text: `${getLocalized(item.name)} is now in your order`,
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
                                    <i className="fas fa-plus"></i> {t('common.add', 'Add')}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <p style={{ marginTop: '3rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>{t('menu.note')}</p>
        </section>
    );
}
