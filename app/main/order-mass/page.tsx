// web/app/(main)/order-mass/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Church, Calendar, Clock, MapPin, Heart, CreditCard,
  ChevronRight, ChevronLeft, Check, Info, Gift,
  Mail, Phone, User, FileText, Sparkles
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassTextarea } from '@/components/glass/GlassTextarea'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import { format, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { orderMass, getChurches } from '@/lib/supabase/queries'

// Form steps
const steps = [
  { id: 'type', title: 'Rodzaj Mszy', icon: Church },
  { id: 'details', title: 'Szczegóły', icon: FileText },
  { id: 'church', title: 'Kościół', icon: MapPin },
  { id: 'date', title: 'Termin', icon: Calendar },
  { id: 'contact', title: 'Kontakt', icon: User },
  { id: 'payment', title: 'Płatność', icon: CreditCard },
]

// Mass types
const massTypes = [
  {
    id: 'thanksgiving',
    name: 'Dziękczynna',
    description: 'Za otrzymane łaski',
    price: 50,
    icon: '🙏'
  },
  {
    id: 'intention',
    name: 'W intencji',
    description: 'W szczególnej intencji',
    price: 50,
    icon: '❤️'
  },
  {
    id: 'healing',
    name: 'O zdrowie',
    description: 'Za zdrowie osoby',
    price: 50,
    icon: '🏥'
  },
  {
    id: 'deceased',
    name: 'Za zmarłych',
    description: 'Za spokój duszy',
    price: 50,
    icon: '✝️'
  },
  {
    id: 'gregorian',
    name: 'Gregoriańska',
    description: '30 Mszy przez 30 dni',
    price: 1500,
    icon: '📿',
    special: true
  },
  {
    id: 'anniversary',
    name: 'Rocznicowa',
    description: 'Rocznica ślubu, urodzin',
    price: 100,
    icon: '🎉',
    special: true
  }
]

// Form schema
const orderSchema = z.object({
  massType: z.string().min(1, 'Wybierz rodzaj Mszy'),
  intention: z.string().min(10, 'Intencja musi mieć minimum 10 znaków'),
  additionalInfo: z.string().optional(),
  churchId: z.string().min(1, 'Wybierz kościół'),
  preferredDate: z.string().min(1, 'Wybierz preferowaną datę'),
  preferredTime: z.string().optional(),
  fullName: z.string().min(3, 'Podaj imię i nazwisko'),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().min(9, 'Nieprawidłowy numer telefonu'),
  isDonation: z.boolean().default(false),
  donationAmount: z.number().optional(),
  paymentMethod: z.string().min(1, 'Wybierz metodę płatności'),
  agreeToTerms: z.boolean().refine(val => val === true, 'Musisz zaakceptować regulamin')
})

type OrderFormData = z.infer<typeof orderSchema>

export default function OrderMassPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [churches, setChurches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange'
  })

  const selectedMassType = watch('massType')
  const selectedChurch = watch('churchId')
  const isDonation = watch('isDonation')

  // Load churches when step changes
  useState(() => {
    if (currentStep === 2) {
      loadChurches()
    }
  })

  const loadChurches = async () => {
    try {
      const data = await getChurches()
      setChurches(data || [])
    } catch (error) {
      console.error('Error loading churches:', error)
      toast.error('Nie udało się załadować listy kościołów')
    }
  }

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true)
    try {
      const massType = massTypes.find(t => t.id === data.massType)
      const church = churches.find(c => c.id === data.churchId)
      
      const orderData = {
        mass_type: data.massType,
        intention: data.intention,
        additional_info: data.additionalInfo,
        church_id: data.churchId,
        church_name: church?.name,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        contact_name: data.fullName,
        contact_email: data.email,
        contact_phone: data.phone,
        amount: massType?.price || 50,
        donation_amount: data.isDonation ? data.donationAmount : null,
        total_amount: (massType?.price || 50) + (data.isDonation && data.donationAmount ? data.donationAmount : 0),
        payment_method: data.paymentMethod,
        status: 'pending'
      }

      const result = await orderMass(orderData)
      
      setOrderDetails({
        ...result,
        massTypeName: massType?.name,
        churchName: church?.name,
        churchAddress: church?.address
      })
      
      setShowConfirmation(true)
      toast.success('Zamówienie zostało złożone!')
      
      // Here you would integrate with payment gateway
      // For now, we'll just show confirmation
      
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Nie udało się złożyć zamówienia')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedMassType
      case 1: return watch('intention')?.length >= 10
      case 2: return !!selectedChurch
      case 3: return !!watch('preferredDate')
      case 4: return watch('fullName') && watch('email') && watch('phone')
      case 5: return watch('paymentMethod') && watch('agreeToTerms')
      default: return false
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Zamów Mszę Świętą Online
          </h1>
          <p className="text-lg text-white/70">
            Złóż intencję mszalną w wybranym kościele
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step.id} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${isActive ? 'bg-secondary text-primary' : 
                          isCompleted ? 'bg-secondary/20 text-secondary' : 
                          'bg-glass-white text-white/50'}
                      `}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span className={`
                      text-xs mt-2 hidden md:block
                      ${isActive ? 'text-secondary' : 'text-white/50'}
                    `}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute top-6 left-1/2 w-full h-0.5
                      ${isCompleted ? 'bg-secondary' : 'bg-glass-white'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-6 md:p-8">
                {/* Step 0: Mass Type */}
                {currentStep === 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Wybierz rodzaj Mszy Świętej
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {massTypes.map((type) => {
                        const isSelected = selectedMassType === type.id
                        
                        return (
                          <motion.div
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                value={type.id}
                                {...register('massType')}
                                className="sr-only"
                              />
                              <GlassCard
                                className={`
                                  p-4 border-2 transition-all
                                  ${isSelected 
                                    ? 'border-secondary bg-glass-secondary' 
                                    : 'border-transparent hover:border-glass-white'
                                  }
                                  ${type.special ? 'relative overflow-hidden' : ''}
                                `}
                              >
                                {type.special && (
                                  <div className="absolute top-2 right-2">
                                    <Sparkles className="w-4 h-4 text-secondary" />
                                  </div>
                                )}
                                <div className="flex items-start gap-4">
                                  <span className="text-3xl">{type.icon}</span>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1">
                                      {type.name}
                                    </h3>
                                    <p className="text-sm text-white/70 mb-2">
                                      {type.description}
                                    </p>
                                    <p className="text-secondary font-bold">
                                      {type.price} zł
                                    </p>
                                  </div>
                                </div>
                              </GlassCard>
                            </label>
                          </motion.div>
                        )
                      })}
                    </div>
                    {errors.massType && (
                      <p className="text-error text-sm mt-2">{errors.massType.message}</p>
                    )}
                  </div>
                )}

                {/* Step 1: Details */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Podaj szczegóły intencji
                    </h2>
                    <div className="space-y-6">
                      <GlassTextarea
                        label="Intencja mszalna *"
                        placeholder="Np. O zdrowie dla Jana Kowalskiego, Za spokój duszy śp. Marii..."
                        rows={4}
                        {...register('intention')}
                        error={errors.intention?.message}
                      />
                      
                      <GlassTextarea
                        label="Dodatkowe informacje (opcjonalnie)"
                        placeholder="Dodatkowe prośby, szczególne okoliczności..."
                        rows={3}
                        {...register('additionalInfo')}
                      />

                      <div className="bg-glass-white rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-white/70">
                            <p>Twoja intencja zostanie przekazana celebransowi.</p>
                            <p className="mt-1">Msza zostanie odprawiona w ciągu 30 dni od wybranej daty.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Church Selection */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Wybierz kościół
                    </h2>
                    <div className="space-y-4">
                      {churches.length > 0 ? (
                        churches.map((church) => {
                          const isSelected = selectedChurch === church.id
                          
                          return (
                            <label key={church.id} className="cursor-pointer">
                              <input
                                type="radio"
                                value={church.id}
                                {...register('churchId')}
                                className="sr-only"
                              />
                              <GlassCard
                                className={`
                                  p-4 border-2 transition-all
                                  ${isSelected 
                                    ? 'border-secondary bg-glass-secondary' 
                                    : 'border-transparent hover:border-glass-white'
                                  }
                                `}
                              >
                                <div className="flex items-start gap-4">
                                  <Church className="w-8 h-8 text-secondary flex-shrink-0" />
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">
                                      {church.name}
                                    </h3>
                                    <p className="text-white/70 text-sm mb-1">
                                      {church.address}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-white/50">
                                      <span>{church.city}</span>
                                      {church.has_streaming && (
                                        <span className="text-secondary">• Transmisja online</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </GlassCard>
                            </label>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-white/50">
                          Ładowanie kościołów...
                        </div>
                      )}
                    </div>
                    {errors.churchId && (
                      <p className="text-error text-sm mt-2">{errors.churchId.message}</p>
                    )}
                  </div>
                )}

                {/* Step 3: Date Selection */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Wybierz preferowany termin
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">
                          Preferowana data *
                        </label>
                        <input
                          type="date"
                          {...register('preferredDate')}
                          min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                          className="w-full px-4 py-3 rounded-xl bg-glass-white backdrop-blur-sm border border-glass-white text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                        {errors.preferredDate && (
                          <p className="text-error text-sm mt-1">{errors.preferredDate.message}</p>
                        )}
                      </div>

                      <GlassSelect
                        label="Preferowana godzina (opcjonalnie)"
                        {...register('preferredTime')}
                        options={[
                          { value: '', label: 'Dowolna godzina' },
                          { value: '07:00', label: '7:00' },
                          { value: '08:00', label: '8:00' },
                          { value: '09:00', label: '9:00' },
                          { value: '10:00', label: '10:00' },
                          { value: '11:00', label: '11:00' },
                          { value: '12:00', label: '12:00' },
                          { value: '17:00', label: '17:00' },
                          { value: '18:00', label: '18:00' },
                          { value: '19:00', label: '19:00' }
                        ]}
                      />

                      <div className="bg-glass-white rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-white/70">
                            <p>Msza zostanie odprawiona w najbliższym możliwym terminie od wybranej daty.</p>
                            <p className="mt-1">Otrzymasz potwierdzenie z dokładną datą i godziną.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Information */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Dane kontaktowe
                    </h2>
                    <div className="space-y-6">
                      <GlassInput
                        label="Imię i nazwisko *"
                        placeholder="Jan Kowalski"
                        {...register('fullName')}
                        error={errors.fullName?.message}
                        icon={<User className="w-5 h-5" />}
                      />

                      <GlassInput
                        label="Email *"
                        type="email"
                        placeholder="jan@example.com"
                        {...register('email')}
                        error={errors.email?.message}
                        icon={<Mail className="w-5 h-5" />}
                      />

                      <GlassInput
                        label="Telefon *"
                        type="tel"
                        placeholder="123 456 789"
                        {...register('phone')}
                        error={errors.phone?.message}
                        icon={<Phone className="w-5 h-5" />}
                      />

                      <div className="bg-glass-white rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-white/70">
                            <p>Twoje dane są bezpieczne i będą użyte tylko do kontaktu w sprawie zamówienia.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Podsumowanie i płatność
                    </h2>
                    
                    {/* Order Summary */}
                    <div className="bg-glass-white rounded-xl p-4 mb-6">
                      <h3 className="font-bold text-white mb-3">Podsumowanie zamówienia:</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Rodzaj Mszy:</span>
                          <span className="text-white font-medium">
                            {massTypes.find(t => t.id === selectedMassType)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Kościół:</span>
                          <span className="text-white font-medium">
                            {churches.find(c => c.id === selectedChurch)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Preferowana data:</span>
                          <span className="text-white font-medium">
                            {watch('preferredDate') && format(new Date(watch('preferredDate')), 'd MMMM yyyy', { locale: pl })}
                          </span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-glass-white">
                          <div className="flex justify-between">
                            <span className="text-white/70">Ofiara za Mszę:</span>
                            <span className="text-white font-medium">
                              {massTypes.find(t => t.id === selectedMassType)?.price} zł
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Donation */}
                    <div className="mb-6">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          {...register('isDonation')}
                          className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary"
                        />
                        <span className="text-white">
                          <Gift className="inline w-4 h-4 mr-1 text-secondary" />
                          Chcę dodatkowo wspomóc kościół
                        </span>
                      </label>
                      
                      {isDonation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <GlassInput
                            type="number"
                            placeholder="Kwota dodatkowej ofiary (zł)"
                            {...register('donationAmount', { valueAsNumber: true })}
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-3">Metoda płatności</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { id: 'blik', name: 'BLIK', icon: '📱' },
                          { id: 'card', name: 'Karta płatnicza', icon: '💳' },
                          { id: 'transfer', name: 'Przelew', icon: '🏦' },
                          { id: 'cash', name: 'Gotówka w kościele', icon: '💵' }
                        ].map((method) => (
                          <label key={method.id} className="cursor-pointer">
                            <input
                              type="radio"
                              value={method.id}
                              {...register('paymentMethod')}
                              className="sr-only"
                            />
                            <GlassCard
                              className={`
                                p-3 border-2 transition-all text-center
                                ${watch('paymentMethod') === method.id
                                  ? 'border-secondary bg-glass-secondary' 
                                  : 'border-transparent hover:border-glass-white'
                                }
                              `}
                            >
                              <span className="text-2xl mb-1 block">{method.icon}</span>
                              <span className="text-white text-sm">{method.name}</span>
                            </GlassCard>
                          </label>
                        ))}
                      </div>
                      {errors.paymentMethod && (
                        <p className="text-error text-sm mt-2">{errors.paymentMethod.message}</p>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('agreeToTerms')}
                          className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary mt-0.5"
                        />
                        <span className="text-white text-sm">
                          Akceptuję <a href="/terms" className="text-secondary hover:underline">regulamin</a> i wyrażam zgodę na przetwarzanie danych osobowych w celu realizacji zamówienia.
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-error text-sm mt-2">{errors.agreeToTerms.message}</p>
                      )}
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-secondary/20 to-prayer/20 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">Do zapłaty:</span>
                        <span className="text-3xl font-bold text-secondary">
                          {(massTypes.find(t => t.id === selectedMassType)?.price || 0) + 
                           (isDonation && watch('donationAmount') ? watch('donationAmount') : 0)} zł
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Wstecz
                  </GlassButton>

                  {currentStep < steps.length - 1 ? (
                    <GlassButton
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      Dalej
                      <ChevronRight className="w-4 h-4" />
                    </GlassButton>
                  ) : (
                    <GlassButton
                      type="submit"
                      loading={loading}
                      disabled={!isValid}
                      className="gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Zamów i zapłać
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Confirmation Modal */}
        <GlassModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false)
            // Reset form or redirect
          }}
          title="Zamówienie przyjęte!"
          size="md"
        >
          {orderDetails && (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-secondary/20 rounded-full mb-4"
                >
                  <Check className="w-8 h-8 text-secondary" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Dziękujemy za złożenie zamówienia!
                </h3>
                <p className="text-white/70">
                  Numer zamówienia: <span className="text-secondary font-bold">#{orderDetails.id}</span>
                </p>
              </div>

              <div className="bg-glass-white rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Msza:</span>
                  <span className="text-white">{orderDetails.massTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Kościół:</span>
                  <span className="text-white">{orderDetails.churchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Kwota:</span>
                  <span className="text-white font-bold">{orderDetails.total_amount} zł</span>
                </div>
              </div>

              <div className="text-center text-white/70 text-sm">
                <p>Potwierdzenie zostało wysłane na adres:</p>
                <p className="text-secondary">{orderDetails.contact_email}</p>
              </div>

              <GlassButton
                className="w-full"
                onClick={() => {
                  setShowConfirmation(false)
                  // Redirect to payment or home
                }}
              >
                Przejdź do płatności
              </GlassButton>
            </div>
          )}
        </GlassModal>
      </div>
    </div>
  )
}