/* =========================================================
   WARUNG NUSANTARA — SUPABASE CONFIG
   
   CARA SETUP:
   1. Buat akun Supabase di https://supabase.com (gratis)
   2. Buat project baru
   3. Buka Settings > API
   4. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di bawah
   ========================================================= */

const SUPABASE_URL = "https://pbxpinjuyufqwtdjhzpf.supabase.co";
// Contoh: "https://abcdefgh.supabase.co"
// ⚠️ Jangan tambahkan /rest/v1/ atau path apapun di belakangnya!

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHBpbmp1eXVmcXd0ZGpoenBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDc1NTUsImV4cCI6MjA5ODgyMzU1NX0.B7CnLAhcmokL64Tpbcwl-o6_v4vAQrEphy3x0KI_0Yo";
// Contoh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Inisialisasi Supabase client (menggunakan CDN, lihat index.html)
// Variabel `supabase` tersedia secara global setelah script ini dimuat
let _supabaseClient = null;

// Placeholder untuk pengecekan — JANGAN UBAH BARIS INI
const _PLACEHOLDER_URL = "GANTI_DENGAN_URL_SUPABASE_ANDA";
const _PLACEHOLDER_KEY = "GANTI_DENGAN_ANON_KEY_SUPABASE_ANDA";

function getSupabase() {
  if (!_supabaseClient) {
    if (!isSupabaseConfigured()) {
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
    SUPABASE_URL !== _PLACEHOLDER_URL &&
    SUPABASE_ANON_KEY !== _PLACEHOLDER_KEY &&
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_URL.includes(".supabase.co")
  );
}
