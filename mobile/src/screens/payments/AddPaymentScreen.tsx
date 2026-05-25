import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar, StatusBadge, Logo } from '../../components/common';
import { loansApi } from '../../api/loans.api';
import { paymentsApi } from '../../api/payments.api';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan } from '../../types';
import type { AddPaymentProps } from '../../navigation/types';

const PAYMENT_METHODS = ['Virement Bancaire', 'MTN MoMo', 'Orange Money', 'Cash', 'Autre'];

export function AddPaymentScreen({ route, navigation }: AddPaymentProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { colors } = useTheme();
  const { loanId } = route.params;
  const [loan, setLoan] = useState<Loan | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Virement Bancaire');
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loansApi.getById(loanId).then(setLoan).catch(() => {});
  }, [loanId]);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0.');
      return;
    }
    setLoading(true);
    try {
      await paymentsApi.create({
        loan_id: loanId,
        amount_paid: parsedAmount,
        payment_type: parsedAmount >= Number(loan?.remaining_balance || 0) ? 'full' : 'partial',
        payment_date: new Date(date).toISOString(),
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      Alert.alert('Paiement enregistré', 'Le paiement a été ajouté avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
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
          <Text className="text-[16px] font-bold text-[#222222]">Nouveau paiement</Text>
        </View>
        <Avatar name={user?.fullname || 'U'} size="sm" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }} keyboardShouldPersistTaps="handled">
          {/* Titre */}
          <Text className="text-[#222222] text-[24px] font-bold mb-1" style={{ fontFamily: 'LibreCaslon-Bold' }}>Enregistrer un{'\n'}Paiement</Text>
          <Text className="text-[#888888] text-[13px] mb-5">Effectuez votre remboursement en toute sécurité.</Text>

          {/* Carte solde */}
          {loan && (
            <Card className="mb-6 bg-cream border border-[#E8E4DC]">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#888888] text-[12px]">Solde Total du Prêt</Text>
                <StatusBadge status={loan.status} />
              </View>
              <Text className="text-burgundy text-[28px] font-bold mb-3">{formatCurrency(Number(loan.remaining_balance))}</Text>
              <View className="flex-row gap-4">
                <View>
                  <Text className="text-[#888888] text-[11px]">Prochaine Échéance</Text>
                  <Text className="text-[#222222] text-[14px] font-bold">{formatCurrency(Number(loan.monthly_payment))}</Text>
                </View>
                <View>
                  <Text className="text-[#888888] text-[11px]">Date Limite</Text>
                  <Text className="text-[#222222] text-[14px] font-bold">{formatDate(loan.end_date)}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Montant */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Montant du Paiement</Text>
            <View className="flex-row items-center">
              <TextInput
                className={`${inputClass} flex-1`}
                placeholder="0.00"
                placeholderTextColor="#CFCFCF"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text className="text-[#888888] text-[14px] font-bold ml-3">FCFA</Text>
            </View>
          </View>

          {/* Date */}
          <View className="mb-5">
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Date du Paiement</Text>
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
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Mode de Paiement</Text>
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
            <Text className="text-[#222222] text-[14px] font-bold mb-2">Note (Optionnel)</Text>
            <TextInput
              className={`${inputClass} min-h-[80px]`}
              placeholder="Référence du virement ou commentaire..."
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
              {loading ? 'Enregistrement...' : 'Confirmer le Paiement'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
