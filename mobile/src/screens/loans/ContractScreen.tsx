import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ScreenHeader, Card, Avatar, Logo } from '../../components/common';
import { api } from '../../api/client';
import { loansApi } from '../../api/loans.api';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan } from '../../types';

export function ContractScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { loanId } = route.params;
  const { colors } = useTheme();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [contract, setContract] = useState<{ pdf_url?: string; contract_number?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  useEffect(() => {
    Promise.all([
      loansApi.getById(loanId),
      loansApi.getSchedule(loanId),
    ]).then(([l, s]) => {
      setLoan(l);
      setSchedule(s);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [loanId]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await api.post<{ pdf_url: string; contract_number: string }>('/api/contracts/generate', { loan_id: loanId });
      setContract(result);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!contract?.pdf_url) return;
    try {
      const fileUri = documentDirectory + `contrat-${contract.contract_number}.pdf`;
      const { uri } = await downloadAsync(contract.pdf_url, fileUri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
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
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
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
    <View className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 4 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="chevron-back" size={22} color="#800020" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Logo size="small" />
          <Text className="text-burgundy text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold' }}>Contrat</Text>
        </View>
        <View className="w-8" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        {/* Référence */}
        {contract?.contract_number && (
          <View className="mb-4">
            <Text className="text-[#AAAAAA] text-[11px] uppercase tracking-[1px]">Référence du contrat</Text>
            <Text className="text-[#222222] text-[14px] font-bold">{contract.contract_number}</Text>
            <Text className="text-[#AAAAAA] text-[11px] mt-1">Daté d'émission : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
        )}

        {/* Le Prêteur */}
        <View className="mb-3">
          <Text className="text-[#AAAAAA] text-[11px] uppercase tracking-[1px] mb-1">Le Prêteur</Text>
          <Text className="text-[#222222] text-[14px] font-bold">Ya Mi Fintech S.A.</Text>
        </View>

        {/* L'Emprunteur */}
        <View className="mb-5">
          <Text className="text-[#AAAAAA] text-[11px] uppercase tracking-[1px] mb-1">L'Emprunteur</Text>
          <Text className="text-[#222222] text-[14px] font-bold">{borrowerName}</Text>
          {loan.borrower?.phone && <Text className="text-[#888888] text-[12px]">{loan.borrower.phone}</Text>}
          {loan.borrower?.address && <Text className="text-[#888888] text-[12px]">{loan.borrower.address}</Text>}
        </View>

        {/* Montant / Taux / Durée en gros */}
        <View className="items-center mb-2">
          <Text className="text-[#AAAAAA] text-[11px] uppercase tracking-[1px]">Montant du Principal</Text>
          <Text className="text-[#222222] text-[32px] font-bold">{formatCurrency(amount)}</Text>
        </View>
        <View className="flex-row justify-center gap-6 mb-5">
          <View className="items-center border border-[#E8E4DC] rounded-[10px] px-4 py-2">
            <Text className="text-[#AAAAAA] text-[10px] uppercase">Taux Annuel</Text>
            <Text className="text-[#222222] text-[18px] font-bold">{rate}%</Text>
          </View>
          <View className="items-center border border-[#E8E4DC] rounded-[10px] px-4 py-2">
            <Text className="text-[#AAAAAA] text-[10px] uppercase">Durée du Prêt</Text>
            <Text className="text-[#222222] text-[18px] font-bold">{loan.duration} Mois</Text>
          </View>
        </View>

        {/* Échéancier */}
        <Text className="text-[#222222] text-[16px] font-bold mb-3">Échéancier de Remboursement</Text>
        <Card className="p-0 overflow-hidden mb-2">
          {/* Header */}
          <View className="flex-row bg-cream px-4 py-2.5 border-b border-[#E8E4DC]">
            <Text className="text-[#AAAAAA] text-[11px] font-bold w-[70px]">Date</Text>
            <Text className="text-[#AAAAAA] text-[11px] font-bold flex-1 text-center">Principal</Text>
            <Text className="text-[#AAAAAA] text-[11px] font-bold flex-1 text-center">Intérêts</Text>
            <Text className="text-[#AAAAAA] text-[11px] font-bold flex-1 text-right">Total Mensuel</Text>
          </View>
          {displaySchedule.map((item, i) => (
            <View key={i} className={`flex-row items-center px-4 py-3 ${i < displaySchedule.length - 1 ? 'border-b border-[#E8E4DC]' : ''}`}>
              <Text className="text-[#222222] text-[12px] w-[70px]">{formatDate(item.due_date)}</Text>
              <Text className="text-[#222222] text-[12px] flex-1 text-center">{formatCurrency(amount / loan.duration)}</Text>
              <Text className="text-[#222222] text-[12px] flex-1 text-center">{formatCurrency(interest / loan.duration)}</Text>
              <Text className="text-burgundy text-[12px] font-bold flex-1 text-right">{formatCurrency(monthly)}</Text>
            </View>
          ))}
        </Card>
        {schedule.length > 3 && (
          <TouchableOpacity onPress={() => setShowFullSchedule(!showFullSchedule)} className="items-center mb-5">
            <Text className="text-burgundy text-[13px] underline">
              {showFullSchedule ? 'Masquer' : 'Voir tout l\'échéancier'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Termes */}
        <Text className="text-[#222222] text-[14px] font-bold mb-2">Termes et Conditions</Text>
        <Text className="text-[#888888] text-[12px] leading-[18px] mb-1">
          1. <Text className="font-bold">Engagement de remboursement :</Text> L'emprunteur s'engage irrévocablement à rembourser le montant total du prêt, incluant les intérêts et frais, selon l'échéancier défini ci-dessus.
        </Text>
        <Text className="text-[#888888] text-[12px] leading-[18px] mb-5">
          2. <Text className="font-bold">Retards de paiement :</Text> Tout retard entraînera des frais supplémentaires.
        </Text>

        {/* Signatures */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 mr-3">
            <Text className="text-[#AAAAAA] text-[11px] mb-2">Signature du Prêteur (Ya Mi)</Text>
            <View className="border border-[#E8E4DC] rounded-[10px] py-4 items-center bg-cream">
              <Ionicons name="checkmark-circle" size={20} color="#2D6A4F" />
              <Text className="text-[#2D6A4F] text-[10px] mt-1 font-bold uppercase">Approuvé par système</Text>
            </View>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-[#AAAAAA] text-[11px] mb-2">Signature de l'Emprunteur</Text>
            <View className="border border-[#E8E4DC] rounded-[10px] py-4 items-center bg-white">
              <Text className="text-[#222222] text-[16px] font-bold" style={{ fontFamily: 'LibreCaslon' }}>{borrowerName}</Text>
            </View>
          </View>
        </View>

        {/* Boutons */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} className="my-4" />
        ) : (
          <View className="gap-3">
            <TouchableOpacity onPress={handleDownload} className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center" activeOpacity={0.8}>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text className="text-white text-[15px] font-bold ml-2">Télécharger le PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareWhatsApp} className="border border-[#E8E4DC] bg-white rounded-[12px] py-4 flex-row items-center justify-center" activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text className="text-[#222222] text-[15px] font-bold ml-2">Partager via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
