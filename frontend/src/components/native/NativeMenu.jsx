import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

export default function NativeMenu() {
        const { t, language } = useLanguage();

        const getFallbackMenu = () => [
                {
                        "category": "Appetizer",
                        "name": { "en": "Samosa (4 pcs)", "hi": "समोसा (4 पीसी)", "ar": "سمبوسة (4 قطع)" },
                        "description": { "en": "Crispy fried pastry with spiced potato and pea filling.", "hi": "मसालेदार आलू और मटर भराव के साथ कुरकुरा तला हुआ पेस्ट्री।", "ar": "فطيرة مقرمشة محشوة بالبطاطس المتبلة والبازلاء।" },
                        "price": "150",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/samosa.jpg"
                },
                {
                        "category": "Appetizer",
                        "name": { "en": "Paneer Tikka", "hi": "पनीर टिक्का", "ar": "بانيير تيكا" },
                        "description": { "en": "Cubed cottage cheese marinated in yogurt and spices, grilled in tandoor.", "hi": "दही और मसालों में मैरीनेट किया हुआ पनीर, तंदूर में ग्रिल किया हुआ।", "ar": "مكعبات جبنة القريش المتبلة بالزبادي والبهارات والمشوية في التنور." },
                        "price": "320",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/paneer-tikka.jpg"
                },
                {
                        "category": "Appetizer",
                        "name": { "en": "Tandoori Chicken (Half)", "hi": "तंदूरी चिकन (आधा)", "ar": "دجاج تندوري (نصف)" },
                        "description": { "en": "Classic tandoori chicken marinated in secret spices and grilled to perfection.", "hi": "क्लासिक तंदूरी चिकन गुप्त मसालों में मैरीनेट किया हुआ और पूर्णता के साथ ग्रिल किया हुआ।", "ar": "دجاج تندوري كلاسيكي متبل بالبهارات السرية ومشوي بإتقان." },
                        "price": "420",
                        "tags": ["non-veg", "spicy-2"],
                        "image": "/menu-images/tandoori-chicken.jpg"
                },
                {
                        "category": "Appetizer",
                        "name": { "en": "Hara Bhara Kabab (6 pcs)", "hi": "हरा भरा कबाब (6 पीसी)", "ar": "هارا بهارا كباب (6 قطع)" },
                        "description": { "en": "Healthy spinach and green pea patties with traditional herbs and spices.", "hi": "पारंपरिक जड़ी-बूटियों और मसालों के साथ स्वस्थ पालक और हरी मटर के पैटीज़।", "ar": "فطائر السبانخ والبازلاء الخضراء الصحية مع الأعشاب والبهارات التقليدية." },
                        "price": "220",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/hara-bhara.jpg"
                },
                {
                        "category": "Appetizer",
                        "name": { "en": "Fish Amritsari", "hi": "फिश अमृतसरी", "ar": "سمك أمريتساري" },
                        "description": { "en": "Golden fried fish fillets flavored with carom seeds and authentic spices.", "hi": "अजवाइन और प्रामाणिक मसालों के साथ सुनहरे तले हुए मछली के टुकड़े।", "ar": "شرائح سمك مقلية ذهبية بنكهة بذور الكروم والبهارات الأصلية." },
                        "price": "350",
                        "tags": ["non-veg", "spicy-2"],
                        "image": "/menu-images/fish-amritsari.jpg"
                },
                {
                        "category": "Appetizer",
                        "name": { "en": "Chili Paneer", "hi": "चिली पनीर", "ar": "تشيلي بانير" },
                        "description": { "en": "Indo-Chinese style spicy cottage cheese with bell peppers and onions.", "hi": "शिमला मिर्च और प्याज के साथ इंडो-चाइनीज स्टाइल का मसालेदार पनीर।", "ar": "جبنة قريش حارة على الطريقة الهندية الصينية مع فلفل رومي وبصل." },
                        "price": "280",
                        "tags": ["veg", "spicy-2"],
                        "image": "/menu-images/chili-paneer.jpg"
                },
                {
                        "category": "Appetizer",
                        "name": { "en": "Chicken 65", "hi": "चिकन 65", "ar": "دجاج 65" },
                        "description": { "en": "Spicy, deep-fried chicken dish originating from Chennai, India.", "hi": "चेन्नई, भारत से उत्पन्न मसालेदार, गहरे तले हुए चिकन डिश।", "ar": "طبق دجاج مقلي حار من تشيناي، الهند." },
                        "price": "310",
                        "tags": ["non-veg", "spicy-3"],
                        "image": "/menu-images/chicken-65.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Chicken Biryani", "hi": "चिकन बिरयानी", "ar": "دجاج برياني" },
                        "description": { "en": "Fragrant basmati rice cooked with marinated chicken and aromatic spices.", "hi": "सुगंधित बासमती चावल मैरीनेट किए हुए चिकन और सुगंधित मसालों के साथ पकाया जाता है।", "ar": "أرز بسمتي عطري مطبوخ مع دجاج متبل وبهارات عطرية." },
                        "price": "450",
                        "tags": ["non-veg", "spicy-2"],
                        "image": "/menu-images/chicken-biryani.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Butter Chicken", "hi": "बटर चिकन", "ar": "دجاج بالزبدة" },
                        "description": { "en": "Succulent chicken in rich, buttery tomato cream sauce. House specialty.", "hi": "समृद्ध, मलाईदार टमाटर क्रीम सॉस में रसीला चिकन। हाउस स्पेशलिटी।", "ar": "دجاج طري في صلصة طماطم بالزبدة والقشطة الغنية." },
                        "price": "400",
                        "tags": ["non-veg", "spicy-1"],
                        "image": "/menu-images/butter-chicken.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Chicken Tikka Masala", "hi": "चिकन टिक्का मसाला", "ar": "دجاج टिक्का मसाला" },
                        "description": { "en": "Tender chicken in creamy tomato sauce with aromatic spices.", "hi": "सुगंधित मसालों के साथ मलाईदार टमाटर सॉस में नरम चिकन।", "ar": "دجاج طري في صلصة طماطم كريمية مع بهارات عطرية." },
                        "price": "380",
                        "tags": ["non-veg", "spicy-2"],
                        "image": "/menu-images/tikka-masala.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Paneer Butter Masala", "hi": "पनीर बटर मसाला", "ar": "بانيयर بوتر ماسالا" },
                        "description": { "en": "Soft cottage cheese in rich tomato butter gravy. Vegetarian favorite.", "hi": "समृद्ध टमाटर बटर ग्रेवी में नरम पनीर। शाकाहारी पसंदीदा।", "ar": "جبنة قريش ناعمة في مرق الزبدة الغني بالطماطم." },
                        "price": "320",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/paneer-butter.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Dal Makhani", "hi": "दाल मखनी", "ar": "دाल ماخاني" },
                        "description": { "en": "Creamy black lentils slow-cooked with butter, cream, and aromatic spices.", "hi": "मक्खन, क्रीम और सुगंधित मसालों के साथ धीमी आंच पर पकाए गए मलाईदार काले उड़द।", "ar": "عدس أسود كريمي مطبوخ ببطء مع الزبدة والقشطة والبهارات العطرية." },
                        "price": "280",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/dal-makhani.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Lamb Rogan Josh", "hi": "लैम्ब रोगन जोश", "ar": "لحم روجان جوش" },
                        "description": { "en": "Tender lamb cooked in aromatic spice blend with tomato and yogurt sauce.", "hi": "टमाटर और दही की सॉस के साथ सुगंधित मसाले के मिश्रण में पका हुआ नरम मेमना।", "ar": "لحم طري مطبوخ بمزيج بهارات عطرية مع صلصة الطماطم والزبادي." },
                        "price": "450",
                        "tags": ["non-veg", "spicy-3"],
                        "image": "/menu-images/lamb-rogan.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Malai Kofta", "hi": "मलाई कोफ्ता", "ar": "ملاي كفتة" },
                        "description": { "en": "Soft cottage cheese and potato dumplings in a rich, creamy white gravy.", "hi": "समृद्ध, मलाईदार सफेद ग्रेवी में नरम पनीर और आलू के कोफ्ते।", "ar": "كفتة الجبنة والبطاطس الناعمة في مرق أبيض كريمي غني." },
                        "price": "340",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/malai-kofta.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Palak Paneer", "hi": "पालक पनीर", "ar": "بالاك بانير" },
                        "description": { "en": "Cottage cheese cubes in a thick, spiced spinach puree. Nutritious.", "hi": "गाढ़ा, मसालेदार पालक प्यूरी में पनीर के टुकड़े। पौष्टिक।", "ar": "مكعبات جبنة القريش في هريس السبانخ الكثيف والمتبل. مغذية." },
                        "price": "310",
                        "tags": ["veg", "spicy-1"],
                        "image": "/menu-images/palak-paneer.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Kadai Chicken", "hi": "कढ़ाई चिकन", "ar": "كاداي دجاج" },
                        "description": { "en": "Spicy chicken curry cooked with bell peppers, tomatoes, and ground spices.", "hi": "शिमला मिर्च, टमाटर और पिसे हुए मसालों के साथ मसालेदार चिकन करी।", "ar": "كاري الدجاج الحار المطبوخ مع الفلفل الرومي والطماطم والبهارات المطحونة." },
                        "price": "390",
                        "tags": ["non-veg", "spicy-3"],
                        "image": "/menu-images/kadai-chicken.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Goan Fish Curry", "hi": "गोअन फिश करी", "ar": "كاري سمك غوان" },
                        "description": { "en": "Coconut-based tangy fish curry prepared with tamarind and fresh catch.", "hi": "इमली और ताजी मछली के साथ तैयार नारियल आधारित तीखी मछली करी।", "ar": "كاري السمك اللاذع بجوز الهند المعد بالتمر الهندي والصيد الطازج." },
                        "price": "460",
                        "tags": ["non-veg", "spicy-2"],
                        "image": "/menu-images/goan-fish.jpg"
                },
                {
                        "category": "Main Course",
                        "name": { "en": "Chana Masala", "hi": "चना मसाला", "ar": "شانا ماسالا" },
                        "description": { "en": "Classic chickpea curry cooked with tangy tomato and onion gravy.", "hi": "खट्टे टमाटर और प्याज की ग्रेवी के साथ पकाए गए क्लासिक चना करी।", "ar": "كاري الحمص الكلاسيكي المطبوخ مع مرق الطماطم والبصل اللاذع." },
                        "price": "260",
                        "tags": ["veg", "spicy-2"],
                        "image": "/menu-images/chana-masala.jpg"
                },
                {
                        "category": "Bread",
                        "name": { "en": "Garlic Naan", "hi": "गार्लिक नान", "ar": "خبز النान بالثوم" },
                        "description": { "en": "Traditional Indian bread baked in clay oven with fresh garlic and butter.", "hi": "ताजा लहसुन और मक्खन के साथ मिट्टी के ओवन में पकी हुई पारंपरिक भारतीय रोटी।", "ar": "خبز هندي تقليدي مخبوز في فرن الطين مع الثوم الطازج والزبدة." },
                        "price": "80",
                        "tags": ["veg"],
                        "image": "/menu-images/garlic-naan.jpg"
                },
                {
                        "category": "Dessert",
                        "name": { "en": "Gulab Jamun", "hi": "गुलाब जामुन", "ar": "جولاب جامون" },
                        "description": { "en": "Soft milk-based dumplings soaked in rose and cardamom syrup.", "hi": "गुलाब और इलायची की चाशनी में भिगोए हुए नरम दूध के पेड़े।", "ar": "زلابية ناعمة مبنية على الحليب منقوعة في شراب الورد والهيل." },
                        "price": "120",
                        "tags": ["veg"],
                        "image": "/menu-images/gulab-jamun.jpg"
                },
                {
                        "category": "Beverage",
                        "name": { "en": "Mango Lassi", "hi": "मैंगो लस्सी", "ar": "مانجو لاسي" },
                        "description": { "en": "Sweet and creamy yogurt-based drink made with fresh mangoes.", "hi": "ताजे आम से बना मीठा और मलाईदार दही आधारित पेय।", "ar": "مشروب حلو وكريمي قائم على الزبادي ومصنوع من المانجو الطازج." },
                        "price": "150",
                        "tags": ["veg"],
                        "image": "/menu-images/mango-lassi.jpg"
                }
        ];

        const [activeCategory, setActiveCategory] = useState('All');
        const [searchQuery, setSearchQuery] = useState('');
        const [menuItems, setMenuItems] = useState(getFallbackMenu());
        const [loading, setLoading] = useState(true);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        useEffect(() => {
                axios.get(`${API_URL}/api/menu`, { timeout: 5000 })
                        .then(res => {
                                if (Array.isArray(res.data) && res.data.length > 0) {
                                        setMenuItems(res.data);
                                } else {
                                        console.warn("API returned invalid data format, keeping fallback menu.");
                                }
                        })
                        .catch(err => console.error('Error fetching native menu, using fallback:', err))
                        .finally(() => setLoading(false));
        }, [API_URL]);

        const getLocalized = (field) => {
                if (field && typeof field === 'object') {
                        return field[language] || field.en || '';
                }
                return field || '';
        };

        const backendCategories = [...new Set(menuItems.map(item => getLocalized(item.category)).filter(Boolean))];
        const categories = ['All', ...backendCategories];

        const filteredItems = menuItems.filter(item => {
                const cat = getLocalized(item.category);
                const name = getLocalized(item.name).toLowerCase();
                const desc = getLocalized(item.description).toLowerCase();
                const query = searchQuery.toLowerCase();

                const matchesCategory = activeCategory === 'All' || cat === activeCategory;
                const matchesSearch = name.includes(query) || desc.includes(query);

                return matchesCategory && matchesSearch;
        });

        const getCategoryIcon = (cat) => {
                if (cat === 'All') return '🍽️';
                if (cat === 'Appetizer') return '🥟';
                if (cat === 'Main Course') return '🥘';
                if (cat === 'Bread') return '🫓';
                if (cat === 'Dessert') return '🍮';
                if (cat.includes('Beverage')) return '🥤';
                return '🍛';
        };

        if (loading) {
                return (
                        <div className="native-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--accent-color)' }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                        </div>
                );
        }

        return (
                <div className="native-menu-view" id="native-menu">
                        <div className="native-menu-header">
                                <h2>{t('menu.title')}</h2>
                                <div className="search-bar">
                                        <i className="fas fa-search"></i>
                                        <input
                                                type="text"
                                                placeholder={t('menu.searchPlaceholder')}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                </div>
                        </div>

                        <div className="native-categories">
                                {categories.map(cat => {
                                        let localizedCat = cat;
                                        if (cat === 'All') localizedCat = t('menu.catAll') || 'All';
                                        else if (cat === 'Appetizer') localizedCat = t('menu.catAppetizer') || 'Appetizer';
                                        else if (cat === 'Main Course') localizedCat = t('menu.catMain') || 'Main Course';
                                        else if (cat === 'Bread') localizedCat = t('menu.catBread') || 'Bread';
                                        else if (cat === 'Dessert') localizedCat = t('menu.catDessert') || 'Dessert';
                                        else if (cat.includes('Beverage')) localizedCat = t('menu.catBeverage') || 'Beverage';

                                        return (
                                                <button
                                                        key={cat}
                                                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                                                        onClick={() => setActiveCategory(cat)}
                                                >
                                                        <span style={{ marginRight: '5px' }}>{getCategoryIcon(cat)}</span>
                                                        {localizedCat}
                                                </button>
                                        );
                                })}
                        </div>

                        <div className="native-menu-grid">
                                {filteredItems.map((item, index) => {
                                        return (
                                                <div
                                                        key={item.id || index}
                                                        className="native-menu-card futuristic-glass"
                                                >
                                                        <div className="card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                                                                <img
                                                                        loading="lazy"
                                                                        src={item.image}
                                                                        alt={getLocalized(item.name)}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop"; }}
                                                                />
                                                                <div className="card-price">₹{item.price}</div>
                                                        </div>
                                                        <div className="card-content">
                                                                <h3>{getLocalized(item.name)}</h3>
                                                                <div className="menu-item-tags" style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                                        {item.tags && item.tags.map(tag => {
                                                                                if (tag === 'veg') return <span key={tag} className="tag tag-veg" title="Vegetarian" style={{ fontSize: '0.8rem' }}>🌱</span>;
                                                                                if (tag === 'non-veg') return <span key={tag} className="tag tag-nonveg" title="Non-Vegetarian" style={{ fontSize: '0.8rem' }}>🍖</span>;
                                                                                if (tag === 'spicy-1') return <span key={tag} className="tag tag-spicy" title="Mild Spicy" style={{ fontSize: '0.8rem' }}>🌶️</span>;
                                                                                if (tag === 'spicy-2') return <span key={tag} className="tag tag-spicy" title="Medium Spicy" style={{ fontSize: '0.8rem' }}>🌶️🌶️</span>;
                                                                                if (tag === 'spicy-3') return <span key={tag} className="tag tag-spicy" title="Extra Spicy" style={{ fontSize: '0.8rem' }}>🌶️🌶️🌶️</span>;
                                                                                return null;
                                                                        })}
                                                                </div>
                                                                <p>{getLocalized(item.description)}</p>
                                                                <button className="add-to-cart-btn btn-premium-scale">
                                                                        <i className="fas fa-plus"></i> {t('menu.addBtn', 'Add')}
                                                                </button>
                                                        </div>
                                                </div>
                                        );
                                })}
                        </div>

                        <div style={{ height: '30px' }}></div>
                </div>
        );
}
