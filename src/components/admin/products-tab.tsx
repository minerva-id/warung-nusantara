'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, X } from 'lucide-react'

export default function ProductsTab() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [stok, setStok] = useState('')
  const [kategori, setKategori] = useState('makanan')
  const [deskripsi, setDeskripsi] = useState('')
  const [gambarUrl, setGambarUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const handleEdit = (p: any) => {
    setEditingId(p.id)
    setNama(p.nama)
    setHarga(p.harga.toString())
    setStok(p.stok.toString())
    setKategori(p.kategori)
    setDeskripsi(p.deskripsi || '')
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingId(null)
    setNama('')
    setHarga('')
    setStok('10')
    setKategori('makanan')
    setDeskripsi('')
    setGambarUrl('')
    setFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if(!confirm('Hapus produk ini?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let finalImageUrl = gambarUrl

      // Upload file to Supabase Storage if a new file is selected
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `produk-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file)

        if (!uploadError) {
          const { data } = supabase.storage.from('products').getPublicUrl(filePath)
          finalImageUrl = data.publicUrl
        } else {
          console.error("Upload error:", uploadError)
          alert("Gagal mengupload gambar, pastikan bucket 'products' sudah dibuat dan public di Supabase.")
        }
      }

      const payload = {
        nama,
        harga: parseInt(harga),
        stok: parseInt(stok),
        kategori,
        deskripsi,
        gambar_url: finalImageUrl,
        aktif: true
      }

      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId)
      } else {
        await supabase.from('products').insert([payload])
      }
      
      setIsModalOpen(false)
      fetchProducts()
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan saat menyimpan produk")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Kelola Produk</h2>
          <p className="text-sm text-gray-500">Tambah, edit, atau hapus produk di katalog Anda.</p>
        </div>
        <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm shadow-sm hover:opacity-90">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Produk</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} required className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-primary" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Harga (¥)</label>
                  <input type="number" value={harga} onChange={e => setHarga(e.target.value)} required className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Stok</label>
                  <input type="number" value={stok} onChange={e => setStok(e.target.value)} required className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Kategori</label>
                  <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-primary bg-white">
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                    <option value="bumbu">Bumbu</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Foto Produk</label>
                <div className="flex items-center gap-4">
                  {(previewUrl || gambarUrl) && (
                    <img src={previewUrl || gambarUrl} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Deskripsi</label>
                <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-primary min-h-[80px]" />
              </div>
              <button type="submit" disabled={isUploading} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2 disabled:opacity-50">
                {isUploading ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada produk</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                          {p.gambar_url ? <img src={p.gambar_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.nama}</p>
                          <p className="text-xs text-gray-500">{p.aktif ? 'Aktif' : 'Nonaktif'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono">¥{p.harga}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stok > 0 ? `${p.stok} unit` : 'Habis'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 capitalize">{p.kategori.replace('-', ' ')}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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
