// web/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

// web/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  })
}

// web/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// web/lib/supabase/auth.ts
import { createClient } from './client'
import { createServerClient } from './server'
import type { User } from '@supabase/supabase-js'

export async function getUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getServerUser(): Promise<User | null> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, metadata?: any) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// web/lib/supabase/queries.ts
import { createClient } from './client'
import { createServerClient } from './server'
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']

// Prayer queries
export async function getActivePrayerCount() {
  const supabase = createClient()
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  
  const { count, error } = await supabase
    .from('prayer_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .gte('started_at', thirtyMinutesAgo)
  
  if (error) throw error
  return count || 0
}

export async function getPublicIntentions(limit = 20) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('prayer_intentions')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// Candle queries
export async function getActiveCandles() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('candles')
    .select(`
      *,
      prayer_sessions!inner (
        id,
        user_id,
        is_active,
        profiles (
          full_name
        )
      )
    `)
    .eq('is_lit', true)
    .eq('prayer_sessions.is_active', true)
  
  if (error) throw error
  return data
}

// Mass queries
export async function getChurches(city?: string, limit = 10) {
  const supabase = createClient()
  
  let query = supabase
    .from('churches')
    .select('*')
    .eq('is_active', true)
    .limit(limit)
  
  if (city) {
    query = query.eq('city', city)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function orderMass(orderData: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('mass_orders')
    .insert([{
      user_id: user.id,
      ...orderData,
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Profile queries
export async function getUserProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(updates: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Real-time subscriptions
export function subscribeToActivePrayers(callback: (payload: any) => void) {
  const supabase = createClient()
  
  return supabase
    .channel('active_prayers')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'prayer_sessions' }, 
      callback
    )
    .subscribe()
}

export function subscribeToIntentions(candleId: string, callback: (payload: any) => void) {
  const supabase = createClient()
  
  return supabase
    .channel(`intentions_${candleId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'prayer_intentions',
        filter: `candle_id=eq.${candleId}`
      }, 
      callback
    )
    .subscribe()
}