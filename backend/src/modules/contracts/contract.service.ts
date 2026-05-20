import { prisma } from '../../config/prisma';
import { generateContractNumber } from '../../utils/loan.calculator';
import { generateContractPDF } from './pdf.generator';
import { uploadPDF } from './cloudinary.service';
import { getSchedule } from '../loans/loan.service';

export async function generate(userId: string, loanId: string) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
    include: { borrower: true, user: true },
  });
  if (!loan) {
    throw { status: 404, message: 'Prêt introuvable.' };
  }

  const contractNumber = generateContractNumber();
  const schedule = getSchedule(loan);

  const interestAmount = Number(loan.total_repayment) - Number(loan.amount);

  const pdfBuffer = await generateContractPDF({
    contractNumber,
    lender: { fullname: loan.user.fullname, phone: loan.user.phone },
    borrower: {
      fullname: loan.borrower.fullname,
      phone: loan.borrower.phone,
      address: loan.borrower.address,
    },
    amount: Number(loan.amount),
    interestRate: Number(loan.interest_rate),
    duration: loan.duration,
    durationUnit: loan.duration_unit,
    monthlyPayment: Number(loan.monthly_payment),
    totalRepayment: Number(loan.total_repayment),
    interestAmount,
    startDate: loan.start_date,
    endDate: loan.end_date,
    currency: loan.currency,
    schedule,
  });

  // Upload sur Cloudinary
  const pdfUrl = await uploadPDF(pdfBuffer, contractNumber);

  // Créer ou mettre à jour le contrat en base
  const contract = await prisma.contract.upsert({
    where: { loan_id: loanId },
    create: {
      loan_id: loanId,
      contract_number: contractNumber,
      pdf_url: pdfUrl,
    },
    update: {
      pdf_url: pdfUrl,
    },
  });

  return contract;
}

export async function getById(userId: string, contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { loan: true },
  });
  if (!contract) {
    throw { status: 404, message: 'Contrat introuvable.' };
  }
  if (contract.loan.user_id !== userId) {
    throw { status: 403, message: 'Accès refusé.' };
  }
  return contract;
}
