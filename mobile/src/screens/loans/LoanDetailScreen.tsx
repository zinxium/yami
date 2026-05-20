import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Button, Avatar, Card } from '../../components/common';
import { getLoanById } from '../../data/mock';
import { formatCurrency, formatDate } from '../../utils/format';
import type { LoanDetailProps } from '../../navigation/types';

function generateSchedule(loan: { start_date: string; duration: number; monthly_payment: number }) {
  return Array.from({ length: loan.duration }, (_, i) => {
    const date = new Date(loan.start_date);
    date.setMonth(date.getMonth() + i + 1);
    return {
      period: `${i + 1}m ${i + 1}`,
      date: formatDate(date.toISOString()),
      amount: loan.monthly_payment,
    };
  });
}

export function LoanDetailScreen({ route, navigation }: LoanDetailProps) {
  const insets = useSafeAreaInsets();
  const loan = getLoanById(route.params.loanId);

  if (!loan) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <Text className="text-[#888888] text-[16px]">Pret introuvable</Text>
      </View>
    );
  }

  const schedule = generateSchedule(loan);
  const borrowerName = loan.borrower?.fullname || 'Emprunteur';

  const statusLabel: Record<string, string> = {
    active: 'ACTIVE LOAN',
    overdue: 'OVERDUE',
    paid: 'REPAID',
  };

  const statusBg: Record<string, string> = {
    active: 'bg-mustard',
    overdue: 'bg-red-100',
    paid: 'bg-gray-200',
  };

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader
        title=""
        showBack
        onBack={() => navigation.goBack()}
        rightElement={<Avatar name={borrowerName} size="sm" />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Status badge */}
        <View className="items-center mt-2 mb-4">
          <View className={`${statusBg[loan.status]} px-4 py-1.5 rounded-full`}>
            <Text className="text-[#222222] text-[11px] font-bold tracking-[1px]">
              {statusLabel[loan.status]}
            </Text>
          </View>
        </View>

        {/* Hero amount */}
        <Text className="text-center text-[#222222] text-[40px] font-bold mb-1">
          ${formatCurrency(loan.total_repayment, '').trim()}
        </Text>
        <Text className="text-center text-[#888888] text-[13px] mb-5">
          Total Repayment Amount
        </Text>

        {/* Info chips */}
        <View className="flex-row justify-center gap-2 px-4 mb-6">
          <View className="border border-[#E8E4DC] rounded-full px-4 py-2 items-center">
            <Text className="text-[#AAAAAA] text-[10px] uppercase tracking-[1px]">Borrower</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{borrowerName}</Text>
          </View>
          <View className="border border-[#E8E4DC] rounded-full px-4 py-2 items-center">
            <Text className="text-[#AAAAAA] text-[10px] uppercase tracking-[1px]">Interest</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{loan.interest_rate}%</Text>
          </View>
          <View className="border border-[#E8E4DC] rounded-full px-4 py-2 items-center">
            <Text className="text-[#AAAAAA] text-[10px] uppercase tracking-[1px]">Duration</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{loan.duration}m</Text>
          </View>
        </View>

        {/* Next Payment */}
        <View className="mx-5 mb-6">
          <Card className="flex-row items-center justify-between">
            <Text className="text-[#222222] text-[14px]">Next Payment:</Text>
            <Text className="text-burgundy text-[14px] font-bold">
              {formatDate(schedule[0]?.date || loan.start_date)}
            </Text>
          </Card>
        </View>

        {/* Payment Schedule */}
        <View className="px-5 mb-6">
          <Text className="text-burgundy text-[18px] font-bold mb-4">Payment Schedule</Text>

          <Card className="p-0 overflow-hidden">
            {schedule.map((item, i) => (
              <View
                key={i}
                className={`flex-row items-center px-4 py-3.5 ${i < schedule.length - 1 ? 'border-b border-[#E8E4DC]' : ''}`}
              >
                <Text className="text-[#AAAAAA] text-[13px] w-12">{item.period}</Text>
                <View className="w-2 h-2 rounded-full bg-burgundy mx-3" />
                <Text className="text-[#222222] text-[14px] flex-1">{item.date}</Text>
                <Text className="text-[#222222] text-[14px] font-bold">
                  ${formatCurrency(item.amount, '').trim()}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Download Contract */}
        <View className="px-5 mb-4">
          <Button
            title="Download Contract"
            onPress={() => Alert.alert('Contrat', 'Generation PDF a venir')}
            variant="secondary"
            fullWidth
            icon="document-text-outline"
          />
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 px-5">
          <View className="flex-1">
            <Button
              title="Share Receipt"
              onPress={() => Alert.alert('Partage', 'Partage a venir')}
              variant="outline"
              fullWidth
            />
          </View>
          <View className="flex-1">
            <Button
              title="Make Payment"
              onPress={() => Alert.alert('Paiement', 'Paiement a venir')}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
