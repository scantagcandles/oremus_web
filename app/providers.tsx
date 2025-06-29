// app/providers.tsx
"use client";

import { TenantProvider } from "@/hooks/useTenant";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  initialOrganizationId?: string;
  initialOrganizationSlug?: string;
}

/**
 * Application providers for the Oremus CMS
 * This includes the TenantProvider for multi-tenant context
 */
export function Providers({
  children,
  initialOrganizationId,
  initialOrganizationSlug,
}: ProvidersProps) {
  return (
    <TenantProvider
      initialOrganizationId={initialOrganizationId}
      initialOrganizationSlug={initialOrganizationSlug}
    >
      {children}
    </TenantProvider>
  );
}
