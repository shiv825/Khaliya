import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import NativeAppShell from './components/native/NativeAppShell';
import NativeSplash from './components/native/NativeSplash';

// Standalone Subdomain-Ready Admin Module imports
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import ProductsPage from './admin/pages/ProductsPage';
import InventoryPage from './admin/pages/InventoryPage';
import OrdersPage from './admin/pages/OrdersPage';
import BookingsPage from './admin/pages/BookingsPage';
import ReviewsPage from './admin/pages/ReviewsPage';

import { useAppMode } from './hooks/useAppMode';
import { useDynamicTheme } from './hooks/useDynamicTheme';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './assets/style.css';
import './assets/ai-theme.css';

function App() {
  const isAppMode = useAppMode();
  const theme = useDynamicTheme();

  useEffect(() => {
    // Log visit
    const source = isAppMode ? 'App' : 'Website';
    const rawApiUrl = window.KHALIYA_API_URL || import.meta.env.VITE_API_URL || '';
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
    const API_URL = cleanApiUrl ? (cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`) : '/api';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    fetch(`${API_URL}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
      signal: controller.signal
    }).catch(() => {}).finally(() => clearTimeout(timeoutId));

    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      easing: 'ease-out',
      disable: 'mobile' 
    });
  }, [isAppMode]);

  const [showSplash, setShowSplash] = React.useState(isAppMode);

  return (
    <LanguageProvider>
      <CartProvider>
        <div className={`app-theme-${theme}`}>
          {isAppMode && showSplash ? (
            <NativeSplash onAnimationComplete={() => setShowSplash(false)} />
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={isAppMode ? <NativeAppShell /> : <Home />} />

                {/* Subdomain-Ready Admin Module Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={isAppMode ? <NativeAppShell /> : <Home />} />
              </Routes>
            </Router>
          )}
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
