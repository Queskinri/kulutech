import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './KullaniciGiris.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const KullaniciGiris: React.FC = () => {
  const [kullaniciKodu, setKullaniciKodu] = useState('');
  const [hata, setHata] = useState('');
  const navigate = useNavigate();

  const girisYap = () => {
    // Backend'den ESP'nin var olup olmadığını kontrol et
    fetch(`${API_URL}/api/esp/${kullaniciKodu}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('ESP bulunamadı');
        }
      })
      .then(data => {
        // ESP ID'sini localStorage'a kaydet
        localStorage.setItem('espId', kullaniciKodu);
        navigate('/kullanici-panel');
      })
      .catch(err => {
        setHata('Hatalı kullanıcı kodu! Bu cihaz bulunamadı.');
        setTimeout(() => setHata(''), 3000);
      });
  };

  return (
    <div className="kullanici-giris-container">
      <div className="kullanici-giris-card">
        <h1>👤 Kullanıcı Girişi</h1>
        
        <div className="form-grup">
          <label>Kullanıcı Kodu</label>
          <input 
            type="text" 
            placeholder="............"
            value={kullaniciKodu}
            onChange={(e) => setKullaniciKodu(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && girisYap()}
          />
          {hata && <p className="hata-mesaj">{hata}</p>}
        </div>

        <div className="buton-grup">
          <button className="giris-btn" onClick={girisYap}>
            Giriş Yap
          </button>
          <button className="geri-btn" onClick={() => navigate('/')}>
            ← Geri
          </button>
        </div>
      </div>
    </div>
  );
};

export default KullaniciGiris;