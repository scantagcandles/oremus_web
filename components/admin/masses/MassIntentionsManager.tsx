"use client";

import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/glass/Calendar";
import { GlassCard } from "@/components/glass/GlassCard";
import { MassCard } from "./MassCard";
import { useParish } from "@/hooks/useParish";
import { useMassIntentions } from "@/hooks/useMassIntentions";
import type { Mass, MassIntention } from "@/types/parish";

interface MassesForDate {
  [date: string]: {
    masses: Mass[];
    intentions: MassIntention[];
  };
}

export function MassIntentionsManager() {
  const {
    masses,
    selectedDate,
    setSelectedDate,
    loading: parishLoading,
  } = useParish();

  const {
    intentions,
    loading: intentionsLoading,
    updateIntentionStatus,
  } = useMassIntentions();

  const loading = parishLoading || intentionsLoading;

  // Group masses and intentions by date
  const massesAndIntentions = React.useMemo(() => {
    const grouped: MassesForDate = {};

    masses.forEach((mass) => {
      const date = mass.date;
      if (!grouped[date]) {
        grouped[date] = {
          masses: [],
          intentions: [],
        };
      }
      grouped[date].masses.push(mass);
    });

    intentions.forEach((intention) => {
      const mass = masses.find((m) => m.id === intention.mass_id);
      if (mass) {
        const date = mass.date;
        if (!grouped[date]) {
          grouped[date] = {
            masses: [],
            intentions: [],
          };
        }
        grouped[date].intentions.push(intention);
      }
    });

    return grouped;
  }, [masses, intentions]);

  const handleStatusChange = async (
    intention: MassIntention,
    newStatus: string
  ) => {
    await updateIntentionStatus.mutateAsync({
      id: intention.id,
      status: newStatus as any,
    });
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        {/* Calendar */}
        <GlassCard className="p-6">
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={pl}
            modifiers={{
              hasMasses: Object.keys(massesAndIntentions).map(
                (date) => new Date(date)
              ),
            }}
            modifiersStyles={{
              hasMasses: {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
            }}
          />
        </GlassCard>

        {/* Masses list */}
        <div className="space-y-6">
          {selectedDate &&
          massesAndIntentions[format(selectedDate, "yyyy-MM-dd")] ? (
            massesAndIntentions[format(selectedDate, "yyyy-MM-dd")].masses.map(
              (mass) => (
                <motion.div
                  key={mass.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MassCard
                    mass={mass}
                    intentions={intentions.filter((i) => i.mass_id === mass.id)}
                    onStatusChange={handleStatusChange}
                    onAddIntention={() => {
                      /* TODO: Implement add intention */
                    }}
                  />
                </motion.div>
              )
            )
          ) : (
            <GlassCard>
              <div className="p-8 text-center">
                <p className="text-white/70">
                  {selectedDate
                    ? "Brak mszy w wybranym dniu"
                    : "Wybierz datę, aby zobaczyć msze i intencje"}
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
