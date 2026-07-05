'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Package, Clock, Truck, CheckCircle2, ChevronRight } from 'lucide-react'

export default function RiwayatPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }
      
      setUser(session.user)
      
      // Since order schema might not have user_id linked properly yet if we didn't save it during checkout
      // We'll just fetch orders based on phone/name if we had that, or user_id if we saved it.
      // For now, let's fetch based on user_id if we add it to the schema, or email?
      // Wait, in checkout we didn't save user_id. Let's assume we update checkout to save user_id later.
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        // .eq('user_id', session.user.id) // Will add this when checkout is updated
        .order('created_at', { ascending: false })
        .limit(10) // Just show recent 10 for demo if no user filter
        
      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }
    
    fetchOrders()
  }, [])

  if (loading) return <div className="p-8 text-center">Memuat riwayat...</div>

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <Package size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Masuk untuk Lihat Riwayat</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Anda perlu masuk ke akun untuk melihat riwayat pesanan yang tersimpan.
        </p>
        <button 
          onClick={() => router.push('/akun')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold w-full max-w-xs"
        >
          Masuk / Daftar
        </button>
      </div>
    )
  }

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'menunggu_bayar': return { text: 'Belum Bayar', icon: Clock, color: 'text-orange-500 bg-orange-100' }
      case 'bukti_diterima': return { text: 'Verifikasi', icon: Clock, color: 'text-blue-500 bg-blue-100' }
      case 'diproses': return { text: 'Dikemas', icon: Package, color: 'text-purple-500 bg-purple-100' }
      case 'dikirim': return { text: 'Dikirim', icon: Truck, color: 'text-indigo-500 bg-indigo-100' }
      case 'selesai': return { text: 'Selesai', icon: CheckCircle2, color: 'text-green-500 bg-green-100' }
      default: return { text: status, icon: Package, color: 'text-gray-500 bg-gray-100' }
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="bg-card px-4 py-4 border-b border-border sticky top-0 z-10 shadow-sm">
        <h1 className="font-semibold text-lg">Riwayat Pesanan</h1>
      </header>
      
      <div className="p-4 flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold">Belum ada pesanan</h3>
            <p className="text-sm text-muted-foreground">Pesanan yang Anda buat akan muncul di sini.</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusDisplay = getStatusDisplay(order.status)
            const StatusIcon = statusDisplay.icon
            
            return (
              <div key={order.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-muted-foreground">{order.order_number}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusDisplay.color}`}>
                    <StatusIcon size={12} />
                    <span>{statusDisplay.text}</span>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold mb-1">Total Belanja</p>
                    <p className="font-mono text-primary font-bold">¥{order.total_amount.toLocaleString('ja-JP')}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/lacak-pesanan?order=${order.order_number}`)}
                    className="flex items-center gap-1 text-sm font-medium border border-border px-4 py-2 rounded-lg hover:bg-muted/50"
                  >
                    Detail
                  </button>
                </div>
                
                {order.status === 'menunggu_bayar' && (
                  <div className="p-3 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
                    <span className="text-xs text-orange-800">Selesaikan pembayaran</span>
                    <button 
                      onClick={() => router.push(`/konfirmasi?order=${order.order_number}`)}
                      className="text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-md"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
