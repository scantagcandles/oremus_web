'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader, AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/ui/Button';
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
                {status === 'loading' && 'Weryfikacja pÅ‚atnoÅ›ci...'}
                {status === 'success' && 'DziÄ™kujemy za zamÃ³wienie!'}
                {status === 'error' && 'WystÄ…piÅ‚ problem'}
              </h1>

              {status === 'loading' && (
                <p className="text-white/70 mb-8">
                  Prosimy o chwilÄ™ cierpliwoÅ›ci, weryfikujemy TwojÄ… pÅ‚atnoÅ›Ä‡...
                </p>
              )}

              {status === 'success' && details && (
                <>
                  <p className="text-white/70 mb-6">
                    Twoja intencja mszalna zostaÅ‚a przyjÄ™ta, a pÅ‚atnoÅ›Ä‡ zrealizowana.
                    Na podany adres email wysÅ‚aliÅ›my potwierdzenie wraz ze szczegÃ³Å‚ami.
                  </p>

                  <div className="bg-glass-white rounded-xl p-4 mb-8">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/70">Numer zamÃ³wienia:</span>
                      <span className="text-white font-medium">#{details.order_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Kwota:</span>
                      <span className="text-white font-medium">{details.amount} zÅ‚</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button variant="glass"
                      onClick={() => router.push('/')}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      WrÃ³Ä‡ do strony gÅ‚Ã³wnej
                    </Button>
                    <Button variant="glass"
                      variant="secondary"
                      onClick={() => window.open('mailto:contact@oremus.app')}
                      className="gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Kontakt z obsÅ‚ugÄ…
                    </Button>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <p className="text-white/70 mb-8">
                    Przepraszamy, wystÄ…piÅ‚ problem z weryfikacjÄ… pÅ‚atnoÅ›ci.
                    JeÅ›li uwaÅ¼asz, Å¼e to bÅ‚Ä…d, skontaktuj siÄ™ z naszÄ… obsÅ‚ugÄ….
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button variant="glass"
                      onClick={() => router.back()}
                      className="gap-2"
                    >
                      SprÃ³buj ponownie
                    </Button>
                    <Button variant="glass"
                      variant="secondary"
                      onClick={() => window.open('mailto:contact@oremus.app')}
                      className="gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Kontakt z obsÅ‚ugÄ…
                    </Button>
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

