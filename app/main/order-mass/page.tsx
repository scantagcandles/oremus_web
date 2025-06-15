"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ZMIENIONE z 'next/router'
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { CreditCard, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button as GlassButton } from '@/components/glass/Button';
import { Input as GlassInput } from '@/components/glass/Input';
import { Select as GlassSelect } from '@/components/glass/Select';
import { MASS_TYPES } from '@/types/mass';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const orderSchema = z.object({
  intention: z.string().min(1, 'Intencja jest wymagana').max(500, 'Intencja jest zbyt długa'),
  date: z.string().min(1, 'Data jest wymagana'),
  massType: z.string().min(1, 'Typ mszy jest wymagany'),
  preferredTime: z.string().optional(),
  paymentMethod: z.enum(['card', 'blik', 'p24']),
  name: z.string().min(1, 'Imię i nazwisko jest wymagane'),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const OrderPage = () => {
  const router = useRouter();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const supabase = createClientComponentClient();

  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange'
  });

  const handlePayment = async (data: OrderFormData) => {
    setPaymentProcessing(true);
    try {
      // Create mass intention record first
      const { data: intention, error: intentionError } = await supabase
        .from('mass_intentions')
        .insert({
          content: data.intention,
          preferred_date: data.date,
          preferred_time: data.preferredTime,
          mass_type: data.massType,
          requestor_name: data.name,
          requestor_email: data.email,
          requestor_phone: data.phone,
          status: 'pending_payment'
        })
        .select()
        .single();

      if (intentionError) throw intentionError;

      // Create payment intent
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: MASS_TYPES.find(t => t.id === data.massType)?.price || 0,
          method: data.paymentMethod,
          metadata: {
            intentionId: intention.id,
            massType: data.massType,
            date: data.date,
          }
        })
      });

      const { client_secret, redirectUrl, error } = await paymentResponse.json();
      if (error) throw new Error(error);

      if (redirectUrl) {
        // For BLIK/P24
        router.push(redirectUrl);
      } else if (client_secret) {
        // For card payments
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) throw new Error('Nie udało się załadować Stripe');

        const { error: stripeError } = await stripe.confirmCardPayment(client_secret);
        if (stripeError) {
          // Revert intention status
          await supabase
            .from('mass_intentions')
            .update({ status: 'payment_failed' })
            .eq('id', intention.id);

          throw new Error(stripeError.message);
        }

        toast.success('Płatność zaakceptowana!');
        router.push('/success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Błąd płatności. Spróbuj ponownie.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Zamów mszę świętą</h1>
        
        <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
          <GlassInput
            {...register('intention')}
            label="Intencja mszalna"
            placeholder="Wprowadź intencję..."
            error={errors.intention?.message}
            textarea
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              {...register('date')}
              type="date"
              label="Preferowana data"
              min={new Date().toISOString().split('T')[0]}
              error={errors.date?.message}
            />

            <GlassSelect
              {...register('massType')}
              label="Typ mszy"
              options={MASS_TYPES.map(type => ({
                value: type.id,
                label: `${type.name} (${type.price} zł)`
              }))}
              error={errors.massType?.message}
            />
          </div>

          <GlassInput
            {...register('preferredTime')}
            type="time"
            label="Preferowana godzina (opcjonalnie)"
            error={errors.preferredTime?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              {...register('name')}
              label="Imię i nazwisko"
              error={errors.name?.message}
            />

            <GlassInput
              {...register('email')}
              type="email"
              label="Email"
              error={errors.email?.message}
            />
          </div>

          <GlassInput
            {...register('phone')}
            type="tel"
            label="Telefon (opcjonalnie)"
            error={errors.phone?.message}
          />

          <div className="space-y-4">
            <label className="block text-white font-medium mb-2">Metoda płatności</label>
            <div className="grid grid-cols-3 gap-4">
              {['card', 'blik', 'p24'].map(method => (
                <label key={method} className="relative">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value={method}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    watch('paymentMethod') === method
                      ? 'border-secondary bg-glass-secondary'
                      : 'border-glass-white bg-glass-white hover:border-glass-secondary'
                  }`}>
                    <img 
                      src={`/icons/${method}.svg`}
                      alt={method}
                      className="h-8 mx-auto"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <GlassButton
            type="submit"
            disabled={!isValid || paymentProcessing}
            className="w-full"
          >
            {paymentProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Przetwarzanie płatności...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Zamów i zapłać
              </>
            )}
          </GlassButton>
        </form>
      </div>
    </div>
  );
};

export default OrderPage;