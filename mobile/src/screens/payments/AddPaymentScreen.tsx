import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, Avatar, StatusBadge, Logo } from '../../components/common';
import { loansApi } from '../../api/loans.api';
import { paymentsApi } from '../../api/payments.api';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan } from '../../types';
import type { AddPaymentProps } from '../../navigation/types';
import { useNetworkStore } from '../../store/network.store';
import { useMutationQueueStore } from '../../store/mutationQueue.store';
import { useCacheStore } from '../../store/cache.store';

export function AddPaymentScreen({ route, navigation }: AddPaymentProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { colors } = useTheme();
  const { loanId } = route.params;
  const [loan, setLoan] = useState<Loan | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const PAYMENT_METHODS = [t('addPayment.methods.bankTransfer'), t('addPayment.methods.mtnMomo'), t('addPayment.methods.orangeMoney'), t('addPayment.methods.cash'), t('addPayment.methods.other')];

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loansApi.getById(loanId).then(setLoan).catch(() => {});
  }, [loanId]);

  const isConnected = useNetworkStore((s) => s.isConnected);
  const addMutation = useMutationQueueStore((s) => s.addMutation);
  const { addPayment: addCachedPayment, updateLoan } = useCacheStore();

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t('common.error'), t('addPayment.amountError'));
      return;
    }
    const paymentData = {
      loan_id: loanId,
      amount_paid: parsedAmount,
      payment_type: parsedAmount >= Number(loan?.remaining_balance || 0) ? 'full' : 'partial',
      payment_date: new Date(date).toISOString(),
      payment_method: paymentMethod,
      notes: notes || undefined,
    };
    setLoading(true);
    try {
      if (isConnected) {
        await paymentsApi.create(paymentData);
        Alert.alert(t('addPayment.successTitle'), t('addPayment.successMessage'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const tempId = addMutation('CREATE_PAYMENT', paymentData);
        addCachedPayment(loanId, {
          id: tempId,
          loan_id: loanId,
          amount_paid: parsedAmount,
          payment_type: paymentData.payment_type as 'full' | 'partial',
          payment_date: paymentData.payment_date,
          payment_method: paymentMethod,
          notes: notes || undefined,
        });
        // Update cached loan balance
        if (loan) {
          const newBalance = Math.max(0, Number(loan.remaining_balance) - parsedAmount);
          updateLoan(loanId, {
            remaining_balance: newBalance,
            status: newBalance <= 0 ? 'paid' : loan.status,
          });
        }
        Alert.alert(t('common.savedLocally'), t('addPayment.offlineMessage'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: unknown) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5 text-[15px] text-[#222222]';

  return (
    <View className="flex-1 bg-cream">
      {/* Header Ya Mi */}
      <View className="flex-row items-center justify-between px-5" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#222222" />
          </TouchableOpacity>
          <Logo size="small" />
          <Text className="text-[16px] font-bold text-[#222222]">{t('addPayment.title')}</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <Text className="text-[#222222] text-[24px] font-bold mb-1" style={{ fontFamily: 'LibreCaslon-Bold' }}>{t('addPayment.heading')}</Text>
          <Text className="text-[#888888] text-[13px] mb-5">{t('addPayment.subtitle')}</Text>

          {/* Carte solde */}
          {loan && (
            <Card className="mb-6 bg-cream border border-[#E8E4DC]">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#888888] text-[12px]">{t('addPayment.loanBalance')}</Text>
                <StatusBadge status={loan.status} />
              </View>
              <Text className="text-burgundy text-[28px] font-bold mb-3">{formatCurrency(Number(loan.remaining_balance))}</Text>
              <View className="flex-row gap-4">
                <View>
                  <Text className="text-[#888888] text-[11px]">{t('addPayment.nextDue')}</Text>
                  <Text className="text-[#222222] text-[14px] font-bold">{formatCurrency(Number(loan.monthly_payment))}</Text>
                </View>
                <View>
                  <Text className="text-[#888888] text-[11px]">{t('addPayment.deadline')}</Text>
                  <Text className="text-[#222222] text-[14px] font-bold">{formatDate(loan.end_date)}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Montant */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addPayment.amount')}</Text>
            <View className="flex-row items-center">
              <TextInput
                className={`${inputClass} flex-1`}
                placeholder="0.00"
                placeholderTextColor="#CFCFCF"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text className="text-[#888888] text-[14px] font-bold ml-3">{t('common.fcfa')}</Text>
            </View>
          </View>

          {/* Date */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addPayment.date')}</Text>
            <View className="flex-row items-center">
              <TextInput
                className={`${inputClass} flex-1`}
                placeholder="2026-01-15"
                placeholderTextColor="#CFCFCF"
                value={date}
                onChangeText={setDate}
              />
              <Ionicons name="calendar-outline" size={20} color="#CFCFCF" style={{ marginLeft: -36 }} />
            </View>
          </View>

          {/* Mode de paiement (dropdown) */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addPayment.method')}</Text>
            <TouchableOpacity
              onPress={() => setShowMethodPicker(!showMethodPicker)}
              className="flex-row items-center justify-between bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5"
            >
              <Text className="text-[#222222] text-[15px]">{paymentMethod}</Text>
              <Ionicons name="chevron-down" size={18} color="#CFCFCF" />
            </TouchableOpacity>
            {showMethodPicker && (
              <View className="bg-white border border-[#E8E4DC] rounded-[12px] mt-1">
                {PAYMENT_METHODS.map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => { setPaymentMethod(m); setShowMethodPicker(false); }}
                    className="px-4 py-3 border-b border-[#E8E4DC]"
                  >
                    <Text className={`text-[14px] ${m === paymentMethod ? 'text-burgundy font-bold' : 'text-[#222222]'}`}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">{t('addPayment.notes')}</Text>
            <TextInput
              className={`${inputClass} min-h-[80px]`}
              placeholder={t('addPayment.notesPlaceholder')}
              placeholderTextColor="#CFCFCF"
              multiline
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Bouton fixe en bas */}
        <View className="px-5 pb-4" style={{ paddingBottom: insets.bottom + 8 }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
            <Text className="text-white text-[16px] font-bold ml-2">
              {loading ? t('addPayment.submitting') : t('addPayment.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
