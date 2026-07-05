# 📖 Dokumentasi Warung Nusantara — Versi Supabase

Dokumentasi ini untuk pemilik toko. Tidak perlu coding — ikuti langkah-langkah di bawah sesuai kebutuhan.

---

## Daftar Isi

1. [Apa yang Baru di Versi Ini](#apa-yang-baru)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Setup Supabase (Wajib untuk Fitur Database)](#setup-supabase)
4. [Menjalankan di Lokal](#menjalankan-di-lokal)
5. [Deploy ke GitHub Pages](#deploy-ke-github-pages)
6. [Konfigurasi Wajib Sebelum Go-Live](#konfigurasi-wajib)
7. [Mengelola Produk via Admin Panel](#mengelola-produk)
8. [Memproses Pesanan](#memproses-pesanan)
9. [Verifikasi Konfirmasi Pembayaran](#verifikasi-pembayaran)
10. [Pengaturan Toko (Nomor Rekening dll.)](#pengaturan-toko)
11. [Batasan & Pertimbangan Keamanan](#batasan)
12. [Checklist Sebelum Go-Live](#checklist)

---

## Apa yang Baru di Versi Ini {#apa-yang-baru}

Versi ini adalah upgrade besar dari situs statis sebelumnya:

| Fitur | Sebelumnya | Sekarang |
|---|---|---|
| **Katalog produk** | File JSON, edit manual | Database Supabase, edit langsung dari admin panel |
| **Admin login** | Password tersimpan di kode sumber | Supabase Auth (email + password, hash bcrypt, JWT aman) |
| **Pesanan** | Hanya via WhatsApp, tidak tercatat | Tersimpan ke database, admin bisa kelola status |
| **Pembayaran** | Info rekening manual di WhatsApp | Halaman konfirmasi bayar, customer upload bukti, admin verifikasi |
| **Request barang** | WhatsApp saja | Tersimpan ke database + WhatsApp |
| **Rekening** | Japan Post Bank (Yucho) | Bank Indonesia (BCA, BRI, Mandiri) + QRIS |
| **Pengaturan toko** | Edit file JS | Formulir di admin panel (tanpa coding) |
| **Fallback** | — | Jika Supabase belum dikonfigurasi, situs tetap berjalan dengan file JSON |

---

## Arsitektur Sistem {#arsitektur-sistem}

```
Pembeli                Admin
  │                      │
  ▼                      ▼
index.html          admin.html
(katalog, cart)    (kelola produk,
konfirmasi-bayar.html  pesanan, bayar)
  │                      │
  └──────────────────────┘
              │
         Supabase
    ┌──────────────────┐
    │ Database (PG)    │
    │ - products       │
    │ - orders         │
    │ - payment_confs  │
    │ - product_reqs   │
    │ - store_settings │
    │                  │
    │ Auth             │
    │ - Admin login    │
    │                  │
    │ Storage          │
    │ - bukti-bayar/   │
    │ - product-imgs/  │
    └──────────────────┘
```

Situs tetap **100% statis** (tidak ada server Node.js/Express). Supabase bertindak sebagai backend gratis.

---

## Setup Supabase {#setup-supabase}

### Langkah 1 — Buat Akun & Project

1. Buka [supabase.com](https://supabase.com) → klik **Start your project** (gratis, tidak perlu kartu kredit).
2. Login dengan GitHub atau email.
3. Klik **New project**.
4. Isi:
   - **Name**: `warung-nusantara` (bebas)
   - **Database Password**: buat password kuat, simpan di tempat aman
   - **Region**: pilih **Northeast Asia (Tokyo)** untuk performa terbaik
5. Klik **Create new project**. Tunggu ~1 menit hingga project siap.

### Langkah 2 — Ambil Kunci API

1. Di dashboard Supabase → klik **Settings** (ikon gear kiri bawah) → **API**.
2. Catat dua nilai:
   - **Project URL**: contoh `https://abcdefghijkl.supabase.co`
   - **anon public key**: string panjang dimulai `eyJhbGci...`

### Langkah 3 — Isi Konfigurasi Situs

Buka file `js/supabase-config.js` dan isi:

```js
const SUPABASE_URL = "https://abcdefghijkl.supabase.co"; // ← ganti dengan URL Anda
const SUPABASE_ANON_KEY = "eyJhbGci...";                  // ← ganti dengan anon key Anda
```

> **Aman**: `anon key` boleh ada di kode sumber publik. Key ini hanya bisa membaca/menulis sesuai aturan RLS (Row Level Security) yang sudah dibuat — tidak bisa mengakses data admin.

### Langkah 4 — Jalankan Schema Database

1. Di dashboard Supabase → klik **SQL Editor** → **New query**.
2. Buka file `supabase-schema.sql` dari folder project.
3. Salin seluruh isinya → tempel di SQL Editor → klik **Run** (▶).
4. Tunggu hingga semua query selesai. Tabel, kebijakan keamanan, dan data produk awal akan terbuat otomatis.

### Langkah 5 — Buat Akun Admin

1. Di dashboard Supabase → **Authentication** → **Users** → **Invite user** (atau **Add user**).
2. Masukkan email admin Anda dan password yang kuat.
3. Selesai! Gunakan email & password ini untuk login di `admin.html`.

> **Penting**: Ini adalah akun yang aman. Password di-hash secara otomatis oleh Supabase (bcrypt). Tidak tersimpan di kode sumber.

### Langkah 6 — Setup Storage Buckets

Storage sudah dibuat otomatis lewat SQL schema. Untuk memverifikasi:

1. Di dashboard Supabase → **Storage**.
2. Pastikan ada dua bucket: `bukti-bayar` dan `product-images`.
3. `bukti-bayar`: private (hanya admin yang bisa melihat).
4. `product-images`: public (foto produk bisa dilihat semua orang).

---

## Menjalankan di Lokal {#menjalankan-di-lokal}

Situs memuat data lewat `fetch()`, jadi **tidak bisa** dibuka langsung dengan klik dua kali file HTML.

**Opsi A — Python:**
```bash
cd warung-nusantara
python3 -m http.server 8080
```
Buka `http://localhost:8080` di browser.

**Opsi B — VS Code Live Server:**
Klik kanan `index.html` → **Open with Live Server**.

---

## Deploy ke GitHub Pages {#deploy-ke-github-pages}

1. Repository GitHub → tab **Settings** → **Pages**.
2. Source: branch `main`, folder `/ (root)`.
3. Klik **Save**. Tunggu 1–2 menit.
4. URL akan seperti: `https://username.github.io/warung-nusantara/`

Setiap push ke branch `main` akan memperbarui situs otomatis.

---

## Konfigurasi Wajib Sebelum Go-Live {#konfigurasi-wajib}

### 1. Isi Supabase Config

Buka `js/supabase-config.js`:
```js
const SUPABASE_URL = "https://XXXXXX.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGci...";
```

### 2. Isi Nomor Rekening via Admin Panel

Setelah login di `admin.html` → tab **⚙️ Pengaturan** → isi:
- Nomor WhatsApp admin
- Nama & nomor rekening BCA, BRI, Mandiri (isi yang Anda punya saja)
- Centang "QRIS Tersedia" jika ada

### 3. Update Nomor WhatsApp Fallback di main.js

Buka `js/main.js` baris paling atas:
```js
ADMIN_WHATSAPP: "6281234567890",  // ← ganti format: 62 + nomor tanpa 0 depan
```
Ini dipakai jika Supabase belum memuat pengaturan.

---

## Mengelola Produk via Admin Panel {#mengelola-produk}

1. Buka `admin.html` → login dengan email & password admin.
2. Tab **🏷️ Produk** sudah terbuka otomatis.
3. **Tambah produk**: isi form "Tambah Produk Baru" → klik **+ Tambah ke Database**.
4. **Ubah produk**: klik langsung pada kolom tabel → ubah nilai → klik **💾** untuk menyimpan.
5. **Hapus/nonaktifkan produk**: klik **🗑** → produk menjadi tidak aktif (tidak tampil di katalog) tapi data tetap tersimpan.
6. Perubahan langsung tampil di toko dalam hitungan detik (tidak perlu upload ulang file!).

---

## Memproses Pesanan {#memproses-pesanan}

### Alur pesanan:
```
Pembeli checkout → WhatsApp dibuka → Admin konfirmasi via WA
→ Admin input info ongkir → Pembeli transfer
→ Pembeli upload bukti di konfirmasi-bayar.html
→ Admin verifikasi di admin panel → Pesanan diproses & dikirim
```

### Di Admin Panel:
1. Tab **📦 Pesanan** → klik Refresh.
2. Ubah status pesanan dengan dropdown:
   - `menunggu_konfirmasi` → **Baru masuk, belum dibalas**
   - `dikonfirmasi` → **Sudah dibalas admin via WA**
   - `menunggu_bayar` → **Info ongkir sudah dikirim, tunggu transfer**
   - `bukti_diterima` → **Customer sudah upload bukti** (otomatis dari halaman konfirmasi)
   - `diproses` → **Sedang dikemas**
   - `dikirim` → **Sudah dikirim ke ekspedisi**
   - `selesai` → **Pesanan selesai**
3. Klik **Simpan** setelah mengubah status.

---

## Verifikasi Konfirmasi Pembayaran {#verifikasi-pembayaran}

### Cara customer mengirim bukti:
1. Customer checkout → WhatsApp terbuka → Customer mendapat nomor pesanan.
2. Customer buka `konfirmasi-bayar.html` (ada link di modal setelah checkout dan di footer).
3. Customer pilih metode bayar → isi detail → upload foto struk → klik Kirim.
4. Data tersimpan ke database, status pesanan otomatis berubah ke `bukti_diterima`.

### Cara admin verifikasi:
1. Di admin panel → tab **💳 Konfirmasi Bayar** → Refresh.
2. Klik **📷 Lihat** untuk melihat foto bukti (hanya admin yang bisa akses).
3. Klik **✓ Verifikasi** jika sesuai, atau **✗ Tolak** jika tidak sesuai.
4. Hubungi customer via WhatsApp jika ada masalah.

---

## Pengaturan Toko {#pengaturan-toko}

Di admin panel → tab **⚙️ Pengaturan**:

| Setting | Keterangan |
|---|---|
| `whatsapp_admin` | Nomor WA admin: `6281234567890` (format 62 + nomor tanpa 0) |
| `store_name` | Nama toko yang tampil di situs |
| `bank_bca_atas_nama` | Nama pemilik rekening BCA |
| `bank_bca_nomor` | Nomor rekening BCA |
| `bank_bri_atas_nama` | Nama pemilik rekening BRI (kosongkan jika tidak punya) |
| `bank_bri_nomor` | Nomor rekening BRI |
| `bank_mandiri_atas_nama` | Nama pemilik rekening Mandiri |
| `bank_mandiri_nomor` | Nomor rekening Mandiri |
| `qris_tersedia` | `true` atau `false` |
| `jam_operasional` | Tampil di FAQ dan chatbot |

Perubahan di sini langsung mempengaruhi halaman konfirmasi bayar — nomor rekening yang tampil ke customer akan diperbarui otomatis.

---

## Batasan & Pertimbangan Keamanan {#batasan}

### Yang sudah lebih baik dari versi sebelumnya:
- ✅ **Auth aman**: password admin di-hash bcrypt oleh Supabase, tidak ada di kode sumber.
- ✅ **Database terpusat**: beberapa admin bisa mengelola bersamaan.
- ✅ **Pesanan tercatat**: ada histori pesanan dan konfirmasi bayar.
- ✅ **Foto bukti bayar**: tersimpan di Supabase Storage, hanya admin yang bisa akses.

### Batasan yang masih ada:
- ❌ **Keranjang belanja masih localStorage**: ganti device/browser = keranjang kosong. Ini pilihan desain untuk kecepatan — bisa diubah ke Supabase di versi selanjutnya.
- ❌ **Tidak ada payment gateway otomatis**: pembayaran masih perlu verifikasi manual admin.
- ❌ **Stok tidak berkurang otomatis**: admin perlu update stok manual setelah pesanan dikonfirmasi.
- ❌ **Chatbot masih rule-based**: hanya cocokkan kata kunci, bukan AI.

### Batas Gratis Supabase (Free Tier):
| Fitur | Batas Gratis |
|---|---|
| Database | 500 MB |
| Storage | 1 GB |
| Auth users | 50.000 |
| API requests | 2 juta/bulan |
| Bandwidth | 5 GB/bulan |

Untuk toko kecil-menengah, ini lebih dari cukup. Upgrade ke paid plan (~$25/bulan) jika sudah lebih besar.

---

## Checklist Sebelum Go-Live {#checklist}

- [ ] Buat akun Supabase dan project baru
- [ ] Jalankan `supabase-schema.sql` di SQL Editor
- [ ] Isi `js/supabase-config.js` dengan URL dan anon key Supabase
- [ ] Buat akun admin di Supabase Authentication
- [ ] Login di `admin.html` → tab Pengaturan → isi nomor WhatsApp dan rekening bank
- [ ] Perbarui katalog produk di tab Produk (hapus/tambah sesuai stok asli)
- [ ] Isi `ADMIN_WHATSAPP` fallback di `js/main.js` dan `js/konfirmasi-bayar.js`
- [ ] Test checkout: pesan produk, cek WhatsApp terbuka, cek pesanan muncul di admin panel
- [ ] Test konfirmasi bayar: buka `konfirmasi-bayar.html`, isi form, cek data muncul di tab Konfirmasi Bayar
- [ ] Test halaman admin: verifikasi konfirmasi, ubah status pesanan
- [ ] Deploy ke GitHub Pages, bagikan URL ke pelanggan
- [ ] (Opsional) Aktifkan custom domain jika punya
