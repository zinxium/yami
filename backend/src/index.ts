import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- Securite ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));

// --- Rate limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requetes, reessaie dans 15 minutes.' },
});
app.use(limiter);

// --- Body parser ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Ya Mi API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);

// TODO: importer les routes
// app.use('/api/borrowers', borrowerRoutes);
// app.use('/api/loans', loanRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/contracts', contractRoutes);
// app.use('/api/reports', reportRoutes);

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
});

export default app;
