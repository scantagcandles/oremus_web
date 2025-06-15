'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader, AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { PaymentService } from '@/services/payment/PaymentService';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId && !paymentId) {
          throw new Error('No payment reference found');
        }

        const paymentService = new PaymentService();
        if (paymentId) {
          const payment = await paymentService.getPaymentById(paymentId);
          if (payment.status === 'completed') {
            setStatus('success');
            setDetails(payment);
            await paymentService.updatePaymentStatus(paymentId, 'completed');
          } else {
            setStatus('error');
          }
        } else if (sessionId) {
          // Verify Stripe session
          const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const data = await response.json();
          if (data.status === 'complete') {
            setStatus('success');
            setDetails(data);
          } else {
            setStatus('error');
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, paymentId]);

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8 bg-gradient-dark">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">
            <div className="text-center">
              {status === 'loading' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-full mb-6"
                >
                  <Loader className="w-10 h-10 text-secondary animate-spin" />
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-secondary/20 rounded-full mb-6"
                >
                  <Check className="w-10 h-10 text-secondary" />
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-error/20 rounded-full mb-6"
                >
                  <AlertCircle className="w-10 h-10 text-error" />
                </motion.div>
              )}

              <h1 className="text-3xl font-bold text-white mb-4">
                {status === 'loading' && 'Weryfikacja płatności...'}
                {status === 'success' && 'Dziękujemy za zamówienie!'}
                {status === 'error' && 'Wystąpił problem'}
              </h1>

              {status === 'loading' && (
                <p className="text-white/70 mb-8">
                  Prosimy o chwilę cierpliwości, weryfikujemy Twoją płatność...
                </p>
              )}

              {status === 'success' && details && (
                <>
                  <p className="text-white/70 mb-6">
                    Twoja intencja mszalna została przyjęta, a płatność zrealizowana.
                    Na podany adres email wysłaliśmy potwierdzenie wraz ze szczegółami.
                  </p>

                  <div className="bg-glass-white rounded-xl p-4 mb-8">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/70">Numer zamówienia:</span>
                      <span className="text-white font-medium">#{details.order_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Kwota:</span>
                      <span className="text-white font-medium">{details.amount} zł</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <GlassButton
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
                </>
              )}

              {status === 'error' && (
                <>
                  <p className="text-white/70 mb-8">
                    Przepraszamy, wystąpił problem z weryfikacją płatności.
                    Jeśli uważasz, że to błąd, skontaktuj się z naszą obsługą.
                  </p>

                  <div className="flex flex-col gap-3">
                    <GlassButton
                      onClick={() => router.back()}
                      className="gap-2"
                    >
                      Spróbuj ponownie
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
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
