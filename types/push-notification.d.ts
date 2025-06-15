declare module 'push-notification' {
  interface PushServiceConfig {
    applicationServerKey: string
    userVisibleOnly: boolean
  }

  interface PushSubscriptionKeys {
    p256dh: string
    auth: string
  }

  interface PushSubscriptionJSON {
    endpoint: string
    expirationTime: number | null
    keys: PushSubscriptionKeys
  }

  interface PushSubscription {
    endpoint: string
    options: PushServiceConfig
    getKey(name: 'p256dh'): ArrayBuffer
    getKey(name: 'auth'): ArrayBuffer
    toJSON(): PushSubscriptionJSON
    unsubscribe(): Promise<boolean>
  }

  interface PushManager {
    getSubscription(): Promise<PushSubscription | null>
    permissionState(options?: PushServiceConfig): Promise<PermissionState>
    subscribe(options?: PushServiceConfig): Promise<PushSubscription>
  }

  interface ServiceWorkerRegistration {
    pushManager: PushManager
    showNotification(
      title: string,
      options?: NotificationOptions
    ): Promise<void>
  }

  interface Clients extends Set<Client> {
    get(id: string): Promise<Client | undefined>
    matchAll(options?: ClientQueryOptions): Promise<Client[]>
    openWindow(url: string): Promise<WindowClient | null>
    claim(): Promise<void>
  }

  interface ServiceWorkerGlobalScope {
    clients: Clients
    registration: ServiceWorkerRegistration
    skipWaiting(): Promise<void>
    addEventListener(
      type: 'push',
      listener: (event: PushEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void
    addEventListener(
      type: 'pushsubscriptionchange',
      listener: (event: PushSubscriptionChangeEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void
    addEventListener(
      type: 'notificationclick',
      listener: (event: NotificationEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void
  }
}
