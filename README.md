#  Ya Mi

> **« Borrow Me »** — _Yoruba_

Application mobile-first de gestion de prêts personnels entre amis, famille, collègues et tontines.

---

## Pourquoi Ya Mi ?

Les prêts informels en Afrique de l'Ouest se font encore à la main, sur du papier, ou de mémoire. Ya Mi transforme ces échanges en un système **numérique, traçable et sécurisé** — sans nécessiter de compte bancaire.

---

## Fonctionnalités

- Créer un prêt avec montant, taux, durée et emprunteur
- Calcul automatique des intérêts, mensualités et solde restant
- Ticket partageable via **WhatsApp, Telegram, SMS**
- Génération de **contrat PDF** avec QR code
- Suivi des remboursements (complet, partiel, retard)
- Export **Excel / CSV / PDF**
- Notifications et alertes d'échéance
- Historique complet des transactions

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Mobile | React Native + Expo |
| Langage | TypeScript (mobile + backend) |
| Backend | Node.js + Express |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Auth | JWT + bcrypt |
| Notifications | Firebase FCM |
| PDF | PDFKit |
| Excel | ExcelJS |
| Hébergement | Railway |
| Stockage fichiers | Cloudinary |

---

## Structure du projet

```
ya-mi/
├── backend/         # API Node.js + Express + TypeScript
├── mobile/          # App React Native + Expo
└── README.md
```

---

## Installation

### Prérequis

- Node.js 20+
- npm 10+
- Compte Railway (base de données PostgreSQL)
- Compte Firebase (notifications)
- Compte Cloudinary (stockage PDF)

---

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Remplir les variables (voir section Variables d'environnement)

# Générer le client Prisma
npx prisma generate

# Migrer la base de données
npx prisma migrate dev

# Lancer en développement
npm run dev
```

---

### Mobile

```bash
cd mobile

# Installer les dépendances
npm install

# Configurer l'API
cp .env.example .env
# EXPO_PUBLIC_API_URL=https://ya-mi-backend.railway.app

# Lancer Expo
npx expo start

# Scanner le QR avec Expo Go sur Android ou iOS
```

---

## Variables d'environnement

### Backend — `.env`

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/yami

# JWT
JWT_SECRET=ton_secret_jwt_tres_long
JWT_REFRESH_SECRET=ton_secret_refresh_tres_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=ya-mi
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Cloudinary
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ton_api_key
CLOUDINARY_API_SECRET=ton_api_secret

# App
PORT=4000
NODE_ENV=development
```

### Mobile — `.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

---

## API — Endpoints principaux

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
```

### Prêts
```
GET    /api/loans
POST   /api/loans
GET    /api/loans/:id
PUT    /api/loans/:id
DELETE /api/loans/:id
GET    /api/loans/:id/schedule
GET    /api/loans/:id/ticket
```

### Paiements
```
GET    /api/payments/:loan_id
POST   /api/payments
PUT    /api/payments/:id
DELETE /api/payments/:id
```

### Contrats & Exports
```
POST   /api/contracts/generate
GET    /api/contracts/:id
GET    /api/reports/excel
GET    /api/reports/csv
GET    /api/reports/pdf
```

---

## Sécurité

- JWT access token 15min + refresh token 7 jours
- Bcrypt salt rounds 12
- Rate limiting : 100 req/15min global, 5 req/15min sur `/auth`
- Validation Zod sur chaque endpoint
- Helmet pour les headers HTTP
- Prisma protège contre les injections SQL
- `expo-secure-store` pour les tokens côté mobile
- HTTPS obligatoire en production

---

## Conventions Git

### Branches

```
main        → production
staging     → pré-production
develop     → développement actif
feature/*   → nouvelles fonctionnalités
fix/*       → corrections de bugs
```

### Commits

```
feat:      nouvelle fonctionnalité
fix:       correction de bug
refactor:  restructuration du code
docs:      documentation
style:     formatage, pas de logique
test:      ajout de tests

# Exemple
feat: add whatsapp ticket sharing
fix: correct interest calculation for weekly loans
```

---

## MVP — Critères de validation

Ya Mi est considéré prêt quand ces 8 points sont validés :

- [ ] Authentification fonctionnelle
- [ ] Création de prêt avec calcul automatique
- [ ] Ticket partageable via WhatsApp
- [ ] Génération de contrat PDF
- [ ] Historique des remboursements
- [ ] Export Excel
- [ ] Notifications d'échéance
- [ ] Statuts : actif, remboursé, en retard

---

## Roadmap

| Phase | Contenu | Durée estimée |
|-------|---------|---------------|
| Phase 1 | Initialisation projet + infra | Semaine 1 |
| Phase 2 | Backend auth + CRUD prêts | Semaines 2–3 |
| Phase 3 | Frontend mobile + connexion API | Semaines 4–5 |
| Phase 4 | Ticket + partage WhatsApp | Semaine 6 |
| Phase 5 | PDF + contrats | Semaine 7 |
| Phase 6 | Paiements + notifications | Semaines 8–9 |
| Phase 7 | Exports + dashboard + déploiement | Semaine 10 |

---

## Licence

Projet privé — Tous droits réservés.

---

> _Ya Mi n'est PAS une banque._
> _Ya Mi est une plateforme intelligente de gestion de prêts personnels._