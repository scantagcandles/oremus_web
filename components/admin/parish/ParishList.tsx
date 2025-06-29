"use client";

import React, { useState } from "react";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";
import { ParishForm } from "./ParishForm";
import { useParish } from "@/hooks/useParish";
import type { Parish } from "@/types/parish";

export function ParishList() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingParish, setEditingParish] = useState<Parish | null>(null);
  const { parish, updateParish, loading, error } = useParish();

  const handleSubmit = async (data: Partial<Parish>) => {
    try {
      if (parish) {
        await updateParish.mutateAsync(data);
        setEditingParish(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with edit button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Parafia</h2>
        <Button
          variant="primary"
          onClick={() => parish && setEditingParish(parish)}
          leftIcon={<Edit className="w-4 h-4" />}
        >
          Edytuj dane
        </Button>
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editingParish && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ParishForm
              initialData={editingParish}
              onSubmit={handleSubmit}
              onCancel={() => setEditingParish(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parish Info */}
      <div className="grid gap-4">
        {loading ? (
          <GlassCard>
            <div className="p-8 text-center text-white/70">Ładowanie...</div>
          </GlassCard>
        ) : !parish ? (
          <GlassCard>
            <div className="p-8 text-center text-white/70">
              Brak danych parafii. Kliknij "Edytuj dane" aby je uzupełnić.
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {parish.name}
                </h3>
                <p className="text-sm text-white/70 mt-1">{parish.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
                {parish.email && (
                  <div>
                    <span className="font-medium">Email:</span> {parish.email}
                  </div>
                )}
                {parish.phone && (
                  <div>
                    <span className="font-medium">Telefon:</span> {parish.phone}
                  </div>
                )}
                {parish.website && (
                  <div className="md:col-span-2">
                    <span className="font-medium">WWW:</span>{" "}
                    <a
                      href={parish.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:underline"
                    >
                      {parish.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
