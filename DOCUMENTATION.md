# 📖 Dokumentasi Warung Nusantara

Dokumentasi ini untuk pemilik toko yang **tidak harus bisa coding**. Ikuti langkah-langkah di bawah sesuai kebutuhan Anda.

---

## Daftar Isi

1. [Ringkasan Proyek](#ringkasan-proyek)
2. [Menjalankan di Lokal](#menjalankan-di-lokal)
3. [Deploy ke GitHub Pages](#deploy-ke-github-pages)
4. [Konfigurasi Wajib Sebelum Go-Live](#konfigurasi-wajib-sebelum-go-live)
5. [Menambah & Mengubah Produk](#menambah--mengubah-produk)
6. [Mengatur Harga & Stok](#mengatur-harga--stok)
7. [Cara Kerja Request Barang Khusus & Chatbot](#cara-kerja-request-barang-khusus--chatbot)
8. [Rencana & Rekomendasi Metode Pembayaran](#rencana--rekomendasi-metode-pembayaran)
9. [Batasan Teknis Saat Ini](#batasan-teknis-saat-ini)
10. [Checklist Sebelum Go-Live](#checklist-sebelum-go-live)

---

## Ringkasan Proyek

Warung Nusantara adalah website toko online **mobile-first** (dioptimalkan untuk HP, tapi tetap enak dilihat di laptop) yang dibangun sebagai **situs statis** — artinya tidak ada server/database di belakangnya. Semua data produk disimpan dalam satu file `data/products.json`, dan proses checkout maupun request barang dikirim sebagai pesan **WhatsApp** ke admin karena belum ada payment gateway otomatis.

Pendekatan ini sengaja dipilih supaya:
- **Gratis di-hosting** (lewat GitHub Pages).
- **Tidak butuh biaya server bulanan.**
- **Mudah dikelola** pemilik toko tanpa perlu tim developer tetap.
- Tetap bisa **berkembang** ke sistem yang lebih otomatis di masa depan (lihat bagian [Batasan Teknis](#batasan-teknis-saat-ini)).

---

## Menjalankan di Lokal

Karena situs memuat data produk lewat `fetch()`, Anda **tidak bisa** membuka `index.html` dengan klik dua kali (browser akan memblokirnya). Gunakan salah satu cara berikut:

**Opsi A — Python (paling mudah, biasanya sudah terpasang di Mac/Linux):**
```bash
cd warung-nusantara
python3 -m http.server 8080
```
Lalu buka `http://localhost:8080` di browser.

**Opsi B — Ekstensi "Live Server" di VS Code:**
Klik kanan pada `index.html` → "Open with Live Server".

---

## Deploy ke GitHub Pages

Repository ini bisa langsung online gratis lewat GitHub Pages:

1. Buka repository di GitHub → tab **Settings**.
2. Di menu kiri, klik **Pages**.
3. Pada bagian **Source**, pilih branch `main` dan folder `/ (root)`.
4. Klik **Save**.
5. Tunggu 1–2 menit, GitHub akan memberi URL seperti:
   `https://minerva-id.github.io/warung-nusantara/`
6. Bagikan tautan ini ke pelanggan.

Setiap kali Anda mengunggah perubahan file ke branch `main` (misalnya `data/products.json` yang baru), situs akan otomatis diperbarui dalam 1–2 menit.

---

## Konfigurasi Wajib Sebelum Go-Live

Sebelum situs dibagikan ke pelanggan, buka file `js/main.js` dan ubah baris berikut di bagian paling atas:

```js
const CONFIG = {
  ADMIN_WHATSAPP: "819000000000",   // ⬅️ GANTI dengan nomor WhatsApp admin
  CURRENCY_SYMBOL: "¥",
  STORE_NAME: "Warung Nusantara",
};
```

**Format nomor WhatsApp:** kode negara + nomor tanpa angka 0 di depan, tanpa spasi/tanda hubung.
Contoh: nomor Jepang `090-1234-5678` → ditulis `"819012345678"`.

Tanpa langkah ini, tombol checkout dan chatbot akan mengarah ke nomor contoh yang tidak aktif.

---

## Menambah & Mengubah Produk

Ada dua cara. Pilih yang paling nyaman untuk Anda.

### Cara 1 — Lewat Halaman Admin (tanpa coding, direkomendasikan)

1. Buka `admin.html` (contoh: `https://minerva-id.github.io/warung-nusantara/admin.html`).
2. Masukkan kata sandi admin (default: `nusantara2026` — **segera ganti**, lihat catatan keamanan di bawah).
3. Klik **"Muat dari data/products.json"** untuk memuat katalog yang sedang aktif.
4. Untuk **menambah produk baru**: isi form di bagian "2. Tambah Produk Baru", lalu klik **"+ Tambah ke Tabel"**.
5. Untuk **mengubah produk** (nama, kategori, harga, satuan, stok, emoji): klik langsung pada kolom di tabel dan ketik nilai barunya.
6. Untuk **menghapus produk**: klik tombol **"Hapus"** di baris produk terkait.
7. Setelah semua perubahan selesai, klik **"⬇ Unduh products.json"**. File baru akan terunduh ke folder Downloads Anda.
8. Ganti file lama di repository:
   - Buka repository di GitHub → masuk ke folder `data/`.
   - Klik file `products.json` lama → klik ikon pensil (Edit) atau tombol **Upload files** untuk mengganti dengan file yang baru diunduh.
   - Klik **Commit changes**.
9. Tunggu 1–2 menit, katalog di situs akan otomatis diperbarui.

> **Catatan keamanan halaman admin:** kata sandi di `admin.html` hanya proteksi ringan di sisi browser (siapa pun yang membaca kode sumber halaman bisa menemukannya). Ini **cukup untuk mencegah pengunjung biasa "iseng" membuka halaman admin**, tapi **bukan pengganti keamanan sungguhan**. Jangan gunakan halaman ini untuk data sensitif. Untuk keamanan penuh, lihat rekomendasi di bagian [Batasan Teknis](#batasan-teknis-saat-ini).

### Cara 2 — Edit Langsung File JSON (untuk yang terbiasa teknis)

Buka `data/products.json` dan tambahkan objek baru mengikuti format ini:

```json
{
  "id": "mie-sarimi-soto",
  "kategori": "mie-instan",
  "nama": "Sarimi Soto Koya",
  "deskripsi": "Mi kuah rasa soto dengan koya renyah.",
  "harga": 460,
  "satuan": "pak isi 5",
  "stok": 25,
  "tag": ["halal"],
  "emoji": "🍜",
  "unggulan": false
}
```

**Penjelasan setiap kolom (field):**

| Kolom | Wajib? | Keterangan |
|---|---|---|
| `id` | Ya | Kode unik, huruf kecil & tanda hubung, tidak boleh sama dengan produk lain |
| `kategori` | Ya | Harus salah satu dari: `mie-instan`, `bumbu-dapur`, `sembako`, `snack`, `minuman`, `bahan-segar` (kategori baru bisa ditambah, lihat catatan di bawah) |
| `nama` | Ya | Nama produk yang tampil ke pembeli |
| `deskripsi` | Ya | Deskripsi singkat, tampil di halaman detail produk |
| `harga` | Ya | Angka saja, dalam Yen (¥), tanpa titik/koma |
| `satuan` | Ya | Contoh: "pak isi 5", "botol 275ml", "5 kg" |
| `stok` | Ya | Angka. Jika ≤ 5 akan muncul label "Sisa X" berwarna merah; jika 0 dianggap habis |
| `tag` | Tidak | Daftar label kecil, contoh: `["halal", "pedas", "favorit"]` |
| `emoji` | Tidak | Emoji sebagai ikon produk (belum pakai foto asli, lihat catatan di bawah) |
| `unggulan` | Tidak | `true` untuk menampilkan badge "Favorit" di kartu produk |

**Menambah kategori baru:** jika Anda menambah kategori (misalnya `bumbu-dapur` menjadi ada `bumbu-basah`), tambahkan juga entrinya di array `CATEGORIES` pada `js/main.js` (dan pada `<select>` kategori di `admin.html`) supaya muncul sebagai filter.

**Menggunakan foto produk asli (bukan emoji):** saat ini produk memakai emoji sebagai ikon supaya situs ringan tanpa perlu upload gambar. Untuk pakai foto asli:
1. Simpan foto di folder `assets/` (contoh: `assets/indomie-goreng.jpg`).
2. Tambahkan kolom `"gambar": "assets/indomie-goreng.jpg"` pada produk di `products.json`.
3. Di `js/main.js`, ganti bagian yang menampilkan `p.emoji` pada fungsi `renderGrid()` dan `openDetail()` menjadi elemen `<img src="${p.gambar}">` bila kolom `gambar` tersedia. (Ini butuh sedikit penyesuaian kode; hubungi developer Anda bila perlu bantuan.)

---

## Mengatur Harga & Stok

Harga dan stok adalah kolom `harga` dan `stok` pada tiap produk (lihat tabel di atas). Bisa diubah lewat:
- **Halaman admin** (Cara 1 di atas) — paling praktis untuk perubahan harian.
- **Edit langsung JSON** (Cara 2) — untuk perubahan massal atau impor dari Excel.

**Tips mengelola harga:**
- Harga ditampilkan apa adanya (dalam Yen), jadi pastikan sudah termasuk margin keuntungan Anda sebelum disimpan.
- Situs belum menghitung ongkos kirim otomatis — ongkir tetap dikonfirmasi manual oleh admin lewat WhatsApp setelah checkout. Jika volume order sudah tinggi, ini adalah kandidat pertama untuk diotomatisasi (lihat [Batasan Teknis](#batasan-teknis-saat-ini)).
- Stok tidak berkurang otomatis saat ada pesanan (karena tidak ada database). Admin perlu mengurangi stok secara manual di `products.json`/halaman admin setelah pesanan dikonfirmasi.

---

## Cara Kerja Request Barang Khusus & Chatbot

**Form Request Barang Khusus** (di halaman utama, bagian "Tidak Ketemu Barangnya?"):
- Pembeli mengisi nama, kontak, nama barang, jumlah, dan catatan.
- Saat "Kirim Permintaan ke Admin" ditekan, situs otomatis membuka WhatsApp dengan pesan yang sudah terisi lengkap, dikirim ke nomor admin di `CONFIG.ADMIN_WHATSAPP`.
- Tidak ada data yang tersimpan di server — semua histori permintaan ada di chat WhatsApp Anda.

**Chatbot Admin** (ikon 💬 mengambang):
- Ini adalah chatbot sederhana berbasis kata kunci (bukan AI), yang menjawab pertanyaan umum seperti jam operasional, ongkir, cara bayar, dan cara request barang.
- Jika pertanyaan pembeli tidak dikenali, chatbot akan menawarkan tombol untuk lanjut chat langsung ke WhatsApp admin.
- **Mengubah/menambah jawaban chatbot:** edit array `FAQ_DATA` di `js/main.js`. Setiap entri punya:
  ```js
  {
    keywords: ["ongkir", "kirim"],   // kata kunci pemicu
    question: "Berapa ongkir?",       // ditampilkan di FAQ & tombol saran chat
    answer: "Jawaban lengkapnya...",
  }
  ```
  Tambahkan objek baru ke array ini untuk menambah topik FAQ baru — otomatis akan muncul juga di bagian "Pertanyaan Umum" pada halaman utama.

---

## Rencana & Rekomendasi Metode Pembayaran

> Catatan: saya bukan penasihat keuangan atau hukum. Bagian ini adalah gambaran umum opsi teknis yang tersedia — untuk kepastian pajak, izin usaha, dan kepatuhan terhadap regulasi Jepang (misalnya aturan penjualan makanan/impor), sebaiknya berkonsultasi dengan akuntan atau konsultan bisnis setempat.

Karena situs ini statis (tanpa backend), pembayaran saat ini **belum otomatis** — checkout hanya menyiapkan pesan pesanan lewat WhatsApp, lalu admin dan pembeli menyepakati metode bayar secara manual. Berikut rencana bertahap:

### Fase 1 (Sekarang — MVP, tanpa biaya integrasi)

| Metode | Kelebihan | Kekurangan | Paling cocok untuk |
|---|---|---|---|
| **Transfer Bank** (Japan Post Bank / Yucho) | Hampir semua PMI & WNI di Jepang punya rekening ini; tanpa biaya tambahan | Konfirmasi manual, admin perlu cek mutasi & bukti transfer satu per satu | Transaksi rutin, pelanggan tetap |
| **PayPay / LINE Pay** | Transfer instan via QR, tercatat otomatis di riwayat aplikasi | Tidak semua pembeli sudah punya akun/saldo | Pembeli yang terbiasa cashless |
| **Bayar Tunai di Konbini** (manual) | Bisa dipakai walau belum punya rekening bank Jepang | Prosesnya lebih ribet tanpa payment gateway (perlu kirim kode bayar manual) | PMI yang baru datang & belum punya rekening |
| **COD / Titik Kumpul Komunitas** | Tanpa biaya transaksi, membangun kepercayaan | Terbatas area & jadwal, perlu koordinasi logistik | Kota dengan komunitas WNI padat (Tokyo, Osaka, Aichi, dll.) |

### Fase 2 (Setelah order rutin & stabil)

Pertimbangkan integrasi **payment gateway** seperti **Stripe** (mendukung kartu kredit/debit dan pembayaran konbini otomatis di Jepang) atau layanan lokal seperti **Square** / **Univapay**. Ini butuh sedikit pengembangan backend (situs statis saat ini tidak cukup — perlu server kecil untuk memproses transaksi dengan aman), tapi manfaatnya:
- Pembayaran & konfirmasi otomatis, admin tidak perlu cek manual satu-satu.
- Bisa menerima kartu kredit/debit dari pembeli yang lebih nyaman pakai itu.
- Rekonsiliasi keuangan lebih rapi untuk laporan/pajak.

### Fase 3 (Skala lebih besar)

- Sistem poin loyalitas / member untuk pelanggan tetap.
- Integrasi dengan kasir toko fisik bila Warung Nusantara membuka lokasi offline.
- Otomatisasi hitung ongkir berdasarkan berat & prefektur tujuan (integrasi API Japan Post/Yamato).

---

## Batasan Teknis Saat Ini

Situs ini adalah **situs statis** (HTML/CSS/JS murni, tanpa server atau database). Ini membuatnya gratis dan mudah dikelola, tapi ada beberapa batasan yang perlu dipahami pemilik toko:

- **Tidak ada database pusat.** Katalog produk hanya berupa satu file JSON yang di-edit manual/lewat halaman admin. Cocok untuk puluhan–ratusan produk, tapi akan merepotkan bila katalog sudah sangat besar atau dikelola banyak admin sekaligus.
- **Keranjang belanja tersimpan di browser masing-masing pembeli** (localStorage), bukan di server. Jika pembeli ganti perangkat/browser, keranjang akan kosong lagi.
- **Checkout & request barang belum otomatis** — semuanya lewat WhatsApp manual. Tidak ada sistem pelacakan status pesanan otomatis.
- **Chatbot bersifat rule-based sederhana**, bukan AI — hanya mencocokkan kata kunci, bukan memahami konteks percakapan.
- **Halaman admin tidak memiliki otentikasi sungguhan.** Kata sandinya tersimpan di kode sumber (dapat dilihat siapa pun yang memeriksa file `js/admin.js`). Ini cukup untuk mencegah pengunjung biasa, tapi tidak aman dari orang yang sengaja ingin membaca kode sumber.

**Jika bisnis berkembang, rekomendasi langkah lanjutan:**
1. Pindahkan katalog ke database sungguhan (mis. Google Sheets sebagai CMS ringan, Airtable, atau database seperti Supabase/Firebase) supaya banyak admin bisa mengelola bersamaan dengan aman.
2. Tambahkan backend kecil (mis. Node.js/Express) untuk memproses form request & checkout secara otomatis, plus autentikasi admin yang sesungguhnya (login dengan hash password, bukan password polos di kode).
3. Integrasikan payment gateway (Fase 2 di atas) agar pembayaran terverifikasi otomatis.

---

## Checklist Sebelum Go-Live

- [ ] Ganti `ADMIN_WHATSAPP` di `js/main.js` dengan nomor WhatsApp admin yang aktif
- [ ] Ganti kata sandi default `ADMIN_PASSWORD` di `js/admin.js`
- [ ] Isi ulang `data/products.json` dengan produk & harga asli (contoh data saat ini hanya untuk demo)
- [ ] Cek ulang semua harga sudah termasuk margin keuntungan
- [ ] Tes buka situs di HP (Android & iPhone) untuk memastikan tampilan rapi
- [ ] Tes kirim pesan lewat tombol checkout, form request, dan chatbot — pastikan WhatsApp terbuka dengan benar
- [ ] Aktifkan GitHub Pages dan catat URL situs untuk dibagikan
- [ ] Siapkan nomor rekening/QR PayPay untuk dikirim admin saat ada pesanan masuk
- [ ] (Opsional) Cek ketentuan penjualan makanan & pajak usaha kecil di Jepang bersama konsultan/akuntan setempat
