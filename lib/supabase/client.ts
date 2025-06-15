import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Dla kompatybilności z istniejącym kodem
export const supabase = createClient()

// Helper funkcje dla różnych środowisk
export function createClientComponent() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}