'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function KonfirmasiForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultOrder = searchParams.get('order') || ''
  
  const [orderNumber, setOrderNumber] = useState(defaultOrder)
  const [namaPengirim, setNamaPengirim] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [metode, setMetode] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      let buktiUrl = null

      // Upload file to Supabase Storage if exists
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${orderNumber}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `transfer/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('bukti-bayar')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('bukti-bayar').getPublicUrl(filePath)
        buktiUrl = data.publicUrl
      }

      // Save to database
      const { error } = await supabase
        .from('payment_confirmations')
        .insert({
          order_number: orderNumber,
          nama_pengirim: namaPengirim,
          jumlah_transfer: parseInt(jumlah),
          tanggal_transfer: tanggal,
          metode_bayar: metode,
          bukti_url: buktiUrl,
          status: 'pending'
        })

      if (error) throw error

      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'bukti_diterima' })
        .eq('order_number', orderNumber)

      setIsSuccess(true)
    } catch (error) {
      console.error('Error submitting payment proof:', error)
      alert('Terjadi kesalahan. Pastikan form diisi dengan benar dan ukuran file tidak terlalu besar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Konfirmasi Terkirim!</h2>
        <p className="text-muted-foreground mb-8">
          Admin akan memverifikasi pembayaran Anda maksimal 1x24 jam. 
          Anda dapat melacak status pesanan di menu Lacak.
        </p>
        <button 
          onClick={() => router.push('/lacak-pesanan')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold w-full"
        >
          Lacak Pesanan
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="bg-primary text-primary-foreground px-4 py-6 rounded-b-3xl mb-6 shadow-md relative">
        <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full backdrop-blur-sm">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center mt-2">
          <h1 className="font-fraunces text-2xl font-bold">Konfirmasi Bayar</h1>
          <p className="text-primary-foreground/80 text-sm">Upload bukti transfer Anda</p>
        </div>
      </header>

      <div className="px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Nomor Pesanan</label>
              <input 
                type="text" 
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="WN-2024..."
                required
                className="w-full border border-border rounded-xl px-4 py-3 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Bank Tujuan</label>
              <select 
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent appearance-none"
              >
                <option value="" disabled>Pilih Bank Transfer</option>
                <option value="BCA">BCA</option>
                <option value="BRI">BRI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Nama Pengirim</label>
              <input 
                type="text" 
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
                placeholder="Nama di rekening pengirim"
                required
                className="w-full border border-border rounded-xl px-4 py-3 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-semibold text-foreground">Jumlah (¥)</label>
                <input 
                  type="number" 
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full border border-border rounded-xl px-4 py-3 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-semibold text-foreground">Tanggal</label>
                <input 
                  type="date" 
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full border border-border rounded-xl px-4 py-3 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-semibold text-foreground">Bukti Transfer</label>
              <div className="relative border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                {previewUrl ? (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/5" />
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFile(null); setPreviewUrl(null); }}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded shadow-md"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-center">Tap untuk upload foto</p>
                    <p className="text-xs text-muted-foreground text-center">JPG, PNG maks 5MB</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!file}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-md active:scale-[0.98] transition-transform flex justify-center disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function KonfirmasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <KonfirmasiForm />
    </Suspense>
  )
}
