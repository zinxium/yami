import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar, StatusBadge, Card, Button, Logo } from '../../components/common';
import { useLoans } from '../../hooks/useLoans';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency } from '../../utils/format';
import type { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const { loans, loading, refetch } = useLoans();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalLent = loans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalToReceive = loans.filter(l => l.status !== 'paid').reduce((sum, l) => sum + Number(l.remaining_balance), 0);
  const activeCount = loans.filter(l => l.status === 'active').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  const firstName = user?.fullname?.split(' ')[0] || t('common.user');
  const recentLoans = loans.slice(0, 5);

  if (loading && loans.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, paddingTop: insets.top + 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Logo size="small" />
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{t('dashboard.hello')},</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>{firstName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.getParent()?.getParent()?.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stat cards */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>{t('dashboard.totalLent')}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' }}>{formatCurrency(totalLent)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, marginBottom: 4 }}>{t('dashboard.toReceive')}</Text>
            <Text style={{ color: colors.graphite, fontSize: 22, fontWeight: 'bold' }}>{formatCurrency(totalToReceive)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: colors.dustGrey }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('dashboard.activeLoans')}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>{activeCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: overdueCount > 0 ? colors.danger : colors.dustGrey }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('dashboard.overdue')}</Text>
            <Text style={{ color: overdueCount > 0 ? colors.danger : colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>{overdueCount}</Text>
          </View>
        </View>

        {/* Alerte retard */}
        {overdueCount > 0 && (
          <View style={{
            marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.danger + '15',
            borderWidth: 1, borderColor: colors.danger + '30', borderRadius: 12, padding: 16,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Ionicons name="warning-outline" size={20} color={colors.danger} />
            <Text style={{ color: colors.danger, fontSize: 13, marginLeft: 8, flex: 1 }}>
              {overdueCount} {t('dashboard.overdueWarning')}
            </Text>
          </View>
        )}

        {/* Prêts récents */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{t('dashboard.recentLoans')}</Text>
          {recentLoans.length === 0 ? (
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 32, alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={40} color={colors.dustGrey} />
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 12 }}>{t('dashboard.noLoans')}</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {recentLoans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                  activeOpacity={0.7}
                >
                  <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar name={loan.borrower?.fullname || '?'} size="md" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{loan.borrower?.fullname}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {formatCurrency(Number(loan.amount))} · {loan.duration} {loan.duration_unit === 'months' ? t('common.month_short') : t('common.week_short')}
                      </Text>
                    </View>
                    <StatusBadge status={loan.status} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CTA Nouveau prêt */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View style={{ backgroundColor: colors.tertiary, borderRadius: 16, padding: 24 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{t('dashboard.newLoan')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16, lineHeight: 19 }}>
              {t('dashboard.newLoanSubtitle')}
            </Text>
            <Button
              title={t('dashboard.create')}
              onPress={() => navigation.getParent()?.navigate('LoansTab', { screen: 'CreateLoan' })}
              variant="secondary"
            />
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.getParent()?.navigate('LoansTab', { screen: 'CreateLoan' })}
        style={{
          position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
          backgroundColor: colors.primary, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
