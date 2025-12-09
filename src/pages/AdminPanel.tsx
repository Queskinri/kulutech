import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface ESP {
  id: string;
  isim: string;
  mevcutSicaklik: number;
  mevcutNem: number;
  hedefSicaklik: number;
  hedefNem: number;
  uyariMesaji: string;
  olusturanAdmin: string;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
}

const AdminPanel: React.FC = () => {
  const [espList, setEspList] = useState<ESP[]>([]);
  const [siralama, setSiralama] = useState<'tarih-yeni' | 'tarih-eski' | 'id-az' | 'id-za'>('tarih-yeni');
  const [aramaMetni, setAramaMetni] = useState('');
  const [yeniEspId, setYeniEspId] = useState('');
  const [yeniEspIsim, setYeniEspIsim] = useState('');
  const [seciliEsp, setSeciliEsp] = useState<string | null>(null);
  const [yeniSicaklik, setYeniSicaklik] = useState('');
  const [yeniNem, setYeniNem] = useState('');
  const [yeniUyariMesaji, setYeniUyariMesaji] = useState('');
  const navigate = useNavigate();

  // Admin kontrolü
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-giris');
    }
  }, [navigate]);

  // ESP'leri backend'den çek
  useEffect(() => {
    veriCek();
    const interval = setInterval(veriCek, 5000);
    return () => clearInterval(interval);
  }, [siralama]);

  const veriCek = () => {
    fetch(`${API_URL}/api/esp/list?siralama=${siralama}`)
      .then(res => res.json())
      .then(data => setEspList(data))
      .catch(err => console.error('ESP listesi çekme hatası:', err));
  };

  // ESP'leri filtrele (arama)
  const filtrelenmisEspList = espList.filter(esp => {
    if (!aramaMetni) return true;
    const arama = aramaMetni.toLowerCase();
    return (
      esp.id.toLowerCase().includes(arama) ||
      esp.isim.toLowerCase().includes(arama)
    );
  });

  // Yeni ESP ekle
  const espEkle = () => {
    if (yeniEspId && yeniEspIsim) {
      const adminKullanici = localStorage.getItem('adminKullanici') || 'bilinmiyor';
      
      fetch(`${API_URL}/api/esp/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: yeniEspId, 
          isim: yeniEspIsim,
          olusturanAdmin: adminKullanici
        })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.message || 'ESP eklenirken hata oluştu');
            });
          }
          return res.json();
        })
        .then(data => {
          setEspList([...espList, data.esp]);
          setYeniEspId('');
          setYeniEspIsim('');
          alert('✅ ESP başarıyla eklendi!');
        })
        .catch(err => {
          console.error('ESP ekleme hatası:', err);
          alert(`❌ Hata: ${err.message}`);
        });
    } else {
      alert('⚠️ Lütfen tüm alanları doldurun!');
    }
  };

  // ESP sil
  const espSil = (espId: string) => {
    if (window.confirm('Bu ESP\'yi silmek istediğinize emin misiniz?')) {
      fetch(`${API_URL}/api/esp/delete/${espId}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          setEspList(espList.filter(esp => esp.id !== espId));
          alert('✅ ESP silindi!');
        })
        .catch(err => console.error('ESP silme hatası:', err));
    }
  };

  // ESP hedef değerlerini ve uyarı mesajını güncelle
  const espGuncelle = () => {
    if (seciliEsp && yeniSicaklik && yeniNem) {
      fetch(`${API_URL}/api/esp/update-hedef/${seciliEsp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hedefSicaklik: parseFloat(yeniSicaklik), 
          hedefNem: parseFloat(yeniNem) 
        })
      })
        .then(res => res.json())
        .then(data => {
          return fetch(`${API_URL}/api/esp/update-mevcut/${seciliEsp}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              mevcutSicaklik: data.esp.mevcutSicaklik,
              mevcutNem: data.esp.mevcutNem,
              uyariMesaji: yeniUyariMesaji
            })
          });
        })
        .then(res => res.json())
        .then(data => {
          setEspList(espList.map(esp => 
            esp.id === seciliEsp ? data.esp : esp
          ));
          setYeniSicaklik('');
          setYeniNem('');
          setYeniUyariMesaji('');
          setSeciliEsp(null);
          alert('✅ Hedef değerler ve uyarı mesajı güncellendi!');
        })
        .catch(err => console.error('ESP güncelleme hatası:', err));
    } else {
      alert('⚠️ Lütfen ESP seçin ve değerleri girin!');
    }
  };

  const cikisYap = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
  <div className="admin-panel-container">
    <div className="admin-header">
      <div>
        <h1>⚙️ Admin Paneli - ESP Yönetimi</h1>
        <p className="admin-kullanici">
          👤 Giriş yapan: <strong>{localStorage.getItem('adminKullanici') || 'Admin'}</strong>
        </p>
      </div>
      <button className="cikis-btn" onClick={cikisYap}>
        Çıkış Yap
      </button>
    </div>

    <div className="admin-content">
      {/* Yeni ESP Ekle */}
      <div className="esp-ekle-card">
        <h2>➕ Yeni ESP Ekle</h2>
        <p className="bilgi-text">
          Yeni ESP oluşturulduğunda: Mevcut değerler 0°C / 0%, Hedef değerler 37.7°C / 57%
        </p>
        <div className="form-grid">
          <div className="form-grup">
            <label>ESP ID</label>
            <input 
              type="text" 
              placeholder="esp10018"
              value={yeniEspId}
              onChange={(e) => setYeniEspId(e.target.value)}
            />
          </div>
          <div className="form-grup">
            <label>ESP İsmi</label>
            <input 
              type="text" 
              placeholder="Mutfak"
              value={yeniEspIsim}
              onChange={(e) => setYeniEspIsim(e.target.value)}
            />
          </div>
        </div>
        <button className="ekle-btn" onClick={espEkle}>
          ESP Ekle
        </button>
      </div>

      {/* ESP HEDEF GÜNCELLE */}
      {seciliEsp && (
        <div className="esp-guncelle-card">
          <h2>🎯 Hedef Değerleri Düzenle: {espList.find(e => e.id === seciliEsp)?.isim}</h2>
          
          <p className="tip-aciklama">
            🎯 ESP cihazının ulaşması gereken hedef değerleri ve uyarı mesajını düzenleyin. Mevcut değerler ESP cihazından otomatik olarak gelir.
          </p>

          <div className="form-grid">
            <div className="form-grup">
              <label>Hedef Sıcaklık (°C)</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="37.7"
                value={yeniSicaklik}
                onChange={(e) => setYeniSicaklik(e.target.value)}
              />
            </div>
            <div className="form-grup">
              <label>Hedef Nem (%)</label>
              <input 
                type="number" 
                placeholder="57"
                value={yeniNem}
                onChange={(e) => setYeniNem(e.target.value)}
              />
            </div>
            
            <div className="form-grup" style={{gridColumn: '1 / -1'}}>
              <label>Uyarı Mesajı (Opsiyonel)</label>
              <input 
                type="text" 
                placeholder="Örn: Sıcaklık çok yüksek!"
                value={yeniUyariMesaji}
                onChange={(e) => setYeniUyariMesaji(e.target.value)}
              />
              <small style={{color: '#666', fontSize: '0.85rem', marginTop: '0.3rem', display: 'block'}}>
                Bu mesaj kullanıcı panelinde görüntülenecektir.
              </small>
            </div>
          </div>
          
          <div className="guncelle-butonlar">
            <button className="guncelle-btn" onClick={espGuncelle}>
              ✅ Güncelle
            </button>
            <button className="iptal-btn" onClick={() => {
              setSeciliEsp(null);
              setYeniSicaklik('');
              setYeniNem('');
              setYeniUyariMesaji('');
            }}>
              ❌ İptal
            </button>
          </div>
        </div>
      )}

      {/* ESP Listesi */}
      <div className="esp-liste-card">
        <div className="liste-header">
          <h2>📋 ESP Cihazları ({filtrelenmisEspList.length} / {espList.length})</h2>
          
          <div className="liste-kontroller">
            <div className="arama-kutusu">
              <input
                type="text"
                placeholder="🔍 ESP ID veya İsim ara..."
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
              />
              {aramaMetni && (
                <button 
                  className="temizle-btn"
                  onClick={() => setAramaMetni('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="siralama-dropdown">
              <label>Sıralama:</label>
              <select 
                value={siralama} 
                onChange={(e) => setSiralama(e.target.value as any)}
              >
                <option value="tarih-yeni">📅 Tarih (Yeni → Eski)</option>
                <option value="tarih-eski">📅 Tarih (Eski → Yeni)</option>
                <option value="id-az">🔤 ID (A → Z)</option>
                <option value="id-za">🔤 ID (Z → A)</option>
              </select>
            </div>
          </div>
        </div>

        {filtrelenmisEspList.length === 0 ? (
          <p className="bos-mesaj">
            {aramaMetni 
              ? `"${aramaMetni}" için sonuç bulunamadı.`
              : 'Henüz ESP eklenmemiş.'
            }
          </p>
        ) : (
          <div className="esp-grid">
            {filtrelenmisEspList.map(esp => (
              <div key={esp.id} className="esp-kart">
                <div className="esp-header-kart">
                  <h3>{esp.isim}</h3>
                  <span className="esp-id">{esp.id}</span>
                </div>
                
                <div className="esp-durum mevcut">
                  <h4>📊 Mevcut (ESP'den Gelen)</h4>
                  <div className="esp-veriler">
                    <div className="veri-item">
                      <span className="ikon">🌡️</span>
                      <span className="deger">{esp.mevcutSicaklik}°C</span>
                    </div>
                    <div className="veri-item">
                      <span className="ikon">💧</span>
                      <span className="deger">{esp.mevcutNem}%</span>
                    </div>
                  </div>
                </div>

                <div className="esp-durum hedef">
                  <h4>🎯 Hedef (ESP'ye Gidecek)</h4>
                  <div className="esp-veriler">
                    <div className="veri-item">
                      <span className="ikon">🌡️</span>
                      <span className="deger">{esp.hedefSicaklik}°C</span>
                    </div>
                    <div className="veri-item">
                      <span className="ikon">💧</span>
                      <span className="deger">{esp.hedefNem}%</span>
                    </div>
                  </div>
                </div>

                {esp.uyariMesaji && (
                  <div className="esp-uyari">
                    <span className="uyari-ikon">⚠️</span>
                    <span className="uyari-text">{esp.uyariMesaji}</span>
                  </div>
                )}

                <div className="tarih-bilgi">
                  <span>👤 Oluşturan: <strong>{esp.olusturanAdmin}</strong></span>
                  <span>🕒 Oluşturma: {new Date(esp.olusturmaTarihi).toLocaleString('tr-TR')}</span>
                  <span>🔄 Güncelleme: {new Date(esp.guncellemeTarihi).toLocaleString('tr-TR')}</span>
                </div>

                <div className="esp-butonlar">
                  <button 
                    className="duzenle-btn"
                    onClick={() => {
                      setSeciliEsp(esp.id);
                      setYeniSicaklik(esp.hedefSicaklik.toString());
                      setYeniNem(esp.hedefNem.toString());
                      setYeniUyariMesaji(esp.uyariMesaji || '');
                    }}
                  >
                    ✏️ Hedefi Düzenle
                  </button>
                  <button 
                    className="sil-btn"
                    onClick={() => espSil(esp.id)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default AdminPanel;