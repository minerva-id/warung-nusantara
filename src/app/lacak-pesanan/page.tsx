'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

function LacakPesananContent() {
  const searchParams = useSearchParams()
  const defaultOrder = searchParams.get('order') || ''
  
  const [orderNumber, setOrderNumber] = useState(defaultOrder)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!orderNumber.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim())
      .single()

    if (error || !data) {
      setError('Pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.')
    } else {
      setOrder(data)
    }
    
    setLoading(false)
  }

  // Auto search if default order provided in URL
  useState(() => {
    if (defaultOrder) {
      handleSearch()
    }
  })

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'menunggu_bayar': return 1
      case 'bukti_diterima': return 2
      case 'diproses': return 3
      case 'dikirim': return 4
      case 'selesai': return 5
      default: return 0
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="bg-card px-4 py-4 border-b border-border sticky top-0 z-10 shadow-sm">
        <h1 className="font-semibold text-lg">Lacak Pesanan</h1>
      </header>

      <div className="p-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: WN-20240705-1234"
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !orderNumber.trim()}
            className="bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Lacak
          </button>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Mencari pesanan...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3 border border-destructive/20">
            <AlertCircle className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {order && (
          <div className="flex flex-col gap-4">
            {/* Order Summary */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Nomor Pesanan</p>
                  <p className="font-mono text-lg font-bold text-primary">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Belanja</p>
                  <p className="font-mono text-lg font-bold">¥{order.total_amount.toLocaleString('ja-JP')}</p>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="font-semibold">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.customer_phone}</p>
                <p className="text-muted-foreground mt-2 line-clamp-2">{order.customer_address}</p>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold mb-6">Status Pengiriman</h3>
              
              <div className="relative pl-6 flex flex-col gap-8">
                {/* Connecting Line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border -z-10"></div>
                {/* Active Line Fill */}
                <div 
                  className="absolute left-3.5 top-2 w-0.5 bg-primary -z-10 transition-all duration-500"
                  style={{ height: `${(getStatusStep(order.status) - 1) * 25}%` }}
                ></div>

                {/* Step 1 */}
                <div className="relative">
                  <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                    <Clock size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${getStatusStep(order.status) >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Menunggu Pembayaran</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Pesanan dibuat. Silakan transfer ke rekening admin.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${getStatusStep(order.status) >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Bukti Pembayaran Diterima</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Sedang diverifikasi oleh admin.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 3 ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                    <Package size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${getStatusStep(order.status) >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Pesanan Diproses</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Pembayaran terverifikasi. Barang sedang dikemas.</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 4 ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                    <Truck size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${getStatusStep(order.status) >= 4 ? 'text-foreground' : 'text-muted-foreground'}`}>Dalam Pengiriman</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Paket diserahkan ke kurir (Japan Post/Yamato).</p>
                  </div>
                </div>
                
                {/* Step 5 */}
                <div className="relative">
                  <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 5 ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${getStatusStep(order.status) >= 5 ? 'text-foreground' : 'text-muted-foreground'}`}>Selesai</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Pesanan telah diterima.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
              <h3 className="font-semibold mb-3">Rincian Barang</h3>
              <div className="flex flex-col gap-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="flex-1 truncate pr-4">{item.quantity}x {item.nama}</span>
                    <span className="font-mono text-muted-foreground">¥{(item.harga * item.quantity).toLocaleString('ja-JP')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LacakPesananPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <LacakPesananContent />
    </Suspense>
  )
}
