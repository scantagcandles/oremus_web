import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/glass/Calendar";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { useMassIntentions } from "@/hooks/useMassIntentions";
import type {
  MassIntention,
  MassIntentionStatus,
} from "@/types/mass-intention";

export function MassIntentionDashboard() {
  const {
    intentions,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    confirmIntention,
    rejectIntention,
  } = useMassIntentions();

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>Wystąpił błąd: {error.message}</div>;
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <GlassCard className="lg:col-span-2">
          <Calendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            minDate={new Date()}
          />
        </GlassCard>

        {/* Stats */}
        <GlassCard>
          <h2 className="text-xl font-bold mb-4">Statystyki</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Łącznie intencji</p>
              <p className="text-2xl font-bold">{intentions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Oczekujące</p>
              <p className="text-2xl font-bold">
                {
                  intentions.filter(
                    (i: MassIntention) => i.status === "pending"
                  ).length
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Potwierdzone</p>
              <p className="text-2xl font-bold">
                {
                  intentions.filter(
                    (i: MassIntention) => i.status === "confirmed"
                  ).length
                }
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Intentions List */}
      <GlassCard>
        <h2 className="text-xl font-bold mb-4">
          {selectedDate
            ? `Intencje na dzień ${format(selectedDate, "dd.MM.yyyy")}`
            : "Wszystkie intencje"}
        </h2>
        <div className="space-y-4">
          {intentions.map((intention: MassIntention) => (
            <div
              key={intention.id}
              className="p-4 bg-white/5 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{intention.content}</p>
                <p className="text-sm text-gray-400">
                  {format(new Date(intention.preferred_date), "dd.MM.yyyy")}{" "}
                  {intention.preferred_time}
                </p>
                <p className="text-sm text-gray-400">
                  {intention.requestor_name}
                </p>
              </div>
              <div className="flex space-x-2">
                {intention.status === "pending" && (
                  <>
                    <GlassButton
                      onClick={() => confirmIntention(intention.id)}
                      variant="primary"
                      size="sm"
                    >
                      Zatwierdź
                    </GlassButton>
                    <GlassButton
                      onClick={() => rejectIntention(intention.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Odrzuć
                    </GlassButton>
                  </>
                )}
                {intention.status === "confirmed" && (
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-sm">
                    Zatwierdzona
                  </span>
                )}
                {intention.status === "rejected" && (
                  <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-sm">
                    Odrzucona
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
