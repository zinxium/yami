import ExcelJS from 'exceljs';
import { prisma } from '../../config/prisma';

const BURGUNDY_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF800020' },
};
const WHITE_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
const HEADER_ALIGNMENT: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };

export async function generateExcel(userId: string): Promise<ExcelJS.Buffer> {
  const loans = await prisma.loan.findMany({
    where: { user_id: userId },
    include: { borrower: true, payments: { orderBy: { payment_date: 'asc' } } },
    orderBy: { created_at: 'desc' },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ya Mi';
  workbook.created = new Date();

  // --- Feuille 1 : Prêts ---
  const loansSheet = workbook.addWorksheet('Prêts');
  loansSheet.columns = [
    { header: 'Emprunteur', key: 'borrower', width: 22 },
    { header: 'Montant', key: 'amount', width: 15 },
    { header: 'Taux (%)', key: 'rate', width: 10 },
    { header: 'Durée', key: 'duration', width: 12 },
    { header: 'Intérêts', key: 'interest', width: 15 },
    { header: 'Mensualité', key: 'monthly', width: 15 },
    { header: 'Total', key: 'total', width: 15 },
    { header: 'Solde restant', key: 'remaining', width: 15 },
    { header: 'Statut', key: 'status', width: 12 },
    { header: 'Début', key: 'start', width: 14 },
    { header: 'Fin', key: 'end', width: 14 },
  ];

  // Style header
  loansSheet.getRow(1).eachCell((cell) => {
    cell.fill = BURGUNDY_FILL;
    cell.font = WHITE_FONT;
    cell.alignment = HEADER_ALIGNMENT;
  });

  loans.forEach((loan, i) => {
    const amount = Number(loan.amount);
    const total = Number(loan.total_repayment);
    const row = loansSheet.addRow({
      borrower: loan.borrower.fullname,
      amount,
      rate: Number(loan.interest_rate),
      duration: `${loan.duration} ${loan.duration_unit === 'months' ? 'mois' : 'sem.'}`,
      interest: total - amount,
      monthly: Number(loan.monthly_payment),
      total,
      remaining: Number(loan.remaining_balance),
      status: loan.status,
      start: loan.start_date.toLocaleDateString('fr-FR'),
      end: loan.end_date.toLocaleDateString('fr-FR'),
    });

    // Alternance de couleurs
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      });
    }
  });

  // --- Feuille 2 : Paiements ---
  const paymentsSheet = workbook.addWorksheet('Paiements');
  paymentsSheet.columns = [
    { header: 'Emprunteur', key: 'borrower', width: 22 },
    { header: 'Montant payé', key: 'amount', width: 15 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Méthode', key: 'method', width: 18 },
    { header: 'Notes', key: 'notes', width: 25 },
  ];

  paymentsSheet.getRow(1).eachCell((cell) => {
    cell.fill = BURGUNDY_FILL;
    cell.font = WHITE_FONT;
    cell.alignment = HEADER_ALIGNMENT;
  });

  let paymentIdx = 0;
  loans.forEach((loan) => {
    loan.payments.forEach((payment) => {
      const row = paymentsSheet.addRow({
        borrower: loan.borrower.fullname,
        amount: Number(payment.amount_paid),
        type: payment.payment_type,
        date: payment.payment_date.toLocaleDateString('fr-FR'),
        method: payment.payment_method || '-',
        notes: payment.notes || '-',
      });

      if (paymentIdx % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        });
      }
      paymentIdx++;
    });
  });

  return workbook.xlsx.writeBuffer();
}

function csvEscape(val: string): string {
  if (/[,"\n\r]/.test(val) || /^[=+\-@\t\r]/.test(val)) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

export async function generateCSV(userId: string): Promise<string> {
  const loans = await prisma.loan.findMany({
    where: { user_id: userId },
    include: { borrower: true, payments: { orderBy: { payment_date: 'asc' } } },
    orderBy: { created_at: 'desc' },
  });

  const lines: string[] = [];
  lines.push('Emprunteur,Montant,Taux(%),Durée,Intérêts,Mensualité,Total,Solde restant,Statut,Début,Fin');

  loans.forEach((loan) => {
    const amount = Number(loan.amount);
    const total = Number(loan.total_repayment);
    lines.push([
      csvEscape(loan.borrower.fullname),
      amount,
      Number(loan.interest_rate),
      csvEscape(`${loan.duration} ${loan.duration_unit === 'months' ? 'mois' : 'semaines'}`),
      total - amount,
      Number(loan.monthly_payment),
      total,
      Number(loan.remaining_balance),
      csvEscape(loan.status),
      loan.start_date.toLocaleDateString('fr-FR'),
      loan.end_date.toLocaleDateString('fr-FR'),
    ].join(','));
  });

  return lines.join('\n');
}
