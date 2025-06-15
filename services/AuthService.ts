import { supabase } from '@/lib/supabase/client'
import { AuthResponse, PasswordValidation, ResetPasswordData, UserProfile } from '@/types/auth'

export class AuthService {
  private supabase = supabase

  validatePassword(password: string): PasswordValidation {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update last login
      await this.updateLastLogin(data.user.id)

      const profile = await this.getUserProfile(data.user.id)
      return {
        success: true,
        user: profile
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during sign in'
        }
      }
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const validation = this.validatePassword(password)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: validation.errors.join('. ')
          }
        }
      }

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Create user profile tylko jeśli user istnieje
      if (data.user) {
        await this.createUserProfile(data.user.id)
      }

      return {
        success: true,
        message: 'Please check your email to verify your account'
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during sign up'
        }
      }
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      if (data.token && data.newPassword) {
        const validation = this.validatePassword(data.newPassword)
        if (!validation.isValid) {
          return {
            success: false,
            error: {
              message: validation.errors.join('. ')
            }
          }
        }

        const { error } = await this.supabase.auth.updateUser({
          password: data.newPassword
        })

        if (error) throw error

        return {
          success: true,
          message: 'Password has been successfully reset'
        }
      } else {
        const { error } = await this.supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) throw error

        return {
          success: true,
          message: 'Password reset instructions have been sent to your email'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during password reset'
        }
      }
    }
  }

  // Making this method public
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Jeśli profil nie istnieje, utwórz go
        if (error.code === 'PGRST116') {
          await this.createUserProfile(userId)
          return this.getUserProfile(userId)
        }
        throw error
      }

      const { data: userData } = await this.supabase.auth.getUser()

      return {
        ...userData.user!,
        ...data,
        role: data.role || 'user',
        isEmailVerified: data.is_email_verified || false,
        twoFactorEnabled: data.two_factor_enabled || false
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  private async createUserProfile(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: 'user',
          is_email_verified: false,
          two_factor_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        // Ignoruj błąd jeśli profil już istnieje
        if (error.code !== '23505') {
          throw error
        }
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating last login:', error)
        // Nie rzucaj błędu - to nie jest krytyczne
      }
    } catch (error) {
      console.error('Error updating last login:', error)
      // Nie rzucaj błędu - to nie jest krytyczne
    }
  }
}