import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency, formatDate } from '../../utils/format';
import type { TicketData } from '../../services/ticket.service';

interface TicketViewProps {
  data: TicketData;
}

export function TicketView({ data }: TicketViewProps) {
  const currency = data.currency || 'XOF';
  const unit = data.durationUnit === 'months' ? 'mois' : 'sem.';
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const ref = data.contractNumber || `YM-${Date.now().toString(36).toUpperCase()}`;

  return (
    <View style={{ backgroundColor: '#FFFFFF', width: 320, padding: 20, borderRadius: 4 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#800020' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#800020', letterSpacing: 4 }}>YA MI</Text>
        <Text style={{ fontSize: 10, color: '#888888', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>Relevé de prêt</Text>
      </View>

      {/* Ref */}
      <Text style={{ textAlign: 'center', fontSize: 10, color: '#888888', marginVertical: 8 }}>
        Réf : <Text style={{ fontWeight: 'bold', color: '#222222' }}>{ref}</Text>
      </Text>

      <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#CFCFCF', marginVertical: 8 }} />

      {/* Prêteur */}
      <Text style={{ fontSize: 9, color: '#888888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>Prêteur</Text>
      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#222222', marginBottom: 8 }}>{data.lenderName}</Text>

      {/* Emprunteur */}
      <Text style={{ fontSize: 9, color: '#888888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>Emprunteur</Text>
      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#222222' }}>{data.borrowerName}</Text>
      {data.borrowerPhone && <Text style={{ fontSize: 11, color: '#888888' }}>{data.borrowerPhone}</Text>}

      {/* Montant */}
      <View style={{ alignItems: 'center', backgroundColor: '#FAF7F2', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 6, padding: 12, marginVertical: 12 }}>
        <Text style={{ fontSize: 9, color: '#888888', textTransform: 'uppercase', letterSpacing: 1 }}>Montant du prêt</Text>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#800020', marginTop: 2 }}>{formatCurrency(data.amount, currency)}</Text>
      </View>

      {/* Détails */}
      <DetailRow label="Taux d'intérêt" value={`${data.interestRate}% / ${unit}`} />
      <DetailRow label="Durée" value={`${data.duration} ${unit}`} />
      <DetailRow label="Intérêts" value={formatCurrency(data.interestAmount, currency)} />
      <DetailRow label="Mensualité" value={formatCurrency(data.monthlyPayment, currency)} />

      {/* Total */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#800020', marginVertical: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#800020' }}>TOTAL À REMBOURSER</Text>
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#800020' }}>{formatCurrency(data.totalRepayment, currency)}</Text>
      </View>

      <DetailRow label="Date de début" value={formatDate(data.startDate)} />
      <DetailRow label="Date de fin" value={formatDate(data.endDate)} />

      {data.notes && (
        <>
          <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#CFCFCF', marginVertical: 8 }} />
          <Text style={{ fontSize: 10, color: '#888888', fontStyle: 'italic' }}>Note : {data.notes}</Text>
        </>
      )}

      {/* Footer */}
      <View style={{ alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#800020' }}>
        <Text style={{ fontSize: 9, color: '#888888', letterSpacing: 1 }}>ACCORD DE CONFIANCE</Text>
        <Text style={{ fontSize: 10, color: '#AAAAAA', marginTop: 4 }}>{date}</Text>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ fontSize: 12, color: '#888888' }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#222222' }}>{value}</Text>
    </View>
  );
}
