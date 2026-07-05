'use client'

import { Database } from '@/types/database'
import { useCartStore } from '@/store/useCartStore'
import { Plus, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

type Product = Database['public']['Tables']['products']['Row']

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  const isOutOfStock = product.stok <= 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col relative ${
        isOutOfStock ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
    >
      {/* Image Area - Fallback to Emoji if no image_url */}
      <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
        {product.gambar_url ? (
          <img 
            src={product.gambar_url} 
            alt={product.nama} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl">{product.emoji || '🛍️'}</span>
        )}
        
        {/* Badges */}
        {product.unggulan && !isOutOfStock && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-full">
            ⭐ Favorit
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
            Habis
          </span>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">
          {product.nama}
        </h3>
        {product.satuan && (
          <p className="text-[11px] text-muted-foreground mb-2">{product.satuan}</p>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <div className="font-mono font-bold text-primary">
            ¥{product.harga.toLocaleString('ja-JP')}
          </div>
          
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              added 
                ? 'bg-green-500 text-white' 
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
            } ${isOutOfStock ? 'cursor-not-allowed opacity-50' : ''}`}
            aria-label="Tambah ke keranjang"
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
