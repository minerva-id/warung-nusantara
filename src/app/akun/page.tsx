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

          <div className="text-center mt-6">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary font-semibold"
            >
              {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
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
