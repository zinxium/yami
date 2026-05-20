# Ya Mi — Documentation Technique & Roadmap

> **Version 2.0** — Stack Solo Developer (Node.js + TypeScript)

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Stack Technique](#2-stack-technique)
3. [Architecture Générale](#3-architecture-générale)
4. [Base de données](#4-base-de-données)
5. [API REST](#5-api-rest)
6. [Sécurité](#6-sécurité)
7. [Roadmap de développement](#7-roadmap-de-développement)
8. [Guide d'installation](#8-guide-dinstallation)
9. [Conventions](#9-conventions)
10. [Roadmap long terme](#10-roadmap-long-terme)
11. [Définition du MVP](#11-définition-du-mvp)

---

## 1. Présentation du projet

**Ya Mi** est une application mobile-first de gestion de prêts personnels.

Le nom vient du yoruba et signifie :

> « Borrow Me »

### Vision du produit

Ya Mi transforme les prêts informels entre :

- Amis
- Familles
- Collègues
- Petits commerçants
- Tontines

...en un système numérique **simple, sécurisé et traçable**.

### Fonctionnalités principales MVP

- Créer un prêt avec montant, taux d'intérêt, durée et emprunteur
- Calcul automatique des intérêts, mensualités et solde restant
- Ticket partageable (WhatsApp, Telegram, SMS, Copier)
- Génération de contrat PDF avec QR code
- Suivi des remboursements (complet, partiel, retard)
- Export Excel / CSV / PDF
- Notifications et alertes d'échéance
- Historique complet des transactions

---

## 2. Stack Technique

> **Principe clé : UN seul langage (TypeScript) du mobile au serveur.**
> Avantage : types partagés, un seul environnement à déboguer, vitesse de développement x2.

### Stack complète

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Mobile | React Native + Expo | UI Android & iOS |
| Langage | TypeScript | Mobile + Backend |
| Backend | Node.js + Express | API REST sécurisée |
| ORM | Prisma | Types auto-générés depuis le schéma DB |
| Base de données | PostgreSQL | Données relationnelles |
| Auth | JWT + bcrypt | Authentification sécurisée |
| Notifications push | Firebase FCM | Alertes iOS & Android |
| PDF | PDFKit | Génération contrats |
| Excel | ExcelJS | Export relevés |
| Hébergement | Railway | Backend + DB managée |
| Stockage fichiers | Cloudinary | PDF contrats |
| State management | Zustand | Store mobile léger |
| Requêtes API | TanStack Query | Cache + synchronisation |
| Navigation | React Navigation | Navigation mobile |

### Packages de sécurité Node.js

| Package | Rôle |
|---------|------|
| `helmet` | Sécurise les headers HTTP |
| `express-rate-limit` | Bloque les attaques brute force |
| `bcryptjs` | Chiffrement des mots de passe |
| `jsonwebtoken` | Gestion des tokens JWT |
| `zod` | Validation stricte des inputs |
| `prisma` | Protection SQL injection automatique |
| `cors` | Contrôle des origines autorisées |
| `express-validator` | Validation des requêtes |

### Pourquoi ce choix pour un solo developer

| Critère | Django (ancienne stack) | Node.js + TS (nouvelle stack) |
|---------|------------------------|-------------------------------|
| Cohérence stack | Non - Python + JS | Oui - TypeScript partout |
| Partage de types | Non | Oui |
| Génération PDF | Très bon | Très bon aussi |
| Admin panel | Django Admin | A construire |
| Sécurité | Excellent | Très bon |
| Solo dev JS | Deux langages | Un seul langage |
| Vitesse MVP | Plus lent | Plus rapide |

---

## 3. Architecture Générale

### Flux de données

```
React Native App (Expo + TypeScript)
         ↓  HTTPS + JWT
Node.js API (Express + TypeScript)
         ↓  Prisma ORM
    PostgreSQL (Railway)
         ↓  Async
  Firebase FCM (Notifications)
         ↓
  Cloudinary (PDF Storage)
```

### Structure Backend — Node.js

```
backend/
├── src/
│   ├── config/            # env, db, firebase
│   ├── middleware/         # auth, rateLimit, validation
│   ├── modules/
│   │   ├── auth/           # register, login, refresh
│   │   ├── users/          # profil utilisateur
│   │   ├── borrowers/      # gestion emprunteurs
│   │   ├── loans/          # CRUD prêts + calculs
│   │   ├── payments/       # remboursements
│   │   ├── contracts/      # génération PDF
│   │   ├── notifications/  # FCM + rappels
│   │   └── reports/        # exports Excel/CSV
│   ├── prisma/             # schema.prisma + migrations
│   ├── utils/              # helpers, calculs financiers
│   └── types/              # types partagés
├── .env
├── package.json
└── tsconfig.json
```

### Structure Frontend Mobile — React Native

```
mobile/
├── src/
│   ├── api/            # axios client + endpoints
│   ├── components/     # composants réutilisables
│   ├── screens/        # écrans de l'app
│   ├── navigation/     # React Navigation
│   ├── store/          # Zustand store
│   ├── hooks/          # custom hooks
│   ├── services/       # notifications, partage, PDF
│   ├── utils/          # calculs, formatage
│   ├── types/          # types partagés avec backend
│   └── constants/      # couleurs, config
├── assets/
├── app.json
└── tsconfig.json
```

---

## 4. Base de données

### Schéma Prisma — Tables

#### Table `users`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| id | String (UUID) | Primary Key | Identifiant unique |
| fullname | String | Required | Nom complet |
| email | String | Unique | Email de connexion |
| phone | String | Unique | Numéro avec indicatif |
| password | String | Required | Hash bcrypt |
| created_at | DateTime | Default now() | Date d'inscription |

#### Table `borrowers`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| id | String (UUID) | Primary Key | Identifiant unique |
| user_id | String | FK → users | Propriétaire |
| fullname | String | Required | Nom de l'emprunteur |
| phone | String | Optional | Numéro avec indicatif |
| address | String | Optional | Adresse |
| created_at | DateTime | Default now() | Date création |

#### Table `loans`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| id | String (UUID) | Primary Key | Identifiant unique |
| user_id | String | FK → users | Prêteur |
| borrower_id | String | FK → borrowers | Emprunteur |
| amount | Decimal | Required | Montant principal |
| interest_rate | Decimal | Required | Taux d'intérêt (%) |
| duration | Int | Required | Durée (nombre) |
| duration_unit | Enum | months \| weeks | Unité de durée |
| monthly_payment | Decimal | Computed | Paiement par période |
| total_repayment | Decimal | Computed | Total à rembourser |
| remaining_balance | Decimal | Computed | Solde restant |
| currency | String | Default XOF | Devise (XOF, EUR, USD) |
| status | Enum | active \| paid \| overdue | Statut du prêt |
| start_date | DateTime | Required | Date de début |
| end_date | DateTime | Computed | Date d'échéance |
| created_at | DateTime | Default now() | Date création |

#### Table `payments`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| id | String (UUID) | Primary Key | Identifiant unique |
| loan_id | String | FK → loans | Prêt concerné |
| amount_paid | Decimal | Required | Montant payé |
| payment_type | Enum | full \| partial \| advance | Type de paiement |
| payment_date | DateTime | Required | Date du paiement |
| payment_method | String | Optional | MTN MoMo, Orange, Cash... |
| notes | String | Optional | Notes libres |

#### Table `contracts`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| id | String (UUID) | Primary Key | Identifiant unique |
| loan_id | String | FK → loans | Prêt concerné |
| contract_number | String | Unique | Numéro de contrat |
| pdf_url | String | Cloudinary URL | Lien PDF |
| qr_code | String | Optional | Données QR Code |
| signed | Boolean | Default false | Signé ou non |
| created_at | DateTime | Default now() | Date génération |

#### Table `notifications`

| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| id | String (UUID) | Primary Key | Identifiant unique |
| user_id | String | FK → users | Destinataire |
| loan_id | String | Optional FK → loans | Prêt concerné |
| type | Enum | reminder \| overdue \| payment \| created | Type d'alerte |
| message | String | Required | Message |
| sent_at | DateTime | Default now() | Date envoi |
| read | Boolean | Default false | Lu ou non |

---

## 5. API REST

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion + retourne JWT |
| POST | `/api/auth/refresh` | Renouveler le token |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/forgot-password` | Réinitialisation mot de passe |

### Emprunteurs

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/borrowers` | Liste des emprunteurs |
| POST | `/api/borrowers` | Créer un emprunteur |
| GET | `/api/borrowers/:id` | Détail emprunteur |
| PUT | `/api/borrowers/:id` | Modifier emprunteur |
| DELETE | `/api/borrowers/:id` | Supprimer emprunteur |

### Prêts

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/loans` | Liste des prêts (filtres, pagination) |
| POST | `/api/loans` | Créer un prêt |
| GET | `/api/loans/:id` | Détail d'un prêt |
| PUT | `/api/loans/:id` | Modifier un prêt |
| DELETE | `/api/loans/:id` | Supprimer un prêt |
| GET | `/api/loans/:id/schedule` | Échéancier complet |
| GET | `/api/loans/:id/ticket` | Générer ticket texte |

### Paiements

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/payments/:loan_id` | Historique remboursements |
| POST | `/api/payments` | Enregistrer un paiement |
| PUT | `/api/payments/:id` | Modifier un paiement |
| DELETE | `/api/payments/:id` | Supprimer un paiement |

### Contrats & Exports

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/contracts/generate` | Générer contrat PDF |
| GET | `/api/contracts/:id` | Télécharger contrat |
| GET | `/api/reports/excel` | Export Excel |
| GET | `/api/reports/csv` | Export CSV |
| GET | `/api/reports/pdf` | Export relevé PDF |

---

## 6. Sécurité

### Backend

- JWT avec access token **15min** + refresh token **7 jours**
- Bcrypt pour tous les mots de passe (salt rounds: 12)
- Rate limiting : 100 req/15min global, **5 req/15min** sur `/auth`
- Validation Zod sur chaque endpoint (inputs strictement typés)
- Permissions : un user ne peut accéder qu'à ses propres données
- HTTPS obligatoire, HTTP refusé
- Variables d'environnement pour tous les secrets
- Headers sécurisés via Helmet

### Base de données

- Prisma protège automatiquement contre les injections SQL
- Chiffrement des données sensibles (montants, téléphones)
- Sauvegardes automatiques quotidiennes (Railway)
- Accès restreint par `user_id` sur toutes les requêtes

### Mobile

- `expo-secure-store` pour les tokens (pas AsyncStorage)
- Certificate pinning contre les attaques man-in-the-middle
- Aucun secret dans le code source
- Validation des inputs côté client **et** côté serveur

---

## 7. Roadmap de développement

### Phase 1 — Préparation (Semaine 1)

- [ ] Initialiser monorepo GitHub (backend + mobile)
- [ ] Configurer Railway (Node.js + PostgreSQL)
- [ ] Setup TypeScript backend + Prisma
- [ ] Setup Expo + React Native TypeScript
- [ ] Configurer variables d'environnement

### Phase 2 — Backend Auth & Prêts (Semaines 2–3)

- [ ] Authentification complète (register, login, JWT, refresh)
- [ ] CRUD Borrowers
- [ ] CRUD Loans avec calculs automatiques
- [ ] Migrations Prisma
- [ ] Tests Postman de tous les endpoints

### Phase 3 — Frontend Mobile (Semaines 4–5)

- [ ] Écrans d'authentification
- [ ] Écran tableau de bord
- [ ] Écran création de prêt + calcul en temps réel
- [ ] Connexion complète à l'API
- [ ] Gestion des tokens (SecureStore)

### Phase 4 — Ticket & Partage (Semaine 6)

- [ ] Génération du ticket texte formaté
- [ ] Partage WhatsApp (lien `wa.me` avec texte pré-rempli)
- [ ] Partage Telegram, SMS, Copier
- [ ] Validation avec de vrais utilisateurs test

### Phase 5 — PDF & Contrats (Semaine 7)

- [ ] Génération PDF avec PDFKit (backend)
- [ ] Upload Cloudinary
- [ ] QR Code dans le contrat
- [ ] Téléchargement + partage depuis le mobile

### Phase 6 — Paiements & Notifications (Semaines 8–9)

- [ ] Enregistrement des remboursements (complet, partiel)
- [ ] Calcul automatique du solde restant
- [ ] Statut des échéances (à jour, en retard)
- [ ] Firebase FCM : notifications push
- [ ] Rappels automatiques J-3, J-0, J+1

### Phase 7 — Exports & Dashboard (Semaine 10)

- [ ] Export Excel avec ExcelJS
- [ ] Export CSV
- [ ] Dashboard statistiques
- [ ] Tests finaux + déploiement production

---

## 8. Guide d'installation

### Backend Node.js

```bash
# Cloner le repo
git clone https://github.com/ton-user/ya-mi.git
cd ya-mi/backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Remplir les variables d'environnement

# Générer le client Prisma + migrer
npx prisma generate
npx prisma migrate dev

# Lancer en développement
npm run dev
```

### Mobile React Native + Expo

```bash
cd ya-mi/mobile

# Installer les dépendances
npm install

# Configurer l'API URL
cp .env.example .env
# EXPO_PUBLIC_API_URL=https://ya-mi-backend.railway.app

# Lancer Expo
npx expo start

# Scanner le QR code avec Expo Go (Android/iOS)
```

---

## 9. Conventions

### Branches Git

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
```

**Exemples :**

```
feat: add whatsapp ticket sharing
fix: correct interest calculation for weekly loans
refactor: extract loan calculator to utils
docs: update API endpoints table
```

---

## 10. Roadmap long terme

### V2 — Fonctionnalités avancées

- Paiements partiels multiples avec historique complet
- Dashboard graphiques (courbes remboursement, statistiques)
- Multi-devises : XOF, EUR, USD
- Mode tontines : groupes, contributions, rotation

### V3 — Mobile Money

- Intégration MTN MoMo
- Intégration Orange Money
- Intégration Moov Money
- Paiements automatiques programmés

### V4 — Intelligence

- Score de confiance emprunteur
- Détection de risque de non-remboursement
- Suggestions de taux selon le profil
- Analyse prédictive des retards

### V5 — Communauté

- Système de garanties entre membres
- Réputation emprunteur (feedback prêteurs)
- Tontines numériques sécurisées

---

## 11. Définition du MVP

Ya Mi est considéré utilisable quand ces 8 points sont validés :

- [ ] Authentification fonctionnelle (register, login, JWT)
- [ ] Création de prêt avec calcul automatique
- [ ] Ticket partageable via WhatsApp
- [ ] Génération de contrat PDF
- [ ] Historique des remboursements
- [ ] Export Excel
- [ ] Notifications d'échéance
- [ ] Statuts : actif, remboursé, en retard

---

> _Ya Mi n'est PAS une banque._
>
> _Ya Mi est une plateforme intelligente de gestion de prêts personnels._