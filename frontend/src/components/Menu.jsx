import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function Menu() {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();

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
                "en": "Crispy fried golden pastry stuffed with royal spiced potato and pea filling.",
                "hi": "मसालेदार आलू और मटर भराव के साथ कुरकुरा तला हुआ पेस्ट्री।",
                "ar": "فطيرة مقرمشة محشوة بالبطاطس المتبلة والبازلاء."
            },
            "price": "₹150",
            "tags": ["veg", "spicy-1"],
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
                "en": "Char-grilled artisan cottage cheese marinated in hung curd, Kashmiri chilies & royal spices.",
                "hi": "दही और मसालों में मैरीनेट किया हुआ पनीर, तंदूर में ग्रिल किया हुआ।",
                "ar": "مكعبات جبنة القريش المتبلة بالزبادي والبهارات والمشوية في التنور."
            },
            "price": "₹320",
            "tags": ["veg", "spicy-1"],
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
                "en": "Signature tandoori chicken marinated in secret Mughlai spices, slow roasted over charcoal.",
                "hi": "क्लासिक तंदूरी चिकन गुप्त मसालों में मैरीनेट किया हुआ और पूर्णता के साथ ग्रिल किया हुआ।",
                "ar": "دجاج تندوري كلاسيكي متبل بالبهارات السرية ومشوي بإتقان."
            },
            "price": "₹420",
            "tags": ["non-veg", "spicy-2"],
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
                "en": "Healthy spinach and green pea patties infused with aromatic herbs & cashew crunch.",
                "hi": "पारंपरिक जड़ी-बूटियों और मसालों के साथ स्वस्थ पालक और हरी मटर के पैटीज़।",
                "ar": "فطائر السبانخ والبازلاء الخضراء الصحية مع الأعشاب والبهارات التقليدية."
            },
            "price": "₹220",
            "tags": ["veg", "spicy-1"],
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
                "en": "Golden crisp river sole fillets seasoned with crushed carom seeds & Punjabi spices.",
                "hi": "अजवाइन और प्रामाणिक मसालों के साथ सुनहरे तले हुए मछली के टुकड़े।",
                "ar": "شرائح سمك مقلية ذهبية بنكهة بذور الكروم والبهارات الأصلية."
            },
            "price": "₹350",
            "tags": ["non-veg", "spicy-2"],
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGLQvjPkx0ESR53XRcU0VYgcNmbGyqdPvS9GhFv6KUWg&s=10"
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
                "en": "Indo-Chinese style wok-tossed cottage cheese with bell peppers and dark soy reduction.",
                "hi": "शिमला मिर्च और प्याज के साथ इंडो-चाइनीज स्टाइल का मसालेदार पनीर।",
                "ar": "جبنة قريش حارة على الطريقة الهندية الصينية مع فلفل رومي وبصل."
            },
            "price": "₹280",
            "tags": ["veg", "spicy-2"],
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
                "en": "Fiery south-Indian tempura chicken tossed with curry leaves, garlic & red chili paste.",
                "hi": "चेन्नई, भारत से उत्पन्न मसालेदार, गहरे तले हुए चिकन डिश।",
                "ar": "طبق دجاج مقلي حار من تشيناي، الهند."
            },
            "price": "₹310",
            "tags": ["non-veg", "spicy-3"],
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
                "en": "Dum-cooked aged Basmati rice layered with succulent saffron chicken & mint-ghee aroma.",
                "hi": "सुगंधित बासमती चावल मैरीनेट किए हुए चिकन और सुगंधित मसालों के साथ पकाया जाता है।",
                "ar": "أرز بسمتي عطري مطبوخ مع دجاج متبل وبهارات عطرية."
            },
            "price": "₹450",
            "tags": ["non-veg", "spicy-2"],
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
                "en": "Tandoori chicken simmered in rich velvet tomato-butter gravy with kasuri methi.",
                "hi": "समृद्ध, मलाईदार टमाटर क्रीम सॉस में रसीला चिकन। हाउस स्पेशलिटी।",
                "ar": "دجاج طري في صلصة طماطم بالزبدة والقشطة الغنية."
            },
            "price": "₹400",
            "tags": ["non-veg", "spicy-1"],
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
                "en": "Smoky char-grilled chicken bites cooked in onion-tomato masala & fresh cream.",
                "hi": "सुगंधित मसालों के साथ मलाईदार टमाटर सॉस में नरम चिकन।",
                "ar": "دجاج طري في صلصة طماطم كريمية مع بهارات عطرية."
            },
            "price": "₹380",
            "tags": ["non-veg", "spicy-2"],
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
                "en": "Melt-in-mouth malai paneer cubes submerged in rich golden butter-tomato sauce.",
                "hi": "समृद्ध टमाटर बटर ग्रेवी में नरम पनीर। शाकाहारी पसंदीदा।",
                "ar": "جبنة قريش ناعمة في مرق الزبدة الغني بالطماطم."
            },
            "price": "₹320",
            "tags": ["veg", "spicy-1"],
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
                "en": "Overnight slow-cooked black lentils enriched with churned butter & cream.",
                "hi": "मक्खन, क्रीम और सुगंधित मसालों के साथ धीमी आंच पर पकाए गए मलाईदार काले उड़द।",
                "ar": "عدس أسود كريمي مطبوخ ببطء مع الزبدة والقشطة والبهارات العطرية."
            },
            "price": "₹280",
            "tags": ["veg", "spicy-1"],
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
                "en": "Kashmiri classic tender lamb braised in alkanet root, fennel & cardamom gravy.",
                "hi": "टमाटर और दही की सॉस के साथ सुगंधित मसाले के मिश्रण में पका हुआ नरम मेमना।",
                "ar": "لحم طري مطبوخ بمزيج بهارات عطرية مع صلصة الطماطم والزبادي."
            },
            "price": "₹450",
            "tags": ["non-veg", "spicy-3"],
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
                "en": "Handcrafted cottage cheese & dry fruit croquettes in a cashew cardamom white sauce.",
                "hi": "समृद्ध, मलाईदार सफेद ग्रेवी में नरम पनीर और आलू के कोफ्ते।",
                "ar": "كفتة الجبنة والبطاطس الناعمة في مرق أبيض كريمي غني."
            },
            "price": "₹340",
            "tags": ["veg", "spicy-1"],
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
                "en": "Fresh organic spinach velvety gravy with charred cottage cheese cubes.",
                "hi": "गाढ़ा, मसालेदार पालक प्यूरी में पनीर के टुकड़े। पौष्टिक।",
                "ar": "مكعبات جبنة القريश في هريس السبانخ الكثيف والمتبل. مغذية."
            },
            "price": "₹310",
            "tags": ["veg", "spicy-1"],
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
                "en": "Wok-cooked chicken stir-fried with coarsely ground spices, bell peppers & tomato sauce.",
                "hi": "शिमला मिर्च, टमाटर और पिसे हुए मसालों के साथ मसालेदार चिकन करी।",
                "ar": "كاري الدجاج الحار المطبوخ مع الفلفل الرومي والطماطم والبهارات المطحونة."
            },
            "price": "₹390",
            "tags": ["non-veg", "spicy-3"],
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
                "en": "Coastal fish curry simmered with freshly pressed coconut milk, tamarind & red chilies.",
                "hi": "इमली और ताजी मछली के साथ तैयार नारियल आधारित तीखी मछली करी।",
                "ar": "كاري السمك اللاذع بجوز الهند المعد بالتمر الهندي والصيد الطازج."
            },
            "price": "₹460",
            "tags": ["non-veg", "spicy-2"],
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
                "en": "Kabuli chickpeas cooked with tangy dried pomegranate seeds & ground spices.",
                "hi": "खट्टे टमाटर और प्याज की ग्रेवी के साथ पकाए गए क्लासिक चना करी।",
                "ar": "كاري الحمص الكلاسيكي المطبوخ مع مرق الطماطم والبصل اللاذع."
            },
            "price": "₹260",
            "tags": ["veg", "spicy-2"],
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
                "en": "Leavened flatbread brushed with minced garlic, fresh coriander & cow ghee.",
                "hi": "ताजा लहसुन और मक्खन के साथ मिट्टी के ओवन में पकी हुई पारंपरिक भारतीय रोटी।",
                "ar": "خبز هندي تقليدي مخبوز في فرن الطين مع الثوم الطازج والزبدة."
            },
            "price": "₹80",
            "tags": ["veg"],
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
                "en": "Warm milk-solid spheres soaked in saffron, green cardamom & rose water syrup.",
                "hi": "गुलाब और इलायची की चाशनी में भिगोए हुए नरम दूध के पेड़े।",
                "ar": "زلابية ناعمة مبنية على الحليب منقوعة في شراب الورد والهيل."
            },
            "price": "₹120",
            "tags": ["veg"],
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
                "en": "Creamy boneless chicken marinated in cream cheese, white pepper & royal cardamom.",
                "hi": "चीज़ और क्रीम में मैरीनेट किए हुए मलाईदार, मुँह में घुल जाने वाले चिकन के टुकड़े।",
                "ar": "قطع دجاج كريمية تذوب في الفم متبلة بالجبن والقشطة."
            },
            "price": "₹380",
            "tags": ["non-veg", "spicy-1"],
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
                "en": "Yellow arhar lentils tempered with desi ghee, cumin, crushed garlic & whole red chili.",
                "hi": "घी, जीरा, लहसुन और लाल मिर्च के तड़के वाली पीली दाल। एक आत्मिक क्लासिक।",
                "ar": "عدس أصفر مقلي بالسمن والكمون والثوم والفلفل الأحمر. طبق كلاسيكي مريح."
            },
            "price": "₹240",
            "tags": ["veg", "spicy-2"],
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
                "en": "Aromatic basmati rice cooked with caramelized dry fruits, fresh berries & saffron essence.",
                "hi": "फलों, मेवों और केसर के साथ पकाया गया सुगंधित चावल। शाही और खुशबूदार।",
                "ar": "أرز عطري مطبوخ بالفواكه والمكسرات والزعفران الرقيق. ملكي وعطري."
            },
            "price": "₹320",
            "tags": ["veg"],
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
                "en": "Chilled artisan yogurt blend infused with Alphonsos mango pulp & green cardamom.",
                "hi": "ताजे आम से बना मीठा और मलाईदार दही आधारित पेय।",
                "ar": "مشروب حلو وكريمي قائم على الزبادي ومصنوع من المانجو الطازج."
            },
            "price": "₹150",
            "tags": ["veg"],
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
                "en": "Hand-rolled golden pastries stuffed with seasoned Julienne vegetables.",
                "hi": "सीजंड कुरकुरी सब्जियों से भरे कुरकुरे सुनहरे रैपर।",
                "ar": "أغلفة ذهبية مقرمشة محشوة بالخضار المقرمشة المتبلة."
            },
            "price": "₹180",
            "tags": ["veg"],
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
                "en": "Crisp red onion fritters laced with ajwain, gram flour & sweet chutney.",
                "hi": "चने के आटे और मसालों के साथ गहरे तले हुए कटे हुए प्याज के पकोड़े।",
                "ar": "فطائر البصل المقطعة والمقلية مع دقيق الحمص والبهارات."
            },
            "price": "₹160",
            "tags": ["veg"],
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
                "en": "Grated spiced paneer skewers chargrilled with aromatic bell pepper dust.",
                "hi": "तंदूर में ग्रिल किए हुए कीमा बनाया हुआ पनीर और सब्जियों के सीख कबाब।",
                "ar": "سيخ من جبنة القريش والخضار المفرومة والمشوية في التنور."
            },
            "price": "₹340",
            "tags": ["veg", "spicy-1"],
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
                "en": "Succulent minced lamb seasoned with raw spices, coriander roots & charcoal flame.",
                "hi": "जड़ी-बूटियों के साथ अनुभवी और मिट्टी के ओवन में ग्रिल किए गए कीमा मटन सीख कबाब।",
                "ar": "أسياخ لحم الضأن المفروم المتبل بالأعشاب والمشوي في فرن الطين."
            },
            "price": "₹450",
            "tags": ["non-veg", "spicy-2"],
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
                "en": "Crispy cauliflower florets tossed in wok-seared spicy garlic Indo-Chinese sauce.",
                "hi": "तीखे इंडो-चाइनीज सॉस में लिपटे कुरकुरे फूलगोभी के टुकड़े।",
                "ar": "زهور القرنبيط المقرمشة المغمسة في صلصة الهند والصين اللاذعة."
            },
            "price": "₹240",
            "tags": ["veg", "spicy-2"],
            "image": "https://res.cloudinary.com/mbib5dog/image/upload/v1788443800/khaliya_restaurant/product_1780141128421.jpg"
        }
    ];

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const sortOptions = [
        { value: 'default', label: t('menu.sortDefault', 'Default Sort'), icon: 'fa-sort' },
        { value: 'price-low', label: t('menu.sortLow', 'Price: Low to High'), icon: 'fa-sort-amount-down-alt' },
        { value: 'price-high', label: t('menu.sortHigh', 'Price: High to Low'), icon: 'fa-sort-amount-down' },
        { value: 'popular', label: t('menu.sortPopular', 'Most Popular'), icon: 'fa-fire' }
    ];

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get('/api/menu');
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setMenuItems(res.data);
                } else {
                    setMenuItems(getFallbackMenu());
                }
            } catch (err) {
                console.warn('Backend menu unavailable, using fallback menu', err);
                setMenuItems(getFallbackMenu());
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const categories = ['All', 'Appetizer', 'Main Course', 'Bread', 'Dessert', 'Beverage'];

    const getLocalized = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[language] || field.en || Object.values(field)[0] || '';
    };

    const filteredItems = menuItems
        .filter(item => {
            const cat = typeof item.category === 'object' ? item.category.en : item.category;
            const matchesCategory = filter === 'All' || cat === filter;
            const nameStr = getLocalized(item.name).toLowerCase();
            const descStr = getLocalized(item.description).toLowerCase();
            const matchesSearch = nameStr.includes(search.toLowerCase()) || descStr.includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            const priceA = parseInt((a.effectivePrice || a.price || '0').toString().replace(/[^0-9]/g, '')) || 0;
            const priceB = parseInt((b.effectivePrice || b.price || '0').toString().replace(/[^0-9]/g, '')) || 0;
            if (sort === 'price-low') return priceA - priceB;
            if (sort === 'price-high') return priceB - priceA;
            if (sort === 'popular') return (b.id % 10) - (a.id % 10);
            return 0;
        });

    const activeSortOption = sortOptions.find(o => o.value === sort) || sortOptions[0];

    return (
        <section className="section container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <div className="section-header text-center" style={{ marginBottom: '2.5rem' }}>
                <span className="subtitle" style={{ letterSpacing: '4px', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t('menu.subtitle', 'Culinary Excellence')}
                </span>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                    background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 50%, #B8860B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginTop: '0.4rem',
                    marginBottom: '0.8rem',
                    letterSpacing: '1px'
                }}>
                    {t('menu.title', 'Royal Culinary Collection')}
                </h2>
                <p style={{ maxWidth: '650px', margin: '0 auto', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {t('menu.desc', 'Crafted by master chefs using regal spices, authentic recipes, and organic ingredients for an unparalleled dining journey.')}
                </p>
                <div style={{ height: '2px', width: '80px', background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', margin: '1.2rem auto 0' }}></div>
            </div>

            {/* Filter and Search Bar Container */}
            <div style={{
                background: 'rgba(20, 17, 14, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '20px',
                padding: '1.2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}>
                {/* Category Pills */}
                <div className="menu-categories" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                    justifyContent: 'center'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                background: filter === cat
                                    ? 'linear-gradient(135deg, #FFF5C0, #FFD700, #B8860B)'
                                    : 'rgba(30, 26, 20, 0.6)',
                                color: filter === cat ? '#0d0d0d' : 'rgba(255, 255, 255, 0.85)',
                                border: filter === cat ? 'none' : '1px solid rgba(212, 175, 55, 0.25)',
                                padding: '8px 18px',
                                borderRadius: '25px',
                                fontWeight: filter === cat ? '700' : '500',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: filter === cat ? '0 4px 15px rgba(255, 215, 0, 0.35)' : 'none',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {cat === 'All' ? t('menu.catAll', 'All Dishes') : t(`menu.cat_${cat.toLowerCase().replace(' ', '_')}`, cat)}
                        </button>
                    ))}
                </div>

                {/* Search & Sort Controls */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Search Input */}
                    <div style={{
                        position: 'relative',
                        flex: '1 1 250px',
                        minWidth: '220px'
                    }}>
                        <i className="fas fa-search" style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#D4AF37',
                            fontSize: '0.9rem'
                        }}></i>
                        <input
                            type="text"
                            placeholder={t('menu.searchPlaceholder', 'Search royal dishes...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px 10px 38px',
                                background: 'rgba(15, 12, 9, 0.8)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px',
                                color: '#FFF',
                                fontSize: '0.88rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    {/* Custom Dark Gold Dropdown for Sort */}
                    <div style={{ position: 'relative', flex: '0 0 auto' }}>
                        <button
                            type="button"
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 18px',
                                background: 'linear-gradient(145deg, rgba(30, 25, 18, 0.9), rgba(18, 14, 10, 0.95))',
                                border: '1px solid rgba(212, 175, 55, 0.35)',
                                borderRadius: '12px',
                                color: '#FFF5C0',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                            }}
                        >
                            <i className={`fas ${activeSortOption.icon}`} style={{ color: '#FFD700' }}></i>
                            <span>{activeSortOption.label}</span>
                            <i className={`fas fa-chevron-down`} style={{
                                color: '#D4AF37',
                                fontSize: '0.75rem',
                                transition: 'transform 0.3s ease',
                                transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}></i>
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <>
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                        onClick={() => setIsSortOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            right: 0,
                                            width: '210px',
                                            background: 'rgba(22, 18, 14, 0.98)',
                                            backdropFilter: 'blur(20px)',
                                            WebkitBackdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                            borderRadius: '14px',
                                            padding: '6px',
                                            boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(255,215,0,0.15)',
                                            zIndex: 100,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {sortOptions.map(option => {
                                            const isSelected = option.value === sort;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSort(option.value);
                                                        setIsSortOpen(false);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '10px 14px',
                                                        background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: isSelected ? '#FFD700' : 'rgba(255, 255, 255, 0.85)',
                                                        fontSize: '0.85rem',
                                                        fontWeight: isSelected ? '700' : '500',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)';
                                                            e.currentTarget.style.color = '#FFF5C0';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                                                        }
                                                    }}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className={`fas ${option.icon}`} style={{ color: isSelected ? '#FFD700' : 'rgba(212, 175, 55, 0.6)', width: '16px' }}></i>
                                                        {option.label}
                                                    </span>
                                                    {isSelected && <i className="fas fa-check" style={{ color: '#FFD700', fontSize: '0.8rem' }}></i>}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Menu Grid - 7-Star Michelin Luxury Glassmorphic Dish Cards */}
            <div className="menu-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} style={{
                            background: 'rgba(26, 22, 17, 0.6)',
                            borderRadius: '20px',
                            height: '380px',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            animation: 'pulse 1.5s infinite'
                        }}></div>
                    ))
                ) : (
                    filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => {
                            const isVeg = item.tags && item.tags.includes('veg');
                            const isNonVeg = item.tags && item.tags.includes('non-veg');
                            const spicyTag = item.tags && item.tags.find(t => t.startsWith('spicy-'));
                            const spiceLevel = spicyTag ? parseInt(spicyTag.replace('spicy-', '')) : 0;

                            return (
                                <motion.div
                                    key={item.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.04 }}
                                    whileHover={{ y: -8 }}
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(26, 22, 17, 0.95), rgba(15, 12, 9, 0.98))',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(212, 175, 55, 0.22)',
                                        borderRadius: '20px',
                                        padding: '1.2rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 235, 175, 0.15)',
                                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                                        e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.22)';
                                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 235, 175, 0.15)';
                                    }}
                                >
                                    {/* Top Image Container */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '200px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        marginBottom: '1.2rem',
                                        background: '#120f0c',
                                        border: '1px solid rgba(212, 175, 55, 0.15)'
                                    }}>
                                        <img
                                            loading="lazy"
                                            src={item.image}
                                            alt={getLocalized(item.name)}
                                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />

                                        {/* FSSAI Pure Veg / Non-Veg Official Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            background: 'rgba(15, 12, 9, 0.85)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            border: isVeg ? '1px solid #2ECC71' : isNonVeg ? '1px solid #E74C3C' : '1px solid rgba(212, 175, 55, 0.3)',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                        }}>
                                            {/* Square FSSAI Indicator */}
                                            <div style={{
                                                width: '14px',
                                                height: '14px',
                                                border: `2px solid ${isVeg ? '#2ECC71' : isNonVeg ? '#E74C3C' : '#FFD700'}`,
                                                borderRadius: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '1px'
                                            }}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: isVeg ? '50%' : '50%',
                                                    background: isVeg ? '#2ECC71' : isNonVeg ? '#E74C3C' : '#FFD700'
                                                }}></div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.5px',
                                                color: isVeg ? '#2ECC71' : isNonVeg ? '#E74C3C' : '#FFD700',
                                                textTransform: 'uppercase'
                                            }}>
                                                {isVeg ? 'Veg' : isNonVeg ? 'Non-Veg' : 'Special'}
                                            </span>
                                        </div>

                                        {/* Category Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            padding: '4px 12px',
                                            background: 'rgba(0, 0, 0, 0.75)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(212, 175, 55, 0.35)',
                                            borderRadius: '20px',
                                            color: '#FFF5C0',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {getLocalized(item.category)}
                                        </div>

                                        {/* Spice Level Indicator Overlay if applicable */}
                                        {spiceLevel > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                right: '10px',
                                                padding: '3px 8px',
                                                background: 'rgba(0, 0, 0, 0.75)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255, 69, 0, 0.4)',
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                gap: '2px'
                                            }}>
                                                {Array(spiceLevel).fill('🌶️').join('')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Header & Title */}
                                    <div style={{ marginBottom: '0.6rem' }}>
                                        <h3 style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '1.25rem',
                                            color: '#FFF5C0',
                                            margin: '0 0 0.4rem 0',
                                            lineHeight: '1.3',
                                            fontWeight: '600',
                                            letterSpacing: '0.3px'
                                        }}>
                                            {getLocalized(item.name)}
                                        </h3>
                                    </div>

                                    {/* Card Description */}
                                    <p style={{
                                        fontSize: '0.88rem',
                                        color: 'rgba(255, 255, 255, 0.68)',
                                        margin: '0 0 1.2rem 0',
                                        lineHeight: '1.55',
                                        flex: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {getLocalized(item.description)}
                                    </p>

                                    {/* Card Footer: Price & Add to Cart Button */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 'auto',
                                        paddingTop: '0.8rem',
                                        borderTop: '1px solid rgba(212, 175, 55, 0.12)'
                                    }}>
                                        <div>
                                            <span style={{
                                                fontSize: '1.35rem',
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {item.effectivePrice || item.price}
                                            </span>
                                            {item.isSurgeActive && (
                                                <span style={{
                                                    display: 'block',
                                                    fontSize: '0.68rem',
                                                    color: '#FF6B6B',
                                                    fontWeight: 600
                                                }}>
                                                    ⚡ Peak Hours Price
                                                </span>
                                            )}
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (item) {
                                                    addToCart(item);
                                                    Swal.fire({
                                                        title: t('cart.addedTitle', 'Selection Added'),
                                                        text: `${getLocalized(item.name)} ${t('cart.addedMsg', 'is now in your royal order')}`,
                                                        icon: 'success',
                                                        toast: true,
                                                        position: 'top-end',
                                                        showConfirmButton: false,
                                                        timer: 3000,
                                                        background: 'rgba(22, 18, 14, 0.95)',
                                                        color: '#FFF5C0',
                                                        iconColor: '#FFD700'
                                                    });
                                                }
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                                                color: '#0d0d0d',
                                                border: 'none',
                                                borderRadius: '25px',
                                                padding: '9px 18px',
                                                fontSize: '0.82rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.5px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                                                transition: 'box-shadow 0.3s ease'
                                            }}
                                        >
                                            <i className="fas fa-plus" style={{ fontSize: '0.75rem' }}></i>
                                            <span>{t('common.add', 'Add Item')}</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '4rem 1rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            background: 'rgba(20, 17, 14, 0.5)',
                            borderRadius: '20px',
                            border: '1px dashed rgba(212, 175, 55, 0.2)'
                        }}>
                            <i className="fas fa-utensils" style={{ fontSize: '2.5rem', color: '#D4AF37', marginBottom: '1rem' }}></i>
                            <h3 style={{ color: '#FFF5C0', fontFamily: 'var(--font-heading)' }}>No Royal Dishes Found</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try adjusting your search criteria or category filter.</p>
                            <button
                                onClick={() => { setFilter('All'); setSearch(''); setSort('default'); }}
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                                    color: '#0d0d0d',
                                    fontWeight: 700,
                                    padding: '10px 22px',
                                    borderRadius: '25px',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )
                )}
            </div>

            <p style={{ marginTop: '3.5rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', fontSize: '0.85rem' }}>
                {t('menu.note', 'All taxes applicable. Dishes are prepared fresh to order.')}
            </p>
        </section>
    );
}
