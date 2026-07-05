export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          kategori: string
          nama: string
          deskripsi: string | null
          harga: number
          satuan: string | null
          stok: number
          tag: string[] | null
          emoji: string | null
          unggulan: boolean | null
          gambar_url: string | null
          aktif: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          kategori: string
          nama: string
          deskripsi?: string | null
          harga?: number
          satuan?: string | null
          stok?: number
          tag?: string[] | null
          emoji?: string | null
          unggulan?: boolean | null
          gambar_url?: string | null
          aktif?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          kategori?: string
          nama?: string
          deskripsi?: string | null
          harga?: number
          satuan?: string | null
          stok?: number
          tag?: string[] | null
          emoji?: string | null
          unggulan?: boolean | null
          gambar_url?: string | null
          aktif?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_address: string | null
          items: Json
          total_amount: number
          shipping_cost: number
          status: string
          payment_method: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          customer_name: string
          customer_phone: string
          customer_address?: string | null
          items: Json
          total_amount: number
          shipping_cost?: number
          status?: string
          payment_method?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_address?: string | null
          items?: Json
          total_amount?: number
          shipping_cost?: number
          status?: string
          payment_method?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      payment_confirmations: {
        Row: {
          id: string
          order_number: string
          nama_pengirim: string
          jumlah_transfer: number
          tanggal_transfer: string
          catatan: string | null
          metode_bayar: string
          bukti_url: string | null
          status: string
          created_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          id?: string
          order_number: string
          nama_pengirim: string
          jumlah_transfer: number
          tanggal_transfer: string
          catatan?: string | null
          metode_bayar: string
          bukti_url?: string | null
          status?: string
          created_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          nama_pengirim?: string
          jumlah_transfer?: number
          tanggal_transfer?: string
          catatan?: string | null
          metode_bayar?: string
          bukti_url?: string | null
          status?: string
          created_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
      }
      product_requests: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          request_text: string
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          request_text: string
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          request_text?: string
          status?: string
          created_at?: string | null
        }
      }
      store_settings: {
        Row: {
          id: string
          key_name: string
          value: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          key_name: string
          value: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          key_name?: string
          value?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
