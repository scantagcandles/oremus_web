"use client"
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassButton } from '@/components/glass/GlassButton'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { resetPassword, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await resetPassword(email)
    if (response.success) {
      setMessage(response.message || 'Check your email for reset instructions')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Reset Password</h1>
        
        {message ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <GlassInput
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <GlassButton variant="primary"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </GlassButton>
          </form>
        )}
      </GlassCard>
    </div>
  )
}

