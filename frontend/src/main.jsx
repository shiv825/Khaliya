import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { i18nData } from './i18nData'

// Expose translations for the PWA manager
window.KHALIYA_i18n = i18nData;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
