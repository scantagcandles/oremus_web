'use client';

import React, { useState } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/glass/Button';
import { PriestForm } from './PriestForm';
import { useParish } from '@/hooks/useParish';
import type { Priest } from '@/types/parish';

export function PriestsList() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPriest, setEditingPriest] = useState<Priest | null>(null);
  const { priests, addPriest, updatePriest, deletePriest, loading, error } = useParish();

  const handleSubmit = async (data: Partial<Priest>) => {
    try {
      if (editingPriest) {
        await updatePriest.mutateAsync({ id: editingPriest.id, ...data });
        setEditingPriest(null);
      } else {
        await addPriest.mutateAsync(data);
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego księdza?')) {
      try {
        await deletePriest.mutateAsync(id);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Księża</h2>
        <Button
          variant="primary"
          onClick={() => setIsAdding(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Dodaj księdza
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingPriest) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PriestForm
              initialData={editingPriest || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsAdding(false);
                setEditingPriest(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priests List */}
      <div className="grid gap-4">
        {loading ? (
          <GlassCard>
            <div className="p-8 text-center text-white/70">
              Ładowanie...
            </div>
          </GlassCard>
        ) : priests.length === 0 ? (
          <GlassCard>
            <div className="p-8 text-center text-white/70">
              Brak księży w parafii. Kliknij "Dodaj księdza" aby dodać pierwszego.
            </div>
          </GlassCard>
        ) : (
          priests.map((priest) => (
            <motion.div
              key={priest.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {priest.first_name} {priest.last_name}
                    </h3>
                    <p className="text-sm text-white/70">
                      {priest.role}
                    </p>
                    <div className="mt-2 space-x-4 text-sm text-white/50">
                      {priest.email && (
                        <span>{priest.email}</span>
                      )}
                      {priest.phone && (
                        <span>{priest.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPriest(priest)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(priest.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
