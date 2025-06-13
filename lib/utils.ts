// web/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatCurrency(amount: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pl-PL').format(num)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'przed chwilą'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min temu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} godz. temu`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dni temu`
  
  return date.toLocaleDateString('pl-PL')
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

// Dodatkowe funkcje pomocnicze
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Usuń diakrytyki
    .replace(/[^\w\s-]/g, '') // Usuń znaki specjalne
    .replace(/\s+/g, '-') // Zamień spacje na myślniki
    .replace(/--+/g, '-') // Zamień wielokrotne myślniki na pojedyncze
    .replace(/^-+/, '') // Usuń myślniki z początku
    .replace(/-+$/, '') // Usuń myślniki z końca
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch((error) => {
    if (retries <= 0) throw error
    return sleep(delay).then(() => retry(fn, retries - 1, delay * 2))
  })
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key]
    return result
  }, {} as Pick<T, K>)
}

// web/lib/constants.ts
export const APP_NAME = 'OREMUS'
export const APP_DESCRIPTION = 'Wspólnota modlitwy online'
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oremus.app'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CANDLE: '/candle',
  PRAYER: '/prayer',
  MASS: '/mass',
  ORDER_MASS: '/order-mass',
  SHOP: '/shop',
  PLAYER: '/player',
  ACADEMY: '/academy',
  LIBRARY: '/library',
  COMMUNITY: '/community',
  SPIRITUALITY: '/spirituality',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
  BLOG: '/blog',
  EVENTS: '/events',
  DONATIONS: '/donations',
  TESTIMONIES: '/testimonies',
  SAINTS: '/saints',
  CALENDAR: '/calendar',
} as const

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    DELETE: '/api/user/delete',
    PREFERENCES: '/api/user/preferences',
  },
  PRAYERS: {
    LIST: '/api/prayers',
    CREATE: '/api/prayers/create',
    UPDATE: '/api/prayers/update',
    DELETE: '/api/prayers/delete',
    LIKE: '/api/prayers/like',
    REPORT: '/api/prayers/report',
  },
  CANDLES: {
    LIST: '/api/candles',
    LIGHT: '/api/candles/light',
    STATS: '/api/candles/stats',
  },
  MASSES: {
    LIST: '/api/masses',
    ORDER: '/api/masses/order',
    CHURCHES: '/api/masses/churches',
    SCHEDULE: '/api/masses/schedule',
  },
  SHOP: {
    PRODUCTS: '/api/shop/products',
    CATEGORIES: '/api/shop/categories',
    CART: '/api/shop/cart',
    CHECKOUT: '/api/shop/checkout',
    ORDERS: '/api/shop/orders',
  },
  CONTENT: {
    COURSES: '/api/content/courses',
    BOOKS: '/api/content/books',
    VIDEOS: '/api/content/videos',
    ARTICLES: '/api/content/articles',
  },
  COMMUNITY: {
    GROUPS: '/api/community/groups',
    EVENTS: '/api/community/events',
    POSTS: '/api/community/posts',
    COMMENTS: '/api/community/comments',
  },
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'oremus_auth_token',
  REFRESH_TOKEN: 'oremus_refresh_token',
  USER_PREFERENCES: 'oremus_user_preferences',
  CART: 'oremus_cart',
  FAVORITES: 'oremus_favorites',
  THEME: 'oremus_theme',
  LANGUAGE: 'oremus_language',
  LAST_VISITED: 'oremus_last_visited',
  PRAYER_REMINDERS: 'oremus_prayer_reminders',
  NOTIFICATION_SETTINGS: 'oremus_notification_settings',
} as const

export const QUERY_KEYS = {
  USER: 'user',
  PROFILE: 'profile',
  PRAYERS: 'prayers',
  CANDLES: 'candles',
  MASSES: 'masses',
  CHURCHES: 'churches',
  PRODUCTS: 'products',
  COURSES: 'courses',
  BOOKS: 'books',
  GROUPS: 'groups',
  EVENTS: 'events',
  POSTS: 'posts',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  STATISTICS: 'statistics',
  TESTIMONIES: 'testimonies',
  SAINTS: 'saints',
  CALENDAR: 'calendar',
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Wystąpił błąd. Spróbuj ponownie.',
  NETWORK: 'Błąd połączenia. Sprawdź internet.',
  AUTH_REQUIRED: 'Musisz być zalogowany.',
  INVALID_CREDENTIALS: 'Nieprawidłowe dane logowania.',
  EMAIL_TAKEN: 'Ten email jest już zajęty.',
  WEAK_PASSWORD: 'Hasło jest za słabe.',
  TOKEN_EXPIRED: 'Sesja wygasła. Zaloguj się ponownie.',
  PERMISSION_DENIED: 'Brak uprawnień do tej akcji.',
  NOT_FOUND: 'Nie znaleziono zasobu.',
  VALIDATION_ERROR: 'Nieprawidłowe dane.',
  SERVER_ERROR: 'Błąd serwera. Spróbuj później.',
  RATE_LIMIT: 'Zbyt wiele prób. Odczekaj chwilę.',
  PAYMENT_FAILED: 'Płatność nie powiodła się.',
  FILE_TOO_LARGE: 'Plik jest zbyt duży.',
  INVALID_FILE_TYPE: 'Nieprawidłowy typ pliku.',
} as const

export const SUCCESS_MESSAGES = {
  LOGIN: 'Zalogowano pomyślnie!',
  REGISTER: 'Konto utworzone!',
  LOGOUT: 'Wylogowano pomyślnie.',
  PROFILE_UPDATED: 'Profil zaktualizowany.',
  ORDER_PLACED: 'Zamówienie złożone!',
  CANDLE_LIT: 'Świeca zapalona!',
  PRAYER_ADDED: 'Modlitwa dodana!',
  MASS_ORDERED: 'Msza zamówiona!',
  PASSWORD_RESET: 'Hasło zresetowane.',
  EMAIL_SENT: 'Email wysłany.',
  SAVED: 'Zapisano zmiany.',
  DELETED: 'Usunięto pomyślnie.',
  COPIED: 'Skopiowano do schowka.',
  SUBSCRIBED: 'Subskrypcja aktywna!',
  DONATION_SENT: 'Dziękujemy za wsparcie!',
} as const

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE_REGEX: /^(\+48)?[\s-]?[\d\s-]{9,}$/,
  POSTAL_CODE_REGEX: /^\d{2}-\d{3}$/,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

export const CACHE_TIMES = {
  SHORT: 5 * 60 * 1000, // 5 minut
  MEDIUM: 30 * 60 * 1000, // 30 minut
  LONG: 24 * 60 * 60 * 1000, // 24 godziny
  INFINITE: Infinity,
} as const

export const PRAYER_TIMES = {
  MORNING: { hour: 6, minute: 0, name: 'Poranna' },
  ANGELUS: { hour: 12, minute: 0, name: 'Anioł Pański' },
  DIVINE_MERCY: { hour: 15, minute: 0, name: 'Koronka do Miłosierdzia' },
  EVENING: { hour: 18, minute: 0, name: 'Wieczorna' },
  NIGHT: { hour: 21, minute: 0, name: 'Na dobranoc' },
} as const

export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/oremusapp',
  INSTAGRAM: 'https://instagram.com/oremusapp',
  YOUTUBE: 'https://youtube.com/@oremusapp',
  TWITTER: 'https://twitter.com/oremusapp',
} as const

export const SUPPORT = {
  EMAIL: 'pomoc@oremus.app',
  PHONE: '+48 123 456 789',
  HOURS: 'Pon-Pt: 9:00-17:00',
} as const