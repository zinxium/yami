import React from 'react';
import { View, Text } from 'react-native';
import { LoanStatus } from '../../types';

interface StatusBadgeProps {
  status: LoanStatus;
}

const statusConfig: Record<LoanStatus, { bg: string; text: string; label: string }> = {
  active:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  overdue: { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Late' },
  paid:    { bg: 'bg-gray-100',  text: 'text-gray-500',  label: 'Repaid' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View className={`${config.bg} px-3 py-1 rounded-full`}>
      <Text className={`${config.text} text-[11px] font-bold`}>{config.label}</Text>
    </View>
  );
}
