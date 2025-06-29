"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/glass/GlassCard";
import Link from "next/link";

interface QuickStat {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  icon: React.ElementType;
  color: string;
  sublabel?: string;
  href?: string;
}

export function QuickStats() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<QuickStat[]>([]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setStats([
        {
          id: "ordered",
          label: "Zamówione Msze",
          value: 12,
          sublabel: "Ten miesiąc",
          icon: Calendar,
          color: "text-sacred-gold",
          change: 15,
          href: "/admin/intentions?status=pending",
        },
        {
          id: "pending",
          label: "Oczekujące",
          value: 3,
          sublabel: "Do odprawienia",
          icon: Clock,
          color: "text-orange-400",
          href: "/admin/intentions?status=waiting",
        },
        {
          id: "completed",
          label: "Odprawione",
          value: 156,
          sublabel: "Łącznie",
          icon: CheckCircle2,
          color: "text-green-400",
          change: 8,
          href: "/admin/intentions?status=completed",
        },
        {
          id: "upcoming",
          label: "Nadchodzące",
          value: 5,
          sublabel: "Ten tydzień",
          icon: Users,
          color: "text-blue-400",
          href: "/admin/masses?upcoming=true",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <QuickStatsLoading />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const CardWrapper = stat.href ? Link : "div";
        const cardProps = stat.href ? { href: stat.href } : {};

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CardWrapper {...cardProps}>
              <GlassCard
                className="h-full p-6 transition-all duration-300 cursor-pointer hover:scale-105 group"
                intensity="medium"
                gradient
                gradientDirection="diagonal-br"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-white font-heading">
                      {stat.value}
                    </p>
                    {stat.sublabel && (
                      <p className="mt-1 text-sm text-gray-400">
                        {stat.sublabel}
                      </p>
                    )}
                    {stat.change && (
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                        <span className="text-sm text-green-400">
                          +{stat.change}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300",
                      stat.color,
                      "group-hover:scale-110"
                    )}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </GlassCard>
            </CardWrapper>
          </motion.div>
        );
      })}
    </div>
  );
}

function QuickStatsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-6 border backdrop-blur-xl bg-white/10 border-white/20 rounded-xl"
        >
          <div className="animate-pulse">
            <div className="w-24 h-4 mb-3 rounded bg-white/20"></div>
            <div className="w-16 h-8 mb-2 rounded bg-white/30"></div>
            <div className="w-20 h-3 rounded bg-white/20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Custom hook for using quick stats data
export function useQuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // This would be replaced with actual API call
        const response = await new Promise<QuickStat[]>((resolve) => {
          setTimeout(() => {
            resolve([
              {
                id: "ordered",
                label: "Zamówione Msze",
                value: 12,
                sublabel: "Ten miesiąc",
                icon: Calendar,
                color: "text-sacred-gold",
                change: 15,
              },
              {
                id: "pending",
                label: "Oczekujące",
                value: 3,
                sublabel: "Do odprawienia",
                icon: Clock,
                color: "text-orange-400",
              },
              {
                id: "completed",
                label: "Odprawione",
                value: 156,
                sublabel: "Łącznie",
                icon: CheckCircle2,
                color: "text-green-400",
                change: 8,
              },
              {
                id: "revenue",
                label: "Przychód",
                value: "2,450 zł",
                sublabel: "Ten miesiąc",
                icon: DollarSign,
                color: "text-purple-400",
                change: 12,
              },
            ]);
          }, 1000);
        });

        setStats(response);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
