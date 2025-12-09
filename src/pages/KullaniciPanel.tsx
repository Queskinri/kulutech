import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KullaniciPanel.css';

// Fotoları require ile import et
const bildircinImg = require('../photo/bildircin.png');
const ordekImg = require('../photo/ordek.png');
const tavukImg = require('../photo/tavuk.png');

interface ESPData {
  id: string;
  isim: string;
  mevcutSicaklik: number;
  mevcutNem: number;
  hedefSicaklik: number;
  hedefNem: number;
  uyariMesaji: string;
  guncellemeTarihi: string;
}

interface HayvanTip {
  isim: string;
  sicaklik: number;
  nem: number;
  foto: any;
}

const hayvanlar: HayvanTip[] = [
  { isim: 'Tavuk', sicaklik: 37.5, nem: 55, foto: tavukImg },
  { isim: 'Bıldırcın', sicaklik: 37, nem: 56, foto: bildircinImg },
  { isim: 'Ördek', sicaklik: 37, nem: 57, foto: ordekImg }
];

const KullaniciPanel: React.FC = () => {
  const [veri, setVeri] = useState<ESPData>({
    id: '',
    isim: '',
    mevcutSicaklik: 0,
    mevcutNem: 0,
    hedefSicaklik: 0,
    hedefNem: 0,
    uyariMesaji: '',
    guncellemeTarihi: new Date().toLocaleString('tr-TR')
  });
  
  const [yeniHedefSicaklik, setYeniHedefSicaklik] = useState('');
  const [yeniHedefNem, setYeniHedefNem] = useState('');
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliHayvan, setSeciliHayvan] = useState<HayvanTip | null>(null);
  const navigate = useNavigate();

  // Giriş kontrolü ve veri çekme
  useEffect(() => {
    const espId = localStorage.getItem('espId');
    
    if (!espId) {
      navigate('/kullanici-giris');
      return;
    }

    veriCek(espId);
    
    // Her 5 saniyede bir verileri güncelle
    const interval = setInterval(() => veriCek(espId), 5000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const veriCek = (espId: string) => {
    fetch(`http://localhost:5001/api/esp/${espId}`)
      .then(res => res.json())
      .then(data => {
        setVeri({
          id: data.id,
          isim: data.isim,
          mevcutSicaklik: data.mevcutSicaklik,
          mevcutNem: data.mevcutNem,
          hedefSicaklik: data.hedefSicaklik,
          hedefNem: data.hedefNem,
          uyariMesaji: data.uyariMesaji || '',
          guncellemeTarihi: new Date(data.guncellemeTarihi).toLocaleString('tr-TR')
        });
      })
      .catch(err => console.error('Veri çekme hatası:', err));
  };

  const hedefGuncelle = () => {
    const espId = localStorage.getItem('espId');
    
    if (yeniHedefSicaklik && yeniHedefNem && espId) {
      fetch(`http://localhost:5001/api/esp/update-hedef/${espId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hedefSicaklik: parseFloat(yeniHedefSicaklik), 
          hedefNem: parseFloat(yeniHedefNem) 
        })
      })
        .then(res => res.json())
        .then(data => {
          setVeri({
            ...veri,
            hedefSicaklik: parseFloat(yeniHedefSicaklik),
            hedefNem: parseFloat(yeniHedefNem),
            guncellemeTarihi: new Date().toLocaleString('tr-TR')
          });
          alert('✅ Hedef değerler güncellendi!');
          setYeniHedefSicaklik('');
          setYeniHedefNem('');
        })
        .catch(err => {
          console.error('Veri gönderme hatası:', err);
          alert('❌ Hata oluştu!');
        });
    } else {
      alert('⚠️ Lütfen tüm alanları doldurun!');
    }
  };

  // Modal aç
  const otomatikModalAc = () => {
    setModalAcik(true);
    setSeciliHayvan(null);
  };

  // Hayvan seç
  const hayvanSec = (hayvan: HayvanTip) => {
    setSeciliHayvan(hayvan);
  };

  // Seçili hayvanı uygula
  const seciliHayvaniUygula = () => {
    if (seciliHayvan) {
      setYeniHedefSicaklik(seciliHayvan.sicaklik.toString());
      setYeniHedefNem(seciliHayvan.nem.toString());
      setModalAcik(false);
      setSeciliHayvan(null);
    } else {
      alert('⚠️ Lütfen bir hayvan seçin!');
    }
  };

  const cikisYap = () => {
    localStorage.removeItem('espId');
    navigate('/');
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h1>🌡️ {veri.isim} Paneli</h1>
        <div className="header-info">
          <span className="esp-id-badge">{veri.id}</span>
          <button className="cikis-btn" onClick={cikisYap}>
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* MEVCUT DURUM */}
        <div className="durum-card mevcut">
          <h2>📊 Mevcut Durum (Cihazdan Gelen)</h2>
          <p className="aciklama">Cihazdan gelen gerçek zamanlı veriler</p>
          
          <div className="veri-kartlari">
            <div className="veri-kart sicaklik">
              <div className="ikon">🌡️</div>
              <div className="deger">{veri.mevcutSicaklik}°C</div>
              <div className="etiket">Sıcaklık</div>
            </div>

            <div className="veri-kart nem">
              <div className="ikon">💧</div>
              <div className="deger">{veri.mevcutNem}%</div>
              <div className="etiket">Nem</div>
            </div>
          </div>
        </div>

        {/* UYARI MESAJI */}
        {veri.uyariMesaji && (
          <div className="uyari-card">
            <div className="uyari-header">
              <span className="uyari-ikon">⚠️</span>
              <h3>ESP Uyarı Mesajı</h3>
            </div>
            <p className="uyari-mesaj">{veri.uyariMesaji}</p>
          </div>
        )}

        {/* HEDEF DURUM */}
        <div className="durum-card hedef">
          <h2>🎯 Hedef Durum (Cihaza Gönderilecek)</h2>
          <p className="aciklama">Cihazının ulaşması gereken hedef değerler</p>
          
          <div className="veri-kartlari">
            <div className="veri-kart sicaklik">
              <div className="ikon">🌡️</div>
              <div className="deger">{veri.hedefSicaklik}°C</div>
              <div className="etiket">Hedef Sıcaklık</div>
            </div>

            <div className="veri-kart nem">
              <div className="ikon">💧</div>
              <div className="deger">{veri.hedefNem}%</div>
              <div className="etiket">Hedef Nem</div>
            </div>
          </div>

          {/* FORM */}
          <div className="hedef-form">
            <h3>Hedefi Değiştir</h3>
            
            <div className="form-container">
              <div className="form-inputs">
                <div className="form-grup-kucuk">
                  <label>Sıcaklık (°C)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="37.5"
                    value={yeniHedefSicaklik}
                    onChange={(e) => setYeniHedefSicaklik(e.target.value)}
                  />
                </div>

                <div className="form-grup-kucuk">
                  <label>Nem (%)</label>
                  <input 
                    type="number" 
                    placeholder="55"
                    value={yeniHedefNem}
                    onChange={(e) => setYeniHedefNem(e.target.value)}
                  />
                </div>
              </div>

              <button className="otomatik-btn" onClick={otomatikModalAc}>
                🎯 Otomatik
              </button>
            </div>

            <button className="guncelle-btn" onClick={hedefGuncelle}>
              ✅ Hedefi Güncelle
            </button>
          </div>
        </div>

        <p className="guncelleme-tarihi">
          Son Güncelleme: {veri.guncellemeTarihi}
        </p>
      </div>

      {/* HAYVAN SEÇİM MODALI */}
      {modalAcik && (
        <div className="modal-overlay" onClick={() => setModalAcik(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🐔 Hayvan Türü Seçin</h2>
              <button className="modal-kapat" onClick={() => setModalAcik(false)}>
                ✕
              </button>
            </div>

            <div className="hayvan-grid">
              {hayvanlar.map((hayvan, index) => (
                <div 
                  key={index}
                  className={`hayvan-kart-modal ${seciliHayvan?.isim === hayvan.isim ? 'secili' : ''}`}
                  onClick={() => hayvanSec(hayvan)}
                >
                  <img 
                    src={hayvan.foto} 
                    alt={hayvan.isim}
                    className="hayvan-foto"
                  />
                  <h3>{hayvan.isim}</h3>
                  <p className="hayvan-degerler">
                    🌡️ {hayvan.sicaklik}°C<br/>
                    💧 {hayvan.nem}%
                  </p>
                  {seciliHayvan?.isim === hayvan.isim && (
                    <div className="secim-badge">✓ Seçildi</div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-butonlar">
              <button 
                className="uygula-btn" 
                onClick={seciliHayvaniUygula}
                disabled={!seciliHayvan}
              >
                ✅ Uygula
              </button>
              <button className="iptal-btn" onClick={() => setModalAcik(false)}>
                ❌ İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KullaniciPanel;