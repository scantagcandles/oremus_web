// Utilities for working with multi-tenant context in server components

import { cookies, headers } from "next/headers";
import { supabase } from "@/configs/supabase";
import { Organization, Membership, MembershipRole } from "@/types/multi-tenant";

/**
 * Gets the current organization context from request headers
 * This is set by the middleware for subdomain and custom domain requests
 */
export async function getCurrentOrganization(): Promise<Organization | null> {
  const headerList = headers();
  const organizationId = headerList.get("x-organization-id");

  if (!organizationId) {
    return null;
  }

  // Fetch complete organization data
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  return data as Organization | null;
}

/**
 * Gets the hostname and subdomain/custom domain info
 */
export function getDomainInfo() {
  const headerList = headers();
  const host = headerList.get("host") || "";

  // Extract subdomain if it's an oremus.pl domain
  let subdomain: string | null = null;
  let isCustomDomain = false;

  if (host.includes(".oremus.pl")) {
    const parts = host.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  } else if (host && !["localhost", "127.0.0.1"].includes(host.split(":")[0])) {
    isCustomDomain = true;
  }

  return {
    host,
    subdomain,
    isCustomDomain,
    isMainApp:
      host === "app.oremus.pl" ||
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1"),
  };
}

/**
 * Checks if the current user is a member of the organization
 * @param organizationId The organization ID to check membership for
 * @param userId The user ID to check (defaults to current user)
 */
export async function isOrganizationMember(
  organizationId: string,
  userId?: string
): Promise<boolean> {
  // If no userId provided, get current user
  if (!userId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return false;
    }
    userId = session.user.id;
  }

  // Check if user is a member of the organization
  const { data, error } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  return !!data && !error;
}

/**
 * Get organization by slug or custom domain
 * @param identifier Slug or custom domain of the organization
 * @returns Organization or null if not found
 */
export async function getOrganizationByIdentifier(
  identifier: string
): Promise<Organization | null> {
  // Try to find by slug first
  const { data: orgBySlug, error: slugError } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", identifier)
    .single();

  if (!slugError && orgBySlug) {
    return orgBySlug as Organization;
  }

  // If not found, try by custom domain
  const { data: orgByDomain, error: domainError } = await supabase
    .from("organizations")
    .select("*")
    .eq("custom_domain", identifier)
    .single();

  if (!domainError && orgByDomain) {
    return orgByDomain as Organization;
  }

  return null;
}

/**
 * Get user's membership in an organization
 * @param userId User ID
 * @param organizationId Organization ID
 * @returns Membership or null if user is not a member
 */
export async function getUserMembership(
  userId: string,
  organizationId: string
): Promise<Membership | null> {
  const { data: membership, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !membership) {
    return null;
  }

  return membership as Membership;
}

/**
 * Check if a user has a specific role in an organization
 * @param userId User ID
 * @param organizationId Organization ID
 * @param requiredRoles Array of roles that grant access
 * @returns Boolean indicating if user has access
 */
export async function hasOrganizationRole(
  userId: string,
  organizationId: string,
  requiredRoles: MembershipRole[] = []
): Promise<boolean> {
  const membership = await getUserMembership(userId, organizationId);

  if (!membership) {
    return false;
  }

  // If no specific roles are required, any membership is sufficient
  if (requiredRoles.length === 0) {
    return true;
  }

  // Check if user's role is in the list of required roles
  return requiredRoles.includes(membership.role);
}

/**
 * Checks if a user is a super admin with access to all organizations
 * @param userId User ID
 * @returns Boolean indicating if user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return false;
  }

  return user.role === "super_admin";
}
