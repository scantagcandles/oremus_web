import React from "react";
import { Card } from "@/components/glass/Card";
import { Button } from "@/components/design-system";
import { Calendar } from "@/components/glass/Calendar";
import {
  Check,
  X,
  Clock,
  CalendarDays,
  Church,
  User,
  Euro,
} from "lucide-react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useMassIntentions } from "@/hooks/useMassIntentions";
import type { MassIntention, IntentionStatus } from "@/types/mass-intention";

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  confirmed: <Check className="w-5 h-5 text-green-500" />,
  rejected: <X className="w-5 h-5 text-red-500" />,
} as const;

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500",
  confirmed: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
} as const;

export const MassIntentionDashboard = () => {
  const {
    intentions,
    selectedDate,
    loading,
    error,
    setSelectedDate,
    confirmIntention,
    rejectIntention,
    refresh,
  } = useMassIntentions();

  const handleConfirm = async (intentionId: string) => {
    await confirmIntention(intentionId);
  };

  const handleReject = async (intentionId: string) => {
    await rejectIntention(intentionId);
  };

  if (error) {
    return (
      <Card variant="glass" className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">Wystąpił błąd</h2>
        <p className="text-white/70">{error}</p>
        <Button variant="primary" className="mt-4" onClick={refresh}>
          Spróbuj ponownie
        </Button>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Intencje Mszalne
          </motion.h1>
          <motion.p
            className="text-lg text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Zarządzaj intencjami mszalnymi i kalendarzem parafii
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card
            variant="glass"
            title="Kalendarz"
            description="Wybierz datę aby zobaczyć intencje"
          >
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              className="w-full"
              events={intentions.map((intention) => ({
                date: new Date(intention.date),
                status: intention.status,
              }))}
            />
          </Card>

          {/* Intentions List */}
          <Card variant="glass" title="Intencje na wybrany dzień">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {intentions
                  .filter((intention) => {
                    if (!selectedDate) return true;
                    const intentionDate = new Date(intention.date);
                    return (
                      intentionDate.getDate() === selectedDate.getDate() &&
                      intentionDate.getMonth() === selectedDate.getMonth() &&
                      intentionDate.getFullYear() === selectedDate.getFullYear()
                    );
                  })
                  .map((intention) => (
                    <motion.div
                      key={intention.id}
                      className={twMerge(
                        "p-4 rounded-lg",
                        "border border-white/10",
                        statusColors[intention.status]
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h3 className="font-medium">{intention.intention}</h3>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(intention.date).toLocaleDateString()}
                            {" • "}
                            {intention.time}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <User className="w-4 h-4" />
                            {intention.requestedBy}
                            {intention.phone && ` • ${intention.phone}`}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Euro className="w-4 h-4" />
                            Ofiara: {intention.offering} zł
                            {intention.paid ? " (Opłacone)" : " (Nieopłacone)"}
                          </div>
                        </div>
                        {statusIcons[intention.status]}
                      </div>

                      {intention.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleConfirm(intention.id)}
                          >
                            Potwierdź
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleReject(intention.id)}
                          >
                            Odrzuć
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
