'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

export default function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data } = await supabase.from('payment_confirmations').select('*').order('created_at', { ascending: false })
    if (data) setPayments(data)
    setLoading(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Konfirmasi Pembayaran</h2>
          <p className="text-sm text-gray-500">Verifikasi bukti transfer dari pelanggan.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-200">Memuat data...</div>
        ) : payments.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-200">Belum ada konfirmasi pembayaran</div>
        ) : (
          payments.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3 relative">
              {p.status === 'pending' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order {p.order_number}</p>
                  <p className="font-semibold">{p.nama_pengirim}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-primary">¥{p.jumlah_transfer}</p>
                  <p className="text-xs text-gray-500">{p.metode_bayar}</p>
                </div>
              </div>
              
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                {p.bukti_url ? (
                  <>
                    <img src={p.bukti_url} className="w-full h-full object-cover" />
                    <a href={p.bukti_url} target="_blank" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={24} />
                    </a>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Tidak ada gambar</span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 text-center">Transfer Tgl: {p.tanggal_transfer}</p>
              
              {p.status === 'pending' ? (
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:bg-green-600 transition-colors">
                    <CheckCircle2 size={16} /> Terima
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors">
                    <XCircle size={16} /> Tolak
                  </button>
                </div>
              ) : (
                <div className="mt-2 py-2 rounded-lg text-sm font-semibold text-center bg-gray-50 text-gray-500 border border-gray-100 flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} className="text-green-500" /> Sudah Diverifikasi
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
