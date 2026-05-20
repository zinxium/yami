import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar, StatusBadge, Card, Button } from '../../components/common';
import { mockLoans, mockBorrowers, dashboardStats } from '../../data/mock';
import { formatCurrency } from '../../utils/format';
import type { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const loansByBorrower = mockBorrowers.map((b) => {
    const loan = mockLoans.find((l) => l.borrower_id === b.id);
    return { borrower: b, loan };
  }).filter((item) => item.loan);

  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 pb-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-burgundy items-center justify-center">
              <Text className="text-white text-[14px] font-bold">Y</Text>
            </View>
            <Text className="text-[18px] font-bold text-[#222222]">Home Dashboard</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color="#222222" />
            </TouchableOpacity>
            <Avatar name={mockBorrowers[0]?.fullname || 'U'} size="sm" />
          </View>
        </View>

        {/* Stat cards */}
        <View className="flex-row gap-3 px-5 mb-3">
          <View className="flex-1 bg-burgundy rounded-[12px] p-4">
            <Text className="text-white/70 text-[12px] mb-1">Total Lent</Text>
            <Text className="text-white text-[24px] font-bold">
              ${formatCurrency(dashboardStats.totalLent, '').trim()}
            </Text>
          </View>
          <View className="flex-1 bg-mustard rounded-[12px] p-4">
            <Text className="text-[#222222]/70 text-[12px] mb-1">Total Repaid</Text>
            <Text className="text-[#222222] text-[24px] font-bold">
              ${formatCurrency(dashboardStats.totalRepaid, '').trim()}
            </Text>
          </View>
        </View>

        {/* Active loans card */}
        <View className="px-5 mb-5">
          <Card className="flex-row items-center justify-between">
            <View>
              <Text className="text-[#888888] text-[12px] mb-1">Active Loans</Text>
              <Text className="text-[#222222] text-[28px] font-bold">{dashboardStats.activeLoansCount}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-mustard/20 items-center justify-center">
              <Ionicons name="trending-up" size={20} color="#7A5F00" />
            </View>
          </Card>
        </View>

        {/* My Borrowers */}
        <View className="px-5 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#222222] text-[18px] font-bold">My Borrowers</Text>
            <TouchableOpacity>
              <Text className="text-burgundy text-[13px] font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-white border border-[#E8E4DC] rounded-[8px] px-4 py-2.5 mb-4">
            <Ionicons name="search-outline" size={18} color="#CFCFCF" />
            <TextInput
              placeholder="Search borrowers"
              placeholderTextColor="#CFCFCF"
              className="flex-1 ml-2 text-[14px] text-[#222222]"
            />
          </View>

          {/* Borrower list */}
          <View className="gap-2">
            {loansByBorrower.map(({ borrower, loan }) => (
              <TouchableOpacity
                key={borrower.id}
                onPress={() => loan && navigation.navigate('LoanDetail', { loanId: loan.id })}
                activeOpacity={0.7}
              >
                <Card className="flex-row items-center">
                  <Avatar name={borrower.fullname} size="md" />
                  <View className="flex-1 ml-3">
                    <Text className="text-[#222222] text-[15px] font-bold">{borrower.fullname}</Text>
                    <Text className="text-[#888888] text-[12px]">
                      ${loan?.amount} * {loan?.duration}m
                    </Text>
                  </View>
                  {loan && <StatusBadge status={loan.status} />}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create New Loan CTA */}
        <View className="px-5 mt-3">
          <View className="bg-burgundy-dark rounded-[16px] p-6">
            <Text className="text-white text-[20px] font-bold mb-2">Create New Loan</Text>
            <Text className="text-white/70 text-[13px] mb-4 leading-[19px]">
              Empower someone today with a secure personal loan.
            </Text>
            <Button
              title="Get Started"
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
