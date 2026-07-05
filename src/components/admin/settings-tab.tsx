'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'

export default function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({
    bank_bca_nomor: '',
    bank_bca_atas_nama: '',
    bank_bri_nomor: '',
    bank_bri_atas_nama: '',
    bank_mandiri_nomor: '',
    bank_mandiri_atas_nama: '',
    whatsapp_admin: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const { data } = await supabase.from('store_settings').select('*')
    if (data) {
      const newSettings = { ...settings }
      data.forEach(row => {
        newSettings[row.key_name] = row.value
      })
      setSettings(newSettings)
    }
    setLoading(false)
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Convert object back to array of upserts
    const upserts = Object.keys(settings).map(key => ({
      key_name: key,
      value: settings[key],
      updated_at: new Date().toISOString()
    }))
    
    // Basic implementation for loop upsert since no easy bulk upsert by key if id is required
    for (const item of upserts) {
      const { data } = await supabase.from('store_settings').select('id').eq('key_name', item.key_name).single()
      if (data) {
        await supabase.from('store_settings').update({ value: item.value, updated_at: item.updated_at }).eq('id', data.id)
      } else {
        await supabase.from('store_settings').insert(item)
      }
    }
    
    alert('Pengaturan berhasil disimpan!')
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat pengaturan...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Pengaturan Toko</h2>
          <p className="text-sm text-gray-500">Konfigurasi rekening bank dan kontak admin.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : <><Save size={16} /> Simpan Perubahan</>}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
        
        <section>
          <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Nomor WhatsApp Admin</h3>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Nomor WA (Gunakan kode negara, ex: 62812...)</label>
            <input 
              type="text" 
              value={settings.whatsapp_admin}
              onChange={e => handleChange('whatsapp_admin', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary max-w-sm"
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Rekening Bank BCA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nomor Rekening</label>
              <input type="text" value={settings.bank_bca_nomor} onChange={e => handleChange('bank_bca_nomor', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Atas Nama</label>
              <input type="text" value={settings.bank_bca_atas_nama} onChange={e => handleChange('bank_bca_atas_nama', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Rekening Bank BRI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nomor Rekening</label>
              <input type="text" value={settings.bank_bri_nomor} onChange={e => handleChange('bank_bri_nomor', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Atas Nama</label>
              <input type="text" value={settings.bank_bri_atas_nama} onChange={e => handleChange('bank_bri_atas_nama', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Rekening Bank Mandiri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nomor Rekening</label>
              <input type="text" value={settings.bank_mandiri_nomor} onChange={e => handleChange('bank_mandiri_nomor', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Atas Nama</label>
              <input type="text" value={settings.bank_mandiri_atas_nama} onChange={e => handleChange('bank_mandiri_atas_nama', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
