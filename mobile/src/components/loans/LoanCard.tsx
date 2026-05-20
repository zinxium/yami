import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, StatusBadge, Card } from '../common';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan } from '../../types';

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const borrowerName = loan.borrower?.fullname || 'Emprunteur';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="flex-row items-center">
        <Avatar name={borrowerName} size="md" />
        <View className="flex-1 ml-3">
          <Text className="text-[#222222] text-[15px] font-bold">{borrowerName}</Text>
          <Text className="text-[#888888] text-[12px]">
            {formatCurrency(Number(loan.amount))} · Fin {formatDate(loan.end_date)}
          </Text>
        </View>
        <View className="items-end">
          <StatusBadge status={loan.status} />
          <Text className="text-[#888888] text-[11px] mt-1">
            {formatCurrency(Number(loan.total_repayment))}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CFCFCF" className="ml-1" />
      </Card>
    </TouchableOpacity>
  );
}
