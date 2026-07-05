# 🍚 Warung Nusantara

Website toko online mobile-first untuk **WNI dan Pekerja Migran Indonesia (PMI) di Jepang** — menjual mie instan, bumbu dapur, sembako, dan kebutuhan konsumsi Indonesia lain yang sulit ditemukan di Jepang.

**[📖 Baca DOCUMENTATION.md](./DOCUMENTATION.md)** untuk panduan lengkap instalasi, cara menambah produk & mengatur harga, serta rencana metode pembayaran.

## Fitur

- 🛍️ Katalog produk dengan kategori & pencarian
- 🛒 Keranjang belanja (tersimpan di browser)
- 📝 Form request barang khusus yang tidak ada di katalog
- 💬 Chatbot FAQ sederhana + eskalasi ke WhatsApp admin
- 🧾 Checkout via WhatsApp (tanpa perlu payment gateway di awal)
- 🔐 Halaman admin (`admin.html`) untuk menambah produk & mengubah harga tanpa coding

## Struktur Proyek

```
warung-nusantara/
├── index.html          # Halaman utama toko
├── admin.html          # Halaman admin untuk kelola katalog & harga
├── css/
│   ├── style.css        # Gaya utama toko
│   └── admin.css        # Gaya tambahan halaman admin
├── js/
│   ├── main.js           # Logika katalog, keranjang, form, chatbot
│   └── admin.js          # Logika CRUD produk di halaman admin
├── data/
│   └── products.json     # Sumber data katalog produk
├── DOCUMENTATION.md
└── README.md
```

## Menjalankan di Lokal

Karena situs memuat `data/products.json` lewat `fetch()`, buka lewat server lokal (bukan klik dua kali file HTML):

```bash
cd warung-nusantara
python3 -m http.server 8080
# buka http://localhost:8080 di browser
```

## Deploy Gratis dengan GitHub Pages

Lihat langkah lengkap di [DOCUMENTATION.md](./DOCUMENTATION.md#deploy-ke-github-pages).

## Lisensi

Bebas digunakan dan dimodifikasi untuk kebutuhan Warung Nusantara.
