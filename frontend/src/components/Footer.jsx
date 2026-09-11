import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (sectionName) => {
        setOpenSection(prev => prev === sectionName ? null : sectionName);
    };

    return (
        <footer 
            style={{ 
                background: 'linear-gradient(180deg, #070A0E 0%, #030508 100%)', 
                padding: '5rem 2rem 2.5rem 2rem', 
                color: '#CBD5E1',
                borderTop: '1.5px solid rgba(212, 175, 55, 0.35)', 
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {/* Top Metallic Gold Filigree Divider Bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 15%, #FFD700 50%, rgba(212, 175, 55, 0.2) 85%, transparent 100%)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
            }} />

            {/* Main Footer Multi-Column Grid */}
            <div className="footer-main-grid" style={{
                maxWidth: '1280px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '40px',
                marginBottom: '4rem',
                textAlign: 'left'
            }}>

                {/* Column 1: Merchant & Legal Entity Info */}
                <div>
                    {/* Brand Logo & Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.2rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            border: '1.5px solid rgba(212, 175, 55, 0.6)',
                            boxShadow: '0 0 25px rgba(212, 175, 55, 0.35)',
                            background: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <img 
                                src="/khaliya-logo.jpg" 
                                alt="Khaliya Logo" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div style={{ 
                                fontFamily: "'Cinzel', 'Playfair Display', serif",
                                background: 'linear-gradient(135deg, #FFF5C0 0%, #FFD700 40%, #D4AF37 80%, #AA7C11 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '1.8rem',
                                fontWeight: '800',
                                letterSpacing: '2px',
                                lineHeight: '1'
                            }}>
                                KHALIYA
                            </div>
                            <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '3px' }}>
                                ROYAL INDIAN CUISINE
                            </div>
                        </div>
                    </div>

                    <p className="footer-brand-desc" style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '1.2rem' }}>
                        Experience the grandeur of authentic royal Indian dining — Dum-Pukht biryanis, coal-fired tandoori sizzlers, and heritage royal hospitality.
                    </p>

                    {/* Merchant Corporate Info Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                        <span style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', color: '#D4AF37', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                            <i className="fas fa-certificate" style={{ marginRight: '5px' }}></i> FSSAI: 12723000000000
                        </span>
                        <span style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', color: '#D4AF37', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                            <i className="fas fa-receipt" style={{ marginRight: '5px' }}></i> GSTIN: 09AAAAA0000A1Z5
                        </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5' }}>
                        Operated by: <strong style={{ color: '#CBD5E1' }}>Khaliya Hospitality Private Limited</strong>
                    </div>
                </div>

                {/* Column 2: Quick Navigation Links */}
                <div>
                    <h4 
                        className="footer-column-title"
                        onClick={() => toggleSection('explore')}
                        style={{ color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: '1.1rem', marginBottom: '1.4rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    >
                        <span>Quick Explore</span>
                        <i className={`fas fa-chevron-${openSection === 'explore' ? 'up' : 'down'} accordion-arrow`}></i>
                    </h4>
                    <div className={`footer-column-content ${openSection === 'explore' ? 'open' : ''}`}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                            <li>
                                <Link to="/" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#D4AF37', marginRight: '8px' }}></i> Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/menu" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#D4AF37', marginRight: '8px' }}></i> Signature Menu
                                </Link>
                            </li>
                            <li>
                                <Link to="/reserve" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#D4AF37', marginRight: '8px' }}></i> Book a Table
                                </Link>
                            </li>
                            <li>
                                <Link to="/tables" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#D4AF37', marginRight: '8px' }}></i> Dining Spaces
                                </Link>
                            </li>
                            <li>
                                <Link to="/reviews" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#D4AF37', marginRight: '8px' }}></i> Guest Reviews
                                </Link>
                            </li>
                            <li>
                                <Link to="/location" style={{ color: '#CBD5E1', textDecoration: 'none' }}>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#D4AF37', marginRight: '8px' }}></i> Location & Distance
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Column 3: Razorpay Consumer Policies */}
                <div>
                    <h4 
                        className="footer-column-title"
                        onClick={() => toggleSection('policies')}
                        style={{ color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: '1.1rem', marginBottom: '1.4rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    >
                        <span>Merchant Policies</span>
                        <i className={`fas fa-chevron-${openSection === 'policies' ? 'up' : 'down'} accordion-arrow`}></i>
                    </h4>
                    <div className={`footer-column-content ${openSection === 'policies' ? 'open' : ''}`}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                            <li>
                                <Link to="/privacy-policy" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-user-shield" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-and-conditions" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-file-contract" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-undo-alt" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Refund & Cancellation
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping-policy" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-truck" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Shipping & Fulfillment
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-headset" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Contact Us & Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Column 4: Statutory Legal & Regulatory Disclosures */}
                <div>
                    <h4 
                        className="footer-column-title"
                        onClick={() => toggleSection('statutory')}
                        style={{ color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: '1.1rem', marginBottom: '1.4rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    >
                        <span>Statutory Disclosures</span>
                        <i className={`fas fa-chevron-${openSection === 'statutory' ? 'up' : 'down'} accordion-arrow`}></i>
                    </h4>
                    <div className={`footer-column-content ${openSection === 'statutory' ? 'open' : ''}`}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                            <li>
                                <Link to="/grievance-redressal" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-balance-scale" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Grievance Officer (IT Act)
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing-policy" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-percentage" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Pricing & GST (SAC 996331)
                                </Link>
                            </li>
                            <li>
                                <Link to="/fssai-declaration" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-utensils" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> FSSAI Food Hygiene
                                </Link>
                            </li>
                            <li>
                                <Link to="/corporate-info" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-building" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Merchant Corporate Entity
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
                                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '0.78rem', color: '#D4AF37', marginRight: '8px' }}></i> Disclaimer & Allergens
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            {/* Razorpay Payment Security & Accepted Payment Badges Banner */}
            <div className="footer-security-banner" style={{
                maxWidth: '1280px',
                margin: '0 auto 2.5rem auto',
                background: 'rgba(15, 20, 30, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '16px',
                padding: '20px 25px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-lock" style={{ color: '#2ECC71' }}></i> 100% Secure Payments via Razorpay
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '3px' }}>
                        PCI-DSS Level 1 Encrypted Payment Gateway • Accepts All Major Indian Payment Methods
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <span style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#FFF' }}>
                        <i className="fas fa-qrcode" style={{ color: '#5F259F', marginRight: '6px' }}></i> UPI (GPay • PhonePe • Paytm)
                    </span>
                    <span style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#FFF' }}>
                        <i className="fas fa-credit-card" style={{ color: '#1A1F71', marginRight: '6px' }}></i> Visa • Mastercard • RuPay
                    </span>
                    <span style={{ background: 'linear-gradient(135deg, #0C2340 0%, #1A365D 100%)', border: '1px solid #3182CE', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', color: '#63B3ED' }}>
                        ⚡ Razorpay Secured
                    </span>
                </div>
            </div>

            {/* Social Links & PWA App Installation */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <a href="https://www.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>Facebook</a>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                    <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>Instagram</a>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                    <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>WhatsApp</a>
                </div>

                <button 
                    onClick={() => {
                        if (window.promptInstall) window.promptInstall();
                        else if (window.forceShowPwaBanner) window.forceShowPwaBanner();
                    }}
                    style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1.5px solid #D4AF37',
                        color: '#FFD700',
                        padding: '10px 22px',
                        borderRadius: '50px',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                    }}
                >
                    <i className="fas fa-mobile-alt" style={{ marginRight: '8px' }}></i> Install Official Khaliya PWA App
                </button>
            </div>

            {/* Copyright & Legal Bar */}
            <div className="copyright" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.8rem' }}>
                <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0, lineHeight: '1.6' }}>
                    &copy; 2026 <strong style={{ color: '#D4AF37' }}>Khaliya Hospitality Private Limited</strong>. All Rights Reserved.<br />
                    Approved Razorpay Merchant Partner.
                </p>
            </div>
        </footer>
    );
}
