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
            <div className="copyright">
                <p>&copy; 2024 <span>{t('common.name')}</span>. <span>{t('footer.rights')}</span></p>
            </div>
        </footer>
    );
}
