import React from "react";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { Box } from "@shopify/restyle";
import { Theme } from "../theme";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

interface ModernLayoutProps {
  children: React.ReactNode;
  withGlass?: boolean;
  withPadding?: boolean;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  withGlass = true,
  withPadding = true,
}) => {
  const { isFeatureEnabled } = useFeatureFlags();
  const { deviceType } = useResponsiveLayout();
  const glassmorphismEnabled =
    isFeatureEnabled("glassmorphismEnabled") && withGlass;

  return (
    <Box
      flex={1}
      backgroundColor="background.light"
      padding={withPadding ? "lg" : "none"}
      style={[
        glassmorphismEnabled && {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
      ]}
    >
      <Box
        flex={1}
        maxWidth={
          deviceType === "desktop"
            ? 1280
            : deviceType === "tablet"
            ? 1024
            : "100%"
        }
        marginHorizontal="auto"
        width="100%"
      >
        {children}
      </Box>
    </Box>
  );
};

export default ModernLayout;
