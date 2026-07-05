'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TopNav() {
  const pathname = usePathname()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch for persisted store
  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide top nav on admin and checkout pages
  if (pathname?.startsWith('/admin') || 
      pathname?.startsWith('/keranjang') || 
      pathname?.startsWith('/checkout') || 
      pathname?.startsWith('/konfirmasi')) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="flex h-14 items-center justify-between px-4 max-w-3xl mx-auto">
        <Link href="/" className="font-fraunces font-bold text-lg tracking-tight flex items-center gap-2">
          <span>🍚</span> Warung Nusantara
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/keranjang" className="relative p-2">
            <ShoppingCart size={22} />
            {mounted && itemCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-primary bg-white rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
