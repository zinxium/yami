import { prisma } from '../../config/prisma';
import * as notificationService from './notification.service';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function checkLoansDaily() {
  const now = new Date();
  console.log(`[CRON] Vérification des prêts — ${now.toISOString()}`);

  // Rappel J-3
  const in3Days = addDays(now, 3);
  const loansJ3 = await prisma.loan.findMany({
    where: {
      status: 'active',
      end_date: { gte: startOfDay(in3Days), lte: endOfDay(in3Days) },
    },
    include: { borrower: true },
  });
  for (const loan of loansJ3) {
    await notificationService.sendReminder(loan.user_id, loan, 3);
  }
  if (loansJ3.length) console.log(`[CRON] ${loansJ3.length} rappel(s) J-3 envoyé(s)`);

  // Rappel J-1
  const in1Day = addDays(now, 1);
  const loansJ1 = await prisma.loan.findMany({
    where: {
      status: 'active',
      end_date: { gte: startOfDay(in1Day), lte: endOfDay(in1Day) },
    },
    include: { borrower: true },
  });
  for (const loan of loansJ1) {
    await notificationService.sendReminder(loan.user_id, loan, 1);
  }
  if (loansJ1.length) console.log(`[CRON] ${loansJ1.length} rappel(s) J-1 envoyé(s)`);

  // Prêts en retard
  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: 'active',
      end_date: { lt: startOfDay(now) },
    },
    include: { borrower: true },
  });
  for (const loan of overdueLoans) {
    await prisma.loan.update({ where: { id: loan.id }, data: { status: 'overdue' } });
    await notificationService.sendOverdue(loan.user_id, loan);
  }
  if (overdueLoans.length) console.log(`[CRON] ${overdueLoans.length} prêt(s) passé(s) en retard`);

  console.log('[CRON] Vérification terminée.');
}
