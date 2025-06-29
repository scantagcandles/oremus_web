// Types for multi-tenant functionality in Oremus
// This file contains TypeScript types for organizations and memberships

import { Database } from "./supabase";

// Organization status type
export type OrganizationStatus = "pending" | "active" | "suspended";

// Organization subscription plan type
export type OrganizationPlan = "basic" | "premium" | "enterprise";

// Role within an organization (parish)
export type MembershipRole =
  | "proboszcz"
  | "wikariusz"
  | "rezydent"
  | "kapelan"
  | "parish_admin";

// Base Organization type
export interface Organization {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  created_at: string;
  updated_at: string;
  settings: OrganizationSettings;
}

// Rate limiting settings
export interface RateLimitSettings {
  max_requests_per_minute?: number;
  max_api_calls_per_day?: number;
  enabled: boolean;
}

// Organization settings
export interface OrganizationSettings {
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
  };
  features?: {
    enable_candles?: boolean;
    enable_mass_intentions?: boolean;
    enable_calendar?: boolean;
    enable_announcements?: boolean;
    enable_push_notifications?: boolean;
    enable_custom_domain?: boolean;
    enable_api_access?: boolean;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  custom_domain_settings?: {
    ssl_enabled?: boolean;
    dns_verified?: boolean;
    verification_code?: string;
  };
  rate_limiting?: RateLimitSettings;
  maintenance_mode?: {
    enabled: boolean;
    message?: string;
    scheduled_end?: string;
  };
}

// Member permissions
export interface MemberPermissions {
  manage_members?: boolean;
  manage_finances?: boolean;
  manage_masses?: boolean;
  manage_candles?: boolean;
  manage_announcements?: boolean;
  view_analytics?: boolean;
  manage_settings?: boolean;
}

// Membership type
export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: MembershipRole;
  permissions: MemberPermissions;
  created_at: string;
  updated_at: string;
}

// Extended Database type to include new multi-tenant tables
export type DatabaseWithMultiTenant = Database & {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Organization, "id" | "created_at" | "updated_at">>;
      };
      memberships: {
        Row: Membership;
        Insert: Omit<Membership, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Membership, "id" | "created_at" | "updated_at">>;
      };
    } & Database["public"]["Tables"];
  };
};
