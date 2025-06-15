"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSearchParams } from 'next/navigation'
import GlassCard from '@/components/glass/GlassCard'
import GlassInput from '@/components/glass/GlassInput'
import GlassButton from '@/components/glass/GlassButton'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const { resetPassword, loading, error } = useAuth()
  const searchParams = useSearchParams()

  const token = searchParams?.get('token')

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or expired reset token')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    if (token) {
      const response = await resetPassword({
        token,
        newPassword: password
      })
      
      if (response.success) {
        setMessage(response.message || 'Password has been reset successfully')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Set New Password</h1>
        
        {message ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <GlassInput
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <GlassInput
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error.message}
              </div>
            )}

            <GlassButton
              type="submit"
              disabled={loading || !token}
              className="w-full"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </GlassButton>
          </form>
        )}
      </GlassCard>
    </div>
  )
}