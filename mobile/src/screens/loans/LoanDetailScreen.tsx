import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Button, Avatar, Card, StatusBadge, Logo } from '../../components/common';
import { loansApi } from '../../api/loans.api';
import { paymentsApi } from '../../api/payments.api';
import { formatCurrency, formatDate } from '../../utils/format';
import { shareTicket } from '../../services/sharing.service';
import { Colors } from '../../constants/colors';
import type { LoanDetailProps } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Loan, Payment, ScheduleItem } from '../../types';

export function LoanDetailScreen({ route, navigation }: LoanDetailProps) {
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { loanId } = route.params;
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [loanData, scheduleData, paymentsData] = await Promise.all([
        loansApi.getById(loanId),
        loansApi.getSchedule(loanId),
        paymentsApi.getByLoan(loanId),
      ]);
      setLoan(loanData);
      setSchedule(scheduleData);
      setPayments(paymentsData);
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading || !loan) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const borrowerName = loan.borrower?.fullname || 'Emprunteur';
  const progressPercent = loan.total_repayment > 0
    ? Math.round(((Number(loan.total_repayment) - Number(loan.remaining_balance)) / Number(loan.total_repayment)) * 100)
    : 0;

  const handleMarkPaid = () => {
    Alert.alert('Confirmer', 'Marquer ce prêt comme remboursé ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer', onPress: async () => {
          await loansApi.markAsPaid(loanId);
          fetchData();
        }
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce prêt définitivement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await loansApi.delete(loanId);
          navigation.goBack();
        }
      },
    ]);
  };

  const handleShareTicket = async () => {
    try {
      const { ticket } = await loansApi.getTicket(loanId);
      await shareTicket(ticket, loan.borrower?.phone);
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader title="" showBack onBack={() => navigation.goBack()} rightElement={<Avatar name={borrowerName} size="sm" />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Status + nom */}
        <View className="items-center mt-2 mb-4">
          <StatusBadge status={loan.status} />
          <Text className="text-[#888888] text-[13px] mt-2">{borrowerName}</Text>
        </View>

        {/* Montant */}
        <Text className="text-center text-[#222222] text-[36px] font-bold mb-1">
          {formatCurrency(Number(loan.total_repayment))}
        </Text>
        <Text className="text-center text-[#888888] text-[13px] mb-5">Total à rembourser</Text>

        {/* Info chips */}
        <View className="flex-row justify-center gap-2 px-4 mb-5">
          <View className="border border-[#E8E4DC] rounded-full px-4 py-2 items-center">
            <Text className="text-[#AAAAAA] text-[10px] uppercase tracking-[1px]">Taux</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{Number(loan.interest_rate)}%</Text>
          </View>
          <View className="border border-[#E8E4DC] rounded-full px-4 py-2 items-center">
            <Text className="text-[#AAAAAA] text-[10px] uppercase tracking-[1px]">Durée</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{loan.duration} {loan.duration_unit === 'months' ? 'mois' : 'sem.'}</Text>
          </View>
          <View className="border border-[#E8E4DC] rounded-full px-4 py-2 items-center">
            <Text className="text-[#AAAAAA] text-[10px] uppercase tracking-[1px]">Mensualité</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{formatCurrency(Number(loan.monthly_payment))}</Text>
          </View>
        </View>

        {/* Barre de progression */}
        <View className="mx-5 mb-5">
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#888888] text-[13px]">Remboursement</Text>
              <Text className="text-burgundy text-[14px] font-bold">{progressPercent}%</Text>
            </View>
            <View className="h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
              <View className="h-full bg-burgundy rounded-full" style={{ width: `${progressPercent}%` }} />
            </View>
            <Text className="text-[#888888] text-[12px] mt-2">
              Reste : {formatCurrency(Number(loan.remaining_balance))}
            </Text>
          </Card>
        </View>

        {loan.notes ? (
          <View className="mx-5 mb-5">
            <Card>
              <Text className="text-[#888888] text-[12px] mb-1">Notes</Text>
              <Text className="text-[#222222] text-[14px]">{loan.notes}</Text>
            </Card>
          </View>
        ) : null}

        {/* Actions rapides */}
        <View className="px-5 mb-4 gap-3">
          <Button title="Ticket WhatsApp" onPress={handleShareTicket} variant="secondary" fullWidth icon="logo-whatsapp" />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button title="Contrat PDF" onPress={() => rootNav.navigate('Contract', { loanId })} variant="outline" fullWidth icon="document-text-outline" />
            </View>
            <View className="flex-1">
              <Button title="Paiement" onPress={() => rootNav.navigate('AddPayment', { loanId })} variant="primary" fullWidth icon="card-outline" />
            </View>
          </View>
          {loan.status !== 'paid' && (
            <Button title="Marquer remboursé" onPress={handleMarkPaid} variant="outline" fullWidth icon="checkmark-circle-outline" />
          )}
          <Button title="Modifier le prêt" onPress={() => rootNav.navigate('EditLoan', { loanId })} variant="outline" fullWidth icon="create-outline" />
        </View>

        {/* Accordéon Échéancier */}
        <View className="px-5 mb-4">
          <TouchableOpacity onPress={() => setShowSchedule(!showSchedule)} className="flex-row items-center justify-between mb-2">
            <Text className="text-burgundy text-[16px] font-bold">Échéancier</Text>
            <Ionicons name={showSchedule ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
          </TouchableOpacity>
          {showSchedule && (
            <Card className="p-0 overflow-hidden">
              {schedule.map((item, i) => (
                <View key={i} className={`flex-row items-center px-4 py-3 ${i < schedule.length - 1 ? 'border-b border-[#E8E4DC]' : ''}`}>
                  <Text className="text-[#AAAAAA] text-[13px] w-10">{item.period}</Text>
                  <View className={`w-2 h-2 rounded-full mx-3 ${item.status === 'paid' ? 'bg-green-500' : item.status === 'overdue' ? 'bg-red-500' : 'bg-burgundy'}`} />
                  <Text className="text-[#222222] text-[14px] flex-1">{formatDate(item.due_date)}</Text>
                  <Text className="text-[#222222] text-[14px] font-bold">{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Accordéon Paiements */}
        <View className="px-5 mb-4">
          <TouchableOpacity onPress={() => setShowPayments(!showPayments)} className="flex-row items-center justify-between mb-2">
            <Text className="text-burgundy text-[16px] font-bold">Historique paiements ({payments.length})</Text>
            <Ionicons name={showPayments ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
          </TouchableOpacity>
          {showPayments && (
            payments.length === 0 ? (
              <Text className="text-[#888888] text-[13px]">Aucun paiement enregistré.</Text>
            ) : (
              <Card className="p-0 overflow-hidden">
                {payments.map((p, i) => (
                  <View key={p.id} className={`flex-row items-center px-4 py-3 ${i < payments.length - 1 ? 'border-b border-[#E8E4DC]' : ''}`}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text className="text-[#222222] text-[14px] flex-1 ml-2">{formatDate(p.payment_date)}</Text>
                    <Text className="text-[#222222] text-[14px] font-bold">{formatCurrency(p.amount_paid)}</Text>
                  </View>
                ))}
              </Card>
            )
          )}
        </View>

        {/* Supprimer */}
        <View className="px-5 mt-2">
          <TouchableOpacity onPress={handleDelete} className="items-center py-3">
            <Text className="text-[#4D0013] text-[14px] font-bold">Supprimer ce prêt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
