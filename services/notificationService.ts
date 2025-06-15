import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export type NotificationSubscription = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
}

export type NotificationPayload = {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export class NotificationService {
  private static vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported')
    }

    return navigator.serviceWorker.register('/service-worker.js')
  }

  static async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    return permission
  }

  static async subscribe() {
    if (!this.vapidPublicKey) {
      throw new Error('VAPID public key not configured')
    }

    const registration = await this.registerServiceWorker()
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.vapidPublicKey,
    })

    const subscriptionJson = subscription.toJSON() as NotificationSubscription
    
    // Save subscription to Supabase
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase.from('notification_subscriptions').insert({
      user_id: user.user.id,
      endpoint: subscriptionJson.endpoint,
      p256dh_key: subscriptionJson.keys.p256dh,
      auth_key: subscriptionJson.keys.auth,
      user_agent: navigator.userAgent,
    })

    if (error) {
      throw error
    }

    return subscriptionJson
  }

  static async unsubscribe() {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()

      // Remove from Supabase
      const { data: user } = await supabase.auth.getUser()
      if (user?.user?.id) {
        await supabase
          .from('notification_subscriptions')
          .delete()
          .eq('user_id', user.user.id)
          .eq('endpoint', subscription.endpoint)
      }
    }
  }

  static async getSubscription() {
    const registration = await navigator.serviceWorker.ready
    return registration.pushManager.getSubscription()
  }

  // Server-side function to send notifications
  static async sendNotification(
    userId: string,
    payload: NotificationPayload
  ) {
    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    if (!subscriptions?.length) {
      return
    }

    // This would be handled by a server function
    // that has access to the VAPID private key
    const sendToEndpoint = async (subscription: any) => {
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }
    }

    await Promise.all(subscriptions.map(sendToEndpoint))
  }
}

// React hook for managing notifications
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        if ('Notification' in window) {
          const currentSub = await NotificationService.getSubscription()
          setSubscription(currentSub)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error checking status'))
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  const subscribe = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await NotificationService.requestPermission()
      setPermission(Notification.permission)

      if (Notification.permission === 'granted') {
        const sub = await NotificationService.subscribe()
        setSubscription(sub as any)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error subscribing'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await NotificationService.unsubscribe()
      setSubscription(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error unsubscribing'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    permission,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
  }
}
