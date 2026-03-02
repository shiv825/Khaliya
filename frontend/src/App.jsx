import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { LanguageProvider } from './context/LanguageContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './assets/style.css';
import './assets/ai-theme.css';
import './assets/loyalty.css';

function App() {
  const [isAdminAuth, setIsAdminAuth] = React.useState(
    sessionStorage.getItem('adminLoggedIn') === 'true'
  );
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      offset: 120,
      easing: 'ease-in-out'
    });
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLogin onLogin={setIsAdminAuth} />} />
          <Route path="/admin/dashboard" element={isAdminAuth ? <AdminDashboard onLogout={setIsAdminAuth} /> : <AdminLogin onLogin={setIsAdminAuth} />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
