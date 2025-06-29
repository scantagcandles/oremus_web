import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";

interface WindowDimensions {
  width: number;
  height: number;
}

interface ResponsiveLayout {
  deviceType: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  isLargeScreen: boolean;
}

const getWindowDimensions = (): WindowDimensions => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

const getDeviceType = (width: number): DeviceType => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? "landscape" : "portrait";
};

export const useResponsiveLayout = (): ResponsiveLayout => {
  const [dimensions, setDimensions] = useState<WindowDimensions>(
    getWindowDimensions()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setDimensions(getWindowDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = dimensions;
  const deviceType = getDeviceType(width);
  const orientation = getOrientation(width, height);
  const isLargeScreen = width >= 768;

  return {
    deviceType,
    orientation,
    width,
    height,
    isLargeScreen,
  };
};

export default useResponsiveLayout;
