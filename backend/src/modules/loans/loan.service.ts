import { prisma } from '../../config/prisma';
import { calculateLoan, generateContractNumber } from '../../utils/loan.calculator';
import { CreateLoanInput, UpdateLoanInput } from './loan.schema';
import { DurationUnit, LoanStatus } from '@prisma/client';

export async function getAll(userId: string, filters?: { status?: string; search?: string }) {
  const where: any = { user_id: userId };

  if (filters?.status && ['active', 'paid', 'overdue'].includes(filters.status)) {
    where.status = filters.status as LoanStatus;
  }

  if (filters?.search) {
    where.borrower = { fullname: { contains: filters.search, mode: 'insensitive' } };
  }

  return prisma.loan.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: { borrower: true },
  });
}

export async function getById(userId: string, loanId: string) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
    include: { borrower: true, payments: { orderBy: { payment_date: 'desc' } }, contract: true },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }
  return loan;
}

export async function create(userId: string, data: CreateLoanInput) {
  // Vérifier que l'emprunteur appartient à l'utilisateur
  const borrower = await prisma.borrower.findFirst({
    where: { id: data.borrower_id, user_id: userId },
  });
  if (!borrower) {
    throw { status: 404, message: 'Emprunteur introuvable.' };
  }

  const calc = calculateLoan({
    amount: data.amount,
    interestRate: data.interest_rate,
    duration: data.duration,
    durationUnit: data.duration_unit as DurationUnit,
    startDate: data.start_date,
  });

  return prisma.loan.create({
    data: {
      user_id: userId,
      borrower_id: data.borrower_id,
      amount: data.amount,
      interest_rate: data.interest_rate,
      duration: data.duration,
      duration_unit: data.duration_unit as DurationUnit,
      monthly_payment: calc.periodPayment,
      total_repayment: calc.totalRepayment,
      remaining_balance: calc.totalRepayment,
      start_date: data.start_date,
      end_date: calc.endDate,
      notes: data.notes,
    },
    include: { borrower: true },
  });
}

export async function update(userId: string, loanId: string, data: UpdateLoanInput) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }

  const updateData: any = { ...data };

  // Recalculer si montant, taux ou durée changent
  const needsRecalc = data.amount || data.interest_rate || data.duration || data.duration_unit || data.start_date;
  if (needsRecalc) {
    const calc = calculateLoan({
      amount: data.amount ?? Number(loan.amount),
      interestRate: data.interest_rate ?? Number(loan.interest_rate),
      duration: data.duration ?? loan.duration,
      durationUnit: (data.duration_unit ?? loan.duration_unit) as DurationUnit,
      startDate: data.start_date ?? loan.start_date,
    });
    updateData.monthly_payment = calc.periodPayment;
    updateData.total_repayment = calc.totalRepayment;
    updateData.remaining_balance = calc.totalRepayment;
    updateData.end_date = calc.endDate;
  }

  return prisma.loan.update({
    where: { id: loanId },
    data: updateData,
    include: { borrower: true },
  });
}

export async function remove(userId: string, loanId: string) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }
  return prisma.loan.delete({ where: { id: loanId } });
}

export async function markAsPaid(userId: string, loanId: string) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }
  return prisma.loan.update({
    where: { id: loanId },
    data: { status: 'paid', remaining_balance: 0 },
    include: { borrower: true },
  });
}

export function getSchedule(loan: any) {
  const schedule = [];
  const periodPayment = Number(loan.monthly_payment);
  const startDate = new Date(loan.start_date);

  for (let i = 1; i <= loan.duration; i++) {
    const dueDate = new Date(startDate);
    if (loan.duration_unit === 'months') {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else {
      dueDate.setDate(dueDate.getDate() + i * 7);
    }

    const isPast = dueDate < new Date();
    schedule.push({
      period: i,
      due_date: dueDate,
      amount: periodPayment,
      status: loan.status === 'paid' ? 'paid' : isPast ? 'overdue' : 'upcoming',
    });
  }

  return schedule;
}

export function generateTicket(loan: any) {
  const borrowerName = loan.borrower?.fullname || 'N/A';
  const amount = Number(loan.amount).toLocaleString('fr-FR');
  const total = Number(loan.total_repayment).toLocaleString('fr-FR');
  const monthly = Number(loan.monthly_payment).toLocaleString('fr-FR');
  const rate = Number(loan.interest_rate);
  const startDate = new Date(loan.start_date).toLocaleDateString('fr-FR');
  const endDate = new Date(loan.end_date).toLocaleDateString('fr-FR');

  return [
    `📋 *RÉCAPITULATIF DU PRÊT*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 Emprunteur : ${borrowerName}`,
    `💰 Montant prêté : ${amount} ${loan.currency}`,
    `📊 Taux d'intérêt : ${rate}%`,
    `📅 Durée : ${loan.duration} ${loan.duration_unit === 'months' ? 'mois' : 'semaines'}`,
    `💵 Mensualité : ${monthly} ${loan.currency}`,
    `💎 Total à rembourser : ${total} ${loan.currency}`,
    `📆 Début : ${startDate}`,
    `📆 Fin : ${endDate}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `_Généré par Ya Mi_`,
  ].join('\n');
}

export async function checkOverdue() {
  const now = new Date();
  const result = await prisma.loan.updateMany({
    where: {
      status: 'active',
      end_date: { lt: now },
    },
    data: { status: 'overdue' },
  });
  return result.count;
}
