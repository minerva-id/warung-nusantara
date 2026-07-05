'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquarePlus, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RequestPage() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [barang, setBarang] = useState('')
  const [jumlah, setJumlah] = useState('1')
  const [catatan, setCatatan] = useState('')
  const [adminWa, setAdminWa] = useState('')

  useEffect(() => {
    const fetchWa = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('store_settings').select('value').eq('key_name', 'whatsapp_admin').single()
      if (data) setAdminWa(data.value)
    }
    fetchWa()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !barang || !jumlah) return

    const waNumber = adminWa || '6281234567890'
    const message = `Halo Admin Warung Nusantara, saya ingin request barang khusus:\n\n*Nama:* ${nama}\n*Barang:* ${barang}\n*Jumlah:* ${jumlah}\n*Catatan:* ${catatan || '-'}\n\nTerima kasih!`
    const waUrl = `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    
    window.open(waUrl, '_blank')
    
    // Clear form
    setNama('')
    setBarang('')
    setJumlah('1')
    setCatatan('')
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-6 rounded-b-3xl mb-6 shadow-md relative">
        <div className="text-center mt-2">
          <h1 className="font-fraunces text-2xl font-bold flex items-center justify-center gap-2">
            <MessageSquarePlus size={24} /> Request Barang
          </h1>
          <p className="text-primary-foreground/90 text-sm mt-1">Cari barang yang tidak ada di katalog?</p>
        </div>
      </header>

      <div className="px-4">
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Nama Anda</label>
            <input 
              type="text" 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama Anda"
              required
              className="w-full border border-border rounded-xl px-4 py-3 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Nama Barang yang Dicari</label>
            <input 
              type="text" 
              value={barang}
              onChange={(e) => setBarang(e.target.value)}
              placeholder="Contoh: Bumbu Rujak Bangkok"
              required
              className="w-full border border-border rounded-xl px-4 py-3 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Perkiraan Jumlah</label>
            <input 
              type="number" 
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              required
              className="w-full border border-border rounded-xl px-4 py-3 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Catatan Tambahan (opsional)</label>
            <textarea 
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Kalau bisa merk A, atau ukuran botol besar..."
              className="w-full border border-border rounded-xl px-4 py-3 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent min-h-[100px] resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl mt-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Kirim Permintaan ke Admin
          </button>
        </form>
      </div>
    </div>
  )
}
