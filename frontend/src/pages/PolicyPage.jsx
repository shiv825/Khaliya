import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PolicyPage({ defaultType = 'privacy' }) {
    const { policyType } = useParams();
    const activePolicy = policyType || defaultType;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activePolicy]);

    const policies = {
        privacy: {
            title: "Privacy Policy",
            subtitle: "Merchant Data Protection & User Privacy Declaration",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Introduction & Overview</h3>
                    <p>At <strong>Khaliya Restaurant</strong> (operated under <strong>Khaliya Hospitality Private Limited</strong>), we are deeply committed to safeguarding the privacy and security of our guests, website visitors, and application users. This Privacy Policy details how we collect, store, process, and protect your personal information when you use our website, mobile PWA, table QR ordering system, and digital booking services.</p>
                    
                    <h3>2. Information We Collect</h3>
                    <p>We collect information necessary to fulfill your dining, reservation, and culinary order requests:</p>
                    <ul>
                        <li><strong>Personal Identification Data:</strong> Full Name, Email Address, Phone Number provided during table reservations, order checkouts, or feedback.</li>
                        <li><strong>Table Session & Transaction Data:</strong> Table Number, Order Items, Special Cooking Instructions, Payment Status, Invoice Numbers, and Timestamp.</li>
                        <li><strong>Technical & Device Data:</strong> IP Address, Browser Type, Device Operating System, Local Storage session tokens, and Service Worker PWA cache state.</li>
                        <li><strong>Location Data:</strong> Approximate distance calculations (only when explicitly authorized via browser geolocation permissions for restaurant tracking).</li>
                    </ul>

                    <h3>3. Purpose & Use of Collected Information</h3>
                    <p>Your information is processed strictly for legitimate operational purposes:</p>
                    <ul>
                        <li>To process in-restaurant QR orders, kitchen ticket (KOT) printing, and bill presentment.</li>
                        <li>To confirm, manage, and send SMS/email notifications for table reservations.</li>
                        <li>To process digital payments securely via PCI-DSS compliant payment gateways (Razorpay).</li>
                        <li>To provide customer support and handle refund or inquiry requests.</li>
                    </ul>

                    <h3>4. Payment Security & Data Sharing</h3>
                    <p><strong>Razorpay Compliance Guarantee:</strong> We do NOT store credit card numbers, debit card PINs, CVV codes, net banking passwords, or UPI PINs on our servers. All financial transactions are encrypted and processed by <strong>Razorpay Payment Gateway</strong> using bank-grade 256-bit SSL encryption adhering to PCI-DSS Level 1 standards.</p>
                    <p>We do not sell, rent, or trade your personal information to third parties. Data is shared exclusively with necessary service sub-processors (Razorpay for payments, Nodemailer/Twilio for transaction receipts and OTPs).</p>

                    <h3>5. Cookies & Local Storage</h3>
                    <p>We utilize browser Local Storage and minimal session cookies to remember your language preferences, active cart items, device PWA installation state, and session tokens. You may clear your browser cookies at any time.</p>

                    <h3>6. User Rights & Data Deletion</h3>
                    <p>You have the right to inspect, update, or request the permanent deletion of your personal contact data from our reservation system. To submit a data access or deletion request, please contact our Privacy Officer at <a href="mailto:privacy@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>privacy@khaliyarestaurant.com</a>.</p>

                    <h3>7. Merchant Contact Information</h3>
                    <p><strong>Khaliya Hospitality Private Limited</strong><br />
                    Plot No. 42, Royal Heritage Commercial Hub, Sector 18, Noida, UP - 201301, India<br />
                    Email: <a href="mailto:support@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>support@khaliyarestaurant.com</a> | Helpline: +91 98765 43210</p>
                </div>
            )
        },
        terms: {
            title: "Terms & Conditions",
            subtitle: "Merchant Terms of Service & Guest Dining Agreement",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Agreement to Terms</h3>
                    <p>Welcome to <strong>Khaliya Restaurant</strong> (website and digital PWA operated by <strong>Khaliya Hospitality Private Limited</strong>). By accessing our website, placing an order via Table QR, booking a reservation, or utilizing our services, you agree to be bound by these Terms & Conditions.</p>

                    <h3>2. Dining & Service Scope</h3>
                    <p>Khaliya Restaurant provides fine dining, Table QR self-service ordering, table reservation management, takeout pickup, and digital bill verification services. We reserve the right to modify menu item availability, pricing, or operating hours without prior notice.</p>

                    <h3>3. Order Placement & Pricing</h3>
                    <ul>
                        <li>All menu prices listed on the website are in Indian Rupees (INR - ₹) and are inclusive of applicable Goods and Services Tax (GST 5%).</li>
                        <li>Dynamic pricing or seasonal surge adjustments (if active) are clearly displayed before order confirmation.</li>
                        <li>Once an order is submitted via Table QR and transmitted to the kitchen, it becomes binding for bill settlement.</li>
                    </ul>

                    <h3>4. User Conduct & Responsibilities</h3>
                    <p>Guests are expected to provide accurate contact details when placing orders or booking tables. Misuse of the QR ordering system, fraudulent payment attempts, or disrespectful behavior towards restaurant staff will result in immediate service termination and potential legal action under Indian law.</p>

                    <h3>5. Intellectual Property</h3>
                    <p>All content, trademarks, logos, menu descriptions, graphics, and software scripts on this platform are the exclusive intellectual property of <strong>Khaliya Hospitality Private Limited</strong>. Reproduction or unauthorized use is strictly prohibited.</p>

                    <h3>6. Governing Law & Dispute Jurisdiction</h3>
                    <p>These Terms shall be governed by and construed in accordance with the laws of India. Any legal proceedings or disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts in Noida / New Delhi, India.</p>
                </div>
            )
        },
        refund: {
            title: "Refund & Cancellation Policy",
            subtitle: "Razorpay Merchant Refund & Order Cancellation Guidelines",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Order Cancellation Guidelines</h3>
                    <p>At <strong>Khaliya Restaurant</strong>, we prepare every dish fresh upon receipt of your order. Our cancellation rules are as follows:</p>
                    <ul>
                        <li><strong>Dine-In Orders:</strong> Orders placed via Table QR are transmitted instantly to our kitchen (KOT status). Orders cannot be cancelled once food preparation has commenced in the kitchen. If you need to add or adjust items, please alert your waiter immediately.</li>
                        <li><strong>Table Reservations:</strong> Table reservations can be cancelled up to <strong>2 hours prior</strong> to your scheduled dining time without any penalty. Deposit amounts (if applicable) will be fully refunded.</li>
                        <li><strong>Takeout & Pickup Orders:</strong> Takeout orders can be cancelled within <strong>5 minutes</strong> of placement, provided preparation has not started.</li>
                    </ul>

                    <h3>2. Refund Eligibility & Criteria</h3>
                    <p>Refunds will be approved under the following verified circumstances:</p>
                    <ul>
                        <li><strong>Double Billing / Payment Error:</strong> If your bank account or UPI handle was debited twice for a single order due to a network glitch.</li>
                        <li><strong>Unavailable Item:</strong> If an ordered item becomes out of stock after payment confirmation.</li>
                        <li><strong>Quality Issue / Wrong Order Served:</strong> Verified by our floor manager on-site prior to meal consumption.</li>
                    </ul>

                    <h3>3. Refund Processing Timeline</h3>
                    <p>Approved refunds are processed through our primary payment aggregator, <strong>Razorpay</strong>. Refunds will be credited back to the <strong>original payment method</strong> (UPI, Debit/Credit Card, Net Banking) within <strong>5 to 7 business days</strong> depending on your issuing bank's settlement cycle.</p>

                    <h3>4. How to Request a Refund</h3>
                    <p>To request a refund or resolve a payment discrepancy, please contact our Accounts Support team with your Invoice Number / Transaction Ref:</p>
                    <p><strong>Refund Helpline:</strong> +91 98765 43210<br />
                    <strong>Email:</strong> <a href="mailto:refunds@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>refunds@khaliyarestaurant.com</a><br />
                    <strong>Support Hours:</strong> 11:00 AM – 11:00 PM IST (Mon–Sun)</p>
                </div>
            )
        },
        shipping: {
            title: "Shipping & Fulfillment Policy",
            subtitle: "Order Fulfillment, Table Service & Pickup Guidelines",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Fulfillment Modes</h3>
                    <p><strong>Khaliya Restaurant</strong> specializes in premium on-premise fine dining and direct counter takeout. We offer two primary fulfillment methods:</p>
                    <ul>
                        <li><strong>Table QR Dine-In Fulfillment:</strong> Orders placed at your assigned table (e.g. Table T03) are prepared fresh and served directly to your table by our hospitality staff within an estimated <strong>15 to 25 minutes</strong>.</li>
                        <li><strong>Counter Takeout & Pickup:</strong> Takeout orders are prepared and packaged in eco-friendly tamper-evident containers, ready for pickup at our restaurant counter within <strong>20 to 30 minutes</strong>.</li>
                    </ul>

                    <h3>2. Shipping & Delivery Charges</h3>
                    <p>All Dine-In and Takeout Pickup orders carry <strong>₹0 (ZERO) shipping or delivery fees</strong>.</p>

                    <h3>3. Order Tracking & Notifications</h3>
                    <p>Upon order placement, guests receive real-time status updates via their digital bill screen and optional SMS alerts indicating kitchen progress (Received ➔ Preparing ➔ Ready to Serve).</p>

                    <h3>4. Physical Restaurant Location for Pickup</h3>
                    <p><strong>Khaliya Restaurant & Bar</strong><br />
                    Plot No. 42, Royal Heritage Commercial Hub, Sector 18, Noida, Uttar Pradesh - 201301, India<br />
                    Landmark: Near Sector 18 Metro Station | Support Phone: +91 98765 43210</p>
                </div>
            )
        },
        grievance: {
            title: "Grievance Redressal Policy",
            subtitle: "Statutory Redressal Mechanism under Consumer Protection Rules 2020 & IT Act 2000",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Statutory Purpose & Mandate</h3>
                    <p>In accordance with Rule 5(9) of the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> and the <strong>Information Technology Act, 2000</strong>, Khaliya Restaurant has appointed a dedicated Nodal Grievance Officer to address customer complaints, transaction disputes, data privacy issues, or service deficiencies in a prompt and transparent manner.</p>

                    <h3>2. Designated Grievance Redressal Officer</h3>
                    <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontWeight: '700', color: '#FFD700' }}>Mr. Rajeshwar Malhotra</p>
                        <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#CBD5E1' }}>Head of Nodal Grievance & Regulatory Compliance</p>
                        <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#CBD5E1' }}><strong>Entity:</strong> Khaliya Hospitality Private Limited</p>
                        <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#CBD5E1' }}><strong>Address:</strong> Plot No. 42, Royal Heritage Commercial Hub, Sector 18, Noida, UP - 201301, India</p>
                        <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#CBD5E1' }}><strong>Direct Grievance Email:</strong> <a href="mailto:grievance@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>grievance@khaliyarestaurant.com</a></p>
                        <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#CBD5E1' }}><strong>Direct Telephone Helpline:</strong> +91 98765 43210 / +91 120 4567890</p>
                    </div>

                    <h3>3. Complaint SLA & Resolution Timeline</h3>
                    <ul>
                        <li><strong>Complaint Acknowledgment:</strong> Within <strong>48 hours</strong> of receipt of grievance.</li>
                        <li><strong>Dispute Resolution & Final Report:</strong> Within <strong>1 month (30 days)</strong> from date of filing.</li>
                    </ul>

                    <h3>4. How to File a Grievance</h3>
                    <p>Please send an email to <a href="mailto:grievance@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>grievance@khaliyarestaurant.com</a> with your Invoice Number, Date of Transaction, Order ID, and a clear statement of your issue.</p>
                </div>
            )
        },
        pricing: {
            title: "Pricing, Taxes & Billing Disclosure",
            subtitle: "Tax Compliance Statement & Service SAC Codes",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Service SAC Code & Classification</h3>
                    <p>Khaliya Restaurant operates under Service Accounting Code <strong>SAC 996331</strong> (Services provided by Restaurants, Cafes, and eating joints with approved liquor and dining facilities).</p>

                    <h3>2. Goods & Services Tax (GST 5%)</h3>
                    <ul>
                        <li>All dining and food items are billed with <strong>5% GST (2.5% CGST + 2.5% SGST)</strong> as mandated by the Ministry of Finance, Government of India.</li>
                        <li>Food services are rendered without Input Tax Credit (ITC) as per CGST Notification No. 46/2017.</li>
                        <li>Our official GSTIN is <strong>09AAAAA0000A1Z5</strong>.</li>
                    </ul>

                    <h3>3. Digital PDF Invoices & Receipt Verification</h3>
                    <p>A digital GST-compliant invoice is generated for every completed transaction with a unique sequence number (e.g. <code>KHL-2026-000101</code>). Invoices can be verified anytime at <code>/bill/:billNo</code>.</p>
                </div>
            )
        },
        fssai: {
            title: "FSSAI Food Safety Declaration",
            subtitle: "Statutory Food Safety License & Hygiene Standards",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. FSSAI License Disclosures</h3>
                    <p>Khaliya Restaurant is licensed under the <strong>Food Safety and Standards Authority of India (FSSAI)</strong>:</p>
                    <div style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                        <strong style={{ color: '#2ECC71' }}>FSSAI Registration License Number: 12723000000000</strong><br />
                        <span style={{ fontSize: '0.88rem', color: '#CBD5E1' }}>Licensed Entity: Khaliya Hospitality Private Limited | Category: Food Services & Dining</span>
                    </div>

                    <h3>2. Food Safety & Hygiene Standards</h3>
                    <p>Our kitchens comply strictly with FSSAI Schedule 4 sanitary and hygienic requirements. Vegetables are ozone-washed, meats are temperature-certified, and culinary preparation is supervised by certified Master Chefs.</p>

                    <h3>3. Allergen Advisory</h3>
                    <p>Our dishes are crafted using traditional Indian spices and may contain or come into contact with <strong>dairy, nuts (cashews, almonds), peanuts, gluten, mustard, and sesame</strong>. Guests with severe allergies are requested to inform our team prior to ordering.</p>
                </div>
            )
        },
        corporate: {
            title: "Corporate Identity & Entity Ownership",
            subtitle: "Statutory Merchant Entity & Ownership Declaration",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Merchant Business Entity</h3>
                    <p>The platform, website, brand, and digital PWA <strong>Khaliya Restaurant</strong> are owned and operated by:</p>
                    <p><strong>Legal Company Name:</strong> Khaliya Hospitality Private Limited<br />
                    <strong>Corporate Identification Number (CIN):</strong> U55101UP2026PTC123456<br />
                    <strong>Date of Incorporation:</strong> January 15, 2026<br />
                    <strong>Registered Bank Account Name for Payouts:</strong> KHALIYA HOSPITALITY PRIVATE LIMITED</p>

                    <h3>2. Registered & Head Office Address</h3>
                    <p>Khaliya Hospitality Private Limited<br />
                    Plot No. 42, Royal Heritage Commercial Hub, Sector 18, Noida, Uttar Pradesh - 201301, India<br />
                    Email: <a href="mailto:contact@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>contact@khaliyarestaurant.com</a></p>
                </div>
            )
        },
        disclaimer: {
            title: "Disclaimer & Limitation of Liability",
            subtitle: "Legal Disclaimer & Service Warranty Exclusions",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>1. Website & PWA Warranty Disclaimer</h3>
                    <p>While Khaliya Restaurant strives to provide uninterrupted, 99.9% uptime for our digital ordering website and PWA, services are provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that internet connectivity or payment gateway API handshakes will be completely error-free.</p>

                    <h3>2. Allergen & Taste Preference Disclaimer</h3>
                    <p>Spiciness levels and taste profiles are prepared to authentic royal Indian standards. Guests are responsible for reviewing menu item descriptions and notifying staff of any dietary restrictions.</p>

                    <h3>3. Third-Party Links</h3>
                    <p>Our website may contain links to external payment gateways (Razorpay) or navigation maps. We are not responsible for the privacy practices or content of third-party domains.</p>
                </div>
            )
        },
        contact: {
            title: "Contact Us",
            subtitle: "Merchant Operating Details & Customer Support",
            lastUpdated: "September 6, 2026",
            content: (
                <div>
                    <h3>Merchant Business Details</h3>
                    <p><strong>Operating Legal Entity:</strong> Khaliya Hospitality Private Limited<br />
                    <strong>Brand Name:</strong> Khaliya Restaurant & Bar<br />
                    <strong>GSTIN:</strong> 09AAAAA0000A1Z5<br />
                    <strong>FSSAI License No:</strong> 12723000000000</p>

                    <h3>Registered & Operating Address</h3>
                    <p>Plot No. 42, Royal Heritage Commercial Hub, Sector 18, Noida, Uttar Pradesh - 201301, India</p>

                    <h3>Customer Support Contacts</h3>
                    <p><strong>Helpline Phone:</strong> +91 98765 43210 / +91 120 4567890<br />
                    <strong>Customer Support Email:</strong> <a href="mailto:support@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>support@khaliyarestaurant.com</a><br />
                    <strong>Refunds & Disputes Email:</strong> <a href="mailto:refunds@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>refunds@khaliyarestaurant.com</a><br />
                    <strong>Nodal Grievance Officer:</strong> <a href="mailto:grievance@khaliyarestaurant.com" style={{ color: '#D4AF37' }}>grievance@khaliyarestaurant.com</a></p>

                    <h3>Operating Hours</h3>
                    <p>Monday – Sunday: 11:00 AM – 11:30 PM IST</p>
                </div>
            )
        }
    };

    const current = policies[activePolicy] || policies.privacy;

    return (
        <div style={{ minHeight: '100vh', background: '#070A0E', color: '#FFF', padding: '120px 20px 80px 20px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', background: 'rgba(15, 20, 30, 0.92)', border: '1.5px solid rgba(212, 175, 55, 0.35)', borderRadius: '24px', padding: '40px 35px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                
                {/* Header Navigation Pills */}
                {/* Breadcrumb Navigation Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: '700' }}>Home</Link>
                    <span>/</span>
                    <span>Legal Disclosures</span>
                    <span>/</span>
                    <strong style={{ color: '#FFD700' }}>{current.title}</strong>
                </div>

                {/* Page Title */}
                <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '2.4rem', color: '#FFD700', marginBottom: '6px' }}>{current.title}</h1>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                    {current.subtitle} • <em>Effective Date: {current.lastUpdated}</em>
                </p>

                {/* Policy Content Body */}
                <div className="policy-body" style={{ color: '#CBD5E1', fontSize: '0.96rem', lineHeight: '1.8' }}>
                    {current.content}
                </div>

                {/* Bottom Navigation & Other Legal Documents Link Grid */}
                <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid rgba(212, 175, 55, 0.25)' }}>
                    <h4 style={{ color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: '1rem', marginBottom: '15px', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Other Statutory Legal Documents
                    </h4>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                        {Object.keys(policies).filter(k => k !== activePolicy).map(key => (
                            <Link
                                key={key}
                                to={`/${key === 'privacy' ? 'privacy-policy' : key === 'terms' ? 'terms-and-conditions' : key === 'refund' ? 'refund-policy' : key === 'shipping' ? 'shipping-policy' : key === 'grievance' ? 'grievance-redressal' : key === 'pricing' ? 'pricing-policy' : key === 'fssai' ? 'fssai-declaration' : key === 'corporate' ? 'corporate-info' : key === 'disclaimer' ? 'disclaimer' : 'contact'}`}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    color: '#CBD5E1',
                                    border: '1px solid rgba(212, 175, 55, 0.2)',
                                    padding: '7px 14px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '0.78rem',
                                    textDecoration: 'none'
                                }}
                            >
                                {policies[key].title} →
                            </Link>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/" style={{ color: '#D4AF37', fontWeight: '800', textDecoration: 'none', fontSize: '0.95rem' }}>← Return to Home Page</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
