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
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'oremus_auth_token',
  USER_PREFERENCES: 'oremus_user_preferences',
  CART: 'oremus_cart',
  FAVORITES: 'oremus_favorites',
  THEME: 'oremus_theme',
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
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'Wystąpił błąd. Spróbuj ponownie.',
  NETWORK: 'Błąd połączenia. Sprawdź internet.',
  AUTH_REQUIRED: 'Musisz być zalogowany.',
  INVALID_CREDENTIALS: 'Nieprawidłowe dane logowania.',
  EMAIL_TAKEN: 'Ten email jest już zajęty.',
  WEAK_PASSWORD: 'Hasło jest za słabe.',
} as const

export const SUCCESS_MESSAGES = {
  LOGIN: 'Zalogowano pomyślnie!',
  REGISTER: 'Konto utworzone!',
  LOGOUT: 'Wylogowano pomyślnie.',
  PROFILE_UPDATED: 'Profil zaktualizowany.',
  ORDER_PLACED: 'Zamówienie złożone!',
  CANDLE_LIT: 'Świeca zapalona!',
} as const