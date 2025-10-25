import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwporuaungxdehnyklym.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

if (supabaseAnonKey === 'your_supabase_anon_key') {
  console.error('⚠️  Please update your .env.local file with your actual Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
