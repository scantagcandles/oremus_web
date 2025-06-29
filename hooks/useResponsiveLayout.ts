import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type Orientation = 'portrait' | 'landscape';

interface LayoutInfo {
  deviceType: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  isLargeScreen: boolean;
}

export const useResponsiveLayout = (): LayoutInfo => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isLandscape = width > height;

  const deviceType: DeviceType =
    width < 768 ? 'mobile' :
    width < 1024 ? 'tablet' : 'desktop';

  return {
    deviceType,
    orientation: isLandscape ? 'landscape' : 'portrait',
    width,
    height,
    isLargeScreen: width >= 768
  };
}; 