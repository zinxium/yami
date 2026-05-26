import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../common';
import { paymentsApi } from '../../api/payments.api';
import { formatCurrency, formatDate } from '../../utils/format';
import { Colors } from '../../constants/colors';
import type { Payment } from '../../types';

const METHOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'MTN MoMo': 'phone-portrait-outline',
  'Orange Money': 'phone-portrait-outline',
  'Moov': 'phone-portrait-outline',
  'Cash': 'cash-outline',
};

interface PaymentHistoryListProps {
  payments: Payment[];
  onRefresh: () => void;
}

export function PaymentHistoryList({ payments, onRefresh }: PaymentHistoryListProps) {
  const { t } = useTranslation();

  const TYPE_LABELS: Record<string, string> = {
    full: t('paymentHistory.full'),
    partial: t('paymentHistory.partial'),
    advance: t('paymentHistory.advance'),
  };

  const handleDelete = (payment: Payment) => {
    Alert.alert(t('common.delete'), t('paymentHistory.deleteConfirm', { amount: formatCurrency(payment.amount_paid) }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await paymentsApi.delete(payment.id);
            onRefresh();
          } catch (e: unknown) {
            Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
          }
        },
      },
    ]);
  };

  if (payments.length === 0) {
    return (
      <View className="items-center py-6">
        <Ionicons name="receipt-outline" size={32} color="#CFCFCF" />
        <Text className="text-[#888888] text-[13px] mt-2">{t('paymentHistory.none')}</Text>
        <Text className="text-[#AAAAAA] text-[11px] mt-1">{t('paymentHistory.noneSubtitle')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={payments}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      renderItem={({ item }) => {
        const icon = METHOD_ICONS[item.payment_method || ''] || 'card-outline';
        return (
          <Card className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 items-center justify-center">
              <Ionicons name={icon} size={18} color={Colors.success} />
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-[#222222] text-[14px] font-bold">{formatCurrency(item.amount_paid)}</Text>
                <View className="bg-[#E8E4DC] px-2 py-0.5 rounded">
                  <Text className="text-[#888888] text-[10px]">{TYPE_LABELS[item.payment_type] || item.payment_type}</Text>
                </View>
              </View>
              <Text className="text-[#888888] text-[12px]">
                {formatDate(item.payment_date)} · {item.payment_method || 'N/A'}
              </Text>
              {item.notes && <Text className="text-[#AAAAAA] text-[11px] mt-0.5">{item.notes}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            </TouchableOpacity>
          </Card>
        );
      }}
    />
  );
}
