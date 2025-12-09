import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GirisSayfasi.css';

const GirisSayfasi: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="giris-container">
      <div className="giris-card">
        <h1>🎛️ KuluTech</h1>
        <p>Hoş Geldiniz</p>
        
        <div className="buton-grup">
          <button 
            className="giris-buton kullanici"
            onClick={() => navigate('/kullanici-giris')}
          >
            👤 Kullanıcı Girişi
          </button>
          
          <button 
            className="giris-buton admin"
            onClick={() => navigate('/admin-giris')}
          >
            🔐 Admin Girişi
          </button>
        </div>
      </div>
    </div>
  );
};

export default GirisSayfasi;