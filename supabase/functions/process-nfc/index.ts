import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0'

interface NfcTagData {
  nfcId: string
  candleId: string
  action: 'activate' | 'deactivate' | 'check'
  location?: {
    latitude: number
    longitude: number
    accuracy: number
  }
}

interface NfcTagResponse {
  success: boolean
  message: string
  candle?: {
    id: string
    is_active: boolean
    expires_at: string
  }
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the payload and user-agent
    const userAgent = req.headers.get('user-agent') || undefined
    const payload: NfcTagData = await req.json()

    // Process NFC action
    const { data, error } = await supabase.rpc(
      'process_nfc_action',
      {
        p_candle_id: payload.candleId,
        p_nfc_id: payload.nfcId,
        p_action: payload.action,
        p_location: payload.location,
        p_user_agent: userAgent,
      }
    )

    if (error) {
      throw error
    }

    // Get candle owner for notification
    if (data.success && (payload.action === 'activate' || payload.action === 'deactivate')) {
      const { data: candle } = await supabase
        .from('candles')
        .select('user_id')
        .eq('id', payload.candleId)
        .single()

      if (candle?.user_id) {
        // Send notification to user
        const message = {
          title: 'Virtual Candle Update',
          body: `Your candle has been ${payload.action}d`,
          data: {
            candleId: payload.candleId,
            action: payload.action,
          },
        }

        await supabase.rpc('send_push_notification', {
          user_id: candle.user_id,
          notification: message,
        })
      }
    }

    return new Response(JSON.stringify(data as NfcTagResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: data.success ? 200 : 400,
    })
  } catch (error) {
    console.error('Error processing NFC action:', error)

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error processing NFC action',
      } as NfcTagResponse),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
