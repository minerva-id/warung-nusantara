'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PackageSearch, Clock, User, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const pathname = usePathname()
  
  // Hide bottom nav on admin and checkout pages
  if (pathname?.startsWith('/admin') || 
      pathname?.startsWith('/keranjang') || 
      pathname?.startsWith('/checkout') || 
      pathname?.startsWith('/konfirmasi')) {
    return null
  }

  const tabs = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Request', href: '/request', icon: ClipboardList },
    { name: 'Lacak', href: '/lacak-pesanan', icon: PackageSearch },
    { name: 'Riwayat', href: '/riwayat', icon: Clock },
    { name: 'Akun', href: '/akun', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 max-w-3xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || 
                          (tab.href !== '/' && pathname?.startsWith(tab.href))
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
