import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

export interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id)
          
          if (existingItem) {
            // Update quantity if item exists, up to max stock
            const newQuantity = Math.min(existingItem.quantity + quantity, product.stok)
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: newQuantity } : item
              ),
            }
          }
          
          // Add new item if in stock
          if (product.stok > 0) {
            return { items: [...state.items, { ...product, quantity: Math.min(quantity, product.stok) }] }
          }
          
          return state
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === productId) {
              return { ...item, quantity: Math.max(1, Math.min(quantity, item.stok)) }
            }
            return item
          }),
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.harga * item.quantity, 0)
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'warung-cart-storage',
    }
  )
)
