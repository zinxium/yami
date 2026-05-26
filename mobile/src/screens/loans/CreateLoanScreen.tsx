import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScreenHeader, Button, Card, Logo } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { loansApi } from '../../api/loans.api';
import { borrowersApi } from '../../api/borrowers.api';
import { Borrower, Loan } from '../../types';
import type { CreateLoanProps } from '../../navigation/types';
import { useNetworkStore } from '../../store/network.store';
import { useMutationQueueStore } from '../../store/mutationQueue.store';
import { useCacheStore } from '../../store/cache.store';

interface LoanFormData {
  borrowerName: string;
  amount: string;
  interestRate: string;
  duration: string;
  notes: string;
}

export function CreateLoanScreen({ navigation }: CreateLoanProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<LoanFormData>({
    defaultValues: { borrowerName: '', amount: '', interestRate: '', duration: '', notes: '' },
  });
  const { colors } = useTheme();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showBorrowers, setShowBorrowers] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    borrowersApi.getAll().then(setBorrowers).catch(() => {});
  }, []);

  const watchedAmount = watch('amount');
  const watchedRate = watch('interestRate');
  const watchedDuration = watch('duration');

  const calculation = useMemo(() => {
    const amount = parseFloat(watchedAmount);
    const rate = parseFloat(watchedRate);
    const duration = parseInt(watchedDuration, 10);
    if (!amount || !rate || !duration || amount <= 0 || duration <= 0) return null;
    const interest = amount * (rate / 100) * duration;
    const totalRepayment = amount + interest;
    const monthlyPayment = totalRepayment / duration;
    return { interest, totalRepayment, monthlyPayment };
  }, [watchedAmount, watchedRate, watchedDuration]);

  const isConnected = useNetworkStore((s) => s.isConnected);
  const addMutation = useMutationQueueStore((s) => s.addMutation);
  const { addLoan, addBorrower: addCachedBorrower } = useCacheStore();

  const onSubmit = async (data: LoanFormData) => {
    setLoading(true);
    try {
      if (isConnected) {
        let borrowerId = selectedBorrower?.id;
        if (!borrowerId) {
          const newBorrower = await borrowersApi.create({ fullname: data.borrowerName.trim() });
          borrowerId = newBorrower.id;
        }
        await loansApi.create({
          borrower_id: borrowerId,
          amount: parseFloat(data.amount),
          interest_rate: parseFloat(data.interestRate),
          duration: parseInt(data.duration, 10),
          duration_unit: 'months',
          start_date: new Date().toISOString(),
          notes: data.notes || undefined,
        });
        Alert.alert(t('createLoan.successTitle'), t('createLoan.successMessage'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Mode offline: queue mutations
        let borrowerId = selectedBorrower?.id;
        if (!borrowerId) {
          const tempBorrowerId = addMutation('CREATE_BORROWER', {
            fullname: data.borrowerName.trim(),
            tempId: `temp_b_${Date.now()}`,
          });
          borrowerId = tempBorrowerId;
          addCachedBorrower({
            id: tempBorrowerId,
            user_id: '',
            fullname: data.borrowerName.trim(),
            created_at: new Date().toISOString(),
          });
        }

        const amount = parseFloat(data.amount);
        const rate = parseFloat(data.interestRate);
        const duration = parseInt(data.duration, 10);
        const total = amount + amount * (rate / 100) * duration;
        const monthly = total / duration;
        const tempLoanId = addMutation('CREATE_LOAN', {
          borrower_id: borrowerId,
          amount,
          interest_rate: rate,
          duration,
          duration_unit: 'months',
          start_date: new Date().toISOString(),
          notes: data.notes || undefined,
          tempId: `temp_l_${Date.now()}`,
        });

        // Add optimistic loan to cache
        addLoan({
          id: tempLoanId,
          user_id: '',
          borrower_id: borrowerId,
          borrower: { id: borrowerId, user_id: '', fullname: data.borrowerName.trim(), created_at: '' },
          amount,
          interest_rate: rate,
          duration,
          duration_unit: 'months',
          monthly_payment: monthly,
          total_repayment: total,
          remaining_balance: total,
          currency: 'FCFA',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: '',
          notes: data.notes || undefined,
          created_at: new Date().toISOString(),
        } as Loan);

        Alert.alert(t('common.savedLocally'), t('createLoan.offlineMessage'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: unknown) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const selectBorrower = (b: Borrower) => {
    setSelectedBorrower(b);
    setValue('borrowerName', b.fullname);
    setShowBorrowers(false);
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[8px] px-3 py-2.5 text-[15px] text-[#222222]';
  const labelClass = 'text-[#222222] text-[13px] font-bold mb-1';
  const errorClass = 'text-red-500 text-[11px] mt-0.5';

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader title={t('createLoan.title')} showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-5 justify-between pb-5">
          <View>
            {/* Emprunteur */}
            <View className="mb-3">
              <Text className={labelClass}>{t('createLoan.borrower')}</Text>
              <Controller
                control={control}
                name="borrowerName"
                rules={{ required: t('common.required') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={inputClass}
                    placeholder={t('createLoan.borrowerPlaceholder')}
                    placeholderTextColor="#CFCFCF"
                    onBlur={onBlur}
                    onChangeText={(v) => { onChange(v); setSelectedBorrower(null); setShowBorrowers(v.length > 0); }}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.borrowerName && <Text className={errorClass}>{errors.borrowerName.message}</Text>}
              {showBorrowers && borrowers.length > 0 && (
                <View className="bg-white border border-[#E8E4DC] rounded-[8px] mt-1 absolute top-14 left-0 right-0 z-10">
                  {borrowers.filter(b => b.fullname.toLowerCase().includes(watch('borrowerName').toLowerCase())).slice(0, 3).map(b => (
                    <TouchableOpacity key={b.id} onPress={() => selectBorrower(b)} className="px-3 py-2 border-b border-[#E8E4DC]">
                      <Text className="text-[#222222] text-[13px]">{b.fullname}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Montant */}
            <View className="mb-3">
              <Text className={labelClass}>{t('createLoan.amount')}</Text>
              <Controller control={control} name="amount" rules={{ required: t('common.required'), validate: v => parseFloat(v) > 0 || t('common.mustBePositive') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput className={inputClass} placeholder="50 000" placeholderTextColor="#CFCFCF" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
                )} />
              {errors.amount && <Text className={errorClass}>{errors.amount.message}</Text>}
            </View>

            {/* Taux + Durée côte à côte */}
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className={labelClass}>{t('createLoan.interestRate')}</Text>
                <Controller control={control} name="interestRate" rules={{ required: t('common.required') }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className={inputClass} placeholder="5" placeholderTextColor="#CFCFCF" keyboardType="decimal-pad" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )} />
                {errors.interestRate && <Text className={errorClass}>{errors.interestRate.message}</Text>}
              </View>
              <View className="flex-1">
                <Text className={labelClass}>{t('createLoan.duration')}</Text>
                <Controller control={control} name="duration" rules={{ required: t('common.required'), validate: v => parseInt(v, 10) > 0 || t('common.mustBePositive') }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput className={inputClass} placeholder="6" placeholderTextColor="#CFCFCF" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )} />
                {errors.duration && <Text className={errorClass}>{errors.duration.message}</Text>}
              </View>
            </View>

            {/* Notes (ligne simple) */}
            <View className="mb-3">
              <Text className={labelClass}>{t('createLoan.notes')}</Text>
              <Controller control={control} name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput className={inputClass} placeholder="Notes..." placeholderTextColor="#CFCFCF" onBlur={onBlur} onChangeText={onChange} value={value} />
                )} />
            </View>

            {/* Calcul en temps réel — compact */}
            <Card className="p-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#888888] text-[13px]">{t('createLoan.interest')}</Text>
                <Text className="text-[#222222] text-[14px] font-bold">{calculation ? formatCurrency(calculation.interest) : '---'}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#888888] text-[13px]">{t('createLoan.monthlyPayment')}</Text>
                <Text className="text-[#222222] text-[14px] font-bold">{calculation ? formatCurrency(calculation.monthlyPayment) : '---'}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[#888888] text-[13px]">{t('createLoan.totalRepayment')}</Text>
                <Text className="text-burgundy text-[18px] font-bold">{calculation ? formatCurrency(calculation.totalRepayment) : '---'}</Text>
              </View>
            </Card>
          </View>

          <Button title={loading ? t('createLoan.creating') : t('createLoan.submit')} onPress={handleSubmit(onSubmit)} variant="primary" fullWidth disabled={loading} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
