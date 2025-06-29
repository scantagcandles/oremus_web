import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/configs/supabase";
import type { MassIntention } from "@/types/parish";

export const useMassIntentions = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Fetch intentions
  const {
    data: intentions = [],
    isLoading: loading,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["massIntentions", selectedDate],
    queryFn: async () => {
      let query = supabase.from("mass_intentions").select("*");

      if (selectedDate) {
        const date = selectedDate.toISOString().split("T")[0];
        query = query.eq("date", date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MassIntention[];
    },
  });

  // Update intention status
  const updateIntentionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("mass_intentions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["massIntentions"]);
    },
  });

  return {
    intentions,
    selectedDate,
    loading,
    error: error as Error | null,
    setSelectedDate,
    confirmIntention,
    rejectIntention,
    refresh,
  };
};
