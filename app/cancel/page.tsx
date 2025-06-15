'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';

export default function PaymentCancelled() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8 bg-gradient-dark">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-error/20 rounded-full mb-6"
              >
                <XCircle className="w-10 h-10 text-error" />
              </motion.div>

              <h1 className="text-3xl font-bold text-white mb-4">
                Płatność anulowana
              </h1>
              
              <p className="text-white/70 mb-8">
                Twoje zamówienie zostało zapisane. Możesz powrócić do niego 
                i dokończyć płatność w dowolnym momencie.
              </p>

              {paymentId && (
                <div className="bg-glass-white rounded-xl p-4 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">ID zamówienia:</span>
                    <span className="text-white font-medium">#{paymentId}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {paymentId ? (
                  <GlassButton
                    onClick={() => router.push(`/order-mass?resume=${paymentId}`)}
                    className="gap-2"
                  >
                    Dokończ zamówienie
                  </GlassButton>
                ) : (
                  <GlassButton
                    onClick={() => router.back()}
                    className="gap-2"
                  >
                    Spróbuj ponownie
                  </GlassButton>
                )}
                
                <GlassButton
                  variant="secondary"
                  onClick={() => router.push('/')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Wróć do strony głównej
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  onClick={() => window.open('mailto:contact@oremus.app')}
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Kontakt z obsługą
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
