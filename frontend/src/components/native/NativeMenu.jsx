import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import AiMatchmaker from '../AiMatchmaker';
import masterMenu from '../../data/menu.json';

/**
 * NativeMenu Component
 * Optimized for mobile with Luxury "Gold & Charcoal" styling.
 */
export default function NativeMenu({ setActiveTab }) {
    const { t, language = 'en' } = useLanguage();
    const { addToCart } = useCart();
    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';
    
    // Helper for multi-language fields
    const getLocalized = (field) => {
        if (field && typeof field === 'object') return field[language] || field.en || '';
        return field || '';
    };
    const getFallbackMenu = () => [
        {
                "id": 1780141133327,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443766/khaliya_restaurant/product_1780141133327.jpg"
        },
        {
                "id": 1780141131494,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443767/khaliya_restaurant/product_1780141131494.jpg"
        },
        {
                "id": 1780141134688,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443768/khaliya_restaurant/product_1780141134688.jpg"
        },
        {
                "id": 1780141128405,
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
                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAwLh5sUZK_-QLfl1d0DamPaG-UnlSLkBjJSxJsE7VlA&s=10"
        },
        {
                "id": 1780141133487,
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
                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGLQvjPkx0ESR53XRcU0VYgcNmbGyqdPvS9GhFv6KUWg&s=10",
                "basePriceNum": 350,
                "effectivePriceNum": 350,
                "effectivePrice": "₹350",
                "isSurgeActive": false,
                "available": true
        },
        {
                "id": 1780141134364,
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
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Chilli_Paneer.jpg/960px-Chilli_Paneer.jpg"
        },
        {
                "id": 1780141129487,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443773/khaliya_restaurant/product_1780141129487.png"
        },
        {
                "id": 1780141127512,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443774/khaliya_restaurant/product_1780141127512.jpg"
        },
        {
                "id": 1780141132061,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443776/khaliya_restaurant/product_1780141132061.jpg"
        },
        {
                "id": 1780141129390,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443777/khaliya_restaurant/product_1780141129390.jpg"
        },
        {
                "id": 1780141135395,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443780/khaliya_restaurant/product_1780141135395.jpg"
        },
        {
                "id": 1780141131257,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443781/khaliya_restaurant/product_1780141131257.jpg"
        },
        {
                "id": 1780141136038,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443783/khaliya_restaurant/product_1780141136038.jpg"
        },
        {
                "id": 1780141133779,
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
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Malai_Kofta_-_A_North_Indian_Dish.jpg/960px-Malai_Kofta_-_A_North_Indian_Dish.jpg"
        },
        {
                "id": 1780141128487,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443784/khaliya_restaurant/product_1780141128487.jpg"
        },
        {
                "id": 1780141127149,
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
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Karahi_Chicken.jpg/960px-Karahi_Chicken.jpg"
        },
        {
                "id": 1780141135912,
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
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Goan_Fish_Curry.jpg/960px-Goan_Fish_Curry.jpg"
        },
        {
                "id": 1780141135131,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443785/khaliya_restaurant/product_1780141135131.jpg"
        },
        {
                "id": 1780141129908,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443786/khaliya_restaurant/product_1780141129908.jpg"
        },
        {
                "id": 1780141126850,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443789/khaliya_restaurant/product_1780141126850.jpg"
        },
        {
                "id": 1780141127210,
                "category": "Appetizer",
                "name": {
                        "en": "Murgh Malai Tikka",
                        "hi": "मुर्ग मलाई टिक्का",
                        "ar": "دجاج مالاي تيكا"
                },
                "description": {
                        "en": "Creamy, melt-in-the-mouth chicken chunks marinated in cheese and cream.",
                        "hi": "चीज़ और क्रीम में मैरीनेट किए हुए मलाईदार, मुँह में घुल जाने वाले चिकन के टुकड़े।",
                        "ar": "قطع دجاج كريمية تذوب في الفم متبلة بالجبن والقشطة."
                },
                "price": "₹380",
                "tags": [
                        "non-veg",
                        "spicy-1"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443790/khaliya_restaurant/product_1780141127210.jpg"
        },
        {
                "id": 1780141135552,
                "category": "Main Course",
                "name": {
                        "en": "Dal Tadka",
                        "hi": "दाल तड़का",
                        "ar": "دال तadca"
                },
                "description": {
                        "en": "Yellow lentils tempered with ghee, cumin, garlic, and red chilies. A soulful classic.",
                        "hi": "घी, जीरा, लहसुन और लाल मिर्च के तड़के वाली पीली दाल। एक आत्मिक क्लासिक।",
                        "ar": "عدس أصفر مقلي بالسمن والكمون والثوم والفلفل الأحمر. طبق كلاسيكي مريح."
                },
                "price": "₹240",
                "tags": [
                        "veg",
                        "spicy-2"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443791/khaliya_restaurant/product_1780141135552.jpg"
        },
        {
                "id": 1780141132771,
                "category": "Main Course",
                "name": {
                        "en": "Kashmiri Pulao",
                        "hi": "कश्मीरी पुलाव",
                        "ar": "كشميري بولاو"
                },
                "description": {
                        "en": "Fragrant rice cooked with fruits, nuts, and delicate saffron. Royal and aromatic.",
                        "hi": "फलों, मेवों और केसर के साथ पकाया गया सुगंधित चावल। शाही और खुशबूदार।",
                        "ar": "أرز عطري مطبوخ بالفواكه والمكسرات والزعفران الرقيق. ملكي وعطري."
                },
                "price": "₹320",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443793/khaliya_restaurant/product_1780141132771.jpg"
        },
        {
                "id": 1780141135332,
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
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443794/khaliya_restaurant/product_1780141135332.png"
        },
        {
                "id": 1780141126903,
                "category": "Appetizer",
                "name": {
                        "en": "Veg Spring Rolls (4 pcs)",
                        "hi": "वेज स्प्रिंग रोल (4 पीसी)",
                        "ar": "لفائف الربيع الخضار (4 قطع)"
                },
                "description": {
                        "en": "Crispy golden wrappers filled with seasoned crunchy vegetables.",
                        "hi": "सीजंड कुरकुरी सब्जियों से भरे कुरकुरे सुनहरे रैपर।",
                        "ar": "أغلفة ذهبية مقرمشة محشوة بالخضار المقرمشة المتبلة."
                },
                "price": "₹180",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443796/khaliya_restaurant/product_1780141126903.jpg"
        },
        {
                "id": 1780141135927,
                "category": "Appetizer",
                "name": {
                        "en": "Onion Bhaji (6 pcs)",
                        "hi": "प्याज भाजी (6 पीसी)",
                        "ar": "بصل باجي (6 قطع)"
                },
                "description": {
                        "en": "Deep fried sliced onion patties with chickpea flour and spices.",
                        "hi": "चने के आटे और मसालों के साथ गहरे तले हुए कटे हुए प्याज के पकोड़े।",
                        "ar": "فطائر البصل المقطعة والمقلية مع دقيق الحمص والبهارات."
                },
                "price": "₹160",
                "tags": [
                        "veg"
                ],
                "image": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&fit=crop"
        },
        {
                "id": 1780141130153,
                "category": "Appetizer",
                "name": {
                        "en": "Paneer Seekh Kebab (4 pcs)",
                        "hi": "पनीर सीख कबाब (4 पीसी)",
                        "ar": "بانيير سيخ كباب (4 قطع)"
                },
                "description": {
                        "en": "Minced cottage cheese and vegetables skewers grilled in tandoor.",
                        "hi": "तंदूर में ग्रिल किए हुए कीमा बनाया हुआ पनीर और सब्जियों के सीख कबाब।",
                        "ar": "سيخ من جبنة القريش والخضار المفرومة والمشوية في التنور."
                },
                "price": "₹340",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443797/khaliya_restaurant/product_1780141130153.jpg"
        },
        {
                "id": 1780141129437,
                "category": "Appetizer",
                "name": {
                        "en": "Mutton Seekh Kebab (4 pcs)",
                        "hi": "मटन सीख कबाब (4 पीसी)",
                        "ar": "لحم مفروم سيخ كباب (4 قطع)"
                },
                "description": {
                        "en": "Minced mutton skewers seasoned with herbs and grilled in clay oven.",
                        "hi": "जड़ी-बूटियों के साथ अनुभवी और मिट्टी के ओवन में ग्रिल किए गए कीमा मटन सीख कबाब।",
                        "ar": "أسياخ لحم الضأن المفروم المتبل بالأعشاب والمشوي في فرن الطين."
                },
                "price": "₹450",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443799/khaliya_restaurant/product_1780141129437.jpg"
        },
        {
                "id": 1780141128421,
                "category": "Appetizer",
                "name": {
                        "en": "Gobi Manchurian Dry",
                        "hi": "गोभी मंचूरियन ड्राई",
                        "ar": "غوبي منشوريا الجافة"
                },
                "description": {
                        "en": "Crispy cauliflower florets tossed in tangy Indo-Chinese sauce.",
                        "hi": "तीखे इंडो-चाइनीज सॉस में लिपटे कुरकुरे फूलगोभी के टुकड़े।",
                        "ar": "زهور القرنبيط المقرمشة المغمسة في صلصة الهند والصين اللاذعة."
                },
                "price": "₹240",
                "tags": [
                        "veg",
                        "spicy-2"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443800/khaliya_restaurant/product_1780141128421.jpg"
        },
        {
                "id": 1780141133031,
                "category": "Main Course",
                "name": {
                        "en": "Mutton Biryani",
                        "hi": "मटन बिरयानी",
                        "ar": "لحم الغنم برياني"
                },
                "description": {
                        "en": "Aromatic basmati rice cooked with tender mutton pieces and spices in clay pot.",
                        "hi": "मिट्टी के बर्तन में मटकी मटन के टुकड़ों और मसालों के साथ पकाए गए सुगंधित बासमती चावल।",
                        "ar": "أرز بسمتي عطري مطبوخ مع قطع لحم الضأن الطرية والبهارات في وعاء طيني."
                },
                "price": "₹520",
                "tags": [
                        "non-veg",
                        "spicy-2"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443801/khaliya_restaurant/product_1780141133031.jpg"
        },
        {
                "id": 1780141134913,
                "category": "Main Course",
                "name": {
                        "en": "Mutter Paneer",
                        "hi": "मटर पनीर",
                        "ar": "بازلاء بانيير"
                },
                "description": {
                        "en": "Classic green peas and cottage cheese curry in rich spiced tomato sauce.",
                        "hi": "समृद्ध मसालेदार टमाटर सॉस में क्लासिक हरी मटर और पनीर करी।",
                        "ar": "كاري البازلاء الخضراء الكلاسيكية وجبنة القريش في صلصة الطماطم الغنية بالبهارات."
                },
                "price": "₹310",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443802/khaliya_restaurant/product_1780141134913.jpg"
        },
        {
                "id": 1780141136020,
                "category": "Main Course",
                "name": {
                        "en": "Kadai Paneer",
                        "hi": "कढ़ाई पनीर",
                        "ar": "كاداي بانيير"
                },
                "description": {
                        "en": "Cottage cheese cooked with bell peppers, onions, and freshly ground spices.",
                        "hi": "शिमला मिर्च, प्याज और ताजे पिसे हुए मसालों के साथ पकाया गया पनीर।",
                        "ar": "جبنة قريش مطبوخة مع الفلفل الرومي والبصل والبهارات الطازجة المطحونة."
                },
                "price": "₹330",
                "tags": [
                        "veg",
                        "spicy-2"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443804/khaliya_restaurant/product_1780141136020.jpg"
        },
        {
                "id": 1780141131297,
                "category": "Main Course",
                "name": {
                        "en": "Aloo Gobi Masala",
                        "hi": "आलू गोभी मसाला",
                        "ar": "آلو جوبي ماسالا"
                },
                "description": {
                        "en": "Fresh cauliflower florets and potatoes cooked with ginger and cumin seeds.",
                        "hi": "अदरक और जीरे के साथ पकाई गई ताजी फूलगोभी और आलू।",
                        "ar": "زهور القرنبيط الطازجة والبطاطس المطبوخة مع الزنجبيل وبذور الكمون."
                },
                "price": "₹250",
                "tags": [
                        "veg",
                        "spicy-1"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443805/khaliya_restaurant/product_1780141131297.jpg"
        },
        {
                "id": 1780141131740,
                "category": "Main Course",
                "name": {
                        "en": "Chicken Korma",
                        "hi": "चिकन कोरमा",
                        "ar": "دجاج كورما"
                },
                "description": {
                        "en": "Rich chicken curry cooked in creamy cashew and almond nut sauce.",
                        "hi": "मलाईदार काजू और बादाम की चटनी में पकाई गई समृद्ध चिकन करी।",
                        "ar": "كاري الدجاج الغني المطبوخ في صلصة الكاجو واللوز الكريمية."
                },
                "price": "₹410",
                "tags": [
                        "non-veg",
                        "spicy-1"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443806/khaliya_restaurant/product_1780141131740.jpg"
        },
        {
                "id": 1780141129332,
                "category": "Main Course",
                "name": {
                        "en": "Shahi Paneer",
                        "hi": "शाही पनीर",
                        "ar": "شاهي بانيير"
                },
                "description": {
                        "en": "Royal cottage cheese in thick creamy gravy of almonds and saffron.",
                        "hi": "बादाम और केसर की गाढ़ी मलाईदार ग्रेवी में शाही पनीर।",
                        "ar": "جبنة قريش ملكية في مرق كريمي كثيف من اللوز والزعفران."
                },
                "price": "₹340",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443807/khaliya_restaurant/product_1780141129332.jpg"
        },
        {
                "id": 1780141131193,
                "category": "Bread",
                "name": {
                        "en": "Butter Naan",
                        "hi": "बटर नान",
                        "ar": "نان بالزبدة"
                },
                "description": {
                        "en": "Soft refined flour bread baked in tandoor and layered with fresh butter.",
                        "hi": "तंदूर में पकी हुई और ताजे मक्खन के साथ परतदार नरम मैदा की रोटी।",
                        "ar": "خبز دقيق ناعم طري مخبوز في التنور ومغطى بالزبدة الطازجة."
                },
                "price": "₹70",
                "tags": [
                        "veg"
                ],
                "image": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&fit=crop"
        },
        {
                "id": 1780141127138,
                "category": "Bread",
                "name": {
                        "en": "Tandoori Roti",
                        "hi": "तंदूरी रोटी",
                        "ar": "تندوري روتي"
                },
                "description": {
                        "en": "Traditional whole wheat bread baked in clay tandoor.",
                        "hi": "मिट्टी के तंदूर में पकी हुई पारंपरिक साबुत गेहूं की रोटी।",
                        "ar": "خبز القمح الكامل التقليدي المخبوز في تنور طيني."
                },
                "price": "₹40",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443809/khaliya_restaurant/product_1780141127138.jpg"
        },
        {
                "id": 1780141136167,
                "category": "Bread",
                "name": {
                        "en": "Lachha Paratha",
                        "hi": "लच्छा पराठा",
                        "ar": "لتشا باراتا"
                },
                "description": {
                        "en": "Layered whole wheat crispy flatbread baked in clay oven.",
                        "hi": "मिट्टी के ओवन में बेक की हुई परतदार साबुत गेहूं की कुरकुरी रोटी।",
                        "ar": "خبز مسطح مقرمش من القمح الكامل مخبوز في فرن طيني."
                },
                "price": "₹90",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443810/khaliya_restaurant/product_1780141136167.jpg"
        },
        {
                "id": 1780141131627,
                "category": "Bread",
                "name": {
                        "en": "Aloo Paratha",
                        "hi": "आलू पराठा",
                        "ar": "آلو باراتا"
                },
                "description": {
                        "en": "Whole wheat bread stuffed with seasoned potatoes, cooked on griddle with ghee.",
                        "hi": "मसालेदार आलू से भरी गेहूं की रोटी, तवे पर घी के साथ पकाई गई।",
                        "ar": "خبز القمح الكامل المحشو بالبطاطس المتبلة والمطهو على الصاج مع السمن."
                },
                "price": "₹100",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443811/khaliya_restaurant/product_1780141131627.jpg"
        },
        {
                "id": 1780141127274,
                "category": "Dessert",
                "name": {
                        "en": "Rasgulla (2 pcs)",
                        "hi": "रसगुल्ला (2 पीसी)",
                        "ar": "راسغولا (قطعتان)"
                },
                "description": {
                        "en": "Spongy cottage cheese balls soaked in sweet light sugar syrup.",
                        "hi": "मीठी हल्की चीनी की चाशनी में भिगोए हुए स्पंजी पनीर के गोले।",
                        "ar": "كرات جبنة القريش الإسفنجية المنقوعة في شراب السكر الخفيف الحلو."
                },
                "price": "₹100",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443812/khaliya_restaurant/product_1780141127274.jpg"
        },
        {
                "id": 1780141126548,
                "category": "Dessert",
                "name": {
                        "en": "Rice Kheer",
                        "hi": "चावल की खीर",
                        "ar": "أرز خير"
                },
                "description": {
                        "en": "Slow-cooked rice pudding made with whole milk, saffron, and nuts.",
                        "hi": "साबुत दूध, केसर और मेवों से बनी धीमी आंच पर पकाई गई चावल की खीर।",
                        "ar": "بودنغ الأرز المطبوخ ببطء والمصنوع من الحليب الكامل والزعفران والمكسرات."
                },
                "price": "₹140",
                "tags": [
                        "veg"
                ],
                "image": "https://images.unsplash.com/photo-1574969899363-ee6121f3080a?w=500&fit=crop"
        },
        {
                "id": 1780141127028,
                "category": "Beverage",
                "name": {
                        "en": "Masala Chai",
                        "hi": "मसाला चाय",
                        "ar": "شاي ماسالا"
                },
                "description": {
                        "en": "Traditional Indian milk tea brewed with cardamom, ginger, and spices.",
                        "hi": "इलायची, अदरक और मसालों के साथ बनाई गई पारंपरिक भारतीय दूध की चाय।",
                        "ar": "شاي الحليب الهندي التقليدي المخمر مع الهيل والزنجبيل والبهارات."
                },
                "price": "₹80",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443813/khaliya_restaurant/product_1780141127028.jpg"
        },
        {
                "id": 1780141135558,
                "category": "Beverage",
                "name": {
                        "en": "Rose Lassi",
                        "hi": "गुलाब लस्सी",
                        "ar": "روز لاسي"
                },
                "description": {
                        "en": "Sweet yogurt drink infused with fragrant rose syrup and cardamom.",
                        "hi": "सुगंधित गुलाब के सिरप और इलायची के साथ मीठा दही का पेय।",
                        "ar": "مشروب زبادي حلو غني بشراب الورد العطر والهيل."
                },
                "price": "₹160",
                "tags": [
                        "veg"
                ],
                "image": "https://images.unsplash.com/photo-1571006682869-f54244517307?w=500&fit=crop"
        },
        {
                "id": 1780141127666,
                "category": "Beverage",
                "name": {
                        "en": "Fresh Lime Soda",
                        "hi": "फ्रेश लाइम सोडा",
                        "ar": "صودا الليمون الطازج"
                },
                "description": {
                        "en": "Sweet and salty refreshing carbonated drink with fresh lime juice.",
                        "hi": "ताजे नींबू के रस के साथ मीठा और नमकीन ताज़ा कार्बोनेटेड पेय।",
                        "ar": "مشروب غازي منعش حلو ومالح مع عصير الليمون الطازج."
                },
                "price": "₹110",
                "tags": [
                        "veg"
                ],
                "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443814/khaliya_restaurant/product_1780141127666.jpg"
        }
];

    const [activeCategory, setActiveCategory] = useState('All');
    const [menuItems, setMenuItems] = useState([]);
    
    // Reset visible count when category changes for speed
    useEffect(() => {
        setVisibleCount(20);
    }, [activeCategory]);

    const [loading, setLoading] = useState(true);
    const [showMatchmaker, setShowMatchmaker] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12); // Speed: Start smaller
    const [searchQuery, setSearchQuery] = useState('');
    const [isRenderReady, setIsRenderReady] = useState(true); 

    // Initial mount hook optimized for instant rendering

    // Real-time updates via SSE
    useEffect(() => {
        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        let evtSource = null;
        try {
            evtSource = new EventSource(sseUrl);
            evtSource.onmessage = (e) => {
                try {
                    const update = JSON.parse(e.data);
                    if (update.type === 'menu') {
                        setMenuItems(update.data);
                    }
                } catch (err) {
                    console.error("SSE parsing error", err);
                }
            };
            evtSource.onerror = () => {
                if (evtSource) {
                    evtSource.close();
                }
            };
        } catch (err) {
            console.warn('SSE unavailable in NativeMenu:', err.message);
        }
        
        return () => {
            if (evtSource) evtSource.close();
        };
    }, [API_URL]);

    useEffect(() => {
        axios.get(`${API_URL}/menu?t=${Date.now()}`, { timeout: 5000 })
            .then(res => {
                if (Array.isArray(res.data)) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => {
                console.error('API Error, using fallback:', err);
                setMenuItems(masterMenu);
                setMenuItems(masterMenu);
            })
            .finally(() => setLoading(false));
    }, [API_URL]);

    const categories = useMemo(() => {
        if (!Array.isArray(menuItems)) return ['All'];
        const backendCategories = [...new Set(menuItems.map(item => getLocalized(item.category)).filter(Boolean))];
        return ['All', ...backendCategories];
    }, [menuItems, language]);

    const filteredItems = useMemo(() => {
        let items = activeCategory === 'All'
            ? menuItems
            : menuItems.filter(item => getLocalized(item.category) === activeCategory);
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => 
                getLocalized(item.name).toLowerCase().includes(query) || 
                getLocalized(item.description).toLowerCase().includes(query) ||
                getLocalized(item.category).toLowerCase().includes(query)
            );
        }
        return items;
    }, [menuItems, activeCategory, language, searchQuery]);

    const visibleItems = useMemo(() => {
        return filteredItems.slice(0, visibleCount);
    }, [filteredItems, visibleCount]);

    const CardSkeleton = () => (
        <div className="skeleton-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '25px', height: '280px', position: 'relative', overflow: 'hidden' }}>
            <div className="shimmer" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animation: 'shimmer 1.5s infinite' }}></div>
        </div>
    );

    return (
        <div className="native-menu-view">
            <div className="native-menu-header" style={{ 
                padding: '40px 20px 30px', 
                background: 'var(--indigo-gradient)',
                color: '#FFF',
                borderRadius: '0 0 35px 35px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="menu-title-block">
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: '#FFFFFF', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>{t('menu.title', 'Our Menu')}</h2>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600' }}>Flavor Sanctuary</p>
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMatchmaker(true)}
                        style={{ padding: '10px 18px', borderRadius: '30px', background: 'rgba(255,255,255,0.2)', color: '#FFF', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                    >
                        <i className="fas fa-magic"></i> Matchmaker
                    </motion.button>
                </div>
                {showMatchmaker && <AiMatchmaker onClose={() => setShowMatchmaker(false)} onMatch={setActiveTab} />}
                <div className="search-bar futuristic-glass" style={{ 
                    display: 'flex', alignItems: 'center', padding: '15px 20px', 
                    borderRadius: '15px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)'
                }}>
                    <i className="fas fa-search" style={{ color: 'var(--text-muted)', marginRight: '12px' }}></i>
                    <input 
                        type="text" 
                        placeholder={t('menu.searchPlaceholder', 'Find your flavor...')} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', width: '100%', outline: 'none', fontWeight: '500' }}
                    />
                </div>
            </div>

            <div className="native-categories" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '10px 25px', borderRadius: '30px', border: '1px solid var(--border-color)',
                            backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'var(--bg-surface)',
                            color: activeCategory === cat ? '#FFF' : 'var(--text-muted)',
                            fontWeight: '800', whiteSpace: 'nowrap', transition: 'var(--transition)',
                            fontSize: '0.9rem', boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        {cat === 'All' ? 'All' : cat}
                    </button>
                ))}
            </div>

            <div className="native-menu-grid-responsive">
                    {(!isRenderReady || (loading && menuItems.length === 0)) ? (
                        Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        visibleItems.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                className="native-menu-card futuristic-glass"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: Math.min(index, 6) * 0.02 }}
                                whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                                style={{ 
                                    background: '#FFFFFF', borderRadius: '25px', 
                                    border: '1px solid var(--border-color)', overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                    transition: 'box-shadow 0.3s ease'
                                }}
                            >
                                <div style={{ height: '150px', position: 'relative' }}>
                                    <img 
                                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop'} 
                                        alt={getLocalized(item.name)} 
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop' }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ 
                                        position: 'absolute', top: '12px', right: '12px',
                                        backgroundColor: 'var(--primary-color)', color: '#FFFFFF',
                                        padding: '5px 12px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                    }}>{String(item.price).includes('₹') ? item.price : `₹${item.price}`}</div>
                                </div>
                                <div style={{ padding: '15px 12px 12px' }}>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontWeight: '800' }}>{getLocalized(item.name)}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4', marginBottom: '15px', height: '4.2em', overflow: 'hidden', fontWeight: '500' }}>
                                        {getLocalized(item.description)}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            addToCart(item);
                                            Swal.fire({ title: 'Added!', text: `${getLocalized(item.name)} added`, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                        }}
                                        style={{ 
                                            width: '100%', backgroundColor: 'var(--bg-body)', 
                                            color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '10px', borderRadius: '15px',
                                            fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)'
                                        }}
                                    >
                                        <i className="fas fa-shopping-bag" style={{ marginRight: '6px' }}></i> {t('common.add', 'Order Now')}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
            </div>

            {/* PERFORMANCE: Load More Button */}
            {filteredItems.length > visibleCount && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button 
                        onClick={() => setVisibleCount(prev => prev + 20)}
                        style={{ 
                            padding: '12px 30px', 
                            borderRadius: '25px', 
                            background: 'var(--primary-color)', 
                            color: '#FFF', 
                            border: 'none', 
                            fontWeight: '800',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        See More ({filteredItems.length - visibleCount} items left)
                    </button>
                </div>
            )}
            <div style={{ height: '120px' }}></div>
        </div>
    );
}
