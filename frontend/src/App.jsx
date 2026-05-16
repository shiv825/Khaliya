import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import NativeAppShell from './components/native/NativeAppShell';
import NativeSplash from './components/native/NativeSplash';
import { useAppMode } from './hooks/useAppMode';
import { useDynamicTheme } from './hooks/useDynamicTheme';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './assets/style.css';
import './assets/ai-theme.css';
import './assets/loyalty.css';

function App() {
  const isAppMode = useAppMode();
  const theme = useDynamicTheme();

  const [isAdminAuth, setIsAdminAuth] = React.useState(
    sessionStorage.getItem('adminLoggedIn') === 'true'
  );

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      easing: 'ease-out',
      disable: 'mobile' 
    });
  }, []);

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
                <Route path="/admin" element={<AdminLogin onLogin={setIsAdminAuth} />} />
                <Route path="/admin/dashboard" element={isAdminAuth ? <AdminDashboard onLogout={setIsAdminAuth} /> : <AdminLogin onLogin={setIsAdminAuth} />} />
                {/* Fallback for deep links or broken routes */}
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
