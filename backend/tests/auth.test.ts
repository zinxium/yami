import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '../src/config/prisma';
import * as authService from '../src/modules/auth/auth.service';

const mockUser = {
  id: 'user-123',
  fullname: 'Test User',
  email: 'test@example.com',
  phone: '+22507000000',
  password: '', // Will be set in beforeAll
  created_at: new Date(),
};

beforeAll(async () => {
  mockUser.password = await bcrypt.hash('password123', 12);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth Service - register', () => {
  it('inscription réussie', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: mockUser.id,
      fullname: mockUser.fullname,
      email: mockUser.email,
      phone: mockUser.phone,
      created_at: mockUser.created_at,
    });

    const result = await authService.register({
      fullname: 'Test User',
      email: 'test@example.com',
      phone: '+22507000000',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('échec - email déjà utilisé', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

    await expect(
      authService.register({
        fullname: 'Test User',
        email: 'test@example.com',
        phone: '+22507000001',
        password: 'password123',
      }),
    ).rejects.toEqual({ status: 409, message: 'Cet email est déjà utilisé.' });
  });

  it('échec - téléphone déjà utilisé', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // email check
      .mockResolvedValueOnce(mockUser); // phone check

    await expect(
      authService.register({
        fullname: 'Test User',
        email: 'new@example.com',
        phone: '+22507000000',
        password: 'password123',
      }),
    ).rejects.toEqual({ status: 409, message: 'Ce numéro de téléphone est déjà utilisé.' });
  });
});

describe('Auth Service - login', () => {
  it('connexion réussie', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    // Le mot de passe ne doit pas être retourné
    expect((result.user as Record<string, unknown>).password).toBeUndefined();
  });

  it('échec - utilisateur non trouvé', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    ).rejects.toEqual({ status: 401, message: 'Email ou mot de passe incorrect.' });
  });

  it('échec - mauvais mot de passe', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toEqual({ status: 401, message: 'Email ou mot de passe incorrect.' });
  });
});

describe('Auth Service - refresh', () => {
  it('refresh avec token valide', async () => {
    // D'abord se connecter pour avoir un refreshToken
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const loginResult = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const refreshResult = await authService.refresh(loginResult.refreshToken);

    expect(refreshResult.accessToken).toBeDefined();
  });

  it('échec - token invalide', async () => {
    await expect(authService.refresh('invalid-token')).rejects.toEqual({
      status: 401,
      message: 'Refresh token invalide ou expiré.',
    });
  });
});

describe('Auth Service - forgotPassword', () => {
  it('retourne un message générique', async () => {
    const result = await authService.forgotPassword('test@example.com');
    expect(result.message).toContain('lien de réinitialisation');
  });
});
