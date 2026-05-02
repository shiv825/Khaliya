import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { i18nData } from './i18nData'

// Expose translations for the PWA manager
window.KHALIYA_i18n = i18nData;

console.log('🔰 [System] Initializing React Root...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  const msg = '❌ [System] Fatal: #root element not found in DOM';
  console.error(msg);
  if (window.showKhaliyaDiag) {
    window.showKhaliyaDiag('DOM Error', 'The mount point (#root) was not found. Please check index.html.');
  }
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('✅ [System] Application mount initiated');
  } catch (err) {
    console.error('❌ [System] Fatal error during mount:', err);
    if (window.showKhaliyaDiag) {
      window.showKhaliyaDiag('React Mount Error', err.message + '\n' + (err.stack || ''));
    }
  }
}
