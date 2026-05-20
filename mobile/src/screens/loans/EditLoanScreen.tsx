import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Logo } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { loansApi } from '../../api/loans.api';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency } from '../../utils/format';
import type { Loan } from '../../types';

export function EditLoanScreen({ route, navigation }: any) {
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: any = {};
      if (amount) data.amount = parseFloat(amount);
      if (interestRate) data.interest_rate = parseFloat(interestRate);
      if (duration) data.duration = parseInt(duration, 10);
      await loansApi.update(loanId, data);
      Alert.alert('Modifié', 'Le prêt a été mis à jour.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const borrowerName = loan?.borrower?.fullname || 'Emprunteur';
  const inputClass = 'bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5 text-[15px] text-[#222222]';

  return (
    <View className="flex-1 bg-cream">
      {/* Header Ya Mi */}
      <View className="flex-row items-center justify-between px-5" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#222222" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-1">
          <View className="w-6 h-6 rounded-full bg-burgundy items-center justify-center">
            <Text className="text-white text-[10px] font-bold">Y</Text>
          </View>
          <Text className="text-burgundy text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold' }}>Ya Mi</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <Text className="text-[#222222] text-[24px] font-bold mb-1" style={{ fontFamily: 'LibreCaslon-Bold' }}>Modifier le Prêt</Text>
          <Text className="text-[#888888] text-[13px] mb-6">Ajustez les paramètres du contrat de prêt pour {borrowerName}.</Text>

          {/* Emprunteur (disabled) */}
          <View className="mb-5">
            <Text className="text-[#AAAAAA] text-[11px] mb-1">Nom de l'emprunteur</Text>
            <View className="flex-row items-center bg-cream border border-[#E8E4DC] rounded-[12px] px-4 py-3.5">
              <Ionicons name="person-outline" size={16} color="#CFCFCF" />
              <Text className="text-[#888888] text-[15px] ml-3">{borrowerName}</Text>
            </View>
          </View>

          {/* Montant */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[13px] font-bold mb-1">Montant du prêt (FCFA)</Text>
            <View className="flex-row items-center bg-white border-2 border-burgundy rounded-[12px] px-4 py-3.5">
              <Ionicons name="card-outline" size={16} color="#800020" />
              <TextInput
                className="flex-1 ml-3 text-[15px] text-[#222222]"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Taux et Durée côte à côte */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1">
              <Text className="text-[#222222] text-[13px] font-bold mb-1">Taux d'intérêt (%)</Text>
              <View className="flex-row items-center bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5">
                <TextInput className="flex-1 text-[15px] text-[#222222]" keyboardType="decimal-pad" value={interestRate} onChangeText={setInterestRate} />
                <Text className="text-[#AAAAAA] text-[13px]">%</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[#222222] text-[13px] font-bold mb-1">Durée (Mois)</Text>
              <View className="flex-row items-center bg-white border border-[#E8E4DC] rounded-[12px] px-4 py-3.5">
                <TextInput className="flex-1 text-[15px] text-[#222222]" keyboardType="numeric" value={duration} onChangeText={setDuration} />
                <Ionicons name="calendar-outline" size={16} color="#CFCFCF" />
              </View>
            </View>
          </View>

          {/* Carte burgundy avec calculs */}
          <View className="bg-burgundy rounded-[16px] p-5 mb-6">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white/60 text-[11px] uppercase tracking-[1px]">Paiement Mensuel</Text>
              <View className="w-10 h-10 rounded-[8px] bg-white/10 items-center justify-center">
                <Ionicons name="business-outline" size={20} color="#FFFFFF" />
              </View>
            </View>
            <Text className="text-white text-[32px] font-bold mb-4">
              {calculation ? formatCurrency(calculation.monthly) : '---'}
            </Text>

            <View className="flex-row justify-between mb-3">
              <View>
                <Text className="text-white/60 text-[11px]">Total à rembourser</Text>
                <Text className="text-white text-[16px] font-bold">{calculation ? formatCurrency(calculation.total) : '---'}</Text>
              </View>
              <View>
                <Text className="text-white/60 text-[11px]">Intérêts totaux</Text>
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
            <Text className="text-white text-[16px] font-bold ml-2">{loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}</Text>
          </TouchableOpacity>

          {/* Bouton Annuler */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="border border-[#E8E4DC] bg-white rounded-[12px] py-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-burgundy text-[15px] font-bold">Annuler les modifications</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
