import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, showBack, onBack, rightElement }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {showBack && (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#222222" />
          </TouchableOpacity>
        )}
        <Text className="text-[18px] font-bold text-[#222222]">{title}</Text>
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
}
