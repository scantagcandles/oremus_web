/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2015" />
/// <reference lib="webworker.importscripts" />

declare const self: ServiceWorkerGlobalScope

interface ExtendedPushEvent extends PushEvent {
  readonly data: PushMessageData
}

interface PushSubscriptionChangeEvent extends ExtendableEvent {
  readonly oldSubscription: PushSubscription | null
  readonly newSubscription: PushSubscription | null
}

interface ExtendedNotificationOptions extends NotificationOptions {
  data?: {
    url?: string
    [key: string]: unknown
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting()) // Activate worker immediately
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()) // Claim all clients
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  
  const options: NotificationOptions = {
    ...data,
    badge: '/icons/notification-badge.png',
    icon: data.icon || '/icons/notification-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.data?.url || '/',  // URL to open when notification is clicked
      ...data.data
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If we have a matching client, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // If no matching client, open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})

// Handle subscription expiration
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Here you would send the new subscription to your server
        console.log('Subscription renewed:', subscription)
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncFavorites') {
    event.waitUntil(syncFavorites())
  } else if (event.tag === 'syncProgress') {
    event.waitUntil(syncProgress())
  }
})

// Function to sync favorites when back online
async function syncFavorites() {
  const favoritesCache = await caches.open('favorites-cache')
  const requests = await favoritesCache.keys()
  
  for (const request of requests) {
    try {
      const response = await fetch(request)
      if (response.ok) {
        await favoritesCache.delete(request)
      }
    } catch (error) {
      console.error('Error syncing favorite:', error)
    }
  }
}

// Function to sync progress when back online
async function syncProgress() {
  const progressCache = await caches.open('progress-cache')
  const requests = await progressCache.keys()
  
  for (const request of requests) {
    try {
      const response = await fetch(request)
      if (response.ok) {
        await progressCache.delete(request)
      }
    } catch (error) {
      console.error('Error syncing progress:', error)
    }
  }
}

// Cache static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache static assets
  if (
    request.method === 'GET' &&
    (url.pathname.startsWith('/icons/') ||
     url.pathname.startsWith('/audio/') ||
     url.pathname.startsWith('/_next/static/'))
  ) {
    event.respondWith(
      caches.open('static-assets').then((cache) => {
        return cache.match(request).then((response) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone())
            return networkResponse
          })
          return response || fetchPromise
        })
      })
    )
  }
})
