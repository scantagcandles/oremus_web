export interface OremusCandle {
  id: string
  nfc_id: string
  user_id: string
  activation_date: string | null
  expiry_date: string | null
  intention: string | null
  is_active: boolean
  type: 'standard' | 'premium' | 'deluxe'
  created_at: string
  notification_sent: boolean
  notifications_enabled: boolean
}

export interface ExtendCandleRequest {
  candle_id: string
  hours: number
}

export interface CandleStats {
  total_active: number
  total_expired: number
  by_type: {
    standard: number
    premium: number
    deluxe: number
  }
}
