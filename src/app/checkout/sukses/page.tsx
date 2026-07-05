'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, Upload, ArrowRight } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [copied, setCopied] = useState(false)
  const [bankInfo, setBankInfo] = useState<any>(null)

  useEffect(() => {
    // Fetch bank info from settings
    const fetchSettings = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('store_settings').select('*')
      if (data) {
        const settings = data.reduce((acc: any, row) => {
          acc[row.key_name] = row.value
          return acc
        }, {})
        setBankInfo(settings)
      }
    }
    fetchSettings()
  }, [])

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!orderNumber) {
    return (
      <div className="p-8 text-center">
        <p>Pesanan tidak ditemukan.</p>
        <Link href="/" className="text-primary mt-4 inline-block">Kembali ke Beranda</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto min-h-screen">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={40} strokeWidth={2.5} />
      </div>
      
      <h1 className="font-fraunces text-2xl font-bold text-center mb-2">Pesanan Berhasil Dibuat!</h1>
      <p className="text-center text-muted-foreground text-sm mb-8">
        Terima kasih telah berbelanja. Silakan lakukan pembayaran agar pesanan Anda segera diproses.
      </p>

      <div className="bg-card w-full rounded-2xl border border-border p-5 shadow-sm mb-6 relative overflow-hidden">
        {/* Ticket decoration */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-muted rounded-full border border-border"></div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-muted rounded-full border border-border"></div>
        
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold text-center mb-2">Nomor Pesanan</p>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-xl font-bold text-primary">{orderNumber}</span>
          <button 
            onClick={handleCopy}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="bg-card w-full rounded-2xl border border-border p-5 shadow-sm mb-8">
        <h2 className="font-semibold mb-4 text-center">Langkah Selanjutnya</h2>
        
        <div className="flex flex-col gap-6 relative">
          {/* Connecting line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10"></div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-sm">Transfer Pembayaran</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-2">Transfer sesuai total belanja ke rekening admin.</p>
              
              {bankInfo && (
                <div className="bg-muted p-3 rounded-xl border border-border text-xs">
                  <p className="font-bold">BCA: {bankInfo.bank_bca_nomor}</p>
                  <p className="text-muted-foreground">a.n {bankInfo.bank_bca_atas_nama}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-sm">Upload Bukti</h3>
              <p className="text-xs text-muted-foreground mt-1">Upload foto resi/screenshot transfer untuk verifikasi admin.</p>
            </div>
          </div>
        </div>
      </div>

      <Link 
        href={`/konfirmasi?order=${orderNumber}`}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
      >
        <Upload size={18} />
        Upload Bukti Pembayaran
      </Link>
      
      <Link 
        href="/"
        className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
