import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency, formatDate } from '../utils/format';

export interface TicketData {
  contractNumber?: string;
  lenderName: string;
  borrowerName: string;
  borrowerPhone?: string;
  amount: number;
  interestRate: number;
  duration: number;
  durationUnit: string;
  totalRepayment: number;
  monthlyPayment: number;
  interestAmount: number;
  startDate: string;
  endDate: string;
  currency?: string;
  notes?: string;
}

export function generateTicketHTML(data: TicketData): string {
  const currency = data.currency || 'XOF';
  const unit = data.durationUnit === 'months' ? 'mois' : 'sem.';
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const ref = data.contractNumber || `YM-${Date.now().toString(36).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 300px;
      margin: 0 auto;
      padding: 20px 16px;
      background: #FFFFFF;
      color: #222222;
    }
    .header {
      text-align: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #800020;
    }
    .logo-text {
      font-size: 22px;
      font-weight: bold;
      color: #800020;
      letter-spacing: 4px;
    }
    .subtitle {
      font-size: 9px;
      color: #888888;
      margin-top: 2px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .divider {
      border: none;
      border-top: 1px dashed #CFCFCF;
      margin: 10px 0;
    }
    .ref-line {
      text-align: center;
      font-size: 9px;
      color: #888888;
      margin: 8px 0;
    }
    .ref-line strong { color: #222222; }
    .section-title {
      font-size: 8px;
      color: #888888;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .person-name {
      font-size: 13px;
      font-weight: bold;
      color: #222222;
    }
    .person-detail {
      font-size: 10px;
      color: #888888;
    }
    .amount-box {
      text-align: center;
      background: #FAF7F2;
      border: 1px solid #E8E4DC;
      border-radius: 6px;
      padding: 12px 8px;
      margin: 10px 0;
    }
    .amount-label {
      font-size: 8px;
      color: #888888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .amount-value {
      font-size: 24px;
      font-weight: bold;
      color: #800020;
      margin-top: 2px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11px;
    }
    .detail-label { color: #888888; }
    .detail-value { font-weight: bold; color: #222222; text-align: right; }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      font-weight: bold;
      border-top: 1px solid #800020;
      border-bottom: 1px solid #800020;
      margin: 6px 0;
    }
    .total-row .detail-label { color: #800020; font-weight: bold; }
    .total-row .detail-value { color: #800020; }
    .notes {
      font-size: 9px;
      color: #888888;
      font-style: italic;
      padding: 6px 0;
    }
    .footer {
      text-align: center;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 2px solid #800020;
    }
    .footer-text {
      font-size: 8px;
      color: #888888;
      letter-spacing: 1px;
    }
    .footer-date {
      font-size: 9px;
      color: #AAAAAA;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-text">YA MI</div>
    <div class="subtitle">Relevé de prêt</div>
  </div>

  <div class="ref-line">Réf : <strong>${ref}</strong></div>
  <hr class="divider" />

  <div style="margin-bottom: 8px;">
    <div class="section-title">Prêteur</div>
    <div class="person-name">${data.lenderName}</div>
  </div>

  <div style="margin-bottom: 8px;">
    <div class="section-title">Emprunteur</div>
    <div class="person-name">${data.borrowerName}</div>
    ${data.borrowerPhone ? `<div class="person-detail">${data.borrowerPhone}</div>` : ''}
  </div>

  <div class="amount-box">
    <div class="amount-label">Montant du prêt</div>
    <div class="amount-value">${formatCurrency(data.amount, currency)}</div>
  </div>

  <div class="detail-row">
    <span class="detail-label">Taux d'intérêt</span>
    <span class="detail-value">${data.interestRate}% / ${unit}</span>
  </div>
  <div class="detail-row">
    <span class="detail-label">Durée</span>
    <span class="detail-value">${data.duration} ${unit}</span>
  </div>
  <div class="detail-row">
    <span class="detail-label">Intérêts</span>
    <span class="detail-value">${formatCurrency(data.interestAmount, currency)}</span>
  </div>
  <div class="detail-row">
    <span class="detail-label">Mensualité</span>
    <span class="detail-value">${formatCurrency(data.monthlyPayment, currency)}</span>
  </div>

  <div class="total-row">
    <span class="detail-label">TOTAL À REMBOURSER</span>
    <span class="detail-value">${formatCurrency(data.totalRepayment, currency)}</span>
  </div>

  <div class="detail-row">
    <span class="detail-label">Date de début</span>
    <span class="detail-value">${formatDate(data.startDate)}</span>
  </div>
  <div class="detail-row">
    <span class="detail-label">Date de fin</span>
    <span class="detail-value">${formatDate(data.endDate)}</span>
  </div>

  ${data.notes ? `<hr class="divider" /><div class="notes">Note : ${data.notes}</div>` : ''}

  <div class="footer">
    <div class="footer-text">ACCORD DE CONFIANCE</div>
    <div class="footer-date">${date}</div>
  </div>
</body>
</html>`;
}

export async function shareTicketAsPDF(data: TicketData): Promise<void> {
  const html = generateTicketHTML(data);
  const { uri } = await printToFileAsync({ html, width: 300 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Partager le ticket (PDF)',
      UTI: 'com.adobe.pdf',
    });
  }
}
