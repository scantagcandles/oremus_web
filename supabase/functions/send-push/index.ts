import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0'
import * as webpush from 'npm:web-push'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize WebPush with your VAPID keys
    webpush.setVapidDetails(
      Deno.env.get('SITE_URL') || 'http://localhost:3000',
      Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || '',
      Deno.env.get('VAPID_PRIVATE_KEY') || ''
    )

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    const { userId, notification } = await req.json()

    // Get all active subscriptions for the user
    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    if (!subscriptions?.length) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No active subscriptions found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Send notifications to all subscriptions
    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const subscription: PushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key,
            },
          }

          await webpush.sendNotification(
            subscription,
            JSON.stringify(notification)
          )

          return true
        } catch (error) {
          console.error('Error sending notification:', error)

          // Remove invalid subscriptions
          if (
            error.statusCode === 404 ||
            error.statusCode === 410 ||
            error.statusCode === 400
          ) {
            await supabase
              .from('notification_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }

          return false
        }
      })
    )

    const successCount = results.filter(Boolean).length
    const failureCount = results.length - successCount

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing push notifications:', error)

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error processing push notifications',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
- Church selection with map
- Mass calendar and scheduling
- Intention form
- Order processing
- Admin management- PaymentDashboard
- Analytics and reporting
- Mass management
- User management
- Status tracking
- PaymentDashboard- Analytics and reporting- Mass management- User management- Status tracking- Virtual candle implementation
- Prayer map
- Prayer player
- NFC integration
- Real-time updates
- Book catalog
- Digital content delivery
- Reading progress
- Favorites and bookmarks
- Categories and search