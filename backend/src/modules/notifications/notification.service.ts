import { prisma } from '../../config/prisma';
import { sendPushNotification } from '../../config/firebase';
import { NotificationType } from '@prisma/client';

export async function send(
  userId: string,
  loanId: string | null,
  type: NotificationType,
  title: string,
  message: string,
) {
  // Sauvegarder en base
  const notification = await prisma.notification.create({
    data: { user_id: userId, loan_id: loanId, type, title, message },
  });

  // Envoyer push si FCM token disponible
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.fcm_token) {
    await sendPushNotification(user.fcm_token, title, message, {
      type,
      loan_id: loanId || '',
      notification_id: notification.id,
    });
  }

  return notification;
}

export async function getAll(userId: string) {
  return prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { sent_at: 'desc' },
    take: 50,
  });
}

export async function markAsRead(userId: string, notifId: string) {
  const notif = await prisma.notification.findFirst({
    where: { id: notifId, user_id: userId },
  });
  if (!notif) {
    throw { status: 404, message: 'Notification introuvable.' };
  }
  return prisma.notification.update({
    where: { id: notifId },
    data: { read: true },
  });
}

interface LoanForNotification {
  id: string;
  amount: number | string;
  currency: string;
  borrower?: { fullname: string } | null;
}

export async function sendLoanCreated(userId: string, loan: LoanForNotification) {
  const borrowerName = loan.borrower?.fullname || 'un emprunteur';
  const amount = Number(loan.amount).toLocaleString('fr-FR');
  return send(
    userId,
    loan.id,
    'created',
    'Nouveau prêt créé',
    `Prêt de ${amount} ${loan.currency} à ${borrowerName} enregistré.`,
  );
}

export async function sendPaymentConfirmed(userId: string, loan: LoanForNotification, amountPaid: number) {
  const borrowerName = loan.borrower?.fullname || 'un emprunteur';
  const fmt = amountPaid.toLocaleString('fr-FR');
  return send(
    userId,
    loan.id,
    'payment',
    'Paiement reçu',
    `${fmt} ${loan.currency} reçu de ${borrowerName}.`,
  );
}

export async function sendReminder(userId: string, loan: LoanForNotification, daysLeft: number) {
  const borrowerName = loan.borrower?.fullname || 'un emprunteur';
  return send(
    userId,
    loan.id,
    'reminder',
    `Échéance dans ${daysLeft} jour(s)`,
    `Le prêt à ${borrowerName} arrive à échéance dans ${daysLeft} jour(s).`,
  );
}

export async function sendOverdue(userId: string, loan: LoanForNotification) {
  const borrowerName = loan.borrower?.fullname || 'un emprunteur';
  return send(
    userId,
    loan.id,
    'overdue',
    'Prêt en retard',
    `Le prêt à ${borrowerName} est en retard de paiement.`,
  );
}
