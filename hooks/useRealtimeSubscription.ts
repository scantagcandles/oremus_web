import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Tables, TableRow } from '@/configs/supabase'

type RealtimePostgresChangesPayload<T> = {
  new: T | null
  old: T | null
  eventType: string
}
import { supabase } from '@/lib/supabase/client'
import { REALTIME_CHANNELS } from '@/configs/supabase'

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE'
type SubscriptionFilter = {
  event: SubscriptionEvent
  schema?: string
  table: string
  filter?: string
}

type SubscriptionCallback<T> = (payload: {
  new: T | null
  old: T | null
  eventType: SubscriptionEvent
}) => void

export const useRealtimeSubscription = <T>(
  filter: SubscriptionFilter,
  callback: SubscriptionCallback<T>
) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const { schema = 'public', table, event, filter: filterString } = filter
    
    // Create a new channel with a unique name
    const channelName = `${schema}:${table}:${event}:${filterString || 'all'}`
    
    try {
      const newChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            filter: filterString,
          },          (payload: RealtimePostgresChangesPayload<T>) => {
            callback({
              new: payload.new,
              old: payload.old,
              eventType: payload.eventType as SubscriptionEvent,
            })
          }
        )
        .subscribe((status) => {
          if (status === 'CLOSED') {
            setError(new Error('Subscription closed unexpectedly'))
          }
        })

      setChannel(newChannel)

      // Cleanup function
      return () => {
        newChannel.unsubscribe()
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Subscription error'))
    }
  }, [filter, callback])

  return { error }
}

// Example usage for candle updates:
export const useCandleUpdates = (userId: string) => {
  const [candles, setCandles] = useState<TableRow<'candles'>[]>([])

  useRealtimeSubscription<TableRow<'candles'>>(
    {
      event: 'UPDATE',
      table: 'candles',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      if (payload.new) {
        setCandles((current) =>
          current.map((candle) =>
            candle.id === payload.new?.id ? payload.new : candle
          )
        )
      }
    }
  )

  return { candles }
}

// Example usage for mass updates:
export const useMassUpdates = (userId: string) => {
  const [masses, setMasses] = useState<TableRow<'masses'>[]>([])

  useRealtimeSubscription<TableRow<'masses'>>(
    {
      event: 'UPDATE',
      table: 'masses',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      if (payload.new) {
        setMasses((current) =>
          current.map((mass) =>
            mass.id === payload.new?.id ? payload.new : mass
          )
        )
      }
    }
  )

  return { masses }
}
