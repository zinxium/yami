import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { ScreenHeader, Button, Avatar, Card, StatusBadge, Logo } from '../../components/common';
import { loansApi } from '../../api/loans.api';
import { paymentsApi } from '../../api/payments.api';
import { formatCurrency, formatDate } from '../../utils/format';
import { shareTicketAsPDF, type TicketData } from '../../services/ticket.service';
import { TicketView } from '../../components/tickets/TicketView';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import type { LoanDetailProps } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { Loan, Payment } from '../../types';

export function LoanDetailScreen({ route, navigation }: LoanDetailProps) {
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { loanId } = route.params;
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<{ period: number; due_date: string; amount: number; status: string }[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showTicketChoice, setShowTicketChoice] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  const getTicketData = (): TicketData => ({
    lenderName: user?.fullname || 'Prêteur',
    borrowerName,
    borrowerPhone: loan.borrower?.phone,
    amount: Number(loan.amount),
    interestRate: Number(loan.interest_rate),
    duration: loan.duration,
    durationUnit: loan.duration_unit,
    totalRepayment: Number(loan.total_repayment),
    monthlyPayment: Number(loan.monthly_payment),
    interestAmount: Number(loan.total_repayment) - Number(loan.amount),
    startDate: loan.start_date,
    endDate: loan.end_date,
    currency: loan.currency,
    notes: loan.notes,
  });

  const handleSharePNG = async () => {
    setShowTicketChoice(false);
    try {
      // Small delay for ViewShot to render
      await new Promise((r) => setTimeout(r, 300));
      const uri = await viewShotRef.current?.capture?.();
      if (uri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Partager le ticket (PNG)',
          UTI: 'public.png',
        });
      }
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    }
  };

  const handleSharePDF = async () => {
    setShowTicketChoice(false);
    try {
      await shareTicketAsPDF(getTicketData());
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="" showBack onBack={() => navigation.goBack()} rightElement={<Avatar name={borrowerName} size="sm" />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Status + nom */}
        <View className="items-center mt-2 mb-4">
          <StatusBadge status={loan.status} />
          <Text className="text-[13px] mt-2" style={{ color: colors.textSecondary }}>{borrowerName}</Text>
        </View>

        {/* Montant */}
        <Text className="text-center text-[36px] font-bold mb-1" style={{ color: colors.textPrimary }}>
          {formatCurrency(Number(loan.total_repayment))}
        </Text>
        <Text className="text-center text-[13px] mb-5" style={{ color: colors.textSecondary }}>Total à rembourser</Text>

        {/* Info chips */}
        <View className="flex-row justify-center gap-2 px-4 mb-5">
          <View className="border rounded-full px-4 py-2 items-center" style={{ borderColor: colors.borderLight }}>
            <Text className="text-[10px] uppercase tracking-[1px]" style={{ color: colors.textMuted }}>Taux</Text>
            <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{Number(loan.interest_rate)}%</Text>
          </View>
          <View className="border rounded-full px-4 py-2 items-center" style={{ borderColor: colors.borderLight }}>
            <Text className="text-[10px] uppercase tracking-[1px]" style={{ color: colors.textMuted }}>Durée</Text>
            <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{loan.duration} {loan.duration_unit === 'months' ? 'mois' : 'sem.'}</Text>
          </View>
          <View className="border rounded-full px-4 py-2 items-center" style={{ borderColor: colors.borderLight }}>
            <Text className="text-[10px] uppercase tracking-[1px]" style={{ color: colors.textMuted }}>Mensualité</Text>
            <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(Number(loan.monthly_payment))}</Text>
          </View>
        </View>

        {/* Barre de progression */}
        <View className="mx-5 mb-5">
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[13px]" style={{ color: colors.textSecondary }}>Remboursement</Text>
              <Text className="text-[14px] font-bold" style={{ color: colors.primary }}>{progressPercent}%</Text>
            </View>
            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.borderLight }}>
              <View className="h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: colors.primary }} />
            </View>
            <Text className="text-[12px] mt-2" style={{ color: colors.textSecondary }}>
              Reste : {formatCurrency(Number(loan.remaining_balance))}
            </Text>
          </Card>
        </View>

        {loan.notes ? (
          <View className="mx-5 mb-5">
            <Card>
              <Text className="text-[12px] mb-1" style={{ color: colors.textSecondary }}>Notes</Text>
              <Text className="text-[14px]" style={{ color: colors.textPrimary }}>{loan.notes}</Text>
            </Card>
          </View>
        ) : null}

        {/* Actions rapides */}
        <View className="px-5 mb-4 gap-3">
          <Button title="Partager le ticket" onPress={() => setShowTicketChoice(true)} variant="secondary" fullWidth icon="share-outline" />
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
            <Text className="text-[16px] font-bold" style={{ color: colors.primary }}>Échéancier</Text>
            <Ionicons name={showSchedule ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
          </TouchableOpacity>
          {showSchedule && (
            <Card className="p-0 overflow-hidden">
              {schedule.map((item, i) => (
                <View
                  key={i}
                  className={`flex-row items-center px-4 py-3 ${i < schedule.length - 1 ? 'border-b' : ''}`}
                  style={i < schedule.length - 1 ? { borderBottomColor: colors.borderLight } : undefined}
                >
                  <Text className="text-[13px] w-10" style={{ color: colors.textMuted }}>{item.period}</Text>
                  <View className={`w-2 h-2 rounded-full mx-3 ${item.status === 'paid' ? 'bg-green-500' : item.status === 'overdue' ? 'bg-red-500' : ''}`} style={item.status !== 'paid' && item.status !== 'overdue' ? { backgroundColor: colors.primary } : undefined} />
                  <Text className="text-[14px] flex-1" style={{ color: colors.textPrimary }}>{formatDate(item.due_date)}</Text>
                  <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Accordéon Paiements */}
        <View className="px-5 mb-4">
          <TouchableOpacity onPress={() => setShowPayments(!showPayments)} className="flex-row items-center justify-between mb-2">
            <Text className="text-[16px] font-bold" style={{ color: colors.primary }}>Historique paiements ({payments.length})</Text>
            <Ionicons name={showPayments ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
          </TouchableOpacity>
          {showPayments && (
            payments.length === 0 ? (
              <Text className="text-[13px]" style={{ color: colors.textSecondary }}>Aucun paiement enregistré.</Text>
            ) : (
              <Card className="p-0 overflow-hidden">
                {payments.map((p, i) => (
                  <View
                    key={p.id}
                    className={`flex-row items-center px-4 py-3 ${i < payments.length - 1 ? 'border-b' : ''}`}
                    style={i < payments.length - 1 ? { borderBottomColor: colors.borderLight } : undefined}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text className="text-[14px] flex-1 ml-2" style={{ color: colors.textPrimary }}>{formatDate(p.payment_date)}</Text>
                    <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(p.amount_paid)}</Text>
                  </View>
                ))}
              </Card>
            )
          )}
        </View>

        {/* Supprimer */}
        <View className="px-5 mt-2">
          <TouchableOpacity onPress={handleDelete} className="items-center py-3">
            <Text className="text-[14px] font-bold" style={{ color: colors.danger }}>Supprimer ce prêt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ViewShot caché pour capture PNG */}
      <View style={{ position: 'absolute', left: -9999 }}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <TicketView data={getTicketData()} />
        </ViewShot>
      </View>

      {/* Modal choix format */}
      <Modal visible={showTicketChoice} transparent animationType="fade" statusBarTranslucent>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowTicketChoice(false)}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 4 }}>
              Partager le ticket
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
              Choisissez le format
            </Text>

            <TouchableOpacity
              onPress={handleSharePNG}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#4D001315', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="image-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>Image PNG</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Idéal pour WhatsApp, Telegram</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSharePDF}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#80002015', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>Document PDF</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Idéal pour archivage, email</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
