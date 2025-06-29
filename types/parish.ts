export interface Parish {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Priest {
  id: string;
  parish_id: string;
  first_name: string;
  last_name: string;
  role?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Mass {
  id: string;
  parish_id: string;
  priest_id?: string;
  date: string;
  time: string;
  type: string;
  language: string;
  max_intentions: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MassIntention {
  id: string;
  mass_id: string;
  content: string;
  requestor_name: string;
  requestor_email?: string;
  requestor_phone?: string;
  status: MassIntentionStatus;
  payment_status: PaymentStatus;
  payment_amount?: number;
  payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export enum MassIntentionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface Announcement {
  id: string;
  parish_id: string;
  title: string;
  content: string;
  start_date: string;
  end_date?: string;
  is_published: boolean;
  priority: AnnouncementPriority;
  created_at: string;
  updated_at: string;
}

export type AnnouncementPriority = "low" | "normal" | "high";

export interface User {
  id: string;
  parish_id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = "admin",
  PRIEST = "priest",
  STAFF = "staff",
  USER = "user",
}
