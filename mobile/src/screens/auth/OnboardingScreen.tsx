import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components/common';
import type { OnboardingProps } from '../../navigation/types';

export function OnboardingScreen({ navigation }: OnboardingProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View className="items-center mb-4">
        <View className="w-16 h-16 rounded-full bg-burgundy items-center justify-center">
          <Text className="text-white text-[28px] font-bold">Y</Text>
        </View>
      </View>
      <Text className="text-center text-burgundy text-[20px] font-bold mb-10">
        Ya Mi
      </Text>

      {/* Headline */}
      <Text className="text-center text-[#222222] text-[32px] font-bold leading-[40px] px-8 mb-4">
        Create loans.{'\n'}Track payments.{'\n'}Build trust.
      </Text>
      <Text className="text-center text-[#888888] text-[15px] leading-[22px] px-10 mb-10">
        Dignified financial tools designed for modern community lending.
      </Text>

      {/* Feature cards */}
      <View className="px-6 gap-3 mb-10">
        <Card>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-[10px] bg-burgundy/10 items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#800020" />
            </View>
            <View className="flex-1">
              <Text className="text-[#222222] text-[15px] font-bold mb-0.5">Secure Records</Text>
              <Text className="text-[#888888] text-[13px]">Immutable logs for every transaction.</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-[10px] bg-burgundy/10 items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#800020" />
            </View>
            <View className="flex-1">
              <Text className="text-[#222222] text-[15px] font-bold mb-0.5">Smart Reminders</Text>
              <Text className="text-[#888888] text-[13px]">Automated prompts for gentle follow-ups.</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* CTA */}
      <View className="px-6 mb-4">
        <Button
          title="Get Started"
          onPress={() => navigation.replace('Main')}
          variant="primary"
          fullWidth
        />
      </View>

      {/* Login link */}
      <TouchableOpacity
        onPress={() => navigation.replace('Main')}
        className="items-center mb-8"
      >
        <Text className="text-[#888888] text-[14px]">I already have an account</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text className="text-center text-[#CFCFCF] text-[10px] tracking-[3px] uppercase">
        Handcrafted for reliability
      </Text>
    </ScrollView>
  );
}
