import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AuthService } from '@/services/AuthService'
import { AuthState, ResetPasswordData, UserProfile } from '@/types/auth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const useAuth = () => {
  const router = useRouter()
  const authService = new AuthService()
  const supabase = createClientComponentClient()
  
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const profile = await authService.getUserProfile(user.id)
          setState(prev => ({ ...prev, user: profile }))
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: {
            message: error instanceof Error ? error.message : 'Failed to fetch user'
          }
        }))
      } finally {
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id)
        setState(prev => ({ ...prev, user: profile }))
      } else {
        setState(prev => ({ ...prev, user: null }))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const response = await authService.signIn(email, password)
    
    if (response.success && response.user) {
      setState(prev => ({ ...prev, user: response.user }))
      router.push('/dashboard')
    } else {
      setState(prev => ({
        ...prev,
        error: response.error || { message: 'An unknown error occurred' }
      }))
    }
    
    setState(prev => ({ ...prev, loading: false }))
  }

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const response = await authService.signUp(email, password)
    
    if (response.success) {
      setState(prev => ({ ...prev, user: response.user || null }))
      router.push('/verify-email')
    } else {
      setState(prev => ({
        ...prev,
        error: response.error || { message: 'An unknown error occurred' }
      }))
    }
    
    setState(prev => ({ ...prev, loading: false }))
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setState(prev => ({
        ...prev,
        error: { message: error.message }
      }))
    } else {
      setState(prev => ({ ...prev, user: null }))
      router.push('/login')
    }
    
    setState(prev => ({ ...prev, loading: false }))
  }

  const resetPassword = async (data: ResetPasswordData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const response = await authService.resetPassword(data)
    
    if (response.success) {
      if (data.token) {
        router.push('/login')
      }
    } else {
      setState(prev => ({
        ...prev,
        error: response.error || { message: 'An unknown error occurred' }
      }))
    }
    
    setState(prev => ({ ...prev, loading: false }))
    return response
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      if (!state.user) throw new Error('No user logged in')
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', state.user.id)
        .select()
        .single()
        
      if (error) throw error
      
      setState(prev => ({
        ...prev,
        user: { ...prev.user!, ...data }
      }))
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update profile'
        }
      }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  }
}
