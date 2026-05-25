import { calculateLoan, generateContractNumber } from '../src/utils/loan.calculator';

describe('calculateLoan', () => {
  it('calcule correctement 50 000 FCFA à 5% sur 6 mois', () => {
    const result = calculateLoan({
      amount: 50000,
      interestRate: 5,
      duration: 6,
      durationUnit: 'months',
      startDate: new Date('2025-01-01'),
    });

    // interestAmount = 50000 * 0.05 * 6 = 15000
    expect(result.interestAmount).toBe(15000);
    // totalRepayment = 50000 + 15000 = 65000
    expect(result.totalRepayment).toBe(65000);
    // periodPayment = 65000 / 6 ≈ 10833.33
    expect(result.periodPayment).toBeCloseTo(10833.33, 0);
    // endDate = 2025-07-01
    expect(result.endDate.getMonth()).toBe(6); // juillet = 6
    expect(result.endDate.getFullYear()).toBe(2025);
  });

  it('calcule correctement 100 000 FCFA à 3% sur 12 mois', () => {
    const result = calculateLoan({
      amount: 100000,
      interestRate: 3,
      duration: 12,
      durationUnit: 'months',
      startDate: new Date('2025-01-01'),
    });

    // interestAmount = 100000 * 0.03 * 12 = 36000
    expect(result.interestAmount).toBe(36000);
    // totalRepayment = 100000 + 36000 = 136000
    expect(result.totalRepayment).toBe(136000);
    // periodPayment = 136000 / 12 ≈ 11333.33
    expect(result.periodPayment).toBeCloseTo(11333.33, 0);
    // endDate = 2026-01-01
    expect(result.endDate.getFullYear()).toBe(2026);
    expect(result.endDate.getMonth()).toBe(0);
  });

  it('calcule correctement en semaines', () => {
    const result = calculateLoan({
      amount: 20000,
      interestRate: 2,
      duration: 4,
      durationUnit: 'weeks',
      startDate: new Date('2025-03-01'),
    });

    // interestAmount = 20000 * 0.02 * 4 = 1600
    expect(result.interestAmount).toBe(1600);
    expect(result.totalRepayment).toBe(21600);
    expect(result.periodPayment).toBe(5400);
    // endDate = 2025-03-01 + 4*7 jours = 2025-03-29
    expect(result.endDate.getDate()).toBe(29);
    expect(result.endDate.getMonth()).toBe(2); // mars
  });

  it('gère un taux à 0%', () => {
    const result = calculateLoan({
      amount: 10000,
      interestRate: 0,
      duration: 5,
      durationUnit: 'months',
      startDate: new Date('2025-01-01'),
    });

    expect(result.interestAmount).toBe(0);
    expect(result.totalRepayment).toBe(10000);
    expect(result.periodPayment).toBe(2000);
  });
});

describe('generateContractNumber', () => {
  it('retourne un numéro au format YM-YYYYMM-XXXX', () => {
    const contractNumber = generateContractNumber();
    expect(contractNumber).toMatch(/^YM-\d{6}-\d{4}$/);
  });

  it('contient l\'année et le mois actuels', () => {
    const contractNumber = generateContractNumber();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    expect(contractNumber).toContain(`YM-${year}${month}`);
  });

  it('génère des numéros différents', () => {
    const numbers = new Set(Array.from({ length: 20 }, () => generateContractNumber()));
    // Avec 4 chiffres aléatoires, 20 appels devraient donner des résultats presque tous différents
    expect(numbers.size).toBeGreaterThanOrEqual(15);
  });
});
