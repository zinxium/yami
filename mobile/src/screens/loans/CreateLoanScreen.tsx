import React, { useMemo } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ScreenHeader, Button, Card } from '../../components/common';
import { formatCurrency } from '../../utils/format';
import type { CreateLoanProps } from '../../navigation/types';

interface LoanFormData {
  borrowerName: string;
  amount: string;
  interestRate: string;
  duration: string;
}

export function CreateLoanScreen({ navigation }: CreateLoanProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<LoanFormData>({
    defaultValues: { borrowerName: '', amount: '', interestRate: '', duration: '' },
  });

  const watchedAmount = watch('amount');
  const watchedRate = watch('interestRate');
  const watchedDuration = watch('duration');

  const calculation = useMemo(() => {
    const amount = parseFloat(watchedAmount);
    const rate = parseFloat(watchedRate);
    const duration = parseInt(watchedDuration, 10);

    if (!amount || !rate || !duration || amount <= 0 || duration <= 0) {
      return null;
    }

    const interest = amount * (rate / 100) * duration;
    const totalRepayment = amount + interest;
    const monthlyPayment = totalRepayment / duration;

    return { totalRepayment, monthlyPayment };
  }, [watchedAmount, watchedRate, watchedDuration]);

  const onSubmit = (data: LoanFormData) => {
    Alert.alert(
      'Pret cree',
      `Emprunteur: ${data.borrowerName}\nMontant: $${data.amount}\nTaux: ${data.interestRate}%\nDuree: ${data.duration} mois\nTotal: ${calculation ? formatCurrency(calculation.totalRepayment, 'USD') : '---'}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[8px] px-4 py-3.5 text-[15px] text-[#222222]';
  const labelClass = 'text-[#222222] text-[14px] font-bold mb-2';
  const errorClass = 'text-red-500 text-[12px] mt-1';

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader
        title="Create Loan"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Borrower Name */}
          <View className="mb-5">
            <Text className={labelClass}>Borrower Name</Text>
            <Controller
              control={control}
              name="borrowerName"
              rules={{ required: 'Required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass}
                  placeholder="Borrower Name"
                  placeholderTextColor="#CFCFCF"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.borrowerName && <Text className={errorClass}>{errors.borrowerName.message}</Text>}
          </View>

          {/* Amount */}
          <View className="mb-5">
            <Text className={labelClass}>Amount ($)</Text>
            <Controller
              control={control}
              name="amount"
              rules={{ required: 'Required', validate: (v) => parseFloat(v) > 0 || 'Must be positive' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass}
                  placeholder="$1200"
                  placeholderTextColor="#CFCFCF"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.amount && <Text className={errorClass}>{errors.amount.message}</Text>}
          </View>

          {/* Interest Rate */}
          <View className="mb-5">
            <Text className={labelClass}>Interest Rate (%)</Text>
            <Controller
              control={control}
              name="interestRate"
              rules={{ required: 'Required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass}
                  placeholder="5%"
                  placeholderTextColor="#CFCFCF"
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.interestRate && <Text className={errorClass}>{errors.interestRate.message}</Text>}
          </View>

          {/* Duration */}
          <View className="mb-6">
            <Text className={labelClass}>Duration (Months)</Text>
            <Controller
              control={control}
              name="duration"
              rules={{ required: 'Required', validate: (v) => parseInt(v, 10) > 0 || 'Must be positive' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass}
                  placeholder="6m"
                  placeholderTextColor="#CFCFCF"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.duration && <Text className={errorClass}>{errors.duration.message}</Text>}
          </View>

          {/* Calculation */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#888888] text-[14px]">Monthly Payment:</Text>
              <Text className="text-[#222222] text-[16px] font-bold">
                {calculation ? `$${formatCurrency(calculation.monthlyPayment, '').trim()}` : '---'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[#888888] text-[14px]">Total Payback:</Text>
              <Text className="text-burgundy text-[22px] font-bold">
                {calculation ? `$${formatCurrency(calculation.totalRepayment, '').trim()}` : '---'}
              </Text>
            </View>
          </Card>

          {/* Continue */}
          <Button
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            fullWidth
          />

          {/* Trust banner */}
          <View className="items-center mt-8">
            <Text className="text-[#888888] text-[13px]">Trusted by 20,000+ users daily</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
