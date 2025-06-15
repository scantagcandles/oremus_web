import { useEffect } from 'react'
import { useNotifications } from '@/services/notificationService'

export function useServiceWorkerRegistration() {
  const { subscribe } = useNotifications()

  useEffect(() => {
    async function registerSW() {
      try {
        if (          typeof window !== 'undefined' &&
          'serviceWorker' in navigator &&
          (window as any).workbox !== undefined
        ) {
          // Register the service worker
          const swRegistration = await navigator.serviceWorker.register(
            '/service-worker.js'
          )
          console.log('Service Worker registered:', swRegistration)

          // Request notification permission and subscribe
          if (swRegistration.active) {
            await subscribe()
          }
        }
      } catch (error) {
        console.error('Error registering service worker:', error)
      }
    }

    registerSW()
  }, [subscribe])
}
