import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

interface NeumorphicButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ 
  onPress, 
  children,
  disabled = false,
  style
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.neuButton,
        pressed ? styles.neuPressed : styles.neuRaised,
        disabled && styles.neuDisabled,
        style
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  neuButton: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neuRaised: {
    backgroundColor: '#1e2749',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  neuPressed: {
    backgroundColor: '#161d3a',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  neuDisabled: {
    opacity: 0.5,
  },
}); 