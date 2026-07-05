'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, MapPin, Package, LogOut } from 'lucide-react'

export default function AkunPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [authError, setAuthError] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Cek email Anda untuk konfirmasi pendaftaran.')
      }
    } catch (error: any) {
      setAuthError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) return <div className="p-8 text-center">Memuat...</div>

  if (!user) {
    return (
      <div className="p-6 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="font-fraunces text-2xl font-bold">{isLogin ? 'Masuk' : 'Daftar Akun'}</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin ? 'Masuk untuk melihat pesanan & alamat tersimpan.' : 'Buat akun untuk pengalaman belanja lebih baik.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {authError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">{authError}</div>}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-md mt-2"
            >
              {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Atau</span>
            </div>
          </div>

          <button 
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`
                }
              })
            }}
            className="w-full bg-white text-gray-800 border border-gray-300 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Masuk dengan Google
          </button>

          <div className="text-center mt-6">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary font-semibold"
            >
              {isLogin ? 'Belum punya akun? Daftar via Email' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4 pb-24">
      <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <User size={32} />
        </div>
        <div>
          <h2 className="font-bold text-lg">{user.email?.split('@')[0]}</h2>
          <p className="text-sm opacity-80">{user.email}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button onClick={() => router.push('/riwayat')} className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-primary" />
            <span className="font-semibold text-sm">Pesanan Saya</span>
          </div>
          <span className="text-muted-foreground text-sm">Lihat Riwayat &gt;</span>
        </button>
        <button onClick={() => alert('Fitur simpan alamat akan datang')} className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-primary" />
            <span className="font-semibold text-sm">Alamat Saya</span>
          </div>
          <span className="text-muted-foreground text-sm">&gt;</span>
        </button>
      </div>

      <button 
        onClick={handleLogout}
        className="mt-4 bg-card border border-border text-destructive rounded-2xl p-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
      >
        <LogOut size={18} />
        Keluar
      </button>
    </div>
  )
}
