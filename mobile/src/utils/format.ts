export const formatCurrency = (
  amount: number,
  currency: string = 'XOF'
): string => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' ' + currency;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\+\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
};

export const getInitials = (name: string): string => {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
};

export const generateWhatsAppTicket = (loan: {
  borrowerName: string;
  phone?: string;
  amount: number;
  interestRate: number;
  duration: number;
  durationUnit: string;
  totalRepayment: number;
  periodPayment: number;
  interestAmount: number;
  startDate: string;
  endDate: string;
  notes?: string;
  currency?: string;
}): string => {
  const currency = loan.currency || 'FCFA';
  const unit = loan.durationUnit === 'months' ? 'mois' : 'sem.';

  return [
    `*YA MI -- Releve de Pret*`,
    `--------------------`,
    `* ${loan.borrowerName}*`,
    loan.phone ? `Tel: ${loan.phone}` : null,
    `--------------------`,
    `Montant : ${formatCurrency(loan.amount, currency)}`,
    `Taux : ${loan.interestRate}% / ${unit}`,
    `Duree : ${loan.duration} ${unit}`,
    `--------------------`,
    `Interets : ${formatCurrency(loan.interestAmount, currency)}`,
    `/${unit} : ${formatCurrency(loan.periodPayment, currency)}`,
    `*TOTAL : ${formatCurrency(loan.totalRepayment, currency)}*`,
    `--------------------`,
    `Debut : ${formatDate(loan.startDate)}`,
    `Fin : ${formatDate(loan.endDate)}`,
    loan.notes ? `--------------------\nNote: ${loan.notes}` : null,
    `--------------------`,
    `_Accord de confiance entre amis_`,
  ]
    .filter(Boolean)
    .join('\n');
};
