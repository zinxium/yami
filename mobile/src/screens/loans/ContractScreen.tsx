import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Card, Logo } from '../../components/common';
import { loansApi } from '../../api/loans.api';
import { contractsApi, Contract } from '../../api/contracts.api';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan } from '../../types';
import type { ContractProps } from '../../navigation/types';

export function ContractScreen({ route, navigation }: ContractProps) {
  const insets = useSafeAreaInsets();
  const { loanId } = route.params;
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<{ period: number; due_date: string; amount: number; status: string }[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  useEffect(() => {
    Promise.all([
      loansApi.getById(loanId),
      loansApi.getSchedule(loanId),
      contractsApi.getByLoanId(loanId),
    ]).then(([l, s, c]) => {
      setLoan(l);
      setSchedule(s);
      if (c) setContract(c);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [loanId]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await contractsApi.generate(loanId);
      setContract(result);
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    }
    setLoading(false);
  };

  const handleSign = async () => {
    if (!contract) return;
    Alert.alert(
      'Confirmer la signature',
      'En signant ce contrat, vous confirmez que les deux parties ont accepté les termes. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Signer',
          style: 'destructive',
          onPress: async () => {
            setSigning(true);
            try {
              const updated = await contractsApi.sign(contract.id);
              setContract(updated);
            } catch (e: unknown) {
              Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
            }
            setSigning(false);
          },
        },
      ],
    );
  };

  const handleDownload = async () => {
    if (!contract?.pdf_url) return;
    try {
      const fileUri = documentDirectory + `contrat-${contract.contract_number}.pdf`;
      const { uri } = await downloadAsync(contract.pdf_url, fileUri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur inconnue');
    }
  };

  const handleShareWhatsApp = async () => {
    if (!contract?.pdf_url) return;
    const { default: Linking } = await import('expo-linking');
    const text = encodeURIComponent(`Contrat de prêt Ya Mi N° ${contract.contract_number}\n${contract.pdf_url}`);
    await Linking.openURL(`https://wa.me/?text=${text}`);
  };

  if (fetching || !loan) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const borrowerName = loan.borrower?.fullname || 'Emprunteur';
  const amount = Number(loan.amount);
  const rate = Number(loan.interest_rate);
  const total = Number(loan.total_repayment);
  const monthly = Number(loan.monthly_payment);
  const interest = total - amount;
  const displaySchedule = showFullSchedule ? schedule : schedule.slice(0, 3);

  // Auto-generate if not yet generated
  if (!contract && !loading) {
    handleGenerate();
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 4 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Logo size="small" />
          <Text className="text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold', color: colors.primary }}>Contrat</Text>
        </View>
        <View className="w-8" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        {/* Reference + Signed status */}
        {contract?.contract_number && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[11px] uppercase tracking-[1px]" style={{ color: colors.textMuted }}>Référence du contrat</Text>
                <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{contract.contract_number}</Text>
              </View>
              <View
                className="flex-row items-center rounded-full px-3 py-1.5"
                style={{ backgroundColor: contract.signed ? '#E8F5E8' : '#FFF5E5' }}
              >
                <Ionicons
                  name={contract.signed ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color={contract.signed ? '#2D6A4F' : '#7A5F00'}
                />
                <Text
                  className="text-[11px] font-bold ml-1"
                  style={{ color: contract.signed ? '#2D6A4F' : '#7A5F00' }}
                >
                  {contract.signed ? 'Signé' : 'En attente'}
                </Text>
              </View>
            </View>
            <Text className="text-[11px] mt-1" style={{ color: colors.textMuted }}>
              Date d'émission : {new Date(contract.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        )}

        {/* Le Preteur */}
        <View className="mb-3">
          <Text className="text-[11px] uppercase tracking-[1px] mb-1" style={{ color: colors.textMuted }}>Le Prêteur</Text>
          <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{user?.fullname || 'Prêteur'}</Text>
          {user?.phone && <Text className="text-[12px]" style={{ color: colors.textSecondary }}>{user.phone}</Text>}
        </View>

        {/* L'Emprunteur */}
        <View className="mb-5">
          <Text className="text-[11px] uppercase tracking-[1px] mb-1" style={{ color: colors.textMuted }}>L'Emprunteur</Text>
          <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>{borrowerName}</Text>
          {loan.borrower?.phone && <Text className="text-[12px]" style={{ color: colors.textSecondary }}>{loan.borrower.phone}</Text>}
          {loan.borrower?.address && <Text className="text-[12px]" style={{ color: colors.textSecondary }}>{loan.borrower.address}</Text>}
        </View>

        {/* Montant / Taux / Duree en gros */}
        <View className="items-center mb-2">
          <Text className="text-[11px] uppercase tracking-[1px]" style={{ color: colors.textMuted }}>Montant du Principal</Text>
          <Text className="text-[32px] font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(amount)}</Text>
        </View>
        <View className="flex-row justify-center gap-6 mb-5">
          <View className="items-center rounded-[10px] px-4 py-2" style={{ borderColor: colors.borderLight, borderWidth: 1 }}>
            <Text className="text-[10px] uppercase" style={{ color: colors.textMuted }}>Taux Annuel</Text>
            <Text className="text-[18px] font-bold" style={{ color: colors.textPrimary }}>{rate}%</Text>
          </View>
          <View className="items-center rounded-[10px] px-4 py-2" style={{ borderColor: colors.borderLight, borderWidth: 1 }}>
            <Text className="text-[10px] uppercase" style={{ color: colors.textMuted }}>Durée du Prêt</Text>
            <Text className="text-[18px] font-bold" style={{ color: colors.textPrimary }}>{loan.duration} Mois</Text>
          </View>
        </View>

        {/* Echeancier */}
        <Text className="text-[16px] font-bold mb-3" style={{ color: colors.textPrimary }}>Échéancier de Remboursement</Text>
        <Card className="p-0 overflow-hidden mb-2">
          {/* Header */}
          <View className="flex-row px-4 py-2.5" style={{ backgroundColor: colors.background, borderBottomColor: colors.borderLight, borderBottomWidth: 1 }}>
            <Text className="text-[11px] font-bold w-[70px]" style={{ color: colors.textMuted }}>Date</Text>
            <Text className="text-[11px] font-bold flex-1 text-center" style={{ color: colors.textMuted }}>Principal</Text>
            <Text className="text-[11px] font-bold flex-1 text-center" style={{ color: colors.textMuted }}>Intérêts</Text>
            <Text className="text-[11px] font-bold flex-1 text-right" style={{ color: colors.textMuted }}>Total Mensuel</Text>
          </View>
          {displaySchedule.map((item, i) => (
            <View key={i} className="flex-row items-center px-4 py-3" style={i < displaySchedule.length - 1 ? { borderBottomColor: colors.borderLight, borderBottomWidth: 1 } : undefined}>
              <Text className="text-[12px] w-[70px]" style={{ color: colors.textPrimary }}>{formatDate(item.due_date)}</Text>
              <Text className="text-[12px] flex-1 text-center" style={{ color: colors.textPrimary }}>{formatCurrency(amount / loan.duration)}</Text>
              <Text className="text-[12px] flex-1 text-center" style={{ color: colors.textPrimary }}>{formatCurrency(interest / loan.duration)}</Text>
              <Text className="text-[12px] font-bold flex-1 text-right" style={{ color: colors.primary }}>{formatCurrency(monthly)}</Text>
            </View>
          ))}
        </Card>
        {schedule.length > 3 && (
          <TouchableOpacity onPress={() => setShowFullSchedule(!showFullSchedule)} className="items-center mb-5">
            <Text className="text-[13px] underline" style={{ color: colors.primary }}>
              {showFullSchedule ? 'Masquer' : 'Voir tout l\'échéancier'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Termes */}
        <Text className="text-[14px] font-bold mb-2" style={{ color: colors.textPrimary }}>Termes et Conditions</Text>
        <Text className="text-[12px] leading-[18px] mb-1" style={{ color: colors.textSecondary }}>
          1. <Text className="font-bold">Engagement de remboursement :</Text> L'emprunteur s'engage irrévocablement à rembourser le montant total du prêt, incluant les intérêts et frais, selon l'échéancier défini ci-dessus.
        </Text>
        <Text className="text-[12px] leading-[18px] mb-5" style={{ color: colors.textSecondary }}>
          2. <Text className="font-bold">Retards de paiement :</Text> Tout retard entraînera des frais supplémentaires.
        </Text>

        {/* Signatures */}
        <Text className="text-[14px] font-bold mb-3" style={{ color: colors.textPrimary }}>Signatures</Text>

        {/* Signature du Preteur */}
        <View className="mb-4">
          <View className="rounded-[10px] p-4" style={{ borderColor: colors.borderLight, borderWidth: 1, backgroundColor: colors.background }}>
            <Text className="text-[12px] leading-[18px] mb-3" style={{ color: colors.textSecondary }}>
              Je soussigné(e), <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{user?.fullname || 'Prêteur'}</Text>, déclare accorder un prêt d'un montant de{' '}
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{formatCurrency(amount)}</Text> à{' '}
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{borrowerName}</Text>, aux conditions définies dans le présent contrat.
              Je m'engage à respecter les termes de cet accord.
            </Text>
            <View className="pt-3 items-center" style={{ borderTopColor: colors.borderLight, borderTopWidth: 1 }}>
              <Text className="text-[10px] uppercase tracking-[1px] mb-1" style={{ color: colors.textMuted }}>Signature du Prêteur</Text>
              <Text className="text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon', color: colors.textPrimary }}>{user?.fullname || 'Prêteur'}</Text>
              <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                Signé le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Signature de l'Emprunteur */}
        <View className="mb-6">
          <View className="rounded-[10px] p-4" style={{ borderColor: colors.borderLight, borderWidth: 1, backgroundColor: colors.surface }}>
            <Text className="text-[12px] leading-[18px] mb-3" style={{ color: colors.textSecondary }}>
              Je soussigné(e), <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{borrowerName}</Text>, reconnais avoir reçu un prêt d'un montant de{' '}
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{formatCurrency(amount)}</Text> de la part de{' '}
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{user?.fullname || 'Prêteur'}</Text>.
              Je m'engage à rembourser la totalité du montant dû, soit{' '}
              <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{formatCurrency(total)}</Text>, selon l'échéancier prévu.
            </Text>
            <View className="pt-3 items-center" style={{ borderTopColor: colors.borderLight, borderTopWidth: 1 }}>
              <Text className="text-[10px] uppercase tracking-[1px] mb-1" style={{ color: colors.textMuted }}>Signature de l'Emprunteur</Text>
              <Text className="text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon', color: colors.textPrimary }}>{borrowerName}</Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        {contract?.qr_code && (
          <View className="items-center mb-6">
            <Text className="text-[11px] uppercase tracking-[1px] mb-3" style={{ color: colors.textMuted }}>QR Code de vérification</Text>
            <View className="rounded-[12px] p-4" style={{ backgroundColor: '#FFFFFF', borderColor: colors.borderLight, borderWidth: 1 }}>
              <Image source={{ uri: contract.qr_code }} style={{ width: 160, height: 160 }} />
            </View>
            <Text className="text-[11px] mt-2 text-center" style={{ color: colors.textMuted }}>
              Scannez ce code pour vérifier l'authenticité du contrat
            </Text>
          </View>
        )}

        {/* Boutons */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} className="my-4" />
        ) : (
          <View className="gap-3">
            {/* Bouton signer — visible seulement si pas encore signé */}
            {contract && !contract.signed && (
              <TouchableOpacity
                onPress={handleSign}
                disabled={signing}
                className="rounded-[12px] py-4 flex-row items-center justify-center"
                style={{ backgroundColor: '#2D6A4F' }}
                activeOpacity={0.8}
              >
                {signing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text className="text-white text-[15px] font-bold ml-2">Signer le contrat</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleDownload} className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center" activeOpacity={0.8}>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text className="text-white text-[15px] font-bold ml-2">Télécharger le PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareWhatsApp} className="rounded-[12px] py-4 flex-row items-center justify-center" style={{ borderColor: colors.borderLight, borderWidth: 1, backgroundColor: colors.surface }} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text className="text-[15px] font-bold ml-2" style={{ color: colors.textPrimary }}>Partager via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
