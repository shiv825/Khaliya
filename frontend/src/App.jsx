import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import NativeAppShell from './components/native/NativeAppShell';
import { useAppMode } from './hooks/useAppMode';
import { LanguageProvider } from './context/LanguageContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './assets/style.css';
import './assets/ai-theme.css';
import './assets/loyalty.css';

function App() {
  const isAppMode = useAppMode();

  const [isAdminAuth, setIsAdminAuth] = React.useState(
    sessionStorage.getItem('adminLoggedIn') === 'true'
  );
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      easing: 'ease-out',
      disable: 'mobile' // Completely disable AOS on small devices for maximum speed
    });
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={isAppMode ? <NativeAppShell /> : <Home />} />
          <Route path="/admin" element={<AdminLogin onLogin={setIsAdminAuth} />} />
          <Route path="/admin/dashboard" element={isAdminAuth ? <AdminDashboard onLogout={setIsAdminAuth} /> : <AdminLogin onLogin={setIsAdminAuth} />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
