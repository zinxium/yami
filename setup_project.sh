#!/bin/bash

# =============================================================
#  YA MI — Script d'installation complet
#  "Borrow Me" · Yoruba
#  Stack : Node.js + TypeScript + Prisma + React Native + Expo
# =============================================================

set -e

# ─── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log()     { echo -e "${BLUE}[YA MI]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[ERREUR]${NC} $1"; exit 1; }
title()   { echo -e "\n${BOLD}${BLUE}━━━ $1 ━━━${NC}\n"; }

# ─── Bannière ────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  ██╗   ██╗ █████╗     ███╗   ███╗██╗"
echo "  ╚██╗ ██╔╝██╔══██╗    ████╗ ████║██║"
echo "   ╚████╔╝ ███████║    ██╔████╔██║██║"
echo "    ╚██╔╝  ██╔══██║    ██║╚██╔╝██║██║"
echo "     ██║   ██║  ██║    ██║ ╚═╝ ██║██║"
echo "     ╚═╝   ╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝"
echo -e "${NC}"
echo -e "  ${YELLOW}« Borrow Me »${NC} — Yoruba"
echo -e "  Script d'installation — Stack Solo Developer\n"
echo -e "  ─────────────────────────────────────────────\n"

# ─── Détection OS ────────────────────────────────────────────
title "Détection de l'environnement"

OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
  success "Linux détecté"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
  success "macOS détecté"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  OS="windows"
  warn "Windows détecté — utilise Git Bash ou WSL2 de préférence"
else
  warn "OS non reconnu — le script continue mais peut échouer"
fi

# ─── Vérification curl / wget ────────────────────────────────
if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
  error "curl ou wget est requis. Installe curl d'abord."
fi

# ─── 1. Node.js ──────────────────────────────────────────────
title "1. Node.js"

NODE_REQUIRED=20

if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -ge "$NODE_REQUIRED" ]; then
    success "Node.js $(node -v) déjà installé"
  else
    warn "Node.js $(node -v) trop ancien (requis : v${NODE_REQUIRED}+)"
    log "Mise à jour de Node.js via nvm..."
    if command -v nvm &> /dev/null; then
      nvm install 20 && nvm use 20 && nvm alias default 20
      success "Node.js mis à jour via nvm"
    else
      warn "nvm non trouvé. Installe Node.js 20+ manuellement : https://nodejs.org"
    fi
  fi
else
  log "Node.js non trouvé. Installation via nvm..."
  if ! command -v nvm &> /dev/null; then
    log "Installation de nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    success "nvm installé"
  fi
  nvm install 20
  nvm use 20
  nvm alias default 20
  success "Node.js $(node -v) installé"
fi

# ─── 2. npm ──────────────────────────────────────────────────
title "2. npm"

if command -v npm &> /dev/null; then
  success "npm $(npm -v) disponible"
  log "Mise à jour npm..."
  npm install -g npm@latest --silent
  success "npm mis à jour : $(npm -v)"
else
  error "npm introuvable — réinstalle Node.js"
fi

# ─── 3. Git ──────────────────────────────────────────────────
title "3. Git"

if command -v git &> /dev/null; then
  success "Git $(git --version | awk '{print $3}') disponible"
else
  log "Installation de Git..."
  if [ "$OS" = "macos" ]; then
    xcode-select --install 2>/dev/null || true
  elif [ "$OS" = "linux" ]; then
    sudo apt-get update -qq && sudo apt-get install -y git
  fi
  success "Git installé"
fi

# ─── 4. Expo CLI ─────────────────────────────────────────────
title "4. Expo CLI"

if command -v expo &> /dev/null; then
  success "Expo CLI déjà installé : $(expo --version)"
else
  log "Installation d'Expo CLI..."
  npm install -g expo-cli --silent
  success "Expo CLI installé : $(expo --version)"
fi

# ─── 5. EAS CLI (build & deploy Expo) ───────────────────────
title "5. EAS CLI"

if command -v eas &> /dev/null; then
  success "EAS CLI déjà installé"
else
  log "Installation d'EAS CLI..."
  npm install -g eas-cli --silent
  success "EAS CLI installé"
fi

# ─── 6. TypeScript global ────────────────────────────────────
title "6. TypeScript"

if command -v tsc &> /dev/null; then
  success "TypeScript $(tsc --version) déjà installé"
else
  log "Installation de TypeScript..."
  npm install -g typescript --silent
  success "TypeScript installé : $(tsc --version)"
fi

# ─── 7. ts-node-dev ──────────────────────────────────────────
title "7. ts-node-dev"

if command -v ts-node-dev &> /dev/null; then
  success "ts-node-dev déjà installé"
else
  log "Installation de ts-node-dev..."
  npm install -g ts-node-dev --silent
  success "ts-node-dev installé"
fi

# ─── 8. Prisma CLI ───────────────────────────────────────────
title "8. Prisma CLI"

if command -v prisma &> /dev/null; then
  success "Prisma CLI déjà installé"
else
  log "Installation de Prisma CLI..."
  npm install -g prisma --silent
  success "Prisma CLI installé"
fi

# ─── 9. Structure du projet ──────────────────────────────────
title "9. Création de la structure du projet"

ROOT="ya-mi"

if [ -d "$ROOT" ]; then
  warn "Le dossier '$ROOT' existe déjà. Création ignorée."
else
  mkdir -p "$ROOT"
  success "Dossier racine créé : $ROOT/"
fi

cd "$ROOT"

# ─── 10. Initialisation Git ──────────────────────────────────
title "10. Initialisation Git"

if [ ! -d ".git" ]; then
  git init
  success "Dépôt Git initialisé"
else
  success "Git déjà initialisé"
fi

# .gitignore racine
cat > .gitignore << 'EOF'
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Env
.env
.env.local
.env.*.local

# Build
dist/
build/
.next/

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# Expo
.expo/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Prisma
prisma/migrations/

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF
success ".gitignore créé"

# ─── 11. Backend Node.js + TypeScript ────────────────────────
title "11. Backend — Node.js + TypeScript"

mkdir -p backend/src/{config,middleware,modules/{auth,users,borrowers,loans,payments,contracts,notifications,reports},prisma,utils,types}

cd backend

# package.json
cat > package.json << 'EOF'
{
  "name": "ya-mi-backend",
  "version": "1.0.0",
  "description": "Ya Mi API — Gestion de prêts personnels",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node src/prisma/seed.ts"
  },
  "keywords": ["fintech", "loans", "africa"],
  "author": "",
  "license": "UNLICENSED"
}
EOF
success "package.json backend créé"

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
success "tsconfig.json backend créé"

# .env.example
cat > .env.example << 'EOF'
# ─── Base de données ───────────────────────────────────────
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/yami

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET=change_this_to_a_very_long_random_string_min_64_chars
JWT_REFRESH_SECRET=change_this_to_another_very_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── Firebase ─────────────────────────────────────────────
FIREBASE_PROJECT_ID=ya-mi
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@ya-mi.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# ─── Cloudinary ───────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── App ──────────────────────────────────────────────────
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
EOF
success ".env.example backend créé"

# Schéma Prisma
mkdir -p prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String         @id @default(uuid())
  fullname     String
  email        String         @unique
  phone        String         @unique
  password     String
  fcm_token    String?
  created_at   DateTime       @default(now())
  updated_at   DateTime       @updatedAt
  borrowers    Borrower[]
  loans        Loan[]
  notifications Notification[]

  @@map("users")
}

model Borrower {
  id         String   @id @default(uuid())
  user_id    String
  fullname   String
  phone      String?
  address    String?
  notes      String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  loans      Loan[]

  @@map("borrowers")
}

enum DurationUnit {
  months
  weeks
}

enum LoanStatus {
  active
  paid
  overdue
}

model Loan {
  id                String       @id @default(uuid())
  user_id           String
  borrower_id       String
  amount            Decimal      @db.Decimal(15, 2)
  interest_rate     Decimal      @db.Decimal(5, 2)
  duration          Int
  duration_unit     DurationUnit @default(months)
  monthly_payment   Decimal      @db.Decimal(15, 2)
  total_repayment   Decimal      @db.Decimal(15, 2)
  remaining_balance Decimal      @db.Decimal(15, 2)
  currency          String       @default("XOF")
  status            LoanStatus   @default(active)
  start_date        DateTime
  end_date          DateTime
  notes             String?
  created_at        DateTime     @default(now())
  updated_at        DateTime     @updatedAt
  user              User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  borrower          Borrower     @relation(fields: [borrower_id], references: [id])
  payments          Payment[]
  contract          Contract?
  notifications     Notification[]

  @@map("loans")
}

enum PaymentType {
  full
  partial
  advance
}

model Payment {
  id             String      @id @default(uuid())
  loan_id        String
  amount_paid    Decimal     @db.Decimal(15, 2)
  payment_type   PaymentType @default(full)
  payment_date   DateTime
  payment_method String?
  notes          String?
  created_at     DateTime    @default(now())
  loan           Loan        @relation(fields: [loan_id], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Contract {
  id              String   @id @default(uuid())
  loan_id         String   @unique
  contract_number String   @unique
  pdf_url         String?
  qr_code         String?
  signed          Boolean  @default(false)
  created_at      DateTime @default(now())
  loan            Loan     @relation(fields: [loan_id], references: [id], onDelete: Cascade)

  @@map("contracts")
}

enum NotificationType {
  reminder
  overdue
  payment
  created
}

model Notification {
  id         String           @id @default(uuid())
  user_id    String
  loan_id    String?
  type       NotificationType
  title      String
  message    String
  read       Boolean          @default(false)
  sent_at    DateTime         @default(now())
  user       User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  loan       Loan?            @relation(fields: [loan_id], references: [id], onDelete: SetNull)

  @@map("notifications")
}
EOF
success "schema.prisma créé"

# Point d'entrée principal
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Sécurité ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, réessaie dans 15 minutes.' },
});
app.use(limiter);

// ─── Body parser ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Ya Mi API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// TODO: importer les routes
// app.use('/api/auth', authRoutes);
// app.use('/api/borrowers', borrowerRoutes);
// app.use('/api/loans', loanRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/contracts', contractRoutes);
// app.use('/api/reports', reportRoutes);

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// ─── Démarrage ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Ya Mi API`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Serveur : http://localhost:${PORT}`);
  console.log(`  Health  : http://localhost:${PORT}/health`);
  console.log(`  Env     : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ─────────────────────────────\n`);
});

export default app;
EOF
success "src/index.ts créé"

# Prisma client singleton
cat > src/config/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
EOF
success "src/config/prisma.ts créé"

# Types partagés
cat > src/types/index.ts << 'EOF'
import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface LoanCalculation {
  interestAmount: number;
  totalRepayment: number;
  periodPayment: number;
  endDate: Date;
}
EOF
success "src/types/index.ts créé"

# Utilitaire calcul prêt
cat > src/utils/loan.calculator.ts << 'EOF'
import { DurationUnit } from '@prisma/client';

export interface LoanParams {
  amount: number;
  interestRate: number;
  duration: number;
  durationUnit: DurationUnit;
  startDate: Date;
}

export interface LoanResult {
  interestAmount: number;
  totalRepayment: number;
  periodPayment: number;
  endDate: Date;
}

export function calculateLoan(params: LoanParams): LoanResult {
  const { amount, interestRate, duration, durationUnit, startDate } = params;

  const interestAmount = amount * (interestRate / 100) * duration;
  const totalRepayment = amount + interestAmount;
  const periodPayment = totalRepayment / duration;

  const endDate = new Date(startDate);
  if (durationUnit === 'months') {
    endDate.setMonth(endDate.getMonth() + duration);
  } else {
    endDate.setDate(endDate.getDate() + duration * 7);
  }

  return {
    interestAmount: Math.round(interestAmount * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    periodPayment: Math.round(periodPayment * 100) / 100,
    endDate,
  };
}

export function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `YM-${year}${month}-${random}`;
}
EOF
success "src/utils/loan.calculator.ts créé"

# Installation des dépendances backend
log "Installation des dépendances backend..."

npm install \
  express \
  cors \
  helmet \
  express-rate-limit \
  dotenv \
  bcryptjs \
  jsonwebtoken \
  zod \
  @prisma/client \
  pdfkit \
  exceljs \
  firebase-admin \
  cloudinary \
  --silent

npm install -D \
  typescript \
  ts-node-dev \
  @types/express \
  @types/cors \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/node \
  @types/pdfkit \
  prisma \
  --silent

success "Dépendances backend installées"

cd ..

# ─── 12. Mobile React Native + Expo ──────────────────────────
title "12. Mobile — React Native + Expo"

if [ ! -d "mobile" ]; then
  log "Création de l'app Expo avec TypeScript..."
  npx create-expo-app mobile --template blank-typescript --no-install 2>/dev/null || \
  npx create-expo-app@latest mobile --template blank-typescript --no-install
  success "App Expo créée"
else
  warn "Dossier 'mobile' existe déjà — ignoré"
fi

cd mobile

# .env.example mobile
cat > .env.example << 'EOF'
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_APP_NAME=Ya Mi
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF
success ".env.example mobile créé"

# Structure des dossiers src
mkdir -p src/{api,components/{common,loans,payments},screens/{auth,loans,payments,dashboard},navigation,store,hooks,services,utils,types,constants}

# Constantes couleurs Ya Mi
cat > src/constants/colors.ts << 'EOF'
export const Colors = {
  primary:    '#800020',
  secondary:  '#FFDB58',
  tertiary:   '#4D0013',
  neutral:    '#FAF7F2',
  graphite:   '#222222',
  dustGrey:   '#CFCFCF',
  white:      '#FFFFFF',
  black:      '#000000',

  // Variantes
  primaryLight:   '#80002015',
  secondaryLight: '#FFDB5825',
  tertiaryLight:  '#4D001315',

  // Statuts
  success: '#2D6A4F',
  warning: '#7A5F00',
  danger:  '#4D0013',
  info:    '#1A56DB',

  // Textes
  textPrimary:   '#222222',
  textSecondary: '#888888',
  textMuted:     '#AAAAAA',

  // Bordures
  border:      '#CFCFCF',
  borderLight: '#E8E4DC',
} as const;
EOF
success "src/constants/colors.ts créé"

# Constantes typographie
cat > src/constants/typography.ts << 'EOF'
export const Typography = {
  fonts: {
    headline: 'LibreCaslon',
    body:     'PlusJakartaSans',
    label:    'PlusJakartaSans',
    mono:     'SpaceMono',
  },

  sizes: {
    xs:    10,
    sm:    12,
    base:  14,
    md:    15,
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    hero:  40,
  },

  weights: {
    regular: '400',
    medium:  '500',
    bold:    '700',
  },

  lineHeights: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.7,
  },
} as const;
EOF
success "src/constants/typography.ts créé"

# Types partagés mobile
cat > src/types/index.ts << 'EOF'
export interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Borrower {
  id: string;
  user_id: string;
  fullname: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export type DurationUnit = 'months' | 'weeks';
export type LoanStatus   = 'active' | 'paid' | 'overdue';
export type PaymentType  = 'full' | 'partial' | 'advance';

export interface Loan {
  id: string;
  user_id: string;
  borrower_id: string;
  borrower?: Borrower;
  amount: number;
  interest_rate: number;
  duration: number;
  duration_unit: DurationUnit;
  monthly_payment: number;
  total_repayment: number;
  remaining_balance: number;
  currency: string;
  status: LoanStatus;
  start_date: string;
  end_date: string;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  loan_id: string;
  amount_paid: number;
  payment_type: PaymentType;
  payment_date: string;
  payment_method?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
EOF
success "src/types/index.ts créé"

# Client API
cat > src/api/client.ts << 'EOF'
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('access_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur réseau');
  }

  return response.json();
}

export const api = {
  get:    <T>(url: string)                  => request<T>(url),
  post:   <T>(url: string, body: unknown)   => request<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown)   => request<T>(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(url: string)                  => request<T>(url, { method: 'DELETE' }),
};
EOF
success "src/api/client.ts créé"

# Utilitaire formatage
cat > src/utils/format.ts << 'EOF'
export const formatCurrency = (
  amount: number,
  currency: string = 'XOF'
): string => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' ' + currency;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\+\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
};

export const getInitials = (name: string): string => {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
};

export const generateWhatsAppTicket = (loan: {
  borrowerName: string;
  phone?: string;
  amount: number;
  interestRate: number;
  duration: number;
  durationUnit: string;
  totalRepayment: number;
  periodPayment: number;
  interestAmount: number;
  startDate: string;
  endDate: string;
  notes?: string;
  currency?: string;
}): string => {
  const currency = loan.currency || 'FCFA';
  const unit = loan.durationUnit === 'months' ? 'mois' : 'sem.';

  return [
    `*YA MI — Relevé de Prêt*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `* ${loan.borrowerName}*`,
    loan.phone ? `Tel: ${loan.phone}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Montant : ${formatCurrency(loan.amount, currency)}`,
    `Taux : ${loan.interestRate}% / ${unit}`,
    `Duree : ${loan.duration} ${unit}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Interets : ${formatCurrency(loan.interestAmount, currency)}`,
    `/${unit} : ${formatCurrency(loan.periodPayment, currency)}`,
    `*TOTAL : ${formatCurrency(loan.totalRepayment, currency)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Debut : ${formatDate(loan.startDate)}`,
    `Fin : ${formatDate(loan.endDate)}`,
    loan.notes ? `━━━━━━━━━━━━━━━━━━━━\nNote: ${loan.notes}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `_Accord de confiance entre amis_`,
  ]
    .filter(Boolean)
    .join('\n');
};
EOF
success "src/utils/format.ts créé"

# ─── Installation des dependances mobile ───────────────────────

# -- Expo-managed packages (via npx expo install) ---------------
title "12a. Dependances Expo (npx expo install)"

log "Installation des packages Expo natifs..."
npx expo install \
  expo-secure-store \
  expo-sharing \
  expo-file-system \
  expo-print \
  expo-notifications \
  expo-font \
  expo-linking \
  expo-status-bar \
  react-native-screens \
  react-native-safe-area-context \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-svg
success "Packages Expo installes"

# -- UI & Styling : NativeWind + Tailwind -----------------------
title "12b. NativeWind + Tailwind CSS"

log "Installation de NativeWind et Tailwind..."
npm install nativewind --silent
npm install -D tailwindcss@3 --silent
success "NativeWind + Tailwind installes"

# tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        burgundy:      { DEFAULT: '#800020', dark: '#4D0013', light: 'rgba(128,0,32,0.08)' },
        mustard:       { DEFAULT: '#FFDB58', light: 'rgba(255,219,88,0.15)' },
        cream:         '#FAF7F2',
        graphite:      '#222222',
        'dust-grey':   '#CFCFCF',
        'border-soft': '#E8E4DC',
      },
      fontFamily: {
        headline: ['LibreCaslon'],
        body:     ['PlusJakartaSans'],
        mono:     ['SpaceMono'],
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
        pill:   '9999px',
        modal:  '16px',
      },
    },
  },
  plugins: [],
};
EOF
success "tailwind.config.js cree"

# global.css pour NativeWind
cat > global.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
success "global.css cree"

# babel.config.js avec NativeWind
cat > babel.config.js << 'EOF'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
EOF
success "babel.config.js configure pour NativeWind"

# metro.config.js avec NativeWind
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
EOF
success "metro.config.js configure pour NativeWind"

# nativewind-env.d.ts
cat > nativewind-env.d.ts << 'EOF'
/// <reference types="nativewind/types" />
EOF
success "nativewind-env.d.ts cree"

# -- Navigation -------------------------------------------------
title "12c. Navigation"

log "Installation de React Navigation..."
npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  --silent
success "React Navigation installe"

# -- State Management -------------------------------------------
title "12d. State Management"

log "Installation de Zustand..."
npm install zustand --silent
success "Zustand installe"

# -- API --------------------------------------------------------
title "12e. Client HTTP"

log "Installation d'Axios..."
npm install axios --silent
success "Axios installe"

# -- Forms & Validation -----------------------------------------
title "12f. Formulaires & Validation"

log "Installation de React Hook Form + Zod..."
npm install react-hook-form zod @hookform/resolvers --silent
success "React Hook Form + Zod installes"

# -- Icons ------------------------------------------------------
title "12g. Icones"

log "Installation de @expo/vector-icons..."
npx expo install @expo/vector-icons
success "@expo/vector-icons installe"

# -- QR Code ----------------------------------------------------
title "12h. QR Code"

log "Installation de react-native-qrcode-svg..."
npm install react-native-qrcode-svg --silent
success "react-native-qrcode-svg installe"

# -- Polices Google ---------------------------------------------
title "12i. Polices"

log "Installation des Google Fonts..."
npx expo install \
  @expo-google-fonts/plus-jakarta-sans \
  @expo-google-fonts/libre-caslon-text \
  expo-splash-screen
success "Polices installees"

success "--- Toutes les dependances mobile sont installees ---"

cd ../..

# ─── 13. Premier commit Git ──────────────────────────────────
title "13. Premier commit Git"

cd "$ROOT"
git add .
git commit -m "feat: initial project setup — Ya Mi v1.0.0

- Structure monorepo backend + mobile
- Backend : Node.js + Express + TypeScript + Prisma
- Mobile : React Native + Expo + TypeScript
- Schéma PostgreSQL complet (users, borrowers, loans, payments, contracts, notifications)
- Design tokens : couleurs Ya Mi + typographie
- Utilitaires : calculateur de prêt, formatage, ticket WhatsApp
- Sécurité : helmet, cors, rate-limit, JWT, bcrypt, zod" 2>/dev/null || \
git commit --allow-empty -m "feat: initial project setup — Ya Mi v1.0.0"

success "Premier commit Git effectué"
cd ..

# ─── Récapitulatif final ──────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  Ya Mi — Installation terminee avec succes !${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}  Prochaines étapes :${NC}"
echo ""
echo -e "  ${YELLOW}1.${NC} Copie et configure les variables d'environnement :"
echo -e "     ${BLUE}cp ya-mi/backend/.env.example ya-mi/backend/.env${NC}"
echo -e "     ${BLUE}cp ya-mi/mobile/.env.example  ya-mi/mobile/.env${NC}"
echo ""
echo -e "  ${YELLOW}2.${NC} Lance Prisma (après avoir rempli DATABASE_URL) :"
echo -e "     ${BLUE}cd ya-mi/backend${NC}"
echo -e "     ${BLUE}npx prisma generate${NC}"
echo -e "     ${BLUE}npx prisma migrate dev --name init${NC}"
echo ""
echo -e "  ${YELLOW}3.${NC} Démarre le backend :"
echo -e "     ${BLUE}npm run dev${NC}"
echo ""
echo -e "  ${YELLOW}4.${NC} Démarre le mobile (nouveau terminal) :"
echo -e "     ${BLUE}cd ya-mi/mobile && npx expo start${NC}"
echo ""
echo -e "  ${YELLOW}5.${NC} Teste l'API :"
echo -e "     ${BLUE}curl http://localhost:4000/health${NC}"
echo ""
echo -e "  ${BOLD}Structure créée :${NC}"
echo -e "  ${BLUE}ya-mi/${NC}"
echo -e "  ├── backend/    (Node.js + Express + TypeScript + Prisma)"
echo -e "  └── mobile/     (React Native + Expo + TypeScript)"
echo ""
echo -e "${YELLOW}  Ressources :${NC}"
echo -e "  Railway    → https://railway.app"
echo -e "  Firebase   → https://console.firebase.google.com"
echo -e "  Cloudinary → https://cloudinary.com"
echo ""