"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Input } from "@/components/glass/Input";
import { Button } from "@/components/glass/Button";
import { Textarea } from "@/components/glass/Textarea";
import { DatePicker } from "@/components/glass/DatePicker";
import { Switch } from "@/components/glass/Switch";
import type { Announcement, AnnouncementPriority } from "@/types/parish";

interface AnnouncementFormProps {
  initialData?: Announcement;
  onSubmit: (data: Partial<Announcement>) => Promise<void>;
  onCancel: () => void;
}

export function AnnouncementForm({
  initialData,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: initialData || {
      title: "",
      content: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      is_published: false,
      priority: "normal" as AnnouncementPriority,
    },
  });

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Tytuł</label>
            <Input
              {...register("title", { required: "Tytuł jest wymagany" })}
              placeholder="Tytuł ogłoszenia"
              error={errors.title?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Priorytet</label>
            <select
              {...register("priority")}
              className="w-full px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="low">Niski</option>
              <option value="normal">Normalny</option>
              <option value="high">Wysoki</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-white/70">Treść</label>
            <Textarea
              {...register("content", { required: "Treść jest wymagana" })}
              placeholder="Treść ogłoszenia"
              error={errors.content?.message}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Data rozpoczęcia</label>
            <DatePicker
              value={watch("start_date")}
              onChange={(date: Date) =>
                setValue("start_date", date.toISOString().split("T")[0])
              }
              error={errors.start_date?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Data zakończenia</label>
            <DatePicker
              value={watch("end_date")}
              onChange={(date: Date) =>
                setValue("end_date", date.toISOString().split("T")[0])
              }
              error={errors.end_date?.message}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <Switch
                checked={watch("is_published")}
                onCheckedChange={(checked: boolean) =>
                  setValue("is_published", checked)
                }
              />
              <span className="text-sm text-white/70">Opublikowane</span>
            </label>
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
            {initialData ? "Zapisz zmiany" : "Dodaj ogłoszenie"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
