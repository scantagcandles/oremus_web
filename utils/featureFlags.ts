export const featureFlags = {
  // Nowe funkcje za flagami
  massOrderingEnabled: process.env.NODE_ENV !== 'production' || process.env.EXPO_PUBLIC_ENABLE_MASS_ORDERING === 'true',
  odbPlayerEnabled: process.env.NODE_ENV !== 'production' || process.env.EXPO_PUBLIC_ENABLE_ODB_PLAYER === 'true',
  academyEnabled: process.env.NODE_ENV !== 'production' || process.env.EXPO_PUBLIC_ENABLE_ACADEMY === 'true',

  // Glassmorphism można wyłączyć dla starszych urządzeń
  glassmorphismEnabled: true,

  // A/B testing dla nowego designu
  modernDesignVariant: Math.random() > 0.5 ? 'glass' : 'neo',
}; 