/* =========================================================
   WARUNG NUSANTARA — SUPABASE CONFIG
   
   CARA SETUP:
   1. Buat akun Supabase di https://supabase.com (gratis)
   2. Buat project baru
   3. Buka Settings > API
   4. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di bawah
   ========================================================= */

const SUPABASE_URL = "GANTI_DENGAN_URL_SUPABASE_ANDA";
// Contoh: "https://abcdefgh.supabase.co"

const SUPABASE_ANON_KEY = "GANTI_DENGAN_ANON_KEY_SUPABASE_ANDA";
// Contoh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Inisialisasi Supabase client (menggunakan CDN, lihat index.html)
// Variabel `supabase` tersedia secara global setelah script ini dimuat
let _supabaseClient = null;

function getSupabase() {
  if (!_supabaseClient) {
    if (
      SUPABASE_URL === "GANTI_DENGAN_URL_SUPABASE_ANDA" ||
      SUPABASE_ANON_KEY === "GANTI_DENGAN_ANON_KEY_SUPABASE_ANDA"
    ) {
      console.warn(
        "⚠️ Supabase belum dikonfigurasi! Buka js/supabase-config.js dan isi SUPABASE_URL & SUPABASE_ANON_KEY"
      );
      return null;
    }
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

// Cek apakah Supabase sudah dikonfigurasi
function isSupabaseConfigured() {
  return (
    SUPABASE_URL !== "GANTI_DENGAN_URL_SUPABASE_ANDA" &&
    SUPABASE_ANON_KEY !== "GANTI_DENGAN_ANON_KEY_SUPABASE_ANDA"
  );
}
