const express = require('express');
const cors = require('cors');
const { query, pool } = require('./db');
require('dotenv').config();

const app = express();

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Admin listesi
const adminList = [
  { kullaniciAdi: 'harun', sifre: 'harun8080' },
  { kullaniciAdi: 'serdar', sifre: 'serdar8080' },
  { kullaniciAdi: 'zeynel', sifre: 'zeynel4646' }
];

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend çalışıyor!', database: 'PostgreSQL' });
});

// ==================== ADMİN GİRİŞİ ====================

app.post('/api/admin/giris', (req, res) => {
  const { kullaniciAdi, sifre } = req.body;
  
  const admin = adminList.find(
    a => a.kullaniciAdi === kullaniciAdi && a.sifre === sifre
  );
  
  if (admin) {
    res.json({ 
      success: true, 
      message: 'Giriş başarılı!',
      kullaniciAdi: admin.kullaniciAdi
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Kullanıcı adı veya şifre hatalı!' 
    });
  }
});

// ==================== ESP YÖNETİMİ ====================

// Tüm ESP'leri listele
app.get('/api/esp/list', async (req, res) => {
  try {
    const { siralama } = req.query;
    
    let orderBy = 'olusturma_tarihi DESC';  // Varsayılan
    
    switch(siralama) {
      case 'tarih-yeni':
        orderBy = 'olusturma_tarihi DESC';
        break;
      case 'tarih-eski':
        orderBy = 'olusturma_tarihi ASC';
        break;
      case 'id-az':
        orderBy = 'id ASC';
        break;
      case 'id-za':
        orderBy = 'id DESC';
        break;
      default:
        orderBy = 'olusturma_tarihi DESC';
    }
    
    const result = await query(
      `SELECT * FROM esp_devices ORDER BY ${orderBy}`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// Belirli bir ESP'nin verisini getir
app.get('/api/esp/:espId', async (req, res) => {
  try {
    const { espId } = req.params;
    const result = await query(
      'SELECT * FROM esp_devices WHERE id = $1',
      [espId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ESP bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// Yeni ESP ekle
app.post('/api/esp/add', async (req, res) => {
  try {
    const { id, isim, olusturanAdmin } = req.body;
    
    // ID kontrolü
    const checkResult = await query(
      'SELECT id FROM esp_devices WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Bu ID zaten kullanılıyor' });
    }
    
    const result = await query(
      `INSERT INTO esp_devices (id, isim, olusturan_admin) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [id, isim, olusturanAdmin || 'bilinmiyor']
    );
    
    res.json({ message: 'ESP eklendi!', esp: result.rows[0] });
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// ESP HEDEF değerlerini güncelle
app.put('/api/esp/update-hedef/:espId', async (req, res) => {
  try {
    const { espId } = req.params;
    const { hedefSicaklik, hedefNem } = req.body;
    
    const result = await query(
      `UPDATE esp_devices 
       SET hedef_sicaklik = $1, hedef_nem = $2, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [hedefSicaklik, hedefNem, espId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ESP bulunamadı' });
    }
    
    res.json({ message: 'Hedef değerler güncellendi!', esp: result.rows[0] });
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// ESP MEVCUT değerlerini güncelle (ESP cihazından gelen veri)
app.put('/api/esp/update-mevcut/:espId', async (req, res) => {
  try {
    const { espId } = req.params;
    const { mevcutSicaklik, mevcutNem, uyariMesaji } = req.body;
    
    const result = await query(
      `UPDATE esp_devices 
       SET mevcut_sicaklik = $1, mevcut_nem = $2, uyari_mesaji = $3, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [mevcutSicaklik, mevcutNem, uyariMesaji || '', espId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ESP bulunamadı' });
    }
    
    res.json({ message: 'Mevcut değerler güncellendi!', esp: result.rows[0] });
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// ESP için HEDEF değerleri getir (ESP cihazı bunu okuyacak)
app.get('/api/esp/:espId/hedef', async (req, res) => {
  try {
    const { espId } = req.params;
    const result = await query(
      'SELECT hedef_sicaklik, hedef_nem FROM esp_devices WHERE id = $1',
      [espId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ESP bulunamadı' });
    }
    
    res.json({
      hedefSicaklik: result.rows[0].hedefSicaklik,
      hedefNem: result.rows[0].hedefNem
    });
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// ESP'den veri gönderme endpoint'i
app.post('/api/esp/:espId/gonder', async (req, res) => {
  try {
    const { espId } = req.params;
    const { mevcutSicaklik, mevcutNem, uyariMesaji } = req.body;
    
    const result = await query(
      `UPDATE esp_devices 
       SET mevcut_sicaklik = $1, mevcut_nem = $2, uyari_mesaji = $3, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING hedef_sicaklik, hedef_nem`,
      [mevcutSicaklik, mevcutNem, uyariMesaji || '', espId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ESP bulunamadı' });
    }
    
    res.json({ 
      message: 'Veri alındı!',
      hedefSicaklik: result.rows[0].hedefSicaklik,
      hedefNem: result.rows[0].hedefNem
    });
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// ESP sil
app.delete('/api/esp/delete/:espId', async (req, res) => {
  try {
    const { espId } = req.params;
    
    const result = await query(
      'DELETE FROM esp_devices WHERE id = $1 RETURNING id',
      [espId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ESP bulunamadı' });
    }
    
    res.json({ message: 'ESP silindi!' });
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).json({ message: 'Veritabanı hatası', error: error.message });
  }
});

// Veritabanı tablosu oluştur (ilk çalıştırmada)
const initDatabase = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Veritabanı tabloları oluşturuldu');
  } catch (error) {
    console.error('❌ Veritabanı oluşturma hatası:', error);
  }
};

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  await initDatabase();
});