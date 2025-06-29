"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/glass/GlassCard";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    {
      title: "Zamówione Msze",
      value: "12",
      change: "+3",
      changeType: "positive",
      period: "Ten miesiąc",
      icon: "⛪",
      color: "from-blue-500 to-cyan-500",
      href: "/admin/intentions",
    },
    {
      title: "Oczekujące",
      value: "3",
      change: "-1",
      changeType: "positive",
      period: "Ten tydzień",
      icon: "⏳",
      color: "from-yellow-500 to-orange-500",
      href: "/admin/intentions?status=pending",
    },
    {
      title: "Odprawione",
      value: "8",
      change: "+2",
      changeType: "positive",
      period: "Ten miesiąc",
      icon: "✅",
      color: "from-green-500 to-emerald-500",
      href: "/admin/intentions?status=completed",
    },
    {
      title: "Nadchodzące",
      value: "2",
      change: "0",
      changeType: "neutral",
      period: "Ten tydzień",
      icon: "📅",
      color: "from-purple-500 to-pink-500",
      href: "/admin/intentions?status=upcoming",
    },
  ];

  const quickActions = [
    {
      title: "Intencje mszalne",
      description: "Zarządzaj intencjami i harmonogramem",
      href: "/admin/intentions",
      icon: "📝",
      color: "from-blue-500 to-purple-500",
      badge: "3 nowe",
    },
    {
      title: "Analityka",
      description: "Statystyki i raporty parafii",
      href: "/admin/analytics",
      icon: "📈",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Ogłoszenia",
      description: "Publikuj ogłoszenia parafialne",
      href: "/admin/announcements",
      icon: "📢",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Księża",
      description: "Zarządzaj duchownymi",
      href: "/admin/priests",
      icon: "👨‍💼",
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Płatności",
      description: "System płatności i rozliczeń",
      href: "/admin/payments",
      icon: "💳",
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Monitoring",
      description: "Status systemu i alerty",
      href: "/admin/monitoring",
      icon: "📡",
      color: "from-red-500 to-pink-500",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "intention",
      title: "Nowa intencja mszalna",
      description: "Jan Kowalski zamówił mszę na 25.06.2025",
      time: "2 min temu",
      icon: "➕",
      color: "text-green-400",
    },
    {
      id: 2,
      type: "payment",
      title: "Płatność otrzymana",
      description: "Wpłata 50 zł za intencję #1234",
      time: "15 min temu",
      icon: "💰",
      color: "text-blue-400",
    },
    {
      id: 3,
      type: "priest",
      title: "Harmonogram zaktualizowany",
      description: "ks. Jan Nowak dodał dyspozycyjność",
      time: "1h temu",
      icon: "📅",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                Panel Administracyjny
              </h1>
              <p className="text-blue-100">
                Zarządzaj parafią i monitoruj aktywność
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex p-1 rounded-lg bg-slate-800/50">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    timeRange === range
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {range === "7d"
                    ? "7 dni"
                    : range === "30d"
                    ? "30 dni"
                    : "90 dni"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <Link key={stat.title} href={stat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <GlassCard className="p-6 transition-transform cursor-pointer hover:scale-105 group">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}
                    >
                      {stat.icon}
                    </div>
                    <div
                      className={`text-sm px-2 py-1 rounded ${
                        stat.changeType === "positive"
                          ? "text-green-400 bg-green-400/10"
                          : stat.changeType === "negative"
                          ? "text-red-400 bg-red-400/10"
                          : "text-gray-400 bg-gray-400/10"
                      }`}
                    >
                      {stat.change !== "0" &&
                        (stat.changeType === "positive" ? "+" : "")}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-200">{stat.title}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {stat.period}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="mb-6 text-2xl font-bold text-white">
                Szybkie akcje
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => (
                  <Link key={action.title} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <GlassCard className="relative h-full p-4 transition-transform cursor-pointer hover:scale-105 group">
                        {action.badge && (
                          <div className="absolute px-2 py-1 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                            {action.badge}
                          </div>
                        )}
                        <div
                          className={`w-12 h-12 mb-3 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}
                        >
                          {action.icon}
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-white">
                          {action.title}
                        </h3>
                        <p className="text-sm text-blue-200">
                          {action.description}
                        </p>
                      </GlassCard>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Ostatnia aktywność
                  </h3>
                  <Link
                    href="/admin/activity"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Zobacz wszystko
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm ${activity.color}`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-blue-200 truncate">
                          {activity.description}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
