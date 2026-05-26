import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar, Logo } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { loansApi } from '../../api/loans.api';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency } from '../../utils/format';
import type { Loan } from '../../types';
import type { EditLoanProps } from '../../navigation/types';
import { useNetworkStore } from '../../store/network.store';
import { useMutationQueueStore } from '../../store/mutationQueue.store';
import { useCacheStore } from '../../store/cache.store';

export function EditLoanScreen({ route, navigation }: EditLoanProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { colors } = useTheme();
  const { loanId } = route.params;
  const [loan, setLoan] = useState<Loan | null>(null);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loansApi.getById(loanId).then(l => {
      setLoan(l);
      setAmount(String(Number(l.amount)));
      setInterestRate(String(Number(l.interest_rate)));
      setDuration(String(l.duration));
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [loanId]);

  const calculation = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(interestRate);
    const d = parseInt(duration, 10);
    if (!a || !r || !d || a <= 0 || d <= 0) return null;
    const interest = a * (r / 100) * d;
    const total = a + interest;
    const monthly = total / d;
    const progressPercent = loan ? Math.min(100, Math.round(((total - Number(loan.remaining_balance)) / total) * 100)) : 0;
    return { interest, total, monthly, progressPercent };
  }, [amount, interestRate, duration, loan]);

  const isConnected = useNetworkStore((s) => s.isConnected);
  const addMutation = useMutationQueueStore((s) => s.addMutation);
  const updateCachedLoan = useCacheStore((s) => s.updateLoan);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: { amount?: number; interest_rate?: number; duration?: number } = {};
      if (amount) data.amount = parseFloat(amount);
      if (interestRate) data.interest_rate = parseFloat(interestRate);
      if (duration) data.duration = parseInt(duration, 10);

      if (isConnected) {
        await loansApi.update(loanId, data);
        Alert.alert(t('editLoan.successTitle'), t('editLoan.successMessage'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        addMutation('UPDATE_LOAN', { id: loanId, ...data });
        updateCachedLoan(loanId, data);
        Alert.alert(t('common.savedLocally'), t('editLoan.offlineMessage'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: unknown) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const borrowerName = loan?.borrower?.fullname || 'Emprunteur';

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderWidth: 1,
    color: colors.textPrimary,
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header Ya Mi */}
      <View className="flex-row items-center justify-between px-5" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-1">
          <View className="w-6 h-6 rounded-full bg-burgundy items-center justify-center">
            <Text className="text-white text-[10px] font-bold">Y</Text>
          </View>
          <Text className="text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold', color: colors.primary }}>Ya Mi</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <Text className="text-[24px] font-bold mb-1" style={{ fontFamily: 'LibreCaslon-Bold', color: colors.textPrimary }}>{t('editLoan.title')}</Text>
          <Text className="text-[13px] mb-6" style={{ color: colors.textSecondary }}>{t('editLoan.subtitle', { name: borrowerName })}</Text>

          {/* Emprunteur (disabled) */}
          <View className="mb-5">
            <Text className="text-[11px] mb-1" style={{ color: colors.textMuted }}>{t('editLoan.borrowerLabel')}</Text>
            <View className="flex-row items-center rounded-[12px] px-4 py-3.5" style={{ backgroundColor: colors.background, borderColor: colors.borderLight, borderWidth: 1 }}>
              <Ionicons name="person-outline" size={16} color={colors.dustGrey} />
              <Text className="text-[15px] ml-3" style={{ color: colors.textSecondary }}>{borrowerName}</Text>
            </View>
          </View>

          {/* Montant */}
          <View className="mb-5">
            <Text className="text-[13px] font-bold mb-1" style={{ color: colors.textPrimary }}>{t('editLoan.amount')}</Text>
            <View className="flex-row items-center border-2 border-burgundy rounded-[12px] px-4 py-3.5" style={{ backgroundColor: colors.surface }}>
              <Ionicons name="card-outline" size={16} color={colors.primary} />
              <TextInput
                className="flex-1 ml-3 text-[15px]"
                style={{ color: colors.textPrimary }}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Taux et Duree cote a cote */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1">
              <Text className="text-[13px] font-bold mb-1" style={{ color: colors.textPrimary }}>{t('editLoan.interestRate')}</Text>
              <View className="flex-row items-center rounded-[12px] px-4 py-3.5" style={inputStyle}>
                <TextInput className="flex-1 text-[15px]" style={{ color: colors.textPrimary }} keyboardType="decimal-pad" value={interestRate} onChangeText={setInterestRate} />
                <Text className="text-[13px]" style={{ color: colors.textMuted }}>%</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-bold mb-1" style={{ color: colors.textPrimary }}>{t('editLoan.duration')}</Text>
              <View className="flex-row items-center rounded-[12px] px-4 py-3.5" style={inputStyle}>
                <TextInput className="flex-1 text-[15px]" style={{ color: colors.textPrimary }} keyboardType="numeric" value={duration} onChangeText={setDuration} />
                <Ionicons name="calendar-outline" size={16} color={colors.dustGrey} />
              </View>
            </View>
          </View>

          {/* Carte burgundy avec calculs */}
          <View className="bg-burgundy rounded-[16px] p-5 mb-6">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white/60 text-[11px] uppercase tracking-[1px]">{t('editLoan.monthlyPayment')}</Text>
              <View className="w-10 h-10 rounded-[8px] bg-white/10 items-center justify-center">
                <Ionicons name="business-outline" size={20} color="#FFFFFF" />
              </View>
            </View>
            <Text className="text-white text-[32px] font-bold mb-4">
              {calculation ? formatCurrency(calculation.monthly) : '---'}
            </Text>

            <View className="flex-row justify-between mb-3">
              <View>
                <Text className="text-white/60 text-[11px]">{t('editLoan.totalRepayment')}</Text>
                <Text className="text-white text-[16px] font-bold">{calculation ? formatCurrency(calculation.total) : '---'}</Text>
              </View>
              <View>
                <Text className="text-white/60 text-[11px]">{t('editLoan.totalInterest')}</Text>
                <Text className="text-[#FFDB58] text-[16px] font-bold">{calculation ? `+${formatCurrency(calculation.interest)}` : '---'}</Text>
              </View>
            </View>

            {/* Barre de progression */}
            <View className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <View className="h-full bg-[#FFDB58] rounded-full" style={{ width: `${calculation?.progressPercent || 0}%` }} />
            </View>
          </View>

          {/* Bouton Sauvegarder */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center mb-3"
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text className="text-white text-[16px] font-bold ml-2">{loading ? t('editLoan.saving') : t('editLoan.submit')}</Text>
          </TouchableOpacity>

          {/* Bouton Annuler */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-[12px] py-4 items-center"
            style={{ borderColor: colors.borderLight, borderWidth: 1, backgroundColor: colors.surface }}
            activeOpacity={0.8}
          >
            <Text className="text-[15px] font-bold" style={{ color: colors.primary }}>{t('editLoan.cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
