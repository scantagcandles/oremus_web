'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { GlassCard } from '@/components/glass/GlassCard';
import { Input } from '@/components/glass/Input';
import { Button } from '@/components/glass/Button';
import { Select } from '@/components/glass/Select';
import type { Priest } from '@/types/parish';

interface PriestFormProps {
  initialData?: Priest;
  onSubmit: (data: Partial<Priest>) => Promise<void>;
  onCancel: () => void;
}

const priestRoles = [
  { value: 'proboszcz', label: 'Proboszcz' },
  { value: 'wikariusz', label: 'Wikariusz' },
  { value: 'rezydent', label: 'Rezydent' },
  { value: 'emeryt', label: 'Emeryt' }
] as const;

export function PriestForm({ initialData, onSubmit, onCancel }: PriestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      role: '',
      email: '',
      phone: ''
    }
  });

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Imię</label>
            <Input
              {...register('first_name', { required: 'Imię jest wymagane' })}
              placeholder="Jan"
              error={errors.first_name?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Nazwisko</label>
            <Input
              {...register('last_name', { required: 'Nazwisko jest wymagane' })}
              placeholder="Kowalski"
              error={errors.last_name?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Rola</label>
            <Select
              {...register('role', { required: 'Rola jest wymagana' })}
              error={errors.role?.message}
            >
              <option value="">Wybierz rolę</option>
              {priestRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Email</label>
            <Input
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Nieprawidłowy adres email'
                }
              })}
              placeholder="jan.kowalski@example.com"
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Telefon</label>
            <Input
              type="tel"
              {...register('phone')}
              placeholder="+48 123 456 789"
              error={errors.phone?.message}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {initialData ? 'Zapisz zmiany' : 'Dodaj księdza'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
