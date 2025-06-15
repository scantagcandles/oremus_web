import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { REALTIME_CHANNELS, TABLES } from '@/configs/supabase'
import { Database } from '@/types/supabase'

export type RealtimeSubscription = {
  channelName: string
  channel: RealtimeChannel
  unsubscribe: () => void
}

class RealtimeService {
  private client: SupabaseClient<Database>
  private subscriptions: Map<string, RealtimeSubscription>

  constructor(client: SupabaseClient<Database>) {
    this.client = client
    this.subscriptions = new Map()
  }

  subscribeToCandles(userId: string, callback: (update: any) => void) {
    const channelName = REALTIME_CHANNELS.CANDLE_UPDATES
    
    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName)!
    }

    const channel = this.client
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: TABLES.CANDLES,
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()

    const subscription = {
      channelName,
      channel,
      unsubscribe: () => {
        channel.unsubscribe()
        this.subscriptions.delete(channelName)
      },
    }

    this.subscriptions.set(channelName, subscription)
    return subscription
  }

  subscribeToMasses(userId: string, callback: (update: any) => void) {
    const channelName = REALTIME_CHANNELS.MASS_UPDATES
    
    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName)!
    }

    const channel = this.client
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: TABLES.MASSES,
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()

    const subscription = {
      channelName,
      channel,
      unsubscribe: () => {
        channel.unsubscribe()
        this.subscriptions.delete(channelName)
      },
    }

    this.subscriptions.set(channelName, subscription)
    return subscription
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
    this.subscriptions.clear()
  }
}

export const realtimeService = new RealtimeService(supabase)
