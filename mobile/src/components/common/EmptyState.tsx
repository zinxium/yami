import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'folder-open-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center py-12 px-8">
      <Ionicons name={icon} size={48} color={Colors.dustGrey} />
      <Text className="text-[#222222] text-[16px] font-bold mt-4 text-center">{title}</Text>
      {message && <Text className="text-[#888888] text-[13px] mt-2 text-center">{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} className="mt-4 bg-burgundy px-6 py-3 rounded-[10px]">
          <Text className="text-white text-[14px] font-bold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
