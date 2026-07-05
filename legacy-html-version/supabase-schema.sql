-- =========================================================
-- WARUNG NUSANTARA — SUPABASE DATABASE SCHEMA
-- 
-- Jalankan SQL ini di Supabase SQL Editor:
-- Dashboard Supabase → SQL Editor → New Query → Paste → Run
-- =========================================================

-- ─────────────────────────────────────────────────────────
-- 1. TABEL PRODUK
--    Menggantikan data/products.json yang di-edit manual
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,           -- slug unik, contoh: "mie-indomie-goreng"
  kategori    TEXT NOT NULL,              -- mie-instan, bumbu-dapur, dll.
  nama        TEXT NOT NULL,
  deskripsi   TEXT,
  harga       INTEGER NOT NULL DEFAULT 0, -- dalam Yen (¥)
  satuan      TEXT,                        -- "pak isi 5", "botol 275ml", dll.
  stok        INTEGER NOT NULL DEFAULT 0,
  tag         TEXT[] DEFAULT '{}',         -- ["halal", "pedas", "favorit"]
  emoji       TEXT DEFAULT '🛍️',
  unggulan    BOOLEAN DEFAULT false,
  gambar_url  TEXT,                        -- URL foto produk (opsional)
  aktif       BOOLEAN DEFAULT true,        -- false = sembunyikan dari katalog
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 2. TABEL PESANAN (ORDERS)
--    Setiap pesanan dari checkout WhatsApp dicatat di sini
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,   -- contoh: "WN-20240705-0001"
  nama_pembeli    TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,
  alamat          TEXT,
  prefektur       TEXT,
  items           JSONB NOT NULL,         -- snapshot keranjang saat checkout
  subtotal        INTEGER NOT NULL DEFAULT 0,
  ongkir          INTEGER,                -- diisi admin setelah konfirmasi
  total           INTEGER,                -- subtotal + ongkir
  metode_bayar    TEXT,                   -- "transfer-bca", "qris", "cod", dll.
  status          TEXT NOT NULL DEFAULT 'menunggu_konfirmasi',
  -- Status: menunggu_konfirmasi → dikonfirmasi → menunggu_bayar → 
  --         bukti_diterima → diproses → dikirim → selesai | dibatalkan
  catatan         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 3. TABEL KONFIRMASI PEMBAYARAN
--    Pembeli upload bukti transfer di sini
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_number    TEXT NOT NULL,
  nama_pengirim   TEXT NOT NULL,
  jumlah_transfer INTEGER NOT NULL,
  bank_asal       TEXT NOT NULL,          -- "BCA", "BRI", "Mandiri", "QRIS", dll.
  tanggal_transfer DATE NOT NULL,
  bukti_url       TEXT,                   -- URL foto bukti (dari Supabase Storage)
  catatan         TEXT,
  status          TEXT NOT NULL DEFAULT 'menunggu_verifikasi',
  -- Status: menunggu_verifikasi → terverifikasi | ditolak
  verified_at     TIMESTAMPTZ,
  verified_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 4. TABEL REQUEST BARANG KHUSUS
--    Form request dari halaman utama disimpan ke database
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL,
  kontak      TEXT NOT NULL,
  barang      TEXT NOT NULL,
  jumlah      TEXT,
  catatan     TEXT,
  status      TEXT NOT NULL DEFAULT 'baru',
  -- Status: baru → diproses → tersedia | tidak_tersedia
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 5. TABEL PENGATURAN TOKO (STORE SETTINGS)
--    Nomor rekening, info toko, dll. bisa diatur dari admin
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  label       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Isi pengaturan default
INSERT INTO store_settings (key, value, label) VALUES
  ('whatsapp_admin', '819000000000', 'Nomor WhatsApp Admin'),
  ('store_name', 'Warung Nusantara', 'Nama Toko'),
  ('bank_bca_atas_nama', 'Nama Pemilik Rekening', 'Nama Rekening BCA'),
  ('bank_bca_nomor', '1234567890', 'Nomor Rekening BCA'),
  ('bank_bri_atas_nama', '', 'Nama Rekening BRI'),
  ('bank_bri_nomor', '', 'Nomor Rekening BRI'),
  ('bank_mandiri_atas_nama', '', 'Nama Rekening Mandiri'),
  ('bank_mandiri_nomor', '', 'Nomor Rekening Mandiri'),
  ('qris_tersedia', 'false', 'QRIS Tersedia'),
  ('jam_operasional', '09.00–21.00 WIB / 11.00–23.00 WIJ', 'Jam Operasional')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- 6. FUNGSI & TRIGGER otomatis updated_at
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
--    Keamanan: siapa boleh baca/tulis tabel apa
-- ─────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: siapa pun bisa BACA produk aktif, hanya admin yang bisa UBAH
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (aktif = true);

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- ORDERS: siapa pun bisa INSERT (buat pesanan baru), hanya admin bisa lihat semua
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- PAYMENT CONFIRMATIONS: siapa pun bisa INSERT (upload bukti), admin bisa lihat semua
CREATE POLICY "payments_public_insert" ON payment_confirmations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "payments_admin_all" ON payment_confirmations
  FOR ALL USING (auth.role() = 'authenticated');

-- PRODUCT REQUESTS: siapa pun bisa INSERT
CREATE POLICY "requests_public_insert" ON product_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "requests_admin_all" ON product_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- STORE SETTINGS: siapa pun bisa baca, hanya admin bisa ubah
CREATE POLICY "settings_public_read" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_write" ON store_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────
-- 8. STORAGE BUCKET untuk foto bukti pembayaran & gambar produk
-- ─────────────────────────────────────────────────────────
-- Jalankan di Storage → Create Bucket:
-- Nama: "bukti-bayar" (public: false)
-- Nama: "product-images" (public: true)
--
-- Atau via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES
  ('bukti-bayar', 'bukti-bayar', false),
  ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy untuk storage
CREATE POLICY "bukti_bayar_public_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bukti-bayar');

CREATE POLICY "bukti_bayar_admin_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'bukti-bayar' AND auth.role() = 'authenticated'
  );

CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_write" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
  );

-- ─────────────────────────────────────────────────────────
-- 9. IMPORT DATA PRODUK AWAL (dari products.json)
-- ─────────────────────────────────────────────────────────
INSERT INTO products (id, kategori, nama, deskripsi, harga, satuan, stok, tag, emoji, unggulan) VALUES
  ('mie-indomie-goreng', 'mie-instan', 'Indomie Goreng Original', 'Mi goreng instan legendaris rasa Indonesia, satu pak isi 5 bungkus.', 480, 'pak isi 5', 42, ARRAY['favorit','halal'], '🍜', true),
  ('mie-indomie-ayam-bawang', 'mie-instan', 'Indomie Kuah Ayam Bawang', 'Mi kuah rasa ayam bawang, cocok untuk malam dingin di Jepang.', 480, 'pak isi 5', 35, ARRAY['halal'], '🍜', false),
  ('mie-sedap-korean', 'mie-instan', 'Mie Sedap Korean Spicy Chicken', 'Varian pedas ala Korea, favorit anak kos dan pekerja shift malam.', 520, 'pak isi 5', 20, ARRAY['pedas'], '🌶️', true),
  ('bumbu-kecap-manis', 'bumbu-dapur', 'Kecap Manis Bango', 'Kecap manis kental, wajib ada untuk nasi goreng dan sate.', 650, 'botol 275ml', 18, ARRAY['favorit','halal'], '🍯', true),
  ('bumbu-royco-ayam', 'bumbu-dapur', 'Royco Kaldu Ayam', 'Penyedap rasa ayam untuk sayur bening dan tumisan.', 380, 'sachet isi 10', 30, ARRAY['halal'], '🧂', false),
  ('bumbu-sambal-abc', 'bumbu-dapur', 'Sambal ABC Extra Pedas', 'Sambal botol siap pakai, teman makan sehari-hari.', 590, 'botol 335ml', 25, ARRAY['pedas','halal'], '🌶️', true),
  ('bumbu-bawang-goreng', 'bumbu-dapur', 'Bawang Goreng Kering', 'Taburan bawang goreng renyah untuk soto dan nasi uduk.', 420, 'kemasan 80g', 15, ARRAY['halal'], '🧅', false),
  ('sembako-beras-pandan', 'sembako', 'Beras Pandan Wangi', 'Beras wangi pulen, kemasan praktis untuk 1-2 orang.', 1580, '5 kg', 12, ARRAY['favorit','halal'], '🍚', true),
  ('sembako-santan-kara', 'sembako', 'Santan Kara Instan', 'Santan kemasan praktis untuk rendang, opor, dan gulai.', 320, 'kotak 65ml', 40, ARRAY['halal'], '🥥', false),
  ('sembako-terasi', 'sembako', 'Terasi Udang Bakar', 'Terasi asli untuk sambal terasi dan nasi goreng kampung.', 450, 'kemasan 100g', 10, ARRAY[]::TEXT[], '🦐', false),
  ('snack-kerupuk-udang', 'snack', 'Kerupuk Udang Sidoarjo', 'Kerupuk mentah siap goreng, renyah dan gurih.', 480, 'kemasan 200g', 22, ARRAY['halal'], '🍤', false),
  ('snack-keripik-singkong', 'snack', 'Keripik Singkong Balado', 'Camilan pedas manis, cocok untuk teman kerja malam.', 390, 'kemasan 150g', 28, ARRAY['pedas','halal'], '🍟', true),
  ('minuman-teh-botol', 'minuman', 'Teh Celup Melati', 'Teh melati klasik untuk sarapan pagi ala rumah.', 340, 'kotak isi 25', 33, ARRAY['halal'], '🍵', false),
  ('minuman-kopi-kapal-api', 'minuman', 'Kopi Kapal Api Spesial', 'Kopi bubuk mix legendaris, penambah semangat kerja.', 560, 'kemasan 165g', 19, ARRAY['favorit'], '☕', true),
  ('bahan-tempe-beku', 'bahan-segar', 'Tempe Beku Kedelai', 'Tempe beku kualitas ekspor, tahan lama di freezer.', 620, 'pak 400g', 8, ARRAY['halal'], '🫘', false),
  ('bahan-tahu-putih', 'bahan-segar', 'Tahu Putih Beku', 'Tahu beku siap olah untuk tahu goreng dan sayur.', 480, 'pak 6 potong', 14, ARRAY[]::TEXT[], '🧊', false)
ON CONFLICT (id) DO NOTHING;
