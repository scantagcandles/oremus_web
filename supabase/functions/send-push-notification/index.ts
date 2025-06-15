import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import * as webpush from 'web-push'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Initialize WebPush with VAPID keys
webpush.setVapidDetails(
  process.env.SITE_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Helper to send notification to a specific subscription
async function sendPushNotification(
  subscription: PushSubscription,
  payload: any
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true  } catch (err) {
    const error = err as { statusCode?: number }
    if (
      error.statusCode === 404 ||
      error.statusCode === 410 ||
      error.statusCode === 400
    ) {
      // Subscription has expired or is invalid
      // Delete it from the database
      await supabase
        .from('notification_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
    }
    return false
  }
}

export async function notify(
  userId: string,
  notification: {
    title: string
    body: string
    icon?: string
    data?: any
  }
) {
  // Get all active subscriptions for the user
  const { data: subscriptions, error } = await supabase
    .from('notification_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error || !subscriptions?.length) {
    return { success: false, error: error?.message || 'No subscriptions found' }
  }

  // Send notification to all subscriptions
  const results = await Promise.all(
    subscriptions.map((sub) =>
      sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        } as PushSubscription,
        {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: '/icons/notification-badge.png',
          data: {
            url: '/',
            ...notification.data,
          },
        }
      )
    )
  )

  const successCount = results.filter(Boolean).length
  const failureCount = results.length - successCount

  return {
    success: true,
    sent: successCount,
    failed: failureCount,
  }
}
