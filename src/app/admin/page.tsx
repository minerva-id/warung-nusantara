'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingBag, CreditCard, Settings, LogOut, Loader2, Search } from 'lucide-react'

// Sub-components
import ProductsTab from '@/components/admin/products-tab'
import OrdersTab from '@/components/admin/orders-tab'
import PaymentsTab from '@/components/admin/payments-tab'
import SettingsTab from '@/components/admin/settings-tab'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error: any) {
      setAuthError('Email atau kata sandi salah')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-fraunces text-primary">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Warung Nusantara</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {authError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{authError}</div>}
            
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Kata Sandi</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                required
              />
            </div>
            
            <button type="submit" className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg mt-2 hover:bg-primary/90 transition-colors">
              Masuk
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:min-h-screen shadow-sm z-10 sticky top-0">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="font-fraunces font-bold text-lg text-primary">Admin WN</h1>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 rounded-md md:hidden">
            <LogOut size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto">
          <TabButton icon={Package} label="Produk" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <TabButton icon={ShoppingBag} label="Pesanan" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <TabButton icon={CreditCard} label="Pembayaran" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
          <TabButton icon={Settings} label="Pengaturan" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        
        <div className="p-4 border-t border-gray-200 hidden md:block">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold">A</div>
            <div className="text-xs truncate">{user.email}</div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 py-2 rounded-lg text-sm font-semibold hover:bg-red-100">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}
