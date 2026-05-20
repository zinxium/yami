import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

  const firstName = user?.fullname?.split(' ')[0] || 'Utilisateur';
  const recentLoans = loans.slice(0, 5);

  if (loading && loans.length === 0) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-4" style={{ paddingTop: insets.top + 8 }}>
          <View className="flex-row items-center gap-2 flex-1">
            <Logo size="small" />
            <View>
              <Text className="text-[#888888] text-[13px]">Bonjour,</Text>
              <Text className="text-[#222222] text-[20px] font-bold">{firstName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.getParent()?.getParent()?.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#222222" />
          </TouchableOpacity>
        </View>

        {/* Stat cards */}
        <View className="flex-row gap-3 px-5 mb-3">
          <View className="flex-1 bg-burgundy rounded-[12px] p-4 border-l-4 border-l-[#B8003A]">
            <Text className="text-white/70 text-[12px] mb-1">Total prêté</Text>
            <Text className="text-white text-[22px] font-bold">{formatCurrency(totalLent)}</Text>
          </View>
          <View className="flex-1 bg-mustard rounded-[12px] p-4 border-l-4 border-l-[#E6C200]">
            <Text className="text-[#222222]/70 text-[12px] mb-1">À recevoir</Text>
            <Text className="text-[#222222] text-[22px] font-bold">{formatCurrency(totalToReceive)}</Text>
          </View>
        </View>

        <View className="flex-row gap-3 px-5 mb-5">
          <Card className="flex-1 border-l-4 border-l-[#CFCFCF]">
            <Text className="text-[#888888] text-[12px] mb-1">Prêts actifs</Text>
            <Text className="text-[#222222] text-[24px] font-bold">{activeCount}</Text>
          </Card>
          <Card className={`flex-1 border-l-4 ${overdueCount > 0 ? 'border-l-[#4D0013]' : 'border-l-[#CFCFCF]'}`}>
            <Text className="text-[#888888] text-[12px] mb-1">En retard</Text>
            <Text className={`text-[24px] font-bold ${overdueCount > 0 ? 'text-[#4D0013]' : 'text-[#222222]'}`}>{overdueCount}</Text>
          </Card>
        </View>

        {/* Alerte retard */}
        {overdueCount > 0 && (
          <View className="mx-5 mb-5 bg-red-50 border border-red-200 rounded-[12px] p-4 flex-row items-center">
            <Ionicons name="warning-outline" size={20} color="#4D0013" />
            <Text className="text-[#4D0013] text-[13px] ml-2 flex-1">
              {overdueCount} prêt(s) en retard de paiement !
            </Text>
          </View>
        )}

        {/* Prêts récents */}
        <View className="px-5 mb-3">
          <Text className="text-[#222222] text-[18px] font-bold mb-3">Prêts récents</Text>
          {recentLoans.length === 0 ? (
            <Card className="items-center py-8">
              <Ionicons name="wallet-outline" size={40} color="#CFCFCF" />
              <Text className="text-[#888888] text-[14px] mt-3">Aucun prêt pour le moment.</Text>
            </Card>
          ) : (
            <View className="gap-2">
              {recentLoans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                  activeOpacity={0.7}
                >
                  <Card className="flex-row items-center">
                    <Avatar name={loan.borrower?.fullname || '?'} size="md" />
                    <View className="flex-1 ml-3">
                      <Text className="text-[#222222] text-[15px] font-bold">{loan.borrower?.fullname}</Text>
                      <Text className="text-[#888888] text-[12px]">
                        {formatCurrency(Number(loan.amount))} · {loan.duration} {loan.duration_unit === 'months' ? 'mois' : 'sem.'}
                      </Text>
                    </View>
                    <StatusBadge status={loan.status} />
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CTA Nouveau prêt */}
        <View className="px-5 mt-3">
          <View className="bg-burgundy-dark rounded-[16px] p-6">
            <Text className="text-white text-[20px] font-bold mb-2">Nouveau prêt</Text>
            <Text className="text-white/70 text-[13px] mb-4 leading-[19px]">
              Crée un prêt sécurisé en quelques secondes.
            </Text>
            <Button
              title="Créer"
              onPress={() => navigation.getParent()?.navigate('LoansTab', { screen: 'CreateLoan' })}
              variant="secondary"
              className="self-start"
            />
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.getParent()?.navigate('LoansTab', { screen: 'CreateLoan' })}
        className="absolute bottom-6 right-6 w-14 h-14 bg-burgundy rounded-full items-center justify-center"
        style={{ shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
