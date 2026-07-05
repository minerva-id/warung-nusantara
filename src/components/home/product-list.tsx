'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import ProductCard from './product-card'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'

type Product = Database['public']['Tables']['products']['Row']

interface ProductListProps {
  initialProducts: Product[]
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState<string>('semua')
  const [searchQuery, setSearchQuery] = useState('')

  // Extract unique categories
  const categories = ['semua', ...Array.from(new Set(initialProducts.map(p => p.kategori)))]

  // Format category name for display
  const formatCategory = (cat: string) => {
    return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  // Filter products
  const filteredProducts = initialProducts.filter(product => {
    const matchesCategory = activeCategory === 'semua' || product.kategori === activeCategory
    const matchesSearch = product.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.deskripsi && product.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          placeholder="Cari Indomie, kecap, bumbu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            {formatCategory(category)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="font-semibold text-lg">Produk tidak ditemukan</h3>
          <p className="text-muted-foreground text-sm">Coba kata kunci lain atau pilih kategori Semua.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4"
        >
          <AnimatePresence>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
