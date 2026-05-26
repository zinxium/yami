import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LoanStatus } from '../../types';

interface StatusBadgeProps {
  status: LoanStatus;
}

const statusConfig: Record<LoanStatus, { bg: string; text: string; labelKey: string }> = {
  active:  { bg: 'bg-green-100', text: 'text-green-700', labelKey: 'status.active' },
  overdue: { bg: 'bg-red-100',   text: 'text-red-700',   labelKey: 'status.overdue' },
  paid:    { bg: 'bg-gray-100',  text: 'text-gray-500',  labelKey: 'status.paid' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];

  return (
    <View className={`${config.bg} px-3 py-1 rounded-full`}>
      <Text className={`${config.text} text-[11px] font-bold`}>{t(config.labelKey)}</Text>
    </View>
  );
}
