import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function PayScreen() {
  return (
    <View className="flex-1 bg-cream items-center justify-center px-8">
      <Ionicons name="card-outline" size={48} color="#CFCFCF" />
      <Text className="text-[#222222] text-[18px] font-bold mt-4">Pay</Text>
      <Text className="text-[#888888] text-[14px] mt-2 text-center">Coming Soon</Text>
    </View>
  );
}
