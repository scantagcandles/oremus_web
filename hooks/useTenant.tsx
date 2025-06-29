// hooks/useTenant.tsx - Alternatywna wersja
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface TenantContextType {
  tenant: string | null;
  setTenant: (tenant: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenantState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sprawdź localStorage przy pierwszym załadowaniu
    const savedTenant = localStorage.getItem("selectedTenant");
    if (savedTenant) {
      setTenantState(savedTenant);
    }
    setIsLoading(false);
  }, []);

  const setTenant = (newTenant: string) => {
    setTenantState(newTenant);
    localStorage.setItem("selectedTenant", newTenant);

    // Użyj window.location zamiast useRouter w dynamicznym imporcie
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
