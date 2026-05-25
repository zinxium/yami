import { getSchedule, generateTicket } from '../src/modules/loans/loan.service';

describe('getSchedule', () => {
  it('génère un échéancier mensuel correct', () => {
    const loan = {
      monthly_payment: 10000,
      start_date: new Date('2025-01-01'),
      duration: 3,
      duration_unit: 'months',
      status: 'active',
    };

    const schedule = getSchedule(loan);

    expect(schedule).toHaveLength(3);
    expect(schedule[0].period).toBe(1);
    expect(schedule[0].amount).toBe(10000);
    expect(schedule[1].period).toBe(2);
    expect(schedule[2].period).toBe(3);
  });

  it('génère un échéancier hebdomadaire correct', () => {
    const loan = {
      monthly_payment: 5000,
      start_date: new Date('2025-06-01'),
      duration: 4,
      duration_unit: 'weeks',
      status: 'active',
    };

    const schedule = getSchedule(loan);

    expect(schedule).toHaveLength(4);
    // Chaque période = 7 jours
    const firstDue = new Date(schedule[0].due_date);
    const secondDue = new Date(schedule[1].due_date);
    const diffDays = (secondDue.getTime() - firstDue.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(7);
  });

  it('marque tout comme paid si le prêt est remboursé', () => {
    const loan = {
      monthly_payment: 10000,
      start_date: new Date('2024-01-01'),
      duration: 3,
      duration_unit: 'months',
      status: 'paid',
    };

    const schedule = getSchedule(loan);
    schedule.forEach(item => {
      expect(item.status).toBe('paid');
    });
  });

  it('marque les échéances passées comme overdue si le prêt est actif', () => {
    const loan = {
      monthly_payment: 10000,
      start_date: new Date('2020-01-01'),
      duration: 3,
      duration_unit: 'months',
      status: 'active',
    };

    const schedule = getSchedule(loan);
    schedule.forEach(item => {
      expect(item.status).toBe('overdue');
    });
  });

  it('marque les échéances futures comme upcoming', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const loan = {
      monthly_payment: 10000,
      start_date: futureDate,
      duration: 3,
      duration_unit: 'months',
      status: 'active',
    };

    const schedule = getSchedule(loan);
    schedule.forEach(item => {
      expect(item.status).toBe('upcoming');
    });
  });

  it('accepte monthly_payment comme string (Prisma Decimal)', () => {
    const loan = {
      monthly_payment: '10000.50',
      start_date: '2025-01-01',
      duration: 2,
      duration_unit: 'months',
      status: 'active',
    };

    const schedule = getSchedule(loan);
    expect(schedule[0].amount).toBeCloseTo(10000.50);
  });
});

describe('generateTicket', () => {
  const baseLoan = {
    amount: 50000,
    total_repayment: 65000,
    monthly_payment: 10833,
    interest_rate: 5,
    start_date: new Date('2025-01-01'),
    end_date: new Date('2025-07-01'),
    duration: 6,
    duration_unit: 'months',
    currency: 'FCFA',
    borrower: { fullname: 'Amadou Diallo' },
  };

  it('contient le nom de l\'emprunteur', () => {
    const ticket = generateTicket(baseLoan);
    expect(ticket).toContain('Amadou Diallo');
  });

  it('contient le montant formaté', () => {
    const ticket = generateTicket(baseLoan);
    expect(ticket).toContain('FCFA');
  });

  it('contient le taux d\'intérêt', () => {
    const ticket = generateTicket(baseLoan);
    expect(ticket).toContain('5%');
  });

  it('contient la durée en mois', () => {
    const ticket = generateTicket(baseLoan);
    expect(ticket).toContain('6 mois');
  });

  it('affiche la durée en semaines quand applicable', () => {
    const weeklyLoan = { ...baseLoan, duration_unit: 'weeks', duration: 4 };
    const ticket = generateTicket(weeklyLoan);
    expect(ticket).toContain('4 semaines');
  });

  it('gère l\'absence d\'emprunteur', () => {
    const loanNoBorrower = { ...baseLoan, borrower: null };
    const ticket = generateTicket(loanNoBorrower);
    expect(ticket).toContain('N/A');
  });

  it('contient le header Ya Mi', () => {
    const ticket = generateTicket(baseLoan);
    expect(ticket).toContain('RÉCAPITULATIF DU PRÊT');
    expect(ticket).toContain('Généré par Ya Mi');
  });

  it('accepte les valeurs Prisma Decimal (string)', () => {
    const decimalLoan = {
      ...baseLoan,
      amount: '50000',
      total_repayment: '65000',
      monthly_payment: '10833',
      interest_rate: '5',
    };
    const ticket = generateTicket(decimalLoan);
    expect(ticket).toContain('5%');
  });
});
