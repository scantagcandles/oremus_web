'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useGeoLocation } from '@/hooks/useGeoLocation'
import { ChurchSelector } from './ChurchSelector'
import { DateTimePicker } from './DateTimePicker'
import { IntentionForm } from './IntentionForm'
import { PaymentSection } from './PaymentSection'
import { GlassPanel } from '../glass/GlassPanel'

export default function MassOrderForm() {
  const { user } = useAuth()
  const { location } = useGeoLocation()
  const [step, setStep] = useState(1)
  const [orderData, setOrderData] = useState({
    churchId: '',
    date: null,
    time: '',
    intentionType: '',
    customIntention: '',
  })

  const handleStepComplete = (data: Partial<typeof orderData>) => {
    setOrderData(prev => ({ ...prev, ...data }))
    setStep(prev => prev + 1)
  }

  return (
    <GlassPanel className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {step === 1 && (
          <ChurchSelector 
            userLocation={location}
            onSelect={(churchId) => handleStepComplete({ churchId })}
          />
        )}
        
        {step === 2 && (
          <DateTimePicker
            churchId={orderData.churchId}
            onSelect={(date, time) => handleStepComplete({ date, time })}
          />
        )}

        {step === 3 && (
          <IntentionForm
            onSubmit={(intention) => handleStepComplete(intention)}
          />
        )}

        {step === 4 && (
          <PaymentSection
            orderData={orderData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </motion.div>
    </GlassPanel>
  )
}