/**
 * Tests unitaires pour les interfaces de notification.service.
 * On vérifie que les fonctions acceptent les bons types de paramètres
 * sans toucher la base de données (mock Prisma).
 */

// Mock prisma et firebase avant l'import
jest.mock('../src/config/prisma', () => ({
  prisma: {
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1', type: 'created', title: 'Test', message: 'Test msg' }),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: 'notif-1', read: true }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

jest.mock('../src/config/firebase', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(undefined),
}));

import { sendLoanCreated, sendPaymentConfirmed, sendReminder, sendOverdue, getAll, markAsRead } from '../src/modules/notifications/notification.service';
import { prisma } from '../src/config/prisma';

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLoan = {
    id: 'loan-123',
    amount: 50000,
    currency: 'FCFA',
    borrower: { fullname: 'Amadou Diallo' },
  };

  describe('sendLoanCreated', () => {
    it('crée une notification de type created', async () => {
      await sendLoanCreated('user-1', mockLoan);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 'user-1',
          loan_id: 'loan-123',
          type: 'created',
          title: 'Nouveau prêt créé',
        }),
      });
    });

    it('inclut le nom de l\'emprunteur dans le message', async () => {
      await sendLoanCreated('user-1', mockLoan);

      const call = (prisma.notification.create as jest.Mock).mock.calls[0][0];
      expect(call.data.message).toContain('Amadou Diallo');
    });

    it('gère un emprunteur sans nom', async () => {
      const loanNoBorrower = { ...mockLoan, borrower: null };
      await sendLoanCreated('user-1', loanNoBorrower);

      const call = (prisma.notification.create as jest.Mock).mock.calls[0][0];
      expect(call.data.message).toContain('un emprunteur');
    });
  });

  describe('sendPaymentConfirmed', () => {
    it('crée une notification de type payment', async () => {
      await sendPaymentConfirmed('user-1', mockLoan, 10000);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'payment',
          title: 'Paiement reçu',
        }),
      });
    });

    it('inclut le montant dans le message', async () => {
      await sendPaymentConfirmed('user-1', mockLoan, 10000);

      const call = (prisma.notification.create as jest.Mock).mock.calls[0][0];
      expect(call.data.message).toContain('FCFA');
    });
  });

  describe('sendReminder', () => {
    it('crée une notification de type reminder', async () => {
      await sendReminder('user-1', mockLoan, 3);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'reminder',
          title: 'Échéance dans 3 jour(s)',
        }),
      });
    });
  });

  describe('sendOverdue', () => {
    it('crée une notification de type overdue', async () => {
      await sendOverdue('user-1', mockLoan);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'overdue',
          title: 'Prêt en retard',
        }),
      });
    });
  });

  describe('getAll', () => {
    it('appelle prisma avec le bon userId', async () => {
      await getAll('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        orderBy: { sent_at: 'desc' },
        take: 50,
      });
    });
  });

  describe('markAsRead', () => {
    it('throw quand la notification n\'existe pas', async () => {
      (prisma.notification.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(markAsRead('user-1', 'notif-unknown')).rejects.toEqual({
        status: 404,
        message: 'Notification introuvable.',
      });
    });

    it('met à jour la notification quand elle existe', async () => {
      (prisma.notification.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'notif-1', user_id: 'user-1' });

      await markAsRead('user-1', 'notif-1');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { read: true },
      });
    });
  });
});
