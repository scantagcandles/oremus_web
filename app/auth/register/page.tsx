// web/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Mail, Lock, Eye, EyeOff, User, Phone, Calendar, Shield, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import { signUp } from '@/lib/supabase/auth'
import { toast } from 'react-hot-toast'

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string()
    .min(8, 'Hasło musi mieć minimum 8 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę'),
  confirmPassword: z.string(),
  fullName: z.string().min(3, 'Podaj imię i nazwisko'),
  phone: z.string().optional(),
  birthYear: z.string().optional(),
  diocese: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Musisz zaakceptować regulamin'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Musisz zaakceptować politykę prywatności')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const dioceses = [
  { value: '', label: 'Wybierz diecezję (opcjonalnie)' },
  { value: 'warszawa', label: 'Archidiecezja Warszawska' },
  { value: 'krakow', label: 'Archidiecezja Krakowska' },
  { value: 'poznan', label: 'Archidiecezja Poznańska' },
  { value: 'gdansk', label: 'Archidiecezja Gdańska' },
  { value: 'wroclaw', label: 'Archidiecezja Wrocławska' },
  { value: 'katowice', label: 'Archidiecezja Katowicka' },
  // ... więcej diecezji
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  })

  const password = watch('password')
  const passwordRequirements = [
    { met: password?.length >= 8, text: 'Minimum 8 znaków' },
    { met: /[A-Z]/.test(password || ''), text: 'Jedna wielka litera' },
    { met: /[0-9]/.test(password || ''), text: 'Jedna cyfra' }
  ]

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName,
        phone: data.phone,
        birth_year: data.birthYear,
        diocese: data.diocese
      })
      
      toast.success('Konto utworzone! Sprawdź email w celu weryfikacji.')
      router.push('/login')
    } catch (error: any) {
      console.error('Register error:', error)
      toast.error(error.message || 'Błąd podczas rejestracji')
    } finally {
      setLoading(false)
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
            className="flex justify-center mb-6"
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
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Dołącz do OREMUS
            </h1>
            <p className="text-white/70">
              Stwórz konto i zacznij duchową podróż
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                step >= 1 ? 'bg-secondary text-primary' : 'bg-glass-white text-white/50'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 transition-all ${
                step >= 2 ? 'bg-secondary' : 'bg-glass-white'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                step >= 2 ? 'bg-secondary text-primary' : 'bg-glass-white text-white/50'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <GlassInput
                  {...register('fullName')}
                  label="Imię i nazwisko"
                  placeholder="Jan Kowalski"
                  error={errors.fullName?.message}
                  icon={<User className="w-5 h-5" />}
                />

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

                {/* Password requirements */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className={`w-4 h-4 ${
                          req.met ? 'text-academy' : 'text-white/30'
                        }`} />
                        <span className={`${
                          req.met ? 'text-white/70' : 'text-white/40'
                        }`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="relative">
                  <GlassInput
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Potwierdź hasło"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    icon={<Lock className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <GlassButton
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (watch('fullName') && watch('email') && watch('password') && watch('confirmPassword')) {
                      setStep(2)
                    }
                  }}
                  disabled={!watch('fullName') || !watch('email') || !watch('password') || !watch('confirmPassword')}
                >
                  Dalej
                </GlassButton>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <GlassInput
                  {...register('phone')}
                  type="tel"
                  label="Telefon (opcjonalnie)"
                  placeholder="123 456 789"
                  icon={<Phone className="w-5 h-5" />}
                />

                <GlassSelect
                  {...register('birthYear')}
                  label="Rok urodzenia (opcjonalnie)"
                  options={[
                    { value: '', label: 'Wybierz rok' },
                    ...Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - i - 13
                      return { value: year.toString(), label: year.toString() }
                    })
                  ]}
                />

                <GlassSelect
                  {...register('diocese')}
                  label="Diecezja"
                  options={dioceses}
                />

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary mt-0.5"
                    />
                    <span className="text-white/70 text-sm">
                      Akceptuję <Link href="/terms" className="text-secondary hover:underline">regulamin</Link> serwisu OREMUS
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-error text-sm ml-8">{errors.acceptTerms.message}</p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('acceptPrivacy')}
                      className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary mt-0.5"
                    />
                    <span className="text-white/70 text-sm">
                      Akceptuję <Link href="/privacy" className="text-secondary hover:underline">politykę prywatności</Link> i wyrażam zgodę na przetwarzanie danych osobowych
                    </span>
                  </label>
                  {errors.acceptPrivacy && (
                    <p className="text-error text-sm ml-8">{errors.acceptPrivacy.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Wstecz
                  </GlassButton>
                  <GlassButton
                    type="submit"
                    className="flex-1"
                    size="lg"
                    loading={loading}
                    disabled={!isValid}
                  >
                    Zarejestruj się
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-white"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-glass-black text-white/50">lub</span>
            </div>
          </div>

          {/* Sign in link */}
          <p className="text-center text-white/70">
            Masz już konto?{' '}
            <Link
              href="/login"
              className="text-secondary hover:text-secondary/80 transition-colors font-medium"
            >
              Zaloguj się
            </Link>
          </p>
        </GlassCard>

        {/* Security info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <Shield className="w-4 h-4" />
            <span>Twoje dane są bezpieczne i szyfrowane</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}