import React, { useRef, useEffect } from 'react';
import { Animated, ViewProps } from 'react-native';
import { GlassCard } from './GlassCard';

export const AnimatedCard: React.FC<ViewProps> = ({ children, ...props }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }, { scale: glowAnim }] }}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      {...props}
    >
      <GlassCard>
        {children}
      </GlassCard>
    </Animated.View>
  );
}; 