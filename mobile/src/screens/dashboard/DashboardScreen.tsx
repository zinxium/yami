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
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalLent = loans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalRepaid = loans.reduce((sum, l) => sum + (Number(l.amount) - Number(l.remaining_balance)), 0);
  const totalToReceive = loans.filter(l => l.status !== 'paid').reduce((sum, l) => sum + Number(l.remaining_balance), 0);
  const activeCount = loans.filter(l => l.status === 'active').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;
  const recoveryRate = totalLent > 0 ? Math.round((totalRepaid / totalLent) * 100) : 0;

  const firstName = user?.fullname?.split(' ')[0] || t('common.user');

  // Get unique active borrowers from loans
  const activeBorrowers = loans
    .filter(l => l.status === 'active' || l.status === 'overdue')
    .reduce((acc, loan) => {
      if (loan.borrower && !acc.find(b => b.id === loan.borrower!.id)) {
        const borrowerLoans = loans.filter(
          l => l.borrower?.id === loan.borrower!.id && (l.status === 'active' || l.status === 'overdue')
        );
        const remaining = borrowerLoans.reduce((s, l) => s + Number(l.remaining_balance), 0);
        acc.push({ ...loan.borrower, remaining });
      }
      return acc;
    }, [] as Array<{ id: string; fullname: string; remaining: number }>)
    .slice(0, 5);

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
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingBottom: 16, paddingTop: insets.top + 8,
        }}>
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

        {/* Total Prêté card */}
        <View style={{
          marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 20,
          backgroundColor: isDarkMode ? '#a61c3c' : colors.primary,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 10, fontWeight: '600' }}>
              {t('dashboard.totalLent')}
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
            {formatCurrency(totalLent)}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            {activeCount} {t('dashboard.activeLoans').toLowerCase()}
          </Text>
        </View>

        {/* Total Remboursé card with progress bar */}
        <View style={{
          marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 20,
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: colors.secondary + '20',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="trending-up-outline" size={18} color={colors.secondary} />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 10, fontWeight: '600' }}>
              Total Remboursé
            </Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>
            {formatCurrency(totalRepaid)}
          </Text>
          {/* Progress bar */}
          <View style={{
            height: 8, borderRadius: 4,
            backgroundColor: isDarkMode ? colors.borderLight : '#E8E4DC',
            overflow: 'hidden', marginBottom: 8,
          }}>
            <View style={{
              height: '100%', borderRadius: 4,
              backgroundColor: colors.secondary,
              width: `${Math.min(recoveryRate, 100)}%`,
            }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Taux de recouvrement
            </Text>
            <Text style={{ color: colors.secondary, fontSize: 14, fontWeight: 'bold' }}>
              {recoveryRate}%
            </Text>
          </View>
        </View>

        {/* Stats row: Active / Overdue */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('dashboard.activeLoans')}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>{activeCount}</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: colors.border,
          }}>
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

        {/* Emprunteurs Actifs */}
        {activeBorrowers.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              Emprunteurs Actifs
            </Text>
            <View style={{ gap: 8 }}>
              {activeBorrowers.map((borrower) => (
                <View
                  key={borrower.id}
                  style={{
                    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 1, borderColor: colors.border,
                    borderLeftWidth: 4, borderLeftColor: colors.primary,
                  }}
                >
                  <Avatar name={borrower.fullname || '?'} size="md" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}>
                      {borrower.fullname}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 }}>
                      RESTANT
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 15, fontWeight: 'bold' }}>
                    {formatCurrency(borrower.remaining)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Prêts récents */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{t('dashboard.recentLoans')}</Text>
          {recentLoans.length === 0 ? (
            <View style={{
              backgroundColor: colors.surface, borderRadius: 12, padding: 32,
              alignItems: 'center', borderWidth: 1, borderColor: colors.border,
            }}>
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
                  <View style={{
                    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 1, borderColor: colors.border,
                  }}>
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

        {/* Nouveau Prêt section */}
        <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('LoansTab', { screen: 'CreateLoan' })}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.surface, borderRadius: 16, padding: 24,
              borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: isDarkMode ? '#a61c3c' : colors.primary,
              alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
              {t('dashboard.newLoan')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
              {t('dashboard.newLoanSubtitle')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Opportunité de Financement — glass card */}
        <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 20 }}>
          <View style={{
            borderRadius: 16, padding: 20, overflow: 'hidden',
            backgroundColor: isDarkMode ? 'rgba(166, 28, 60, 0.25)' : colors.primary + '10',
            borderWidth: 1, borderColor: isDarkMode ? 'rgba(166, 28, 60, 0.4)' : colors.primary + '30',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700', marginLeft: 8 }}>
                Opportunité de Financement
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>
              Diversifiez vos prêts pour optimiser vos rendements. Explorez de nouvelles opportunités de financement.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.getParent()?.navigate('LoansTab', { screen: 'CreateLoan' })}
        style={{
          position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
          backgroundColor: isDarkMode ? '#a61c3c' : colors.primary, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: isDarkMode ? '#a61c3c' : colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
