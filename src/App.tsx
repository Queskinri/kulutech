import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GirisSayfasi from './pages/GirisSayfasi';
import KullaniciGiris from './pages/KullaniciGiris';
import KullaniciPanel from './pages/KullaniciPanel';
import AdminGiris from './pages/AdminGiris';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GirisSayfasi />} />
        <Route path="/kullanici-giris" element={<KullaniciGiris />} />
        <Route path="/kullanici-panel" element={<KullaniciPanel />} />
        <Route path="/admin-giris" element={<AdminGiris />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;