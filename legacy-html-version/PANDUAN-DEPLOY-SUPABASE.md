# 🚀 Panduan Deploy Supabase — Warung Nusantara
## Panduan Step-by-Step Lengkap

> **Perkiraan waktu:** 20–30 menit  
> **Keahlian yang dibutuhkan:** Tidak perlu coding — cukup ikuti langkah ini  
> **Biaya:** Gratis (Supabase Free Tier)

---

## Daftar Langkah

| # | Langkah | Waktu |
|---|---|---|
| 1 | [Buat Akun Supabase](#langkah-1--buat-akun-supabase) | ~5 menit |
| 2 | [Buat Project Baru](#langkah-2--buat-project-baru) | ~3 menit |
| 3 | [Jalankan Schema Database](#langkah-3--jalankan-schema-database) | ~5 menit |
| 4 | [Ambil API Keys](#langkah-4--ambil-api-keys) | ~2 menit |
| 5 | [Isi Konfigurasi di Kode](#langkah-5--isi-konfigurasi-di-kode) | ~3 menit |
| 6 | [Buat Akun Admin](#langkah-6--buat-akun-admin) | ~3 menit |
| 7 | [Verifikasi Storage Bucket](#langkah-7--verifikasi-storage-bucket) | ~2 menit |
| 8 | [Isi Pengaturan Toko](#langkah-8--isi-pengaturan-toko) | ~5 menit |
| 9 | [Test & Verifikasi](#langkah-9--test--verifikasi-lengkap) | ~5 menit |
| 10 | [Deploy ke GitHub Pages](#-deploy-ke-github-pages) | ~5 menit |

---

## Langkah 1 — Buat Akun Supabase

### 1.1 Buka Website Supabase

Buka browser → pergi ke: **https://supabase.com**

### 1.2 Klik "Start your project"

Klik tombol besar **"Start your project"** di halaman utama.

### 1.3 Pilih Metode Daftar

```
┌─────────────────────────────────────────┐
│         Daftar ke Supabase               │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │  🐙  Continue with GitHub       │    │← Paling mudah jika punya GitHub
│  └─────────────────────────────────┘    │
│                                          │
│  ──────────── atau ────────────          │
│                                          │
│  Email: [___________________________]    │
│  Password: [_______________________]     │
│  [         Sign Up          ]            │
└─────────────────────────────────────────┘
```

> **💡 Rekomendasi:** Gunakan **Continue with GitHub** agar lebih cepat.

### 1.4 Verifikasi Email (jika daftar dengan email)

Cek inbox email Anda → klik link konfirmasi dari Supabase → Anda akan diarahkan ke dashboard.

---

## Langkah 2 — Buat Project Baru

### 2.1 Klik "New project"

Di dashboard → klik tombol **"New project"** di pojok kanan atas.

### 2.2 Isi Detail Project

```
┌─────────────────────────────────────────────────────────┐
│  Create a new project                                    │
│                                                          │
│  Project name:                                           │
│  ┌───────────────────────────────────────┐               │
│  │ warung-nusantara                      │ ← KETIK INI  │
│  └───────────────────────────────────────┘               │
│                                                          │
│  Database Password:                                      │
│  ┌───────────────────────────────────────┐               │
│  │ [buat password kuat, min 8 karakter]  │ ← PENTING!   │
│  └───────────────────────────────────────┘               │
│  ⚠️ SIMPAN PASSWORD INI! Tidak bisa dilihat lagi.        │
│                                                          │
│  Region:                                                 │
│  ┌───────────────────────────────────────┐               │
│  │ Northeast Asia (Tokyo)            ▼   │ ← PILIH INI  │
│  └───────────────────────────────────────┘               │
│                                                          │
│  [ Create new project ] ← KLIK                           │
└─────────────────────────────────────────────────────────┘
```

> **⚠️ PENTING:** Simpan **Database Password** di tempat aman. Password ini dibutuhkan jika Anda ingin akses langsung ke database PostgreSQL.

### 2.3 Tunggu Project Dibuat

Proses memakan waktu **1–2 menit**. Jangan tutup halaman. Selesai ketika muncul dashboard dengan sidebar lengkap.

---

## Langkah 3 — Jalankan Schema Database

> Langkah ini membuat semua tabel: produk, pesanan, konfirmasi bayar, request barang, pengaturan toko.

### 3.1 Buka SQL Editor

Di sidebar kiri → klik **"SQL Editor"** → klik **"New query"**.

```
SIDEBAR KIRI:
  🏠 Home
  📊 Table Editor
  🔍 SQL Editor    ← KLIK INI
  ⚡ Database
  🔐 Authentication
  💾 Storage
  ⚙️ Settings
```

### 3.2 Salin Isi File Schema

1. Di komputer Anda, buka file **`supabase-schema.sql`** (ada di folder `warung-nusantara`)
2. Pilih semua teks: `Ctrl+A` (Windows) / `Cmd+A` (Mac)
3. Salin: `Ctrl+C` / `Cmd+C`

### 3.3 Tempel & Jalankan

1. Klik di dalam area teks SQL Editor
2. Tempel: `Ctrl+V` / `Cmd+V`
3. Klik tombol **"Run ▶"** di pojok kanan atas

### 3.4 Verifikasi Tabel Terbuat

Setelah Run berhasil, buka **"Table Editor"** di sidebar → pastikan ada 5 tabel:

```
Tables:
  ✓ products
  ✓ orders
  ✓ payment_confirmations
  ✓ product_requests
  ✓ store_settings
```

> **Jika ada error `relation already exists`:** Tidak masalah. Schema menggunakan `CREATE TABLE IF NOT EXISTS` — aman dijalankan ulang.

---

## Langkah 4 — Ambil API Keys

### 4.1 Buka Settings → API

Di sidebar kiri → **⚙️ Settings** → **API**.

### 4.2 Salin Dua Nilai Ini

```
┌─────────────────────────────────────────────────────────┐
│  API Settings                                            │
│                                                          │
│  Project URL                                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ https://abcdefghijklmnop.supabase.co              │  │← ✅ SALIN INI
│  └───────────────────────────────────────────────────┘  │
│                                                  [Copy]  │
│                                                          │
│  Project API Keys                                        │
│  anon  public                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc...   │  │← ✅ SALIN INI
│  └───────────────────────────────────────────────────┘  │
│                                                  [Copy]  │
│                                                          │
│  service_role  secret  ← ❌ JANGAN SALIN YANG INI       │
└─────────────────────────────────────────────────────────┘
```

> **⚠️ PENTING:** Hanya salin `anon public` key — **JANGAN** salin `service_role` key.

---

## Langkah 5 — Isi Konfigurasi di Kode

### 5.1 Buka File

Buka file **`js/supabase-config.js`** di folder `warung-nusantara`.

Bisa dengan VS Code, Notepad (Windows), atau TextEdit (Mac).

### 5.2 Ganti Dua Baris Ini

Cari baris:
```js
const SUPABASE_URL = "GANTI_DENGAN_URL_SUPABASE_ANDA";
const SUPABASE_ANON_KEY = "GANTI_DENGAN_ANON_KEY_SUPABASE_ANDA";
```

Ganti dengan nilai dari Langkah 4:
```js
const SUPABASE_URL = "https://XXXXX.supabase.co";        // ← URL Anda
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiI...";     // ← anon key Anda
```

### 5.3 Simpan File

Tekan `Ctrl+S` (Windows) / `Cmd+S` (Mac).

### 5.4 Verifikasi

Buka `index.html` lewat server lokal → tekan `F12` → tab **Console**.

- ✅ **Berhasil:** `✅ 16 produk dimuat dari Supabase`
- ❌ **Gagal:** `⚠️ Supabase belum dikonfigurasi!` → periksa URL dan key

---

## Langkah 6 — Buat Akun Admin

> Akun ini untuk login di `admin.html`. Password aman di-hash oleh Supabase — tidak tersimpan di kode.

### 6.1 Buka Authentication → Users

Di sidebar kiri → **🔐 Authentication** → **Users**.

### 6.2 Tambah User

Klik **"Add user"** di pojok kanan atas.

### 6.3 Isi Data

```
┌─────────────────────────────────────────────────────────┐
│  Create a new user                                       │
│                                                          │
│  Email:                                                  │
│  ┌───────────────────────────────────────┐               │
│  │ admin@warungnusantara.com             │ ← ISI EMAIL  │
│  └───────────────────────────────────────┘               │
│                                                          │
│  Password:                                               │
│  ┌───────────────────────────────────────┐               │
│  │ [min 8 karakter, huruf+angka+simbol]  │ ← ISI PASS  │
│  └───────────────────────────────────────┘               │
│                                                          │
│  ✓ Auto Confirm User  ← CENTANG INI                      │
│                                                          │
│  [ Create user ]  ← KLIK                                 │
└─────────────────────────────────────────────────────────┘
```

Tips password kuat: `Warung#2024!Nusantara` — gabungkan huruf besar, kecil, angka, simbol.

### 6.4 Catat Email & Password

Simpan email dan password ini — dibutuhkan setiap kali login ke halaman admin.

---

## Langkah 7 — Verifikasi Storage Bucket

### 7.1 Buka Storage

Di sidebar kiri → **💾 Storage**.

### 7.2 Cek Bucket

Seharusnya sudah ada 2 bucket dari SQL schema:

```
  📁 bukti-bayar       🔒 Private  (untuk foto bukti pembayaran)
  📁 product-images    🌍 Public   (untuk foto produk)
```

### 7.3 Jika Bucket Belum Ada — Buat Manual

**Bucket `bukti-bayar`:**
1. Klik **"New bucket"**
2. Name: `bukti-bayar`
3. ❌ Jangan centang "Public bucket"
4. Klik **"Save"**

**Bucket `product-images`:**
1. Klik **"New bucket"**
2. Name: `product-images`
3. ✅ Centang "Public bucket"
4. Klik **"Save"**

---

## Langkah 8 — Isi Pengaturan Toko

### 8.1 Jalankan Server Lokal

```bash
cd warung-nusantara
python3 -m http.server 8080
```

Buka browser → `http://localhost:8080/admin.html`

### 8.2 Login

Masukkan email dan password admin yang dibuat di Langkah 6.

### 8.3 Buka Tab Pengaturan

Klik tab **"⚙️ Pengaturan"**.

### 8.4 Isi Semua Field

| Field | Contoh Isi |
|---|---|
| Nomor WhatsApp Admin | `6281234567890` (format: 62 + nomor tanpa 0 depan) |
| Nama Toko | `Warung Nusantara` |
| Nama Rekening BCA | `Siti Aminah` |
| Nomor Rekening BCA | `1234567890` |
| Nama Rekening BRI | *(kosongkan jika tidak punya)* |
| Nomor Rekening BRI | *(kosongkan jika tidak punya)* |
| QRIS Tersedia | `true` atau `false` |
| Jam Operasional | `09.00–21.00 WIB` |

### 8.5 Simpan

Klik **"💾 Simpan Semua Pengaturan"** → muncul notifikasi sukses.

### 8.6 Verifikasi Rekening Muncul

Buka `http://localhost:8080/konfirmasi-bayar.html` → pilih "Transfer Bank BCA" → nomor rekening Anda harus muncul otomatis.

---

## Langkah 9 — Test & Verifikasi Lengkap

Lakukan semua test ini sebelum go-live:

### ✅ Test 1: Katalog Produk dari Supabase
1. Buka `http://localhost:8080/`
2. Produk harus muncul (16 produk awal)
3. Console: `✅ 16 produk dimuat dari Supabase`

### ✅ Test 2: Checkout & Simpan Pesanan
1. Tambah produk ke keranjang → Checkout
2. WhatsApp terbuka ✓
3. Modal nomor pesanan muncul (contoh: `WN-20240705-A1B2`) ✓
4. Admin panel → tab Pesanan → pesanan tersimpan ✓

### ✅ Test 3: Konfirmasi Pembayaran
1. Klik "📤 Upload Bukti Pembayaran" di modal
2. Isi semua field, upload foto apa pun sebagai test
3. Klik "Kirim" → layar sukses muncul ✓
4. Admin panel → tab Konfirmasi Bayar → data muncul ✓
5. Klik "✓ Verifikasi" → status berubah ✓

### ✅ Test 4: Admin CRUD Produk
1. Tambah produk baru → muncul di katalog ✓
2. Ubah harga → klik 💾 → harga berubah di katalog ✓

### ✅ Test 5: Request Barang
1. Isi form request → WhatsApp terbuka ✓
2. Admin panel → tab Request Barang → data muncul ✓

---

## 🚀 Deploy ke GitHub Pages

### Push Kode ke GitHub

```bash
# Di folder warung-nusantara:
git add .
git commit -m "Upgrade ke Supabase: database, auth, konfirmasi bayar"
git push origin main
```

### Aktifkan GitHub Pages

1. Repository GitHub → tab **Settings**
2. Menu kiri: **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / Folder: **/ (root)**
5. Klik **Save** → tunggu 1–2 menit
6. URL muncul: `https://username.github.io/warung-nusantara/`

### ⚙️ Tambahkan Domain di Supabase Auth

**Wajib agar login admin berfungsi di GitHub Pages:**

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://username.github.io`
3. **Redirect URLs** → klik **"Add URL"** → masukkan:
   ```
   https://username.github.io/warung-nusantara/admin.html
   ```
4. Klik **Save**

---

## ⚠️ Troubleshooting

| Masalah | Penyebab | Solusi |
|---|---|---|
| `relation already exists` saat jalankan SQL | Schema sudah pernah dijalankan | Aman abaikan — tidak ada masalah |
| `permission denied for table storage.buckets` | Error di bagian Storage SQL | Buat bucket manual via Storage UI (Langkah 7.3) |
| Login admin gagal: "Email atau kata sandi salah" | Typo email/password atau belum confirmed | Cek di Authentication → Users, pastikan user ada & confirmed |
| Katalog produk kosong / tidak dari Supabase | `supabase-config.js` belum diisi / URL salah | Cek console browser (`F12`), periksa URL dan anon key |
| Nomor rekening tidak muncul di konfirmasi bayar | Pengaturan belum diisi | Login admin → tab ⚙️ Pengaturan → isi & simpan |
| Upload foto bukti gagal | Bucket belum ada atau policy belum dibuat | Buat bucket manual (Langkah 7.3) |
| Login admin tidak berfungsi di GitHub Pages | Site URL belum dikonfigurasi di Supabase | Tambahkan URL di Supabase Auth → URL Configuration |

---

## ✅ Checklist Final

Centang semua sebelum membagikan link ke customer:

- [ ] Akun Supabase dibuat ✓
- [ ] Project dibuat (region: Northeast Asia / Tokyo) ✓
- [ ] `supabase-schema.sql` berhasil dijalankan (5 tabel terbuat) ✓
- [ ] Project URL dan anon key sudah disalin ✓
- [ ] `js/supabase-config.js` sudah diisi ✓
- [ ] Akun admin dibuat di Supabase Authentication ✓
- [ ] Storage bucket `bukti-bayar` (private) dan `product-images` (public) tersedia ✓
- [ ] Nomor WhatsApp admin sudah diisi via ⚙️ Pengaturan di admin panel ✓
- [ ] Nomor rekening BCA/BRI/Mandiri sudah diisi ✓
- [ ] Test checkout berhasil (pesanan tersimpan ke DB) ✓
- [ ] Test konfirmasi bayar berhasil (foto tersimpan, admin bisa verifikasi) ✓
- [ ] Kode sudah di-push ke GitHub ✓
- [ ] GitHub Pages aktif ✓
- [ ] Site URL di Supabase Auth sudah diisi dengan URL GitHub Pages ✓
- [ ] Test akhir di URL GitHub Pages berhasil ✓

---

## 📊 Batas Gratis Supabase (Free Tier)

| Fitur | Batas Gratis | Cukup untuk |
|---|---|---|
| Database | 500 MB | Ribuan pesanan & produk |
| Storage (foto bukti) | 1 GB | ~2.000 foto @ 500KB |
| Auth users (admin) | 50.000 | Jauh lebih dari cukup |
| API requests | 2 juta/bulan | ~66.000 request/hari |
| Bandwidth | 5 GB/bulan | Sangat cukup untuk toko kecil |

> Upgrade ke **Pro plan (~$25/bulan)** jika toko sudah ramai dan mendekati batas ini.

---

*Panduan ini dibuat untuk Warung Nusantara. Pertanyaan? Hubungi developer Anda.*
