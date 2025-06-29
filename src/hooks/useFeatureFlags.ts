import { useState, useEffect } from "react";
import { FeatureFlags } from "../types/feature-flags";
import { FeatureFlagService } from "../services/featureFlagService";

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const service = FeatureFlagService.getInstance();
        const flags = await service.getFeatureFlags();
        setFlags(flags);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch feature flags")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    if (!flags) return false;
    return flags[feature] ?? false;
  };

  return {
    flags,
    loading,
    error,
    isFeatureEnabled,
  };
}

export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { isFeatureEnabled, loading } = useFeatureFlags();

    if (loading) return null;

    if (!isFeatureEnabled(feature)) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}
