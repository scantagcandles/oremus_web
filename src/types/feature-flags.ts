export interface FeatureFlags {
  massOrderingEnabled: boolean;
  odbPlayerEnabled: boolean;
  academyEnabled: boolean;
  digitalLibraryEnabled: boolean;
  modernDesignEnabled: boolean;
  glassmorphismEnabled: boolean;
}

export type DesignVariant = "glass" | "neo" | "classic";

export interface FeatureConfig {
  name: string;
  description: string;
  isEnabled: boolean;
  variant?: DesignVariant;
  rolloutPercentage?: number;
}
