"use client";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";
import { Calendar, Clock, CheckCircle2, X } from "lucide-react";
import Link from "next/link";

export default function AdminIntentionsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const [intentions, setIntentions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading based on status
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          type: "Za zmarłych",
          date: "2025-06-28",
          status: "pending",
          requester: "Jan Kowalski",
        },
        {
          id: 2,
          type: "O zdrowie",
          date: "2025-06-29",
          status: "waiting",
          requester: "Maria Nowak",
        },
        {
          id: 3,
          type: "Dziękczynna",
          date: "2025-06-27",
          status: "completed",
          requester: "Piotr Wiśniewski",
        },
        {
          id: 4,
          type: "Za rodzinę",
          date: "2025-06-30",
          status: "pending",
          requester: "Anna Kowalczyk",
        },
        {
          id: 5,
          type: "O powołania",
          date: "2025-07-01",
          status: "waiting",
          requester: "Tomasz Mazur",
        },
      ];

      const filtered =
        status === "all"
          ? mockData
          : mockData.filter((item) => item.status === status);

      setIntentions(filtered);
      setIsLoading(false);
    }, 1000);
  }, [status]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        color: "bg-sacred-gold/20 text-sacred-gold",
        icon: Calendar,
        label: "Oczekujące",
      },
      waiting: {
        color: "bg-orange-400/20 text-orange-400",
        icon: Clock,
        label: "Do odprawienia",
      },
      completed: {
        color: "bg-green-400/20 text-green-400",
        icon: CheckCircle2,
        label: "Odprawione",
      },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-deep-blue via-purple-900 to-indigo-900">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white font-heading">
            Intencje Mszalne
          </h1>
          <p className="text-gray-300">
            Zarządzaj intencjami mszalnymi w Twojej parafii
          </p>
        </div>

        {/* Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/intentions">
              <Button variant={status === "all" ? "golden" : "glass"} size="sm">
                Wszystkie
              </Button>
            </Link>
            <Link href="/admin/intentions?status=pending">
              <Button
                variant={status === "pending" ? "golden" : "glass"}
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Oczekujące
              </Button>
            </Link>
            <Link href="/admin/intentions?status=waiting">
              <Button
                variant={status === "waiting" ? "golden" : "glass"}
                size="sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Do odprawienia
              </Button>
            </Link>
            <Link href="/admin/intentions?status=completed">
              <Button
                variant={status === "completed" ? "golden" : "glass"}
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Odprawione
              </Button>
            </Link>
          </div>
        </GlassCard>

        {/* Intentions List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="w-1/3 h-6 mb-2 rounded bg-white/20"></div>
                  <div className="w-1/4 h-4 rounded bg-white/10"></div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : intentions.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-300">Brak intencji do wyświetlenia</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {intentions.map((intention) => {
              const badge = getStatusBadge(intention.status);
              return (
                <GlassCard
                  key={intention.id}
                  className="p-6 hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 text-xl font-semibold text-white">
                        {intention.type}
                      </h3>
                      <p className="text-sm text-gray-300">
                        Zamawiający: {intention.requester} • Data:{" "}
                        {intention.date}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full flex items-center gap-2 ${badge.color}`}
                    >
                      <badge.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{badge.label}</span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link href="/admin/dashboard">
            <Button
              variant="ghost"
              className="text-sacred-gold hover:text-sacred-gold-light"
            >
              ← Powrót do dashboardu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
