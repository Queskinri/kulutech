import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminGiris.css';

const AdminGiris: React.FC = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const navigate = useNavigate();

  const girisYap = () => {
    if (!kullaniciAdi || !sifre) {
      setHata('Lütfen tüm alanları doldurun!');
      setTimeout(() => setHata(''), 3000);
      return;
    }

    // Backend'e giriş isteği gönder
    fetch('http://localhost:5001/api/admin/giris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kullaniciAdi, sifre })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('adminToken', 'logged-in');
          localStorage.setItem('adminKullanici', data.kullaniciAdi);
          navigate('/admin-panel');
        } else {
          setHata(data.message);
          setTimeout(() => setHata(''), 3000);
        }
      })
      .catch(err => {
        console.error('Giriş hatası:', err);
        setHata('Bağlantı hatası!');
        setTimeout(() => setHata(''), 3000);
      });
  };

  return (
    <div className="admin-giris-container">
      <div className="admin-giris-card">
        <h1>🔐 Admin Girişi</h1>
        
        <div className="form-grup">
          <label>Kullanıcı Adı</label>
          <input 
            type="text" 
            placeholder="admin"
            value={kullaniciAdi}
            onChange={(e) => setKullaniciAdi(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && girisYap()}
          />
        </div>

        <div className="form-grup">
          <label>Şifre</label>
          <input 
            type="password" 
            placeholder="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
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

export default AdminGiris;