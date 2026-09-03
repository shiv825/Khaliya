import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import AiMatchmaker from './AiMatchmaker';
import { motion } from 'framer-motion';

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

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');
    const [showMatchmaker, setShowMatchmaker] = useState(false);

    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';

    // Real-time updates via SSE
    useEffect(() => {
        let isMounted = true;
        const sseUrl = `${API_URL.replace('/api', '')}/api/live-updates`;
        let evtSource = null;
        try {
            evtSource = new EventSource(sseUrl);
            evtSource.onmessage = (e) => {
                try {
                    const update = JSON.parse(e.data);
                    if (update.type === 'menu' && isMounted) {
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
            console.warn('SSE unavailable in Menu:', err.message);
        }
        
        return () => {
            isMounted = false;
            if (evtSource) evtSource.close();
        };
    }, [API_URL]);

    useEffect(() => {
        let isMounted = true;
        axios.get(`${API_URL}/menu?t=${Date.now()}`, { timeout: 8000 })
            .then(res => {
                if (isMounted && Array.isArray(res.data)) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => {
                console.warn('API Menu fetch failed, staying with fallback:', err.message);
                if (isMounted) setMenuItems(getFallbackMenu());
                if (isMounted) setMenuItems(getFallbackMenu());
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [API_URL]);

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
        <section id="menu" style={{ position: 'relative' }}>
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
                {['All', 'Appetizer', 'Main Course', 'Bread', 'Dessert', 'Beverage'].map(cat => {
                    const isActive = filter === cat;
                    const catColors = {
                        'All': 'var(--primary-color)',
                        'Appetizer': 'var(--spice-emerald)',
                        'Main Course': 'var(--primary-color)',
                        'Bread': 'var(--spice-saffron)',
                        'Dessert': 'var(--accent-color)',
                        'Beverage': 'var(--secondary-color)'
                    };
                    return (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)} 
                            className={`btn menu-filter-btn ${isActive ? 'active' : ''}`}
                            style={{
                                background: isActive ? catColors[cat] : 'var(--bg-surface)',
                                color: isActive ? '#fff' : 'var(--text-dark)',
                                borderColor: isActive ? catColors[cat] : 'var(--border-color)',
                                padding: '12px 24px',
                                boxShadow: isActive ? `0 8px 20px ${catColors[cat]}44` : 'var(--shadow-sm)',
                                fontWeight: '700'
                            }}
                        >
                            {t(cat === 'All' ? 'menu.catAll' : cat === 'Appetizer' ? 'menu.catAppetizer' : cat === 'Main Course' ? 'menu.catMain' : cat === 'Bread' ? 'menu.catBread' : cat === 'Dessert' ? 'menu.catDessert' : 'menu.catBeverage')}
                        </button>
                    );
                })}
            </div>

            <div id="menu-container" className="menu">
                {loading ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '4rem', color: 'var(--accent-color)' }}>
                        <i className="fas fa-spinner fa-spin fa-3x"></i>
                    </div>
                ) : (
                    displayedMenu.length > 0 ? (
                        displayedMenu.map((item, index) => (
                            <motion.div 
                                key={item.id || index} 
                                className="menu-item" 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                style={{ 
                                    background: 'var(--bg-surface)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    transition: 'box-shadow 0.3s ease',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                {item.image && (
                                    <div className="menu-item-image" style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: '15px', marginBottom: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', background: '#eee' }}>
                                        <img loading="lazy" src={item.image} alt={getLocalized(item.name)} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&fit=crop'} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    </div>
                                )}
                                <div className="menu-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span className="category" style={{ letterSpacing: '1.5px', fontWeight: '700', fontSize: '0.75rem', color: 'var(--accent-light)' }}>{getLocalized(item.category)}</span>
                                    <div className="menu-item-tags" style={{ display: 'flex', gap: '8px' }}>
                                        {item.tags && Array.isArray(item.tags) && item.tags.map(tag => {
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
                                    <motion.button 
                                        className="btn btn-primary" 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: '30px' }}
                                        onClick={() => {
                                            if (item) {
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
                                            }
                                        }}
                                    >
                                        <i className="fas fa-plus"></i> {t('common.add', 'Add')}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', width: '100%', padding: '4rem', color: 'var(--text-muted)' }}>
                            <p>No dishes found matching your selection.</p>
                            <button onClick={() => {setFilter('All'); setSearch('');}} className="btn">Reset Filters</button>
                        </div>
                    )
                )}
            </div>
            <p style={{ marginTop: '3rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>{t('menu.note')}</p>
        </section>
    );
}
