import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import borrowerRoutes from './modules/borrowers/borrower.routes';
import loanRoutes from './modules/loans/loan.routes';
import paymentRoutes from './modules/payments/payment.routes';
import contractRoutes from './modules/contracts/contract.routes';
import reportRoutes from './modules/reports/report.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import { checkLoansDaily } from './modules/notifications/cron.service';
import { globalLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- Trust proxy (Railway, Render, etc.) ---
app.set('trust proxy', 1);

// --- Securite ---
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : (process.env.FRONTEND_URL || 'http://localhost:8081'),
  credentials: true,
}));

// --- Rate limiting ---
app.use(globalLimiter);

// --- Body parser ---
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// --- 404 ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// --- Demarrage ---
app.listen(PORT, () => {
  console.log(`\n  Ya Mi API`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Serveur : http://localhost:${PORT}`);
  console.log(`  Health  : http://localhost:${PORT}/health`);
  console.log(`  Env     : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ─────────────────────────────\n`);

  // Cron: vérification quotidienne à 9h00
  const now = new Date();
  const next9am = new Date(now);
  next9am.setHours(9, 0, 0, 0);
  if (now >= next9am) next9am.setDate(next9am.getDate() + 1);
  const msUntil9 = next9am.getTime() - now.getTime();

  setTimeout(() => {
    checkLoansDaily();
    setInterval(checkLoansDaily, 24 * 60 * 60 * 1000);
  }, msUntil9);
  console.log(`  Cron    : prochain check à ${next9am.toLocaleString('fr-FR')}\n`);
});

export default app;
