import { PrismaClient, DurationUnit, LoanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateLoan } from '../utils/loan.calculator';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // --- User de test ---
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@yami.com' },
    update: {},
    create: {
      fullname: 'Cynthia Test',
      email: 'test@yami.com',
      phone: '+22501020304',
      password: hashedPassword,
    },
  });
  console.log(`User créé: ${user.fullname} (${user.email})`);

  // --- 2 Emprunteurs ---
  const borrower1 = await prisma.borrower.create({
    data: {
      user_id: user.id,
      fullname: 'Kofi Mensah',
      phone: '+22507080910',
      address: 'Abidjan, Cocody',
      notes: 'Ami de longue date',
    },
  });

  const borrower2 = await prisma.borrower.create({
    data: {
      user_id: user.id,
      fullname: 'Ama Diallo',
      phone: '+22506070809',
      address: 'Abidjan, Plateau',
    },
  });
  console.log(`Emprunteurs créés: ${borrower1.fullname}, ${borrower2.fullname}`);

  // --- 3 Prêts ---
  // Prêt 1 : Actif
  const calc1 = calculateLoan({
    amount: 50000,
    interestRate: 5,
    duration: 6,
    durationUnit: DurationUnit.months,
    startDate: new Date('2025-04-01'),
  });
  const loan1 = await prisma.loan.create({
    data: {
      user_id: user.id,
      borrower_id: borrower1.id,
      amount: 50000,
      interest_rate: 5,
      duration: 6,
      duration_unit: DurationUnit.months,
      monthly_payment: calc1.periodPayment,
      total_repayment: calc1.totalRepayment,
      remaining_balance: calc1.totalRepayment,
      start_date: new Date('2025-04-01'),
      end_date: calc1.endDate,
      status: LoanStatus.active,
      notes: 'Prêt pour achat matériel',
    },
  });

  // Prêt 2 : Remboursé
  const calc2 = calculateLoan({
    amount: 30000,
    interestRate: 3,
    duration: 3,
    durationUnit: DurationUnit.months,
    startDate: new Date('2025-01-15'),
  });
  const loan2 = await prisma.loan.create({
    data: {
      user_id: user.id,
      borrower_id: borrower2.id,
      amount: 30000,
      interest_rate: 3,
      duration: 3,
      duration_unit: DurationUnit.months,
      monthly_payment: calc2.periodPayment,
      total_repayment: calc2.totalRepayment,
      remaining_balance: 0,
      start_date: new Date('2025-01-15'),
      end_date: calc2.endDate,
      status: LoanStatus.paid,
      notes: 'Remboursé intégralement',
    },
  });

  // Prêt 3 : En retard
  const calc3 = calculateLoan({
    amount: 100000,
    interestRate: 4,
    duration: 12,
    durationUnit: DurationUnit.months,
    startDate: new Date('2024-06-01'),
  });
  const loan3 = await prisma.loan.create({
    data: {
      user_id: user.id,
      borrower_id: borrower1.id,
      amount: 100000,
      interest_rate: 4,
      duration: 12,
      duration_unit: DurationUnit.months,
      monthly_payment: calc3.periodPayment,
      total_repayment: calc3.totalRepayment,
      remaining_balance: calc3.totalRepayment * 0.6,
      start_date: new Date('2024-06-01'),
      end_date: calc3.endDate,
      status: LoanStatus.overdue,
      notes: 'Retard de paiement',
    },
  });

  console.log(`Prêts créés: actif(${loan1.id}), remboursé(${loan2.id}), retard(${loan3.id})`);

  // --- Paiements pour le prêt remboursé ---
  await prisma.payment.createMany({
    data: [
      {
        loan_id: loan2.id,
        amount_paid: calc2.periodPayment,
        payment_type: 'partial',
        payment_date: new Date('2025-02-15'),
        payment_method: 'MTN MoMo',
      },
      {
        loan_id: loan2.id,
        amount_paid: calc2.periodPayment,
        payment_type: 'partial',
        payment_date: new Date('2025-03-15'),
        payment_method: 'Orange Money',
      },
      {
        loan_id: loan2.id,
        amount_paid: calc2.periodPayment,
        payment_type: 'full',
        payment_date: new Date('2025-04-15'),
        payment_method: 'Cash',
      },
    ],
  });
  console.log('Paiements seed créés.');

  console.log('\nSeed terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
