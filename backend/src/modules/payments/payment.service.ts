import { prisma } from '../../config/prisma';
import { LoanStatus } from '@prisma/client';
import { CreatePaymentInput } from './payment.schema';

export async function getByLoan(userId: string, loanId: string) {
  // Vérifier ownership du prêt
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }

  return prisma.payment.findMany({
    where: { loan_id: loanId },
    orderBy: { payment_date: 'desc' },
  });
}

export async function create(userId: string, data: CreatePaymentInput) {
  // Vérifier ownership du prêt
  const loan = await prisma.loan.findFirst({
    where: { id: data.loan_id, user_id: userId },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }

  // Créer le paiement
  const payment = await prisma.payment.create({
    data: {
      loan_id: data.loan_id,
      amount_paid: data.amount_paid,
      payment_type: data.payment_type,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      notes: data.notes,
    },
  });

  // Mettre à jour le solde restant
  const newBalance = Number(loan.remaining_balance) - data.amount_paid;
  const updateData: { remaining_balance: number; status?: LoanStatus } = {
    remaining_balance: Math.max(0, newBalance),
  };

  // Si solde <= 0, passer à paid
  if (newBalance <= 0) {
    updateData.status = 'paid';
    updateData.remaining_balance = 0;
  }

  await prisma.loan.update({
    where: { id: data.loan_id },
    data: updateData,
  });

  return payment;
}

export async function remove(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { loan: true },
  });
  if (!payment) {
    throw { status: 404, message: 'Paiement introuvable.' };
  }
  if (payment.loan.user_id !== userId) {
    throw { status: 403, message: 'Accès refusé.' };
  }

  // Supprimer le paiement
  await prisma.payment.delete({ where: { id: paymentId } });

  // Recalculer le solde restant
  const remainingPayments = await prisma.payment.findMany({
    where: { loan_id: payment.loan_id },
  });
  const totalPaid = remainingPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const totalRepayment = Number(payment.loan.total_repayment);
  const newBalance = Math.max(0, totalRepayment - totalPaid);

  await prisma.loan.update({
    where: { id: payment.loan_id },
    data: {
      remaining_balance: newBalance,
      status: newBalance <= 0 ? 'paid' : 'active',
    },
  });

  return { message: 'Paiement supprimé, solde recalculé.' };
}
