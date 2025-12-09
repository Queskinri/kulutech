-- ESP tablosu
CREATE TABLE IF NOT EXISTS esp_devices (
    id VARCHAR(50) PRIMARY KEY,
    isim VARCHAR(100) NOT NULL,
    mevcut_sicaklik DECIMAL(5,2) DEFAULT 0,
    mevcut_nem DECIMAL(5,2) DEFAULT 0,
    hedef_sicaklik DECIMAL(5,2) DEFAULT 37.7,
    hedef_nem DECIMAL(5,2) DEFAULT 57,
    uyari_mesaji TEXT DEFAULT '',
    olusturan_admin VARCHAR(50) DEFAULT 'sistem',
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeks ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_esp_id ON esp_devices(id);
CREATE INDEX IF NOT EXISTS idx_esp_olusturma ON esp_devices(olusturma_tarihi DESC);