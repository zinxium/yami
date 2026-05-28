import { prisma } from '../../config/prisma';
import { generateContractNumber } from '../../utils/loan.calculator';
import { generateContractPDF } from './pdf.generator';
import { uploadPDF } from './cloudinary.service';
import { getSchedule } from '../loans/loan.service';
import QRCode from 'qrcode';

export async function generate(userId: string, loanId: string) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, user_id: userId },
    include: { borrower: true, user: { select: { fullname: true, phone: true } } },
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

  // Générer le QR code en data URI pour stockage
  let qrCode: string | null = null;
  try {
    qrCode = await QRCode.toDataURL(JSON.stringify({
      contract: contractNumber,
      borrower: loan.borrower.fullname,
      amount: Number(loan.amount),
      total: Number(loan.total_repayment),
      currency: loan.currency,
    }), { width: 200, margin: 1 });
  } catch {
    // Continue without QR
  }

  // Créer ou mettre à jour le contrat en base
  const contract = await prisma.contract.upsert({
    where: { loan_id: loanId },
    create: {
      loan_id: loanId,
      contract_number: contractNumber,
      pdf_url: pdfUrl,
      qr_code: qrCode,
    },
    update: {
      pdf_url: pdfUrl,
      qr_code: qrCode,
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

export async function sign(userId: string, contractId: string) {
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
  if (contract.signed) {
    throw { status: 400, message: 'Ce contrat est déjà signé.' };
  }

  return prisma.contract.update({
    where: { id: contractId },
    data: { signed: true },
  });
}

export async function verify(contractNumber: string) {
  const contract = await prisma.contract.findUnique({
    where: { contract_number: contractNumber },
    include: {
      loan: {
        include: { borrower: { select: { fullname: true } } },
      },
    },
  });
  if (!contract) {
    throw { status: 404, message: 'Contrat introuvable.' };
  }

  return {
    contract_number: contract.contract_number,
    signed: contract.signed,
    created_at: contract.created_at,
    borrower: contract.loan.borrower.fullname,
    amount: Number(contract.loan.amount),
    currency: contract.loan.currency,
    total_repayment: Number(contract.loan.total_repayment),
  };
}

export async function getByLoanId(userId: string, loanId: string) {
  const contract = await prisma.contract.findUnique({
    where: { loan_id: loanId },
    include: { loan: true },
  });
  if (!contract) {
    return null;
  }
  if (contract.loan.user_id !== userId) {
    throw { status: 403, message: 'Accès refusé.' };
  }
  return contract;
}
