import { prisma } from '../../config/prisma';
import { CreateBorrowerInput, UpdateBorrowerInput } from './borrower.schema';

export async function getAll(userId: string) {
  return prisma.borrower.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { loans: true } } },
  });
}

export async function getById(userId: string, borrowerId: string) {
  const borrower = await prisma.borrower.findFirst({
    where: { id: borrowerId, user_id: userId },
    include: { loans: { orderBy: { created_at: 'desc' } } },
  });
  if (!borrower) {
    throw { status: 404, message: 'Emprunteur introuvable.' };
  }
  return borrower;
}

export async function create(userId: string, data: CreateBorrowerInput) {
  return prisma.borrower.create({
    data: { ...data, user_id: userId },
  });
}

export async function update(userId: string, borrowerId: string, data: UpdateBorrowerInput) {
  const borrower = await prisma.borrower.findFirst({
    where: { id: borrowerId, user_id: userId },
  });
  if (!borrower) {
    throw { status: 404, message: 'Emprunteur introuvable.' };
  }
  return prisma.borrower.update({
    where: { id: borrowerId },
    data,
  });
}

export async function remove(userId: string, borrowerId: string) {
  const borrower = await prisma.borrower.findFirst({
    where: { id: borrowerId, user_id: userId },
  });
  if (!borrower) {
    throw { status: 404, message: 'Emprunteur introuvable.' };
  }
  return prisma.borrower.delete({ where: { id: borrowerId } });
}
