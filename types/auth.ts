import { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  code?: string
}

export interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: AuthError | null
}

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export type UserRole = 'user' | 'admin' | 'priest'

export interface UserProfile {
  id: string
  email?: string
  role: UserRole
  displayName?: string
  phoneNumber?: string
  lastLogin?: Date
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  user_id?: string
  created_at: string
  updated_at: string
  aud?: string
  confirmed_at?: string
  email_confirmed_at?: string
  phone?: string
  confirmation_sent_at?: string
  recovery_sent_at?: string
  last_sign_in_at?: string
  app_metadata: { provider?: string; providers?: string[] }
  user_metadata: Record<string, any>
  identities?: { id: string; user_id: string; identity_data: Record<string, any>; provider: string; created_at: string; updated_at: string }[]
}

export interface ResetPasswordData {
  email: string
  token?: string
  newPassword?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: UserProfile
  error?: AuthError
}
