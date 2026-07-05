import { createClient } from '@/lib/supabase/server'
import ProductList from '@/components/home/product-list'
import { Database } from '@/types/database'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch active products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('aktif', true)
    .order('kategori')
    .order('unggulan', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
  }

  // Fetch settings like store name or announcement if needed
  
  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground p-6 rounded-b-[2rem] mb-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-fraunces text-3xl font-bold mb-2">Warung Nusantara</h1>
          <p className="text-primary-foreground/90 text-sm">
            Toko online bumbu, mie instan, dan kebutuhan dapur Indonesia di Jepang.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 rotate-12">🍜</div>
        <div className="absolute -left-6 -top-6 text-8xl opacity-10 -rotate-12">🌶️</div>
      </section>

      {/* Product List Component (Client) */}
      <div className="px-4">
        <ProductList initialProducts={products || []} />
      </div>
    </div>
  )
}
