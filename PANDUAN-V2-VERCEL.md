# Upgrade Guide Warung Nusantara V2 (Next.js)

Website telah dibangun ulang menggunakan **Next.js** dan disiapkan untuk **Vercel**.
Semua fitur yang Anda minta sudah diimplementasikan (Keranjang terpisah, Checkout profesional, Login/Akun, Riwayat, Lacak Pesanan, dan Admin).

Namun, karena fitur *Akun* baru saja ditambahkan, Anda perlu sedikit menyesuaikan database Supabase yang lama.

## 1. Update Skema Database di Supabase
Jalankan perintah SQL ini di menu **SQL Editor** Supabase Anda untuk menambahkan fitur akun pengguna ke tabel pesanan:

```sql
-- Tambahkan kolom user_id ke tabel orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS (Row Level Security) agar pengguna bisa melihat pesanannya sendiri
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy untuk Insert (semua bisa checkout, baik login maupun anonim)
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);

-- Policy untuk Select (hanya admin atau pemilik pesanan yang bisa melihat)
CREATE POLICY "Enable read for users based on user_id" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR 
  (SELECT (auth.jwt() ->> 'email') = 'admin@warung.com') -- Sesuaikan email admin
);
```

*(Catatan: Tanpa RLS di atas, sementara semua riwayat pesanan bisa dilihat oleh semua pengguna yang login di halaman Riwayat Pesanan).*

## 2. Deploy ke Vercel
Karena aplikasi ini sekarang menggunakan Next.js, Anda tidak lagi deploy ke GitHub Pages, melainkan ke Vercel (gratis dan lebih cocok untuk SSR/Next.js):

1. Login ke [Vercel](https://vercel.com).
2. Hubungkan akun GitHub Anda.
3. Import repository `warung-nusantara` ini.
4. Di bagian **Environment Variables** sebelum klik Deploy, tambahkan:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` | Value: `URL_SUPABASE_ANDA`
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: `ANON_KEY_SUPABASE_ANDA`
5. Klik **Deploy**!
