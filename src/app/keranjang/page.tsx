'use client'

import { useCartStore } from '@/store/useCartStore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'

export default function KeranjangPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="p-4 text-center">Memuat keranjang...</div>

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-muted-foreground mb-6">Yuk, pilih produk Indonesia favoritmu dulu!</p>
        <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-32">
      <header className="bg-card px-4 py-3 flex items-center gap-3 border-b border-border sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">Keranjang Saya</h1>
      </header>

      <div className="flex flex-col gap-3 p-3">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3">
            <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center text-4xl shrink-0 overflow-hidden border border-border">
              {item.gambar_url ? (
                <img src={item.gambar_url} alt={item.nama} className="w-full h-full object-cover" />
              ) : (
                item.emoji || '🛍️'
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-medium line-clamp-2 leading-tight">{item.nama}</h3>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <span className="font-mono font-bold text-primary text-base">¥{item.harga.toLocaleString('ja-JP')}</span>
                
                <div className="flex items-center gap-3 bg-muted rounded-lg border border-border p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-6 h-6 flex items-center justify-center text-foreground hover:bg-background rounded disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stok}
                    className="w-6 h-6 flex items-center justify-center text-foreground hover:bg-background rounded disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Belanja</span>
            <span className="font-mono font-bold text-primary text-xl leading-none mt-1">¥{getTotal().toLocaleString('ja-JP')}</span>
          </div>
          <button 
            onClick={() => router.push('/checkout')}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform flex items-center justify-center"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
