import { NextRequest, NextResponse } from "next/server";
import { getOrganizationByIdentifier, isSuperAdmin } from "@/lib/multi-tenant";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Organization } from "@/types/multi-tenant";
import { Redis } from "@upstash/redis";

// Cache TTL for organization data (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth",
  "/(auth)",
  "/auth/login",
  "/(auth)/login",
  "/auth/register",
  "/auth/register/user",
  "/auth/register/parish",
  "/(auth)/register",
  "/(auth)/register/user",
  "/(auth)/register/parish",
  "/public",
  "/_next",
  "/static",
  "/images",
  "/favicon.ico",
  "/api/public",
  "/",
];

// Paths that should bypass middleware completely
const BYPASS_PATHS = [
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/public",
  "/static",
  "/api",
];

// Admin paths that require super admin access
const ADMIN_PATHS = ["/admin", "/super-admin", "/system"];

// Domain config
interface DomainInfo {
  subdomain: string | null;
  isCustomDomain: boolean;
}

// Redis client for rate limiting
let redis: Redis | null = null;

function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL || "",
      token: process.env.UPSTASH_REDIS_TOKEN || "",
    });
  }
  return redis;
}

// Organization cache
interface CachedOrg {
  data: Organization;
  timestamp: number;
}

const orgCache = new Map<string, CachedOrg>();

function getDomainInfo(hostname: string): DomainInfo {
  let subdomain: string | null = null;
  let isCustomDomain = false;

  if (hostname.includes(".oremus.pl")) {
    const parts = hostname.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  } else if (
    hostname &&
    !["localhost", "127.0.0.1"].includes(hostname.split(":")[0])
  ) {
    isCustomDomain = true;
  }

  return { subdomain, isCustomDomain };
}

function redirectToMainApp(path: string): NextResponse {
  // W development nie przekierowuj na domenę produkcyjną
  if (process.env.NODE_ENV === "development") {
    const url = new URL(`http://localhost:3000${path}`);
    return NextResponse.redirect(url);
  }
  const url = new URL(`https://app.oremus.pl${path}`);
  return NextResponse.redirect(url);
}

function handleError(error: unknown): NextResponse {
  console.error("Middleware error:", error);

  // W development przekieruj lokalnie
  if (process.env.NODE_ENV === "development") {
    const url = new URL("http://localhost:3000/error");
    if (error instanceof Error) {
      url.searchParams.set("code", error.name || "UNKNOWN");
      url.searchParams.set("message", error.message);
    } else {
      url.searchParams.set("code", "UNKNOWN");
    }
    return NextResponse.redirect(url);
  }

  const url = new URL("https://app.oremus.pl/error");
  if (error instanceof Error) {
    url.searchParams.set("code", error.name || "UNKNOWN");
    url.searchParams.set("message", error.message);
  } else {
    url.searchParams.set("code", "UNKNOWN");
  }
  return NextResponse.redirect(url);
}

async function checkRateLimit(
  request: NextRequest,
  organization: Organization
): Promise<boolean> {
  if (!organization.settings?.rate_limiting?.enabled) {
    return true;
  }

  try {
    const redis = getRedisClient();
    const config = organization.settings.rate_limiting;
    const key = `rate_limit:${organization.id}:${request.ip}`;
    const ttl = 60; // 1 minute window

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, ttl);
    }

    return current <= (config.max_requests_per_minute || 100);
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true;
  }
}

function isUnderMaintenance(organization: Organization): boolean {
  if (!organization.settings?.maintenance_mode?.enabled) {
    return false;
  }

  const scheduled_end = organization.settings.maintenance_mode.scheduled_end;
  if (scheduled_end && new Date(scheduled_end) < new Date()) {
    return false;
  }

  return true;
}

async function handleMainApp(
  request: NextRequest,
  supabaseClient: any
): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // Allow access to auth pages without login
  if (path.startsWith("/auth/")) {
    return NextResponse.next();
  }

  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    // If not logged in and not on public path, redirect to login
    if (!session && !PUBLIC_PATHS.some((p) => path.startsWith(p))) {
      url.pathname = "/auth/login";
      url.searchParams.set("returnTo", path);
      return NextResponse.redirect(url);
    }

    // If logged in and on auth page, redirect to dashboard
    if (session && path.startsWith("/auth/")) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth error:", error);
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }
}

async function handleTenantRequest(
  request: NextRequest,
  supabaseClient: any,
  identifier: string
): Promise<NextResponse> {
  try {
    // Check cache first
    const cached = orgCache.get(identifier);
    let organization = cached?.data;

    // If cache is expired or missing, fetch from DB
    if (!cached || Date.now() - cached.timestamp > CACHE_TTL) {
      const org = await getOrganizationByIdentifier(identifier);
      if (org) {
        organization = org;
        orgCache.set(identifier, {
          data: org,
          timestamp: Date.now(),
        });
      }
    }

    if (!organization) {
      return redirectToMainApp("/404");
    }

    // Check if organization is suspended
    if (organization.status !== "active") {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://app.oremus.pl";
      const url = new URL(`${baseUrl}/suspended`);
      url.searchParams.set("org", organization.name);
      return NextResponse.redirect(url);
    }

    // Check if under maintenance
    if (isUnderMaintenance(organization)) {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://app.oremus.pl";
      const url = new URL(`${baseUrl}/maintenance`);
      url.searchParams.set("org", organization.name);
      return NextResponse.redirect(url);
    }

    // Check rate limits
    const withinLimit = await checkRateLimit(request, organization);
    if (!withinLimit) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    // Add organization context to headers
    const response = NextResponse.next();
    response.headers.set("x-organization-id", organization.id);
    response.headers.set("x-organization-slug", organization.slug);
    response.headers.set("x-organization-name", organization.name);

    // Check authentication for protected routes
    if (!PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        const url = new URL(request.nextUrl);
        url.pathname = "/auth/login";
        url.searchParams.set("org", organization.slug);
        return NextResponse.redirect(url);
      }

      // Check organization membership
      const { data: membership } = await supabaseClient
        .from("memberships")
        .select("id, role")
        .eq("user_id", session.user.id)
        .eq("organization_id", organization.id)
        .single();

      if (!membership) {
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://app.oremus.pl";
        const url = new URL(`${baseUrl}/not-member`);
        url.searchParams.set("org", organization.name);
        return NextResponse.redirect(url);
      }

      // Add membership role to headers
      response.headers.set("x-organization-role", membership.role);
    }

    return response;
  } catch (error) {
    console.error("Organization request error:", error);
    return handleError(error);
  }
}

async function handleAdminRequest(
  request: NextRequest,
  supabaseClient: any
): Promise<NextResponse> {
  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      const url = new URL(request.nextUrl);
      url.pathname = "/auth/login";
      url.searchParams.set("returnTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const isAdmin = await isSuperAdmin(session.user.id);
    if (!isAdmin) {
      const url = new URL(request.nextUrl);
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Admin request error:", error);
    return handleError(error);
  }
}

// Helper function to check if hostname is local
function isLocalHost(hostname: string): boolean {
  const host = hostname.split(":")[0];
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("172.16.") ||
    host.startsWith("172.17.") ||
    host.startsWith("172.18.") ||
    host.startsWith("172.19.") ||
    host.startsWith("172.20.") ||
    host.startsWith("172.21.") ||
    host.startsWith("172.22.") ||
    host.startsWith("172.23.") ||
    host.startsWith("172.24.") ||
    host.startsWith("172.25.") ||
    host.startsWith("172.26.") ||
    host.startsWith("172.27.") ||
    host.startsWith("172.28.") ||
    host.startsWith("172.29.") ||
    host.startsWith("172.30.") ||
    host.startsWith("172.31.")
  );
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const path = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    BYPASS_PATHS.some((p: string) => path.startsWith(p)) ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // Create response early to handle cookies
    const response = NextResponse.next();

    // Create Supabase client with proper cookie handling
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete(name);
          },
        },
      }
    );

    // Handle main app (no subdomain) - UPDATED to include all local IPs
    if (hostname === "app.oremus.pl" || isLocalHost(hostname)) {
      return handleMainApp(request, supabaseClient);
    }

    // Handle subdomain/custom domain routing
    const { subdomain, isCustomDomain } = getDomainInfo(hostname);
    if (subdomain || isCustomDomain) {
      return handleTenantRequest(
        request,
        supabaseClient,
        subdomain || hostname
      );
    }

    // Handle admin routes
    if (path.startsWith("/admin")) {
      return handleAdminRequest(request, supabaseClient);
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return handleError(error);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
