import request from 'supertest';
import app from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Nettoyer la base de données avant les tests
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Fermer la connexion Prisma après les tests
  await prisma.$disconnect();
});

describe('Auth Routes', () => {
  test('POST /api/auth/signup - Inscription réussie', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('POST /api/auth/login - Connexion réussie', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('POST /api/auth/login - Échec de connexion (mauvais mot de passe)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Mot de passe incorrect.');
  });

  test('POST /api/auth/login - Échec de connexion (utilisateur non trouvé)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Utilisateur non trouvé.');
  });
});