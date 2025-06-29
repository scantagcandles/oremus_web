// Organization and membership management service
// Handles CRUD operations for multi-tenant functionality

import { supabase } from "@/configs/supabase";
import {
  Organization,
  Membership,
  OrganizationSettings,
  MembershipRole,
  MemberPermissions,
} from "@/types/multi-tenant";

/**
 * Service for managing organizations (parishes) and memberships
 */
export class OrganizationService {
  /**
   * Creates a new organization
   */ static async createOrganization(
    name: string,
    slug: string,
    settings?: Partial<OrganizationSettings>
  ): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name,
          slug,
          settings: settings || {},
          status: "pending",
          plan: "basic",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating organization:", error);
        return null;
      }

      return data as Organization;
    } catch (error) {
      console.error("Exception creating organization:", error);
      return null;
    }
  }

  /**
   * Gets an organization by ID
   */
  static async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching organization:", error);
        return null;
      }

      return data as Organization;
    } catch (error) {
      console.error("Exception fetching organization:", error);
      return null;
    }
  }

  /**
   * Gets an organization by slug (subdomain)
   */
  static async getOrganizationBySlug(
    slug: string
  ): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching organization by slug:", error);
        return null;
      }

      return data as Organization;
    } catch (error) {
      console.error("Exception fetching organization by slug:", error);
      return null;
    }
  }

  /**
   * Gets an organization by custom domain
   */
  static async getOrganizationByDomain(
    domain: string
  ): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("custom_domain", domain)
        .single();

      if (error) {
        console.error("Error fetching organization by domain:", error);
        return null;
      }

      return data as Organization;
    } catch (error) {
      console.error("Exception fetching organization by domain:", error);
      return null;
    }
  }

  /**
   * Updates an organization
   */
  static async updateOrganization(
    id: string,
    updates: Partial<Organization>
  ): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating organization:", error);
        return null;
      }

      return data as Organization;
    } catch (error) {
      console.error("Exception updating organization:", error);
      return null;
    }
  }

  /**
   * Lists organizations for the current user
   */
  static async listUserOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select(
          `
          *,
          memberships!inner(*)
        `
        )
        .order("name");

      if (error) {
        console.error("Error listing user organizations:", error);
        return [];
      }

      return data as Organization[];
    } catch (error) {
      console.error("Exception listing user organizations:", error);
      return [];
    }
  }

  /**
   * Adds a user to an organization with the specified role
   */
  static async addMember(
    organizationId: string,
    userId: string,
    role: MembershipRole,
    permissions?: Partial<MemberPermissions>
  ): Promise<Membership | null> {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role,
          permissions: permissions || {},
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding member:", error);
        return null;
      }

      return data as Membership;
    } catch (error) {
      console.error("Exception adding member:", error);
      return null;
    }
  }

  /**
   * Updates a membership (role or permissions)
   */
  static async updateMembership(
    membershipId: string,
    updates: Partial<Membership>
  ): Promise<Membership | null> {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .update(updates)
        .eq("id", membershipId)
        .select()
        .single();

      if (error) {
        console.error("Error updating membership:", error);
        return null;
      }

      return data as Membership;
    } catch (error) {
      console.error("Exception updating membership:", error);
      return null;
    }
  }

  /**
   * Removes a user from an organization
   */
  static async removeMember(membershipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("memberships")
        .delete()
        .eq("id", membershipId);

      if (error) {
        console.error("Error removing member:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception removing member:", error);
      return false;
    }
  }

  /**
   * Lists members of an organization
   */
  static async listOrganizationMembers(
    organizationId: string
  ): Promise<Membership[]> {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select(
          `
          *,
          users(id, email, name, avatar_url)
        `
        )
        .eq("organization_id", organizationId);

      if (error) {
        console.error("Error listing organization members:", error);
        return [];
      }

      return data as Membership[];
    } catch (error) {
      console.error("Exception listing organization members:", error);
      return [];
    }
  }
}
