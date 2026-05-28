import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../../components/common';
import { useLoans } from '../../hooks/useLoans';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import type { Loan } from '../../types';

function ProgressBar({ value, color, bgColor }: { value: number; color: string; bgColor: string }) {
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: bgColor, overflow: 'hidden' }}>
      <View style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </View>
  );
}

function StatCard({ icon, iconColor, iconBg, label, value, sub, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={{
      flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 18, backgroundColor: iconBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      }}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>{value}</Text>
      {sub && <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{sub}</Text>}
    </View>
  );
}

function getMonthlyBreakdown(loans: Loan[]) {
  const months: Record<string, { lent: number; repaid: number }> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { lent: 0, repaid: 0 };
  }

  for (const loan of loans) {
    const created = loan.created_at ? new Date(loan.created_at) : null;
    if (created) {
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) {
        months[key].lent += Number(loan.amount);
      }
    }
  }

  return Object.entries(months).map(([key, val]) => {
    const [y, m] = key.split('-');
    const date = new Date(Number(y), Number(m) - 1);
    const label = date.toLocaleDateString('fr-FR', { month: 'short' });
    return { label, ...val };
  });
}

function getStatusDistribution(loans: Loan[]) {
  const active = loans.filter(l => l.status === 'active').length;
  const overdue = loans.filter(l => l.status === 'overdue').length;
  const paid = loans.filter(l => l.status === 'paid').length;
  const total = loans.length || 1;
  return { active, overdue, paid, total };
}

function getTopBorrowers(loans: Loan[]) {
  const map: Record<string, { name: string; total: number; count: number }> = {};
  for (const loan of loans) {
    const id = loan.borrower_id;
    const name = loan.borrower?.fullname || '?';
    if (!map[id]) map[id] = { name, total: 0, count: 0 };
    map[id].total += Number(loan.amount);
    map[id].count += 1;
  }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
}

export function AnalyticsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { loans, loading, refetch } = useLoans();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const totalLent = loans.reduce((s, l) => s + Number(l.amount), 0);
    const totalRepaid = loans.reduce((s, l) => s + (Number(l.amount) - Number(l.remaining_balance)), 0);
    const totalRemaining = loans.filter(l => l.status !== 'paid').reduce((s, l) => s + Number(l.remaining_balance), 0);
    const recoveryRate = totalLent > 0 ? Math.round((totalRepaid / totalLent) * 100) : 0;
    const avgLoanAmount = loans.length > 0 ? Math.round(totalLent / loans.length) : 0;
    const avgInterestRate = loans.length > 0 ? (loans.reduce((s, l) => s + Number(l.interest_rate), 0) / loans.length).toFixed(1) : '0';
    const distribution = getStatusDistribution(loans);
    const monthly = getMonthlyBreakdown(loans);
    const topBorrowers = getTopBorrowers(loans);
    const maxMonthlyLent = Math.max(...monthly.map(m => m.lent), 1);

    return { totalLent, totalRepaid, totalRemaining, recoveryRate, avgLoanAmount, avgInterestRate, distribution, monthly, topBorrowers, maxMonthlyLent };
  }, [loans]);

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
        <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 8 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>
            {t('analytics.title')}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            {t('analytics.subtitle')}
          </Text>
        </View>

        {/* Key metrics */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 16 }}>
          <StatCard
            icon="wallet-outline" iconColor={colors.primary} iconBg={colors.primary + '20'}
            label={t('analytics.totalLent')} value={formatCurrency(stats.totalLent)}
            colors={colors}
          />
          <StatCard
            icon="trending-up-outline" iconColor={colors.success} iconBg={colors.success + '20'}
            label={t('analytics.totalRepaid')} value={formatCurrency(stats.totalRepaid)}
            colors={colors}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 12 }}>
          <StatCard
            icon="time-outline" iconColor={colors.warning} iconBg={colors.warning + '20'}
            label={t('analytics.remaining')} value={formatCurrency(stats.totalRemaining)}
            colors={colors}
          />
          <StatCard
            icon="calculator-outline" iconColor={colors.info} iconBg={colors.info + '20'}
            label={t('analytics.avgLoan')} value={formatCurrency(stats.avgLoanAmount)}
            colors={colors}
          />
        </View>

        {/* Recovery rate */}
        <View style={{
          marginHorizontal: 20, marginTop: 20, backgroundColor: colors.surface,
          borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
              {t('analytics.recoveryRate')}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: 'bold' }}>
              {stats.recoveryRate}%
            </Text>
          </View>
          <ProgressBar
            value={stats.recoveryRate}
            color={stats.recoveryRate >= 70 ? colors.success : stats.recoveryRate >= 40 ? colors.warning : colors.danger}
            bgColor={isDarkMode ? colors.borderLight : '#E8E4DC'}
          />
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
            {t('analytics.avgRate')}: {stats.avgInterestRate}%
          </Text>
        </View>

        {/* Status distribution */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, backgroundColor: colors.surface,
          borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border,
        }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
            {t('analytics.distribution')}
          </Text>
          {[
            { label: t('status.active'), count: stats.distribution.active, color: colors.success },
            { label: t('status.overdue'), count: stats.distribution.overdue, color: colors.danger },
            { label: t('status.paid'), count: stats.distribution.paid, color: colors.primary },
          ].map((item) => (
            <View key={item.label} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.label}</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                  {item.count} ({Math.round((item.count / stats.distribution.total) * 100)}%)
                </Text>
              </View>
              <ProgressBar
                value={(item.count / stats.distribution.total) * 100}
                color={item.color}
                bgColor={isDarkMode ? colors.borderLight : '#E8E4DC'}
              />
            </View>
          ))}
        </View>

        {/* Monthly activity (bar chart) */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, backgroundColor: colors.surface,
          borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border,
        }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
            {t('analytics.monthlyActivity')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8 }}>
            {stats.monthly.map((month, i) => {
              const height = Math.max((month.lent / stats.maxMonthlyLent) * 100, 4);
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{
                    width: '100%', height, borderRadius: 6,
                    backgroundColor: isDarkMode ? '#a61c3c' : colors.primary,
                    minHeight: month.lent > 0 ? 12 : 4,
                  }} />
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 6, textTransform: 'capitalize' }}>
                    {month.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top borrowers */}
        {stats.topBorrowers.length > 0 && (
          <View style={{
            marginHorizontal: 20, marginTop: 16, marginBottom: 20, backgroundColor: colors.surface,
            borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
              {t('analytics.topBorrowers')}
            </Text>
            {stats.topBorrowers.map((b, i) => {
              const maxTotal = stats.topBorrowers[0]?.total || 1;
              return (
                <View key={i} style={{ marginBottom: i < stats.topBorrowers.length - 1 ? 14 : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>
                      {i + 1}. {b.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {b.count} {t('analytics.loans')} · {formatCurrency(b.total)}
                    </Text>
                  </View>
                  <ProgressBar
                    value={(b.total / maxTotal) * 100}
                    color={colors.primary}
                    bgColor={isDarkMode ? colors.borderLight : '#E8E4DC'}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
