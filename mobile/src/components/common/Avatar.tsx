import React from 'react';
import { View, Text } from 'react-native';
import { getInitials } from '../../utils/format';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-[11px]' },
  md: { container: 'w-10 h-10', text: 'text-[13px]' },
  lg: { container: 'w-14 h-14', text: 'text-[17px]' },
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const s = sizeMap[size];
  const initials = getInitials(name);

  return (
    <View className={`${s.container} rounded-full bg-burgundy/10 items-center justify-center`}>
      <Text className={`${s.text} font-bold text-burgundy`}>{initials}</Text>
    </View>
  );
}
