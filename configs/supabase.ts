import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Type definitions for better error handling
export type SupabaseResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

// Type helper for table rows
export type Tables = Database["public"]["Tables"];
export type TableRow<T extends keyof Tables> = Tables[T]["Row"];

// Common table names as constants
export const TABLES = {
  USERS: "users",
  CANDLES: "candles",
  MASSES: "masses",
  AUDIO_TRACKS: "audio_tracks",
  USER_PROGRESS: "user_progress",
  USER_FAVORITES: "user_favorites",
} as const;

// Realtime channel names
export const REALTIME_CHANNELS = {
  CANDLE_UPDATES: "candle_updates",
  MASS_UPDATES: "mass_updates",
} as const;

// Audio track types
export const TRACK_TYPES = {
  PRAYER: "prayer",
  COURSE: "course",
  ODB: "odb",
  MASS: "mass",
} as const;

// Mass types and statuses
export const MASS_TYPES = {
  REGULAR: "regular",
  REQUIEM: "requiem",
  THANKSGIVING: "thanksgiving",
} as const;

export const MASS_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Interactive segment types
export const SEGMENT_TYPES = {
  LISTEN: "listen",
  RESPOND: "respond",
  MEDITATE: "meditate",
} as const;

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: PostgrestError) => {
  // Log the error for debugging (you might want to use a proper logging service)
  console.error("Supabase Error:", error);

  // Return user-friendly error messages based on error codes
  switch (error.code) {
    case "23505": // unique_violation
      return "This record already exists.";
    case "23503": // foreign_key_violation
      return "Invalid reference to another record.";
    case "42P01": // undefined_table
      return "System error: Table not found.";
    case "42703": // undefined_column
      return "System error: Invalid field.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

// Function to format date strings consistently
export const formatSupabaseDate = (date: Date) => {
  return date.toISOString();
};

// Function to parse Supabase date strings
export const parseSupabaseDate = (dateString: string) => {
  return new Date(dateString);
};

// Query builder helpers
export const buildPaginationQuery = (page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  return { start, end };
};

// RLS Policy names for reference
export const RLS_POLICIES = {
  USER_OWNS_RECORD: "user_owns_record",
  USER_CAN_READ: "user_can_read",
  USER_CAN_INSERT: "user_can_insert",
  USER_CAN_UPDATE: "user_can_update",
  USER_CAN_DELETE: "user_can_delete",
} as const;
