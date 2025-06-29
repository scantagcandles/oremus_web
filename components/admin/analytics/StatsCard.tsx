"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-glass-white backdrop-blur-lg rounded-xl p-4 text-white",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/70">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="p-2 bg-glass-secondary rounded-lg">
            <span className="w-5 h-5">{icon}</span>
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div
          className={cn(
            "mt-2 text-sm",
            trend >= 0 ? "text-green-400" : "text-red-400"
          )}
        >
          {trend >= 0 ? "+" : ""}
          {trend.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
