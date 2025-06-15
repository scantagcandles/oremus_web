import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { candleId } = await req.json()

    // Pobierz dane świecy i użytkownika
    const { data: candle, error: candleError } = await supabase
      .from('candles')
      .select('*, users!inner(*)')
      .eq('id', candleId)
      .single()

    if (candleError) throw candleError

    // Wyślij email przez Supabase
    const { error: emailError } = await supabase.auth.admin.createUser({
      email: candle.users.email,
      email_confirm: true,
      user_metadata: {
        candleType: candle.type,
        expiryDate: candle.expiry_date,
      },
    })

    if (emailError) throw emailError

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
