"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Clock,
  Church,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { Input } from "@/components/glass/Input";
import { Calendar as CalendarComponent } from "@/components/glass/Calendar";
import type { Mass, MassIntention } from "@/types/parish";

interface MassCardProps {
  mass: Mass;
  intentions: MassIntention[];
  onAddIntention: () => void;
  onStatusChange: (intention: MassIntention, status: string) => void;
}

export function MassCard({
  mass,
  intentions,
  onAddIntention,
  onStatusChange,
}: MassCardProps) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium">
              {format(new Date(mass.date), "d MMMM yyyy", { locale: pl })}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            <span>{mass.time}</span>
            <span>•</span>
            <Church className="w-4 h-4" />
            <span>{mass.type}</span>
          </div>
        </div>

        <div className="space-y-4">
          {intentions.map((intention) => (
            <motion.div
              key={intention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-white/5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{intention.content}</span>
                  </h4>
                  <div className="text-sm text-white/70 space-y-1">
                    <p className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{intention.requestor_name}</span>
                    </p>
                    {intention.requestor_email && (
                      <p className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{intention.requestor_email}</span>
                      </p>
                    )}
                    {intention.requestor_phone && (
                      <p className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{intention.requestor_phone}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {intention.status === "pending" && (
                    <>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => onStatusChange(intention, "approved")}
                      >
                        <Check className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onStatusChange(intention, "rejected")}
                      >
                        <X className="w-4 h-4" />
                      </GlassButton>
                    </>
                  )}
                  {intention.status === "approved" && (
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
            </motion.div>
          ))}

          {intentions.length < mass.max_intentions && (
            <GlassButton
              variant="outline"
              className="w-full"
              onClick={onAddIntention}
            >
              + Dodaj intencję
            </GlassButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
