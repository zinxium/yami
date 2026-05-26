import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, Avatar, StatusBadge, Logo } from '../../components/common';
import { useLoans } from '../../hooks/useLoans';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';

export function PayScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { loans, loading, refetch } = useLoans();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeLoans = loans.filter(l => l.status !== 'paid');

  if (loading && loans.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: insets.top + 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Logo size="small" />
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>{t('payments.title')}</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 48 }}>{t('payments.subtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {activeLoans.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 64 }}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.dustGrey} />
            <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: 12 }}>{t('payments.noActiveLoans')}</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {activeLoans.map(loan => (
              <TouchableOpacity
                key={loan.id}
                onPress={() => navigation.navigate('AddPayment', { loanId: loan.id })}
                activeOpacity={0.7}
              >
                <Card style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface }}>
                  <Avatar name={loan.borrower?.fullname || '?'} size="md" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{loan.borrower?.fullname}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('payments.remaining')} {formatCurrency(Number(loan.remaining_balance))}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <StatusBadge status={loan.status} />
                    <Ionicons name="chevron-forward" size={16} color={colors.dustGrey} style={{ marginTop: 4 }} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
