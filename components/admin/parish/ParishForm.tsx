"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Input } from "@/components/glass/Input";
import { Button } from "@/components/glass/Button";
import type { Parish } from "@/types/parish";

interface ParishFormProps {
  initialData?: Parish;
  onSubmit: (data: Partial<Parish>) => Promise<void>;
  onCancel: () => void;
}

export function ParishForm({
  initialData,
  onSubmit,
  onCancel,
}: ParishFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData || {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Nazwa parafii</label>
            <Input
              {...register("name", { required: "Nazwa parafii jest wymagana" })}
              placeholder="Parafia Św. Jana"
              error={errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Adres</label>
            <Input
              {...register("address", { required: "Adres jest wymagany" })}
              placeholder="ul. Kościelna 1, 00-001 Warszawa"
              error={errors.address?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Email</label>
            <Input
              type="email"
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Nieprawidłowy adres email",
                },
              })}
              placeholder="parafia@example.com"
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Telefon</label>
            <Input
              type="tel"
              {...register("phone")}
              placeholder="+48 123 456 789"
              error={errors.phone?.message}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-white/70">Strona WWW</label>
            <Input
              {...register("website")}
              placeholder="https://example.com"
              error={errors.website?.message}
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
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? "Zapisz zmiany" : "Dodaj parafię"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
