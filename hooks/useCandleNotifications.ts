import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CandleService } from '@/services/candle/CandleService'

export const useCandleNotifications = () => {
  const checkExpiringCandles = useCallback(async () => {
    try {
      const activeCandles = await CandleService.getActiveCandles()
      const now = new Date()

      for (const candle of activeCandles) {
        if (!candle.notifications_enabled || candle.notification_sent) continue

        const expiryDate = new Date(candle.expiry_date!)
        const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursLeft <= 24) {
          // WysyÅ‚anie powiadomienia
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Twoja Å›wieca Oremus wygasa', {
              body: `Åšwieca ${candle.type} wygaÅ›nie za ${Math.round(hoursLeft)} godzin.`,
              icon: '/icons/candle-icon.png'
            })
          }

          // WysyÅ‚anie emaila przez Supabase Edge Function
          await supabase.functions.invoke('send-candle-notification', {
            body: { candleId: candle.id }
          })

          // Oznaczanie powiadomienia jako wysÅ‚ane
          await CandleService.updateNotificationSent(candle.id)
        }
      }
    } catch (error) {
      console.error('Error checking expiring candles:', error)
    }
  }, [])

  useEffect(() => {
    // Sprawdzanie co godzinÄ™
    const interval = setInterval(checkExpiringCandles, 60 * 60 * 1000)
    
    // Pierwsze sprawdzenie
    checkExpiringCandles()

    // ProÅ›ba o pozwolenie na powiadomienia
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => clearInterval(interval)
  }, [checkExpiringCandles])
}

