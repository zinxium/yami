import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthPayload } from '../../types';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET environment variable is required');
const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export async function register(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw { status: 409, message: 'Cet email est déjà utilisé.' };
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existingPhone) {
    throw { status: 409, message: 'Ce numéro de téléphone est déjà utilisé.' };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
    },
    select: { id: true, fullname: true, email: true, phone: true, created_at: true },
  });

  const payload: AuthPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw { status: 401, message: 'Email ou mot de passe incorrect.' };
  }

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    throw { status: 401, message: 'Email ou mot de passe incorrect.' };
  }

  const payload: AuthPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const { password: _, fcm_token: __, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as unknown as AuthPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw { status: 401, message: 'Utilisateur introuvable.' };
    }

    const payload: AuthPayload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(payload);
    return { accessToken: newAccessToken };
  } catch {
    throw { status: 401, message: 'Refresh token invalide ou expiré.' };
  }
}

export async function forgotPassword(_email: string) {
  // Placeholder — à implémenter avec un service email
  return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
}
