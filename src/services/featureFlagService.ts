import {
  FeatureFlags,
  FeatureConfig,
  DesignVariant,
} from "../types/feature-flags";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export class FeatureFlagService {
  private supabase = createClientComponentClient();
  private static instance: FeatureFlagService;
  private cache: Map<string, FeatureConfig> = new Map();

  private constructor() {}

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    try {
      const { data: features, error } = await this.supabase
        .from("feature_flags")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const flags: FeatureFlags = {
        massOrderingEnabled: this.isFeatureEnabled("mass-ordering", features),
        odbPlayerEnabled: this.isFeatureEnabled("odb-player", features),
        academyEnabled: this.isFeatureEnabled("academy", features),
        digitalLibraryEnabled: this.isFeatureEnabled(
          "digital-library",
          features
        ),
        modernDesignEnabled: this.isFeatureEnabled("modern-design", features),
        glassmorphismEnabled: this.isFeatureEnabled("glassmorphism", features),
      };

      return flags;
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return this.getDefaultFlags();
    }
  }

  private isFeatureEnabled(
    featureKey: string,
    features: FeatureConfig[]
  ): boolean {
    const feature = features.find((f) => f.name === featureKey);
    if (!feature) return false;

    // Check if feature is in rollout
    if (feature.rolloutPercentage !== undefined) {
      const userValue = Math.random() * 100;
      return userValue <= feature.rolloutPercentage;
    }

    return feature.isEnabled;
  }

  private getDefaultFlags(): FeatureFlags {
    return {
      massOrderingEnabled:
        process.env.NEXT_PUBLIC_ENABLE_MASS_ORDERING === "true",
      odbPlayerEnabled: process.env.NEXT_PUBLIC_ENABLE_ODB_PLAYER === "true",
      academyEnabled: process.env.NEXT_PUBLIC_ENABLE_ACADEMY === "true",
      digitalLibraryEnabled: process.env.NEXT_PUBLIC_ENABLE_LIBRARY === "true",
      modernDesignEnabled: true,
      glassmorphismEnabled: true,
    };
  }

  getDesignVariant(): DesignVariant {
    return (process.env.NEXT_PUBLIC_DESIGN_VARIANT as DesignVariant) || "glass";
  }
}
