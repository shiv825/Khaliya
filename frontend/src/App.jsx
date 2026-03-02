import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import { LanguageProvider } from './context/LanguageContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './assets/style.css';
import './assets/ai-theme.css';
import './assets/loyalty.css';

function App() {
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
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
