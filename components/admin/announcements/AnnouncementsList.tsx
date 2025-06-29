"use client";

import React, { useState } from "react";
import { Edit, Trash2, PlusCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";
import { AnnouncementForm } from "./AnnouncementForm";
import { useParish } from "@/hooks/useParish";
import type { Announcement } from "@/types/parish";

export function AnnouncementsList() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    loading,
    error,
  } = useParish();

  const handleSubmit = async (data: Partial<Announcement>) => {
    try {
      if (editingAnnouncement) {
        await updateAnnouncement.mutateAsync({
          id: editingAnnouncement.id,
          ...data,
        });
        setEditingAnnouncement(null);
      } else {
        await addAnnouncement.mutateAsync(data);
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) {
      try {
        await deleteAnnouncement.mutateAsync(id);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Ogłoszenia parafialne</h2>
        <Button
          variant="primary"
          onClick={() => setIsAdding(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Dodaj ogłoszenie
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingAnnouncement) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnnouncementForm
              initialData={editingAnnouncement || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsAdding(false);
                setEditingAnnouncement(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      <div className="grid gap-4">
        {loading ? (
          <GlassCard>
            <div className="p-8 text-center text-white/70">Ładowanie...</div>
          </GlassCard>
        ) : announcements.length === 0 ? (
          <GlassCard>
            <div className="p-8 text-center text-white/70">
              Brak ogłoszeń. Kliknij "Dodaj ogłoszenie" aby dodać pierwsze.
            </div>
          </GlassCard>
        ) : (
          announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GlassCard className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {announcement.priority === "high" && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <h3 className="text-lg font-medium text-white">
                          {announcement.title}
                        </h3>
                      </div>
                      <div className="mt-2 text-sm text-white/70">
                        {announcement.content}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-white/50">
                        <span>
                          Od:{" "}
                          {new Date(
                            announcement.start_date
                          ).toLocaleDateString()}
                        </span>
                        {announcement.end_date && (
                          <span>
                            Do:{" "}
                            {new Date(
                              announcement.end_date
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAnnouncement(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
