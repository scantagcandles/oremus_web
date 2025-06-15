import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CandleService } from '@/services/candleService'

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
          // Wysyłanie powiadomienia
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Twoja świeca Oremus wygasa', {
              body: `Świeca ${candle.type} wygaśnie za ${Math.round(hoursLeft)} godzin.`,
              icon: '/icons/candle-icon.png'
            })
          }

          // Wysyłanie emaila przez Supabase Edge Function
          await supabase.functions.invoke('send-candle-notification', {
            body: { candleId: candle.id }
          })

          // Oznaczanie powiadomienia jako wysłane
          await CandleService.updateNotificationSent(candle.id)
        }
      }
    } catch (error) {
      console.error('Error checking expiring candles:', error)
    }
  }, [])

  useEffect(() => {
    // Sprawdzanie co godzinę
    const interval = setInterval(checkExpiringCandles, 60 * 60 * 1000)
    
    // Pierwsze sprawdzenie
    checkExpiringCandles()

    // Prośba o pozwolenie na powiadomienia
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => clearInterval(interval)
  }, [checkExpiringCandles])
}
