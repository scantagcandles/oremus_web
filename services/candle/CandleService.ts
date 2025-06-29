import { supabase } from '@/lib/supabase/client'
import { OremusCandle, ExtendCandleRequest, CandleStats } from '@/types/candle'

export class CandleService {
  // Pobieranie świecy po ID NFC
  static async getCandleByNfcId(nfcId: string): Promise<OremusCandle | null> {
    const { data, error } = await supabase
      .from('candles')
      .select('*')
      .eq('nfc_id', nfcId)
      .single()

    if (error) throw error
    return data
  }

  // Aktywacja świecy
  static async activateCandle(candleId: string): Promise<void> {
    const now = new Date()
    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + 7) // domyślnie 7 dni

    const { error } = await supabase
      .from('candles')
      .update({
        is_active: true,
        activation_date: now.toISOString(),
        expiry_date: expiryDate.toISOString()
      })
      .eq('id', candleId)

    if (error) throw error
  }

  // Przedłużenie czasu palenia świecy
  static async extendCandle({ candle_id, hours }: ExtendCandleRequest): Promise<void> {
    const { data: candle, error: fetchError } = await supabase
      .from('candles')
      .select('expiry_date')
      .eq('id', candle_id)
      .single()

    if (fetchError) throw fetchError

    const currentExpiry = new Date(candle.expiry_date)
    const newExpiry = new Date(currentExpiry.getTime() + hours * 60 * 60 * 1000)

    const { error } = await supabase
      .from('candles')
      .update({
        expiry_date: newExpiry.toISOString()
      })
      .eq('id', candle_id)

    if (error) throw error
  }

  // Pobieranie wszystkich aktywnych świec
  static async getActiveCandles(): Promise<OremusCandle[]> {
    const { data, error } = await supabase
      .from('candles')
      .select('*')
      .eq('is_active', true)
      .order('expiry_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Pobieranie statystyk świec
  static async getCandleStats(): Promise<CandleStats> {
    const { data, error } = await supabase
      .rpc('get_candle_stats')

    if (error) throw error
    return data
  }

  // Aktualizacja statusu powiadomień
  static async updateNotificationSent(candleId: string): Promise<void> {
    const { error } = await supabase
      .from('candles')
      .update({
        notification_sent: true
      })
      .eq('id', candleId)

    if (error) throw error
  }

  // Włączanie/wyłączanie powiadomień dla świecy
  static async toggleNotifications(candleId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('candles')
      .update({
        notifications_enabled: enabled
      })
      .eq('id', candleId)

    if (error) throw error
  }
}
