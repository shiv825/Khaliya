import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer data-aos="fade-up" data-aos-duration="600">
            <h3>{t('common.name')}</h3>
            <p>{t('footer.since')}</p>
            <div className="social-links">
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook</a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            <div className="pwa-footer-install" style={{ margin: '2rem 0' }}>
                <button 
                    onClick={() => {
                        if (window.promptInstall) window.promptInstall();
                        else if (window.forceShowPwaBanner) window.forceShowPwaBanner();
                    }}
                    style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid var(--primary-color)',
                        color: 'var(--primary-color)',
                        padding: '12px 25px',
                        borderRadius: '30px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                    }}
                >
                    <i className="fas fa-mobile-alt"></i> Install Official App
                </button>
            </div>
            <div className="copyright">
                <p>&copy; 2026 <span>{t('common.name')}</span>. <span>{t('footer.rights')}</span></p>
            </div>
        </footer>
    );
}
