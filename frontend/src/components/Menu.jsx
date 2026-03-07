import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Menu() {
    const { t, language } = useLanguage();

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
                        "ar": "بانيير تيكا"
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
                        "ar": "هارا بهارا كباب (6 قطع)"
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
                        "ar": "سمك أمريتساري"
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
                        "ar": "جبنة قريش ناعمة في مرق الزبدة الغني بالطماطم."
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
                        "ar": "مانجو لاسي"
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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        console.log("Khaliya Debug: Menu.jsx is trying to fetch from ->", API_URL);
        axios.get(`${API_URL}/api/menu`, { timeout: 5000 })
            .then(res => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMenuItems(res.data);
                } else {
                    console.warn("API returned invalid data format, forcing fallback menu:", res.data);
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
        <section id="menu" data-aos="fade-up">
            <h2>{t('menu.title')}</h2>

            <div className="menu-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-box" style={{ position: 'relative', minWidth: '300px' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('menu.searchPlaceholder')} style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)' }} />
                    <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                </div>
                <div className="sort-box">
                    <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-dark)', cursor: 'pointer' }}>
                        <option value="default">{t('menu.sortDefault')}</option>
                        <option value="price-low">{t('menu.sortLow')}</option>
                        <option value="price-high">{t('menu.sortHigh')}</option>
                        <option value="popular">{t('menu.sortPopular')}</option>
                    </select>
                </div>
            </div>

            <div className="menu-filters" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {['All', 'Appetizer', 'Main Course', 'Bread', 'Dessert', 'Beverage'].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`btn menu-filter-btn ${filter === cat ? 'active' : ''}`}>
                        {t(cat === 'All' ? 'menu.catAll' : cat === 'Appetizer' ? 'menu.catAppetizer' : cat === 'Main Course' ? 'menu.catMain' : cat === 'Bread' ? 'menu.catBread' : cat === 'Dessert' ? 'menu.catDessert' : 'menu.catBeverage')}
                    </button>
                ))}
            </div>

            <div id="menu-container" className="menu">
                {loading ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '2rem', color: '#666' }}>
                        <i className="fas fa-spinner fa-spin"></i> <span>{t('menu.loading')}</span>
                    </div>
                ) : (
                    displayedMenu.map((item, index) => (
                        <div key={index} className="menu-item" data-aos="fade-up" data-aos-delay={(index % 5) * 100}>
                            {item.image && (
                                <div className="menu-item-image" style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                    <img loading="lazy" src={item.image} alt={getLocalized(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </div>
                            )}
                            <div className="menu-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <span className="category">{getLocalized(item.category)}</span>
                                <div className="menu-item-tags">
                                    {item.tags && item.tags.map(tag => {
                                        if (tag === 'veg') return <span key={tag} className="tag tag-veg" title="Vegetarian">🌱</span>;
                                        if (tag === 'non-veg') return <span key={tag} className="tag tag-nonveg" title="Non-Vegetarian">🍖</span>;
                                        if (tag === 'spicy-1') return <span key={tag} className="tag tag-spicy" title="Mild Spicy">🌶️</span>;
                                        if (tag === 'spicy-2') return <span key={tag} className="tag tag-spicy" title="Medium Spicy">🌶️🌶️</span>;
                                        if (tag === 'spicy-3') return <span key={tag} className="tag tag-spicy" title="Extra Spicy">🌶️🌶️🌶️</span>;
                                        return null;
                                    })}
                                </div>
                            </div>
                            <h3>{getLocalized(item.name)}</h3>
                            <p>{getLocalized(item.description)}</p>
                            <div className="price" style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.1rem', marginTop: '1rem' }}>{item.price}</div>
                        </div>
                    ))
                )}
            </div>
            <p style={{ marginTop: '2rem', color: '#666', textAlign: 'center' }}>{t('menu.note')}</p>
        </section>
    );
}
