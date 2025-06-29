import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/configs/supabase";
import type { Parish, Priest, Mass, Announcement } from "@/types/parish";

export function useParish() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch parish data
  const {
    data: parish,
    isLoading: parishLoading,
    error: parishError,
  } = useQuery({
    queryKey: ["parish"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parishes")
        .select("*")
        .single();

      if (error) throw error;
      return data as Parish;
    },
  });

  // Fetch priests
  const { data: priests = [], isLoading: priestsLoading } = useQuery({
    queryKey: ["priests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("priests")
        .select("*")
        .eq("parish_id", parish?.id);

      if (error) throw error;
      return data as Priest[];
    },
    enabled: !!parish?.id,
  });

  // Fetch masses
  const { data: masses = [], isLoading: massesLoading } = useQuery({
    queryKey: ["masses", selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("masses")
        .select("*")
        .eq("parish_id", parish?.id);

      if (selectedDate) {
        query = query.eq("date", selectedDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Mass[];
    },
    enabled: !!parish?.id,
  });

  // Fetch announcements
  const { data: announcements = [], isLoading: announcementsLoading } =
    useQuery({
      queryKey: ["announcements"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("parish_id", parish?.id)
          .eq("is_published", true)
          .gte("end_date", new Date().toISOString());

        if (error) throw error;
        return data as Announcement[];
      },
      enabled: !!parish?.id,
    });

  // Update parish
  const updateParish = useMutation({
    mutationFn: async (updates: Partial<Parish>) => {
      const { data, error } = await supabase
        .from("parishes")
        .update(updates)
        .eq("id", parish?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parish"] });
    },
  });
  // Add priest
  const addPriest = useMutation({
    mutationFn: async (
      data: Omit<Priest, "id" | "created_at" | "updated_at">
    ) => {
      const { data: newPriest, error } = await supabase
        .from("priests")
        .insert([
          {
            ...data,
            parish_id: parish?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return newPriest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priests"] });
    },
  });

  // Update priest
  const updatePriest = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Priest> & { id: string }) => {
      const { data: updatedPriest, error } = await supabase
        .from("priests")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedPriest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priests"] });
    },
  });

  // Delete priest
  const deletePriest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("priests").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priests"] });
    },
  });

  // Add mass
  const addMass = useMutation({
    mutationFn: async (
      mass: Omit<Mass, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("masses")
        .insert([{ ...mass, parish_id: parish?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masses"] });
    },
  });
  // Add announcement
  const addAnnouncement = useMutation({
    mutationFn: async (
      announcement: Omit<
        Announcement,
        "id" | "created_at" | "updated_at" | "parish_id"
      >
    ) => {
      const { data, error } = await supabase
        .from("announcements")
        .insert([{ ...announcement, parish_id: parish?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  // Update announcement
  const updateAnnouncement = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Announcement> & { id: string }) => {
      const { data: updatedAnnouncement, error } = await supabase
        .from("announcements")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedAnnouncement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  // Delete announcement
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    parish,
    priests,
    masses,
    announcements,
    selectedDate,
    setSelectedDate,
    loading:
      parishLoading || priestsLoading || massesLoading || announcementsLoading,
    error: parishError,
    updateParish,
    addPriest,
    updatePriest,
    deletePriest,
    addMass,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
