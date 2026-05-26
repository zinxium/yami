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
  const { colors, isDarkMode } = useTheme();
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

  // Glass card style for dark mode
  const glassCardStyle = {
    backgroundColor: isDarkMode ? `${colors.surface}CC` : colors.surface,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.border : colors.borderLight,
    borderRadius: 16,
    padding: 16,
  };

  const handleMarkPaid = () => {
    Alert.alert('Confirmer', 'Marquer ce pr\u00eat comme rembours\u00e9 ?', [
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
    Alert.alert('Supprimer', 'Supprimer ce pr\u00eat d\u00e9finitivement ?', [
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
    lenderName: user?.fullname || 'Pr\u00eateur',
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
      <ScreenHeader
        title="Ya Mi"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={<Avatar name={borrowerName} size="sm" />}
      />

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
        <Text className="text-center text-[13px] mb-5" style={{ color: colors.textSecondary }}>Total a rembourser</Text>

        {/* Barre de progression - glass card */}
        <View className="mx-5 mb-5">
          <View style={glassCardStyle}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[13px]" style={{ color: colors.textSecondary }}>Remboursement</Text>
              <Text className="text-[14px] font-bold" style={{ color: colors.secondary }}>{progressPercent}%</Text>
            </View>
            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? colors.borderLight : colors.borderLight }}>
              <View className="h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: colors.secondary }} />
            </View>
            <Text className="text-[12px] mt-2" style={{ color: colors.textSecondary }}>
              Reste : {formatCurrency(Number(loan.remaining_balance))}
            </Text>
          </View>
        </View>

        {/* Specifications card */}
        <View className="mx-5 mb-5">
          <Text className="text-[16px] font-bold mb-3" style={{ color: colors.textPrimary }}>
            Sp{'\u00e9'}cifications
          </Text>
          <View style={glassCardStyle}>
            {/* Taux */}
            <View className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: isDarkMode ? colors.borderLight : colors.borderLight }}>
              <View className="flex-row items-center">
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDarkMode ? `${colors.secondary}1A` : `${colors.secondary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="trending-up-outline" size={18} color={colors.secondary} />
                </View>
                <Text className="text-[14px]" style={{ color: colors.textSecondary }}>Taux</Text>
              </View>
              <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{Number(loan.interest_rate)}%</Text>
            </View>
            {/* Duree */}
            <View className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: isDarkMode ? colors.borderLight : colors.borderLight }}>
              <View className="flex-row items-center">
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDarkMode ? `${colors.secondary}1A` : `${colors.secondary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="time-outline" size={18} color={colors.secondary} />
                </View>
                <Text className="text-[14px]" style={{ color: colors.textSecondary }}>Dur{'\u00e9'}e</Text>
              </View>
              <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{loan.duration} {loan.duration_unit === 'months' ? 'mois' : 'sem.'}</Text>
            </View>
            {/* Date d'Octroi */}
            <View className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: isDarkMode ? colors.borderLight : colors.borderLight }}>
              <View className="flex-row items-center">
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDarkMode ? `${colors.secondary}1A` : `${colors.secondary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
                </View>
                <Text className="text-[14px]" style={{ color: colors.textSecondary }}>Date d'Octroi</Text>
              </View>
              <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{formatDate(loan.start_date)}</Text>
            </View>
            {/* Mensualite */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDarkMode ? `${colors.secondary}1A` : `${colors.secondary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="cash-outline" size={18} color={colors.secondary} />
                </View>
                <Text className="text-[14px]" style={{ color: colors.textSecondary }}>Mensualit{'\u00e9'}</Text>
              </View>
              <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(Number(loan.monthly_payment))}</Text>
            </View>
          </View>
        </View>

        {loan.notes ? (
          <View className="mx-5 mb-5">
            <View style={glassCardStyle}>
              <Text className="text-[12px] mb-1" style={{ color: colors.textSecondary }}>Notes</Text>
              <Text className="text-[14px]" style={{ color: colors.textPrimary }}>{loan.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Historique des Paiements */}
        <View className="mx-5 mb-5">
          <TouchableOpacity onPress={() => setShowPayments(!showPayments)} className="flex-row items-center justify-between mb-3">
            <Text className="text-[16px] font-bold" style={{ color: colors.textPrimary }}>
              Historique des Paiements
            </Text>
            <Ionicons name={showPayments ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showPayments && (
            payments.length === 0 ? (
              <Text className="text-[13px]" style={{ color: colors.textSecondary }}>Aucun paiement enregistr{'\u00e9'}.</Text>
            ) : (
              <View style={{ ...glassCardStyle, padding: 0, overflow: 'hidden' }}>
                {payments.map((p, i) => (
                  <View
                    key={p.id}
                    className="flex-row items-center px-4 py-3"
                    style={i < payments.length - 1 ? { borderBottomWidth: 1, borderBottomColor: isDarkMode ? colors.borderLight : colors.borderLight } : undefined}
                  >
                    {/* Payment icon in secondary circle */}
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${colors.secondary}1A`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                      <Ionicons name="arrow-up-outline" size={18} color={colors.secondary} />
                    </View>
                    {/* Payment info */}
                    <View className="flex-1">
                      <Text className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>Paiement</Text>
                      <Text className="text-[12px] mt-0.5" style={{ color: colors.textMuted }}>{formatDate(p.payment_date)}</Text>
                    </View>
                    {/* Amount + badge */}
                    <View className="items-end">
                      <Text className="text-[14px] font-bold" style={{ color: colors.secondary }}>
                        {formatCurrency(p.amount_paid)}
                      </Text>
                      <View style={{
                        backgroundColor: `${colors.success}20`,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginTop: 4,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: colors.success }}>Succ{'\u00e8'}s</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )
          )}
        </View>

        {/* Echeancier accordion */}
        <View className="mx-5 mb-5">
          <TouchableOpacity onPress={() => setShowSchedule(!showSchedule)} className="flex-row items-center justify-between mb-3">
            <Text className="text-[16px] font-bold" style={{ color: colors.textPrimary }}>
              {'\u00c9'}ch{'\u00e9'}ancier
            </Text>
            <Ionicons name={showSchedule ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showSchedule && (
            <View style={{ ...glassCardStyle, padding: 0, overflow: 'hidden' }}>
              {schedule.map((item, i) => (
                <View
                  key={i}
                  className="flex-row items-center px-4 py-3"
                  style={i < schedule.length - 1 ? { borderBottomWidth: 1, borderBottomColor: isDarkMode ? colors.borderLight : colors.borderLight } : undefined}
                >
                  <Text className="text-[13px] w-10" style={{ color: colors.textMuted }}>{item.period}</Text>
                  <View
                    className="w-2 h-2 rounded-full mx-3"
                    style={{
                      backgroundColor: item.status === 'paid'
                        ? colors.success
                        : item.status === 'overdue'
                          ? colors.danger
                          : colors.secondary,
                    }}
                  />
                  <Text className="text-[14px] flex-1" style={{ color: colors.textPrimary }}>{formatDate(item.due_date)}</Text>
                  <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View className="px-5 mb-4 gap-3">
          {/* Primary action: Paiement */}
          <TouchableOpacity
            onPress={() => rootNav.navigate('AddPayment', { loanId })}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '#a61c3c' : colors.primary,
              borderRadius: 14,
              paddingVertical: 15,
              gap: 8,
            }}
          >
            <Ionicons name="card-outline" size={20} color={isDarkMode ? '#ffb9bf' : '#fff'} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#ffb9bf' : '#fff' }}>
              Enregistrer un Paiement
            </Text>
          </TouchableOpacity>

          {/* Secondary actions row */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowTicketChoice(true)}
              activeOpacity={0.8}
              className="flex-1"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? colors.surfaceHigh : colors.surface,
                borderRadius: 14,
                paddingVertical: 13,
                borderWidth: isDarkMode ? 1 : 1,
                borderColor: isDarkMode ? colors.border : colors.borderLight,
                gap: 6,
              }}
            >
              <Ionicons name="share-outline" size={18} color={colors.textPrimary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => rootNav.navigate('Contract', { loanId })}
              activeOpacity={0.8}
              className="flex-1"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? colors.surfaceHigh : colors.surface,
                borderRadius: 14,
                paddingVertical: 13,
                borderWidth: 1,
                borderColor: isDarkMode ? colors.border : colors.borderLight,
                gap: 6,
              }}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.textPrimary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Contrat</Text>
            </TouchableOpacity>
          </View>

          {loan.status !== 'paid' && (
            <TouchableOpacity
              onPress={handleMarkPaid}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? colors.surfaceHigh : colors.surface,
                borderRadius: 14,
                paddingVertical: 13,
                borderWidth: 1,
                borderColor: isDarkMode ? colors.border : colors.borderLight,
                gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Marquer rembours{'\u00e9'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => rootNav.navigate('EditLoan', { loanId })}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? colors.surfaceHigh : colors.surface,
              borderRadius: 14,
              paddingVertical: 13,
              borderWidth: 1,
              borderColor: isDarkMode ? colors.border : colors.borderLight,
              gap: 8,
            }}
          >
            <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Modifier le pr{'\u00ea'}t</Text>
          </TouchableOpacity>
        </View>

        {/* Supprimer */}
        <View className="px-5 mt-2">
          <TouchableOpacity onPress={handleDelete} className="items-center py-3">
            <Text className="text-[14px] font-bold" style={{ color: colors.danger }}>Supprimer ce pr{'\u00ea'}t</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ViewShot cache pour capture PNG */}
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
              backgroundColor: isDarkMode ? `${colors.surface}F2` : colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
              borderWidth: isDarkMode ? 1 : 0,
              borderBottomWidth: 0,
              borderColor: colors.border,
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
                borderColor: isDarkMode ? colors.border : colors.borderLight,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.secondary}1A`, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="image-outline" size={22} color={colors.secondary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>Image PNG</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Id{'\u00e9'}al pour WhatsApp, Telegram</Text>
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
                borderColor: isDarkMode ? colors.border : colors.borderLight,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>Document PDF</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Id{'\u00e9'}al pour archivage, email</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
