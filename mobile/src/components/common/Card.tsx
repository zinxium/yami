import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`rounded-[12px] p-4 ${className}`}
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight }}
    >
      {children}
    </View>
  );
}
