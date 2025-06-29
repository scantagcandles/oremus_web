'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';
import Link from 'next/link';

export default function ParishRegistrationPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const parishName = formData.get('parishName') as string;
    const parishAddress = formData.get('parishAddress') as string;
    const parishCity = formData.get('parishCity') as string;
    const priestName = formData.get('priestName') as string;

    try {
      await signUp(email, password, {
        name: priestName,
        userType: 'parish',
        parish: {
          name: parishName,
          address: parishAddress,
          city: parishCity
        }
      });
      router.push('/auth/login?registered=true&type=parish');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji parafii');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-yellow-400">
          Załóż konto dla parafii
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="parishName" className="block text-sm font-medium text-gray-300 mb-1">
              Nazwa parafii
            </label>
            <GlassInput
              id="parishName"
              name="parishName"
              type="text"
              required
              placeholder="Parafia pw. św. Jana Chrzciciela"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="parishAddress" className="block text-sm font-medium text-gray-300 mb-1">
              Adres parafii
            </label>
            <GlassInput
              id="parishAddress"
              name="parishAddress"
              type="text"
              required
              placeholder="ul. Przykładowa 1"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="parishCity" className="block text-sm font-medium text-gray-300 mb-1">
              Miasto
            </label>
            <GlassInput
              id="parishCity"
              name="parishCity"
              type="text"
              required
              placeholder="Warszawa"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="priestName" className="block text-sm font-medium text-gray-300 mb-1">
              Imię i nazwisko proboszcza
            </label>
            <GlassInput
              id="priestName"
              name="priestName"
              type="text"
              required
              placeholder="ks. Jan Kowalski"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email parafii
            </label>
            <GlassInput
              id="email"
              name="email"
              type="email"
              required
              placeholder="parafia@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Hasło
            </label>
            <GlassInput
              id="password"
              name="password"
              type="password"
              required
              placeholder="Minimum 8 znaków"
              disabled={isLoading}
            />
          </div>

          <GlassButton
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Tworzenie konta...' : 'Załóż konto dla parafii'}
          </GlassButton>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Masz już konto?{' '}
          <Link href="/auth/login" className="text-yellow-400 hover:text-yellow-300">
            Zaloguj się
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          Chcesz założyć zwykłe konto?{' '}
          <Link href="/auth/register/user" className="text-yellow-400 hover:text-yellow-300">
            Zarejestruj się jako użytkownik
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
