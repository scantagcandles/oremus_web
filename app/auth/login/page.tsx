// web/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Mail, Lock, Eye, EyeOff, Github, Chrome } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { signIn } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      toast.success('Zalogowano pomyślnie!')
      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Błąd logowania')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      console.error('Social login error:', error)
      toast.error('Błąd logowania przez ' + provider)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-dark">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <Flame className="w-16 h-16 text-secondary" />
              <motion.div
                className="absolute inset-0 bg-secondary/20 blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Witaj w OREMUS
            </h1>
            <p className="text-white/70">
              Zaloguj się do swojego konta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <GlassInput
              {...register('email')}
              type="email"
              label="Email"
              placeholder="twoj@email.pl"
              error={errors.email?.message}
              icon={<Mail className="w-5 h-5" />}
            />

            <div className="relative">
              <GlassInput
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Hasło"
                placeholder="••••••••"
                error={errors.password?.message}
                icon={<Lock className="w-5 h-5" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary"
                />
                <span className="text-white/70">Zapamiętaj mnie</span>
              </label>
              <Link
                href="/reset-password"
                className="text-secondary hover:text-secondary/80 transition-colors"
              >
                Zapomniałeś hasła?
              </Link>
            </div>

            <GlassButton
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Zaloguj się
            </GlassButton>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-white"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-glass-black text-white/50">lub kontynuuj przez</span>
            </div>
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <GlassButton
              type="button"
              variant="secondary"
              className="w-full gap-3"
              onClick={() => handleSocialLogin('google')}
            >
              <Chrome className="w-5 h-5" />
              Zaloguj przez Google
            </GlassButton>
            
            <GlassButton
              type="button"
              variant="secondary"
              className="w-full gap-3"
              onClick={() => handleSocialLogin('github')}
            >
              <Github className="w-5 h-5" />
              Zaloguj przez GitHub
            </GlassButton>
          </div>

          {/* Sign up link */}
          <p className="text-center mt-8 text-white/70">
            Nie masz konta?{' '}
            <Link
              href="/register"
              className="text-secondary hover:text-secondary/80 transition-colors font-medium"
            >
              Zarejestruj się
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}