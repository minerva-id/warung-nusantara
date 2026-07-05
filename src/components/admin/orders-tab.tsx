'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye } from 'lucide-react'

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'menunggu_bayar': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">Belum Bayar</span>
      case 'bukti_diterima': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Verifikasi</span>
      case 'diproses': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">Diproses</span>
      case 'dikirim': return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">Dikirim</span>
      case 'selesai': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Selesai</span>
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Pesanan Masuk</h2>
          <p className="text-sm text-gray-500">Pantau dan proses pesanan dari pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">ID Pesanan</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Belum ada pesanan</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-medium">{o.order_number}</td>
                    <td className="p-4">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">{o.customer_phone}</p>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 font-mono font-medium">¥{o.total_amount}</td>
                    <td className="p-4">{getStatusBadge(o.status)}</td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 ml-auto text-xs font-medium">
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
