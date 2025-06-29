import { useState, useEffect } from "react";

export interface FeatureFlags {
  massOrdering: boolean;
  paymentIntegration: boolean;
  notifications: boolean;
  analytics: boolean;
  multiTenant: boolean;
  advancedSearch: boolean;
  socialFeatures: boolean;
  mobileApp: boolean;
}

const defaultFlags: FeatureFlags = {
  massOrdering: true,
  paymentIntegration: true,
  notifications: true,
  analytics: false,
  multiTenant: true,
  advancedSearch: true,
  socialFeatures: false,
  mobileApp: false,
};

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulacja ładowania feature flags z serwera lub localStorage
    const loadFlags = async () => {
      try {
        // Sprawdź localStorage
        const storedFlags = localStorage.getItem("featureFlags");
        if (storedFlags) {
          const parsedFlags = JSON.parse(storedFlags);
          setFlags({ ...defaultFlags, ...parsedFlags });
        }

        // W przyszłości tutaj będzie wywołanie API
        // const response = await fetch('/api/feature-flags');
        // const serverFlags = await response.json();
        // setFlags({ ...defaultFlags, ...serverFlags });
      } catch (error) {
        console.warn("Failed to load feature flags, using defaults:", error);
        setFlags(defaultFlags);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  return flags;
}

// Helper hook do sprawdzania pojedynczej flagi
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const flags = useFeatureFlags();
  return flags[flagName];
}

// Hook do aktualizacji flag (dla adminów)
export function useFeatureFlagUpdater() {
  const updateFlag = (flagName: keyof FeatureFlags, value: boolean) => {
    try {
      const storedFlags = localStorage.getItem("featureFlags");
      const currentFlags = storedFlags ? JSON.parse(storedFlags) : {};
      const updatedFlags = { ...currentFlags, [flagName]: value };

      localStorage.setItem("featureFlags", JSON.stringify(updatedFlags));

      // Tutaj można dodać wywołanie API do aktualizacji na serwerze
      // await fetch('/api/feature-flags', { method: 'PUT', body: JSON.stringify(updatedFlags) });

      console.log(`Feature flag ${flagName} updated to ${value}`);
    } catch (error) {
      console.error("Failed to update feature flag:", error);
    }
  };

  return { updateFlag };
}

export default useFeatureFlags;
