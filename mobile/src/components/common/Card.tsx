import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white rounded-[12px] p-4 border border-[#E8E4DC] ${className}`}>
      {children}
    </View>
  );
}
