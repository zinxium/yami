import React, { useEffect } from 'react';
import { Switch, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  primaryColor: string;
  secondaryColor?: string;
}

export function ThemedSwitch({
  value,
  onValueChange,
  primaryColor,
  secondaryColor = '#CFCFCF',
}: ThemedSwitchProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={primaryColor}
        trackColor={{ false: secondaryColor, true: primaryColor }}
      />
    </Animated.View>
  );
}
