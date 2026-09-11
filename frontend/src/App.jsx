import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Multi-Page System Imports
import PublicLayout from './pages/PublicLayout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ReservePage from './pages/ReservePage';
import TablesExplorePage from './pages/TablesExplorePage';
import ReviewsPublicPage from './pages/ReviewsPublicPage';
import LocationPage from './pages/LocationPage';
import BillVerificationPage from './pages/BillVerificationPage';
import PolicyPage from './pages/PolicyPage';
import CartPage from './pages/CartPage';

// Mobile PWA App Shell
import NativeAppShell from './components/native/NativeAppShell';
import NativeSplash from './components/native/NativeSplash';

// Subdomain-Ready Admin Module imports
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import ProductsPage from './admin/pages/ProductsPage';
import InventoryPage from './admin/pages/InventoryPage';
import OrdersPage from './admin/pages/OrdersPage';
import BookingsPage from './admin/pages/BookingsPage';
import ReviewsPage from './admin/pages/ReviewsPage';
import TablesPage from './admin/pages/TablesPage';
import QrManagementPage from './admin/pages/QrManagementPage';
import KitchenPage from './admin/pages/KitchenPage';
import BillingPage from './admin/pages/BillingPage';
import PrintersPage from './admin/pages/PrintersPage';
import StaffPage from './admin/pages/StaffPage';
import AuditLogsPage from './admin/pages/AuditLogsPage';

// Staff Portal Module Imports
import StaffLayout from './staff/StaffLayout';
import StaffLoginPage from './staff/pages/StaffLoginPage';
import WaiterDashboard from './staff/pages/WaiterDashboard';

import TableQrOrder from './components/TableQrOrder';

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
                {/* Mobile PWA Shell Routing */}
                {isAppMode ? (
                  <Route path="*" element={<NativeAppShell />} />
                ) : (
                  <>
                    {/* Public Multi-Page Routes */}
                    <Route path="/" element={<PublicLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="menu" element={<MenuPage />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="checkout" element={<CartPage />} />
                      <Route path="reserve" element={<ReservePage />} />
                      <Route path="tables" element={<TablesExplorePage />} />
                      <Route path="reviews" element={<ReviewsPublicPage />} />
                      <Route path="location" element={<LocationPage />} />

                      {/* Razorpay & Statutory Merchant Legal Routes (Dedicated Standalone Pages) */}
                      <Route path="policy/:policyType" element={<PolicyPage />} />
                      <Route path="privacy-policy" element={<PolicyPage defaultType="privacy" />} />
                      <Route path="terms-and-conditions" element={<PolicyPage defaultType="terms" />} />
                      <Route path="refund-policy" element={<PolicyPage defaultType="refund" />} />
                      <Route path="shipping-policy" element={<PolicyPage defaultType="shipping" />} />
                      <Route path="grievance-redressal" element={<PolicyPage defaultType="grievance" />} />
                      <Route path="pricing-policy" element={<PolicyPage defaultType="pricing" />} />
                      <Route path="fssai-declaration" element={<PolicyPage defaultType="fssai" />} />
                      <Route path="corporate-info" element={<PolicyPage defaultType="corporate" />} />
                      <Route path="disclaimer" element={<PolicyPage defaultType="disclaimer" />} />
                      <Route path="contact" element={<PolicyPage defaultType="contact" />} />
                    </Route>

                    {/* QR Code In-Restaurant Direct Order & Bill Verification */}
                    <Route path="/table/:tableId" element={<TableQrOrder />} />
                    <Route path="/bill/:billNo" element={<BillVerificationPage />} />

                    {/* Staff Portal Routes */}
                    <Route path="/staff/login" element={<StaffLoginPage />} />
                    <Route path="/staff" element={<StaffLayout />}>
                      <Route index element={<WaiterDashboard />} />
                      <Route path="waiter" element={<WaiterDashboard />} />
                      <Route path="kitchen" element={<KitchenPage />} />
                    </Route>

                    {/* Subdomain-Ready Admin Module Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="tables" element={<TablesPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="kitchen" element={<KitchenPage />} />
                      <Route path="billing" element={<BillingPage />} />
                      <Route path="printers" element={<PrintersPage />} />
                      <Route path="staff" element={<StaffPage />} />
                      <Route path="audit-logs" element={<AuditLogsPage />} />
                      <Route path="qr" element={<QrManagementPage />} />
                      <Route path="bookings" element={<BookingsPage />} />
                      <Route path="reviews" element={<ReviewsPage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                )}
              </Routes>
            </Router>
          )}
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
