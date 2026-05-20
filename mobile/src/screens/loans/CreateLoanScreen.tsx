import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ScreenHeader, Button, Card, Logo } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { loansApi } from '../../api/loans.api';
import { borrowersApi } from '../../api/borrowers.api';
import { Borrower } from '../../types';
import type { CreateLoanProps } from '../../navigation/types';

interface LoanFormData {
  borrowerName: string;
  amount: string;
  interestRate: string;
  duration: string;
  notes: string;
}

export function CreateLoanScreen({ navigation }: CreateLoanProps) {
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

  const onSubmit = async (data: LoanFormData) => {
    setLoading(true);
    try {
      let borrowerId = selectedBorrower?.id;

      // Créer l'emprunteur s'il n'existe pas
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

      Alert.alert('Prêt créé !', 'Le prêt a été enregistré avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectBorrower = (b: Borrower) => {
    setSelectedBorrower(b);
    setValue('borrowerName', b.fullname);
    setShowBorrowers(false);
  };

  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[8px] px-4 py-3.5 text-[15px] text-[#222222]';
  const labelClass = 'text-[#222222] text-[14px] font-bold mb-2';
  const errorClass = 'text-red-500 text-[12px] mt-1';

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader title="Nouveau prêt" showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Emprunteur */}
          <View className="mb-5">
            <Text className={labelClass}>Emprunteur</Text>
            <Controller
              control={control}
              name="borrowerName"
              rules={{ required: 'Requis' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={inputClass}
                  placeholder="Nom de l'emprunteur"
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
              <View className="bg-white border border-[#E8E4DC] rounded-[8px] mt-1">
                {borrowers.filter(b => b.fullname.toLowerCase().includes(watch('borrowerName').toLowerCase())).slice(0, 5).map(b => (
                  <TouchableOpacity key={b.id} onPress={() => selectBorrower(b)} className="px-4 py-3 border-b border-[#E8E4DC]">
                    <Text className="text-[#222222] text-[14px]">{b.fullname}</Text>
                    {b.phone && <Text className="text-[#888888] text-[12px]">{b.phone}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Montant */}
          <View className="mb-5">
            <Text className={labelClass}>Montant (FCFA)</Text>
            <Controller control={control} name="amount" rules={{ required: 'Requis', validate: v => parseFloat(v) > 0 || 'Doit être positif' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput className={inputClass} placeholder="50 000" placeholderTextColor="#CFCFCF" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.amount && <Text className={errorClass}>{errors.amount.message}</Text>}
          </View>

          {/* Taux */}
          <View className="mb-5">
            <Text className={labelClass}>Taux d'intérêt (%)</Text>
            <Controller control={control} name="interestRate" rules={{ required: 'Requis' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput className={inputClass} placeholder="5" placeholderTextColor="#CFCFCF" keyboardType="decimal-pad" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.interestRate && <Text className={errorClass}>{errors.interestRate.message}</Text>}
          </View>

          {/* Durée */}
          <View className="mb-6">
            <Text className={labelClass}>Durée (mois)</Text>
            <Controller control={control} name="duration" rules={{ required: 'Requis', validate: v => parseInt(v, 10) > 0 || 'Doit être positif' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput className={inputClass} placeholder="6" placeholderTextColor="#CFCFCF" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.duration && <Text className={errorClass}>{errors.duration.message}</Text>}
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className={labelClass}>Notes (optionnel)</Text>
            <Controller control={control} name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput className={`${inputClass} min-h-[80px]`} placeholder="Notes..." placeholderTextColor="#CFCFCF" multiline onBlur={onBlur} onChangeText={onChange} value={value} textAlignVertical="top" />
              )} />
          </View>

          {/* Calcul en temps réel */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#888888] text-[14px]">Intérêts :</Text>
              <Text className="text-[#222222] text-[15px] font-bold">{calculation ? formatCurrency(calculation.interest) : '---'}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#888888] text-[14px]">Mensualité :</Text>
              <Text className="text-[#222222] text-[15px] font-bold">{calculation ? formatCurrency(calculation.monthlyPayment) : '---'}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[#888888] text-[14px]">Total à rembourser :</Text>
              <Text className="text-burgundy text-[20px] font-bold">{calculation ? formatCurrency(calculation.totalRepayment) : '---'}</Text>
            </View>
          </Card>

          <Button title={loading ? 'Création...' : 'Créer le prêt'} onPress={handleSubmit(onSubmit)} variant="primary" fullWidth disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
