'use client'

import { useCartStore } from '@/store/useCartStore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, ChevronRight, MapPin, Truck, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  
  // Constants
  const SHIPPING_COST = 800 // Flat rate shipping for now

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

  const subtotal = getTotal()
  const grandTotal = subtotal + SHIPPING_COST

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address || !paymentMethod) {
      alert('Mohon lengkapi semua data dan pilih metode pembayaran.')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    // Generate order number WN-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const orderNumber = `WN-${date}-${random}`

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          items: items,
          total_amount: grandTotal,
          shipping_cost: SHIPPING_COST,
          status: 'menunggu_bayar',
          payment_method: paymentMethod
        })
        .select()
        .single()

      if (error) throw error

      // Clear cart
      clearCart()
      
      // Redirect to success page or payment confirmation
      router.push(`/checkout/sukses?order=${orderNumber}`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <header className="bg-card px-4 py-3 flex items-center gap-3 border-b border-border sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">Checkout</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
        {/* Alamat Pengiriman */}
        <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3">
            <MapPin size={18} />
            <h2>Alamat Pengiriman</h2>
          </div>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-border py-2 bg-transparent focus:outline-none focus:border-primary text-sm"
              required
            />
            <input 
              type="tel" 
              placeholder="Nomor Telepon (WhatsApp)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-border py-2 bg-transparent focus:outline-none focus:border-primary text-sm"
              required
            />
            <textarea 
              placeholder="Alamat Lengkap (Kode Pos, Prefektur, Kota, Gedung/Apartemen)" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border-b border-border py-2 bg-transparent focus:outline-none focus:border-primary text-sm min-h-[80px] resize-none"
              required
            />
          </div>
        </section>

        {/* Ringkasan Produk */}
        <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <h2 className="font-semibold mb-3 text-sm">Pesanan Anda ({items.length} produk)</h2>
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                  {item.gambar_url ? (
                    <img src={item.gambar_url} alt={item.nama} className="w-full h-full object-cover" />
                  ) : (
                    item.emoji || '🛍️'
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <h3 className="text-sm line-clamp-2">{item.nama}</h3>
                  <div className="flex justify-between items-end mt-1">
                    <span className="font-mono font-semibold text-primary">¥{item.harga.toLocaleString('ja-JP')}</span>
                    <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Metode Pengiriman */}
        <section className="bg-card rounded-2xl p-4 border border-border shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">Pengiriman Standar (Flat)</p>
              <p className="text-xs text-muted-foreground">Seluruh wilayah Jepang</p>
            </div>
          </div>
          <span className="font-mono font-semibold">¥{SHIPPING_COST.toLocaleString('ja-JP')}</span>
        </section>

        {/* Metode Pembayaran */}
        <section className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <CreditCard size={18} className="text-primary" />
            <h2>Metode Pembayaran</h2>
          </div>
          <div className="flex flex-col gap-2">
            {['Transfer BCA', 'Transfer BRI', 'Transfer Mandiri', 'QRIS'].map((method) => (
              <label key={method} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === method ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <span className="text-sm font-medium">{method}</span>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 bg-muted p-2 rounded-lg">
            *Setelah checkout, Anda akan diminta mengunggah foto bukti transfer.
          </p>
        </section>

        {/* Rincian Pembayaran */}
        <section className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4">
          <h2 className="font-semibold mb-3 text-sm">Rincian Pembayaran</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal Produk</span>
              <span className="font-mono">¥{subtotal.toLocaleString('ja-JP')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Ongkos Kirim</span>
              <span className="font-mono">¥{SHIPPING_COST.toLocaleString('ja-JP')}</span>
            </div>
            <div className="h-px bg-border my-1"></div>
            <div className="flex justify-between font-bold text-base">
              <span>Total Pembayaran</span>
              <span className="font-mono text-primary">¥{grandTotal.toLocaleString('ja-JP')}</span>
            </div>
          </div>
        </section>
      </form>

      {/* Bottom Floating Action */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Pembayaran</span>
            <span className="font-mono font-bold text-primary text-lg leading-none">¥{grandTotal.toLocaleString('ja-JP')}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !phone || !address || !paymentMethod}
            className="flex-1 bg-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 flex justify-center"
          >
            {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
          </button>
        </div>
      </div>
    </div>
  )
}
