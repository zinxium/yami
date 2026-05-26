import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { EmptyState, LoadingSpinner, Logo } from '../../components/common';
import { LoanCard } from '../../components/loans/LoanCard';
import { useLoans } from '../../hooks/useLoans';
import { useTheme } from '../../hooks/useTheme';
import type { LoanStatus } from '../../types';

export function MyLoansScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { loans, loading, refetch } = useLoans();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const FILTERS = [
    { key: 'all', label: t('myLoans.all') },
    { key: 'active', label: t('myLoans.active') },
    { key: 'overdue', label: t('myLoans.overdue') },
    { key: 'paid', label: t('myLoans.paid') },
  ];

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const filtered = loans.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search && !l.borrower?.fullname.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading && loans.length === 0) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream">
      <View className="px-5 pb-2" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-2 mb-3">
          <Logo size="small" />
          <Text className="text-[#222222] text-[20px] font-bold">{t('myLoans.title')}</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white border border-[#E8E4DC] rounded-[8px] px-4 py-2.5 mb-3">
          <Ionicons name="search-outline" size={18} color="#CFCFCF" />
          <TextInput
            className="flex-1 ml-2 text-[14px] text-[#222222]"
            placeholder={t('myLoans.search')}
            placeholderTextColor="#CFCFCF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View className="flex-row gap-2 mb-2">
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full ${filter === f.key ? 'bg-burgundy' : 'bg-white border border-[#E8E4DC]'}`}
            >
              <Text className={`text-[13px] font-bold ${filter === f.key ? 'text-white' : 'text-[#222222]'}`}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <LoanCard
            loan={item}
            onPress={() => navigation.navigate('HomeTab', { screen: 'LoanDetail', params: { loanId: item.id } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title={t('myLoans.noLoans')}
            message={t('myLoans.noLoansSubtitle')}
            actionLabel={t('myLoans.newLoan')}
            onAction={() => navigation.navigate('LoansTab', { screen: 'CreateLoan' })}
          />
        }
      />
    </View>
  );
}

export default MyLoansScreen;
