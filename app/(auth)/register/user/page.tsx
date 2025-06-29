'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';
import Link from 'next/link';

export default function UserRegistrationPage() {
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
    const name = formData.get('name') as string;

    try {
      await signUp(email, password, {
        name,
        userType: 'user'
      });
      router.push('/auth/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-yellow-400">
          Załóż konto użytkownika
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Imię i nazwisko
            </label>
            <GlassInput
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jan Kowalski"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <GlassInput
              id="email"
              name="email"
              type="email"
              required
              placeholder="jan@example.com"
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
            {isLoading ? 'Tworzenie konta...' : 'Załóż konto'}
          </GlassButton>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Masz już konto?{' '}
          <Link href="/auth/login" className="text-yellow-400 hover:text-yellow-300">
            Zaloguj się
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          Chcesz założyć konto dla parafii?{' '}
          <Link href="/auth/register/parish" className="text-yellow-400 hover:text-yellow-300">
            Zarejestruj parafię
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
