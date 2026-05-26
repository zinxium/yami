import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar, StatusBadge, Card } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan } from '../../types';

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const borrowerName = loan.borrower?.fullname || t('loanCard.borrower');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="flex-row items-center">
        <Avatar name={borrowerName} size="md" />
        <View className="flex-1 ml-3">
          <Text className="text-[15px] font-bold" style={{ color: colors.textPrimary }}>{borrowerName}</Text>
          <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
            {formatCurrency(Number(loan.amount))} · {t('loanCard.end')} {formatDate(loan.end_date)}
          </Text>
        </View>
        <View className="items-end">
          <StatusBadge status={loan.status} />
          <Text className="text-[11px] mt-1" style={{ color: colors.textSecondary }}>
            {formatCurrency(Number(loan.total_repayment))}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.dustGrey} style={{ marginLeft: 4 }} />
      </Card>
    </TouchableOpacity>
  );
}
