"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ComponentType;
  className?: string;
}

export const AnalyticsCard: FC<AnalyticsCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-glass-black p-6 rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/70">{title}</span>
        {Icon && <Icon className="w-5 h-5 text-white/30" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend.positive ? "text-success" : "text-error"
            }`}
          >
            {trend.positive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
