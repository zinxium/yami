# Changelog - Ya Mi Backend

Tous les changements notables de ce projet seront documentés dans ce fichier.

## [1.1.0] - 2026-05-26

### Added
- Utilitaire d'erreur typé (`utils/error.ts`) : `getErrorStatus()` / `getErrorMessage()`
- Interfaces typées : `LoanForSchedule`, `LoanForTicket`, `LoanForNotification`
- Support du type Prisma `Decimal` dans les interfaces de service
- Suite de tests Jest complète — 54 tests, 5 suites :
  - `error.test.ts` (14 tests) — utilitaire d'erreur
  - `loan.calculator.test.ts` (7 tests) — calculateur de prêts
  - `loan.service.test.ts` (14 tests) — schedule et ticket
  - `notification.service.test.ts` (10 tests) — notifications avec mock Prisma
  - `auth.test.ts` (9 tests) — auth avec mock Prisma + Firebase
- Setup Jest global (`tests/setup.ts`) avec mock Firebase
- Scripts npm : `test`, `test:watch`, `test:coverage`
- Migration Prisma initiale (`20260525_init`)
- Firebase optionnel — l'app démarre sans credentials

### Changed
- Tous les controllers : `catch (error: any)` → `catch (error: unknown)` (7 fichiers, 27 catch blocks)
- `loan.service.ts` : `any` → `Prisma.LoanWhereInput`, `Prisma.LoanUpdateInput`
- `payment.service.ts` : `any` → `{ remaining_balance: number; status?: LoanStatus }`
- `notification.service.ts` : `loan: any` → `LoanForNotification` (4 fonctions)
- `firebase.ts` : initialisation gracieuse avec try/catch

### Security
- JWT secrets générés avec `crypto.randomBytes(64)` (128 chars hex)
- Cloudinary credentials configurés

## [1.0.0] - 2026-05-20

### Added
- API REST avec Express.js
- Authentification JWT avec bcrypt
- Modèles Prisma pour PostgreSQL:
  - Users (gestion des utilisateurs)
  - Loans (gestion des prêts)
  - Repayments (gestion des remboursements)
  - Notifications (alertes d'échéance)
- Endpoints API:
  - Authentication (register, login, logout)
  - Loans (create, read, update, delete)
  - Repayments (track, submit, history)
  - Users (profile, settings)
  - Notifications (send, retrieve)
- Calcul automatique des intérêts et mensualités
- Génération de contrats PDF avec PDFKit
- Export de données (Excel avec ExcelJS, CSV, PDF)
- Intégration Firebase FCM pour notifications push
- Intégration Cloudinary pour stockage de fichiers
- Middleware de validation et authentification
- Gestion des erreurs standardisée
- Logging et monitoring
- Unit tests avec Jest
- Configuration TypeScript stricte

### Changed
- Structure du projet avec séparation concerns:
  - src/controllers/
  - src/services/
  - src/routes/
  - src/middleware/
  - src/utils/
  - prisma/ (migrations)
- Configuration environment avec .env.example
- Frontend supporté pour l'intégration complète dark mode

### Fixed
- Validation des données entrantes
- Gestion des transactions concurrentes
- Optimisation des requêtes base de données

### Security
- Validation des tokens JWT
- Hachage sécurisé des mots de passe
- Protection CORS
- Rate limiting sur les endpoints sensibles
- Validation des inputs

## [0.1.0] - 2026-01-01

### Added
- Initialisation du projet backend
- Setup Node.js + Express
- Configuration TypeScript
- Configuration Prisma + PostgreSQL
- Setup Jest pour testing
