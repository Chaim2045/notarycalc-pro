import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  office_name: string | null
  office_address: string | null
  office_phone: string | null
  office_logo_url: string | null
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  subscription_start_date: string | null
  subscription_end_date: string | null
  trial_end_date: string | null
  stripe_customer_id: string | null
  payment_method_id: string | null
  theme: 'light' | 'dark'
  accent_color: 'blue' | 'purple' | 'green' | 'red' | 'orange'
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  user_id: string
  name: string
  id_number: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  type: string
  quantity: number
  baseRate: number
  total: number
}

export type Calculation = {
  id: string
  user_id: string
  client_id: string | null
  client_name: string | null
  services: Service[]
  subtotal: number
  vat: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type Template = {
  id: string
  user_id: string
  name: string
  description: string | null
  services: Service[]
  created_at: string
}

export type Payment = {
  id: string
  user_id: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  stripe_payment_id: string | null
  payment_method: string | null
  invoice_url: string | null
  receipt_url: string | null
  created_at: string
}
