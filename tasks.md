# Ya Mi — Programme Détaillé du Projet

> **Stack** : Node.js + TypeScript + Prisma + React Native + Expo
> **Mode** : Solo Developer
> **Durée estimée** : 10 semaines

---

## PHASE 0 — Préparation & Environnement
> Objectif : tout est prêt avant d'écrire la première ligne de code métier.

### 0.1 Comptes & Services externes
- [ ] Créer un compte [Railway](https://railway.app) — hébergement backend + PostgreSQL
- [ ] Créer un projet PostgreSQL sur Railway — noter l'URL de connexion (`DATABASE_URL`)
- [ ] Créer un compte [Firebase](https://console.firebase.google.com) — notifications push
- [ ] Créer un projet Firebase → activer **Cloud Messaging (FCM)**
- [ ] Télécharger le fichier `service-account.json` depuis Firebase → paramètres du projet
- [ ] Créer un compte [Cloudinary](https://cloudinary.com) — stockage PDF
- [ ] Noter les clés Cloudinary : `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- [ ] Créer un compte [GitHub](https://github.com) si pas encore fait
- [ ] Créer un repo GitHub : `ya-mi` (privé)

### 0.2 Installation locale
- [ ] Lancer le script `setup.sh` :
  ```bash
  chmod +x setup.sh && ./setup.sh
  ```
- [ ] Vérifier que Node.js 20+ est installé : `node -v`
- [ ] Vérifier que npm est installé : `npm -v`
- [ ] Vérifier qu'Expo CLI est installé : `expo --version`
- [ ] Vérifier que Prisma CLI est installé : `prisma --version`
- [ ] Vérifier que TypeScript est installé : `tsc --version`

### 0.3 Configuration des variables d'environnement
- [ ] Copier le fichier env backend :
  ```bash
  cp ya-mi/backend/.env.example ya-mi/backend/.env
  ```
- [ ] Remplir `DATABASE_URL` avec l'URL PostgreSQL de Railway
- [ ] Générer `JWT_SECRET` (64 caractères minimum) :
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Générer `JWT_REFRESH_SECRET` (même commande, valeur différente)
- [ ] Remplir les variables Firebase (`PROJECT_ID`, `CLIENT_EMAIL`, `PRIVATE_KEY`)
- [ ] Remplir les variables Cloudinary
- [ ] Copier le fichier env mobile :
  ```bash
  cp ya-mi/mobile/.env.example ya-mi/mobile/.env
  ```
- [ ] Remplir `EXPO_PUBLIC_API_URL` avec l'URL locale : `http://localhost:4000`

### 0.4 Initialisation Git & GitHub
- [ ] Connecter le repo local au repo GitHub :
  ```bash
  cd ya-mi
  git remote add origin https://github.com/TON_USER/ya-mi.git
  git push -u origin main
  ```
- [ ] Créer les branches de base :
  ```bash
  git checkout -b develop && git push -u origin develop
  git checkout -b staging  && git push -u origin staging
  git checkout main
  ```
- [ ] Installer [GitHub Desktop](https://desktop.github.com) si tu préfères une interface graphique

### 0.5 Outils de développement
- [ ] Installer [VS Code](https://code.visualstudio.com) si pas encore fait
- [ ] Installer les extensions VS Code :
  - Prisma (officielle)
  - ESLint
  - Prettier
  - TypeScript Importer
  - REST Client (pour tester l'API sans Postman)
  - GitLens
- [ ] Installer [Postman](https://www.postman.com) ou [Insomnia](https://insomnia.rest) pour tester l'API
- [ ] Installer **Expo Go** sur ton téléphone Android/iOS

---

## PHASE 1 — Base de données & Prisma
> Objectif : la base de données est prête et les migrations tournent.

### 1.1 Initialisation Prisma
- [ ] Se placer dans le backend :
  ```bash
  cd ya-mi/backend
  ```
- [ ] Générer le client Prisma :
  ```bash
  npx prisma generate
  ```
- [ ] Lancer la première migration :
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] Vérifier que les tables sont créées dans Railway (interface web Railway → PostgreSQL → Tables)
- [ ] Ouvrir Prisma Studio pour visualiser la base :
  ```bash
  npx prisma studio
  ```

### 1.2 Seed de données de test
- [ ] Créer le fichier `src/prisma/seed.ts`
- [ ] Écrire un utilisateur de test dans le seed
- [ ] Écrire 2 emprunteurs de test
- [ ] Écrire 3 prêts de test (actif, remboursé, en retard)
- [ ] Lancer le seed :
  ```bash
  npx prisma db seed
  ```
- [ ] Vérifier les données dans Prisma Studio

### 1.3 Vérification
- [ ] Vérifier que toutes les tables existent : `users`, `borrowers`, `loans`, `payments`, `contracts`, `notifications`
- [ ] Vérifier que les enum fonctionnent : `DurationUnit`, `LoanStatus`, `PaymentType`, `NotificationType`
- [ ] Vérifier les relations entre tables (clés étrangères)

---

## PHASE 2 — Backend : Authentification
> Objectif : register, login, logout, JWT — tout fonctionne et est sécurisé.

### 2.1 Middleware d'authentification
- [ ] Créer `src/middleware/auth.middleware.ts`
  - Vérifier le header `Authorization: Bearer <token>`
  - Décoder et valider le JWT
  - Attacher `req.user` à la requête
  - Retourner 401 si token invalide ou absent
- [ ] Créer `src/middleware/validate.middleware.ts`
  - Middleware générique de validation Zod
  - Retourner 400 avec les erreurs de validation formatées
- [ ] Créer `src/middleware/rateLimit.middleware.ts`
  - Rate limit strict pour `/api/auth` : 5 req / 15 min
  - Rate limit global : 100 req / 15 min

### 2.2 Module Auth
- [ ] Créer `src/modules/auth/auth.schema.ts`
  - Schéma Zod pour `register` : fullname, email, phone, password (min 8 chars)
  - Schéma Zod pour `login` : email, password
  - Schéma Zod pour `forgot-password` : email
- [ ] Créer `src/modules/auth/auth.service.ts`
  - Fonction `register` : hasher le mot de passe (bcrypt, salt 12), créer l'utilisateur
  - Fonction `login` : vérifier email + mot de passe, générer access + refresh token
  - Fonction `refresh` : valider le refresh token, générer un nouveau access token
  - Fonction `logout` : invalider le refresh token
  - Fonction `forgotPassword` : (placeholder pour l'instant)
- [ ] Créer `src/modules/auth/auth.controller.ts`
  - `POST /register` → appeler `auth.service.register`
  - `POST /login` → appeler `auth.service.login`
  - `POST /refresh` → appeler `auth.service.refresh`
  - `POST /logout` → appeler `auth.service.logout`
- [ ] Créer `src/modules/auth/auth.routes.ts`
  - Enregistrer les routes avec les middlewares de validation
- [ ] Connecter les routes auth dans `src/index.ts`

### 2.3 Tests Auth avec Postman
- [ ] Tester `POST /api/auth/register` — succès avec données valides
- [ ] Tester `POST /api/auth/register` — erreur 400 avec données invalides
- [ ] Tester `POST /api/auth/register` — erreur 409 si email déjà utilisé
- [ ] Tester `POST /api/auth/login` — succès → reçoit `access_token` + `refresh_token`
- [ ] Tester `POST /api/auth/login` — erreur 401 avec mauvais mot de passe
- [ ] Tester `POST /api/auth/refresh` — nouveau token généré
- [ ] Tester une route protégée sans token → erreur 401
- [ ] Tester une route protégée avec token → succès

---

## PHASE 3 — Backend : Emprunteurs (Borrowers)
> Objectif : CRUD complet des emprunteurs, données isolées par utilisateur.

### 3.1 Module Borrowers
- [ ] Créer `src/modules/borrowers/borrower.schema.ts`
  - Schéma Zod `createBorrower` : fullname (requis), phone, address, notes
  - Schéma Zod `updateBorrower` : tous les champs optionnels
- [ ] Créer `src/modules/borrowers/borrower.service.ts`
  - `getAll(userId)` : liste des emprunteurs de l'utilisateur connecté
  - `getById(userId, borrowerId)` : un emprunteur (vérifier ownership)
  - `create(userId, data)` : créer un emprunteur
  - `update(userId, borrowerId, data)` : modifier (vérifier ownership)
  - `delete(userId, borrowerId)` : supprimer (vérifier ownership)
- [ ] Créer `src/modules/borrowers/borrower.controller.ts`
- [ ] Créer `src/modules/borrowers/borrower.routes.ts` (toutes les routes protégées par auth middleware)
- [ ] Connecter dans `src/index.ts`

### 3.2 Tests Borrowers avec Postman
- [ ] `GET /api/borrowers` — liste vide au départ
- [ ] `POST /api/borrowers` — créer un emprunteur
- [ ] `GET /api/borrowers/:id` — récupérer l'emprunteur créé
- [ ] `PUT /api/borrowers/:id` — modifier le nom
- [ ] `GET /api/borrowers` — voir l'emprunteur dans la liste
- [ ] `DELETE /api/borrowers/:id` — supprimer
- [ ] Vérifier qu'un utilisateur ne peut pas accéder aux emprunteurs d'un autre

---

## PHASE 4 — Backend : Prêts (Loans)
> Objectif : CRUD prêts avec calculs automatiques corrects.

### 4.1 Calculateur de prêt
- [ ] Ouvrir `src/utils/loan.calculator.ts` (déjà créé par setup.sh)
- [ ] Tester la fonction `calculateLoan` manuellement :
  - 50 000 FCFA, 5%, 6 mois → total = 65 000, mensualité = 10 833
  - 100 000 FCFA, 3%, 12 mois → vérifier le calcul
- [ ] Tester la fonction `generateContractNumber` : format `YM-202501-XXXX`
- [ ] Écrire des tests unitaires simples dans `src/utils/loan.calculator.test.ts`

### 4.2 Module Loans
- [ ] Créer `src/modules/loans/loan.schema.ts`
  - Schéma `createLoan` : borrower_id, amount (>0), interest_rate (0-100), duration (>0), duration_unit, start_date, notes
  - Schéma `updateLoan` : tous les champs optionnels sauf borrower_id
  - Schéma `updateStatus` : status (active | paid | overdue)
- [ ] Créer `src/modules/loans/loan.service.ts`
  - `getAll(userId, filters?)` : liste avec filtres optionnels (status, search)
  - `getById(userId, loanId)` : un prêt avec borrower inclus (vérifier ownership)
  - `create(userId, data)` : créer avec calcul automatique (calculateLoan)
  - `update(userId, loanId, data)` : modifier + recalculer si montant/taux/durée changent
  - `delete(userId, loanId)` : supprimer (vérifier ownership)
  - `markAsPaid(userId, loanId)` : passer status → paid
  - `getSchedule(userId, loanId)` : générer l'échéancier complet période par période
  - `generateTicket(userId, loanId)` : retourner le texte formaté du ticket WhatsApp
  - `checkOverdue()` : fonction cron — passer les prêts dépassés à overdue
- [ ] Créer `src/modules/loans/loan.controller.ts`
- [ ] Créer `src/modules/loans/loan.routes.ts`
- [ ] Connecter dans `src/index.ts`

### 4.3 Tests Loans avec Postman
- [ ] `POST /api/loans` — créer un prêt, vérifier les calculs auto
- [ ] `GET /api/loans` — liste des prêts
- [ ] `GET /api/loans/:id` — détail avec borrower
- [ ] `GET /api/loans/:id/schedule` — vérifier l'échéancier (nb de lignes = duration)
- [ ] `GET /api/loans/:id/ticket` — vérifier le texte WhatsApp
- [ ] `PUT /api/loans/:id` — modifier le montant → vérifier que les calculs se mettent à jour
- [ ] `DELETE /api/loans/:id` — supprimer
- [ ] Vérifier isolation entre utilisateurs

---

## PHASE 5 — Backend : Paiements (Payments)
> Objectif : enregistrer les remboursements et mettre à jour le solde restant.

### 5.1 Module Payments
- [ ] Créer `src/modules/payments/payment.schema.ts`
  - Schéma `createPayment` : loan_id, amount_paid (>0), payment_type, payment_date, payment_method, notes
- [ ] Créer `src/modules/payments/payment.service.ts`
  - `getByLoan(userId, loanId)` : historique des paiements d'un prêt
  - `create(userId, data)` :
    - Vérifier ownership du prêt
    - Enregistrer le paiement
    - Mettre à jour `remaining_balance` du prêt
    - Si `remaining_balance <= 0` → passer le prêt à `paid` automatiquement
  - `delete(userId, paymentId)` : supprimer + recalculer le solde
- [ ] Créer `src/modules/payments/payment.controller.ts`
- [ ] Créer `src/modules/payments/payment.routes.ts`
- [ ] Connecter dans `src/index.ts`

### 5.2 Tests Payments avec Postman
- [ ] `POST /api/payments` — enregistrer un paiement partiel → vérifier `remaining_balance`
- [ ] `POST /api/payments` — enregistrer un paiement complet → prêt passe à `paid`
- [ ] `GET /api/payments/:loan_id` — historique des paiements
- [ ] `DELETE /api/payments/:id` — supprimer → solde recalculé

---

## PHASE 6 — Backend : Contrats PDF
> Objectif : générer un contrat PDF professionnel et le stocker sur Cloudinary.

### 6.1 Générateur PDF
- [ ] Créer `src/modules/contracts/pdf.generator.ts`
  - Utiliser `pdfkit` pour générer le PDF
  - En-tête avec logo/nom **Ya Mi**
  - Section prêteur (nom, téléphone)
  - Section emprunteur (nom, téléphone, adresse)
  - Tableau des conditions (montant, taux, durée, mensualité, total)
  - Échéancier complet
  - Section signature (deux lignes : prêteur / emprunteur)
  - QR code avec les infos du prêt (utiliser `qrcode` package)
  - Pied de page avec numéro de contrat et date
- [ ] Installer les packages nécessaires :
  ```bash
  npm install qrcode
  npm install -D @types/qrcode
  ```

### 6.2 Service Cloudinary
- [ ] Créer `src/config/cloudinary.ts` — initialiser le client Cloudinary
- [ ] Créer `src/modules/contracts/cloudinary.service.ts`
  - Fonction `uploadPDF(buffer, filename)` → retourne l'URL publique

### 6.3 Module Contracts
- [ ] Créer `src/modules/contracts/contract.service.ts`
  - `generate(userId, loanId)` :
    - Vérifier ownership du prêt
    - Générer le PDF avec `pdf.generator.ts`
    - Uploader sur Cloudinary
    - Créer/mettre à jour l'entrée `Contract` en base
    - Retourner l'URL du PDF
  - `getById(userId, contractId)` : récupérer le contrat
- [ ] Créer `src/modules/contracts/contract.controller.ts`
- [ ] Créer `src/modules/contracts/contract.routes.ts`
- [ ] Connecter dans `src/index.ts`

### 6.4 Tests Contracts
- [ ] `POST /api/contracts/generate` — générer un PDF → recevoir une URL Cloudinary
- [ ] Ouvrir l'URL dans le navigateur → vérifier que le PDF est correct
- [ ] `GET /api/contracts/:id` — récupérer le contrat

---

## PHASE 7 — Backend : Notifications
> Objectif : alertes push Firebase, rappels automatiques d'échéance.

### 7.1 Configuration Firebase Admin
- [ ] Créer `src/config/firebase.ts`
  - Initialiser Firebase Admin SDK avec les credentials
  - Exporter la fonction `sendPushNotification(token, title, body, data?)`

### 7.2 Service Notifications
- [ ] Créer `src/modules/notifications/notification.service.ts`
  - `send(userId, loanId, type, title, message)` :
    - Récupérer le FCM token de l'utilisateur
    - Envoyer la notif via Firebase
    - Sauvegarder en base (table `notifications`)
  - `getAll(userId)` : liste des notifications de l'utilisateur
  - `markAsRead(userId, notifId)` : marquer comme lue
  - `sendLoanCreated(loan)` : notification création prêt
  - `sendPaymentConfirmed(payment)` : notification paiement reçu
  - `sendReminder(loan, daysLeft)` : rappel échéance (J-3, J-1)
  - `sendOverdue(loan)` : alerte retard

### 7.3 Tâches cron (rappels automatiques)
- [ ] Installer node-cron :
  ```bash
  npm install node-cron && npm install -D @types/node-cron
  ```
- [ ] Créer `src/modules/notifications/cron.service.ts`
  - Tâche quotidienne à 9h00 :
    - Chercher tous les prêts actifs dont `end_date` = aujourd'hui + 3 jours → envoyer rappel J-3
    - Chercher tous les prêts actifs dont `end_date` = aujourd'hui + 1 jour → envoyer rappel J-1
    - Chercher tous les prêts actifs dont `end_date` < aujourd'hui → passer à `overdue` + envoyer alerte
- [ ] Démarrer le cron dans `src/index.ts`

### 7.4 Endpoint FCM Token
- [ ] Ajouter route `PUT /api/users/fcm-token` — mettre à jour le token FCM de l'utilisateur connecté
- [ ] L'app mobile appellera cette route au démarrage après avoir obtenu le token Expo

---

## PHASE 8 — Backend : Exports
> Objectif : exporter les données en Excel et CSV.

### 8.1 Module Reports
- [ ] Créer `src/modules/reports/report.service.ts`
  - `generateExcel(userId)` :
    - Récupérer tous les prêts de l'utilisateur avec borrower + payments
    - Créer un workbook ExcelJS
    - Feuille 1 "Prêts" : toutes les colonnes (emprunteur, montant, taux, durée, intérêts, total, statut, dates)
    - Feuille 2 "Paiements" : historique de tous les paiements
    - Appliquer les styles (header en burgundy #800020, alternance de lignes)
    - Retourner le buffer
  - `generateCSV(userId)` :
    - Même data que Excel mais format CSV simple
    - Retourner la chaîne CSV
- [ ] Créer `src/modules/reports/report.controller.ts`
  - `GET /api/reports/excel` → header `Content-Disposition: attachment; filename=ya-mi-releve.xlsx`
  - `GET /api/reports/csv` → header `Content-Type: text/csv`
- [ ] Créer `src/modules/reports/report.routes.ts`
- [ ] Connecter dans `src/index.ts`

### 8.2 Tests Exports
- [ ] `GET /api/reports/excel` → télécharger le fichier, vérifier dans Excel
- [ ] `GET /api/reports/csv` → vérifier le contenu
- [ ] Vérifier que seules les données de l'utilisateur connecté sont exportées

---

## PHASE 9 — Backend : Déploiement
> Objectif : l'API est accessible en ligne sur Railway.

### 9.1 Préparation déploiement
- [ ] Vérifier que le build TypeScript fonctionne :
  ```bash
  npm run build
  ```
- [ ] Corriger toutes les erreurs TypeScript
- [ ] Créer `Procfile` à la racine du backend :
  ```
  web: node dist/index.js
  ```
- [ ] Vérifier que `package.json` a le script `start: node dist/index.js`
- [ ] Ajouter `.env` au `.gitignore` (vérifier que les secrets ne sont pas committés)

### 9.2 Déploiement sur Railway
- [ ] Connecter le repo GitHub à Railway
- [ ] Configurer les variables d'environnement dans Railway (copier depuis `.env` local)
- [ ] Déclencher le déploiement
- [ ] Vérifier les logs de build
- [ ] Tester l'URL Railway : `https://ya-mi-backend.railway.app/health`
- [ ] Mettre à jour `EXPO_PUBLIC_API_URL` dans le `.env` mobile avec l'URL Railway

---

## PHASE 10 — Mobile : Authentification
> Objectif : l'utilisateur peut créer un compte et se connecter depuis l'app.

### 10.1 Setup Navigation
- [ ] Créer `src/navigation/index.tsx` — navigation principale
- [ ] Créer `src/navigation/AuthNavigator.tsx` — stack pour les écrans non connectés
- [ ] Créer `src/navigation/AppNavigator.tsx` — tab bar pour les écrans connectés
- [ ] Configurer les tabs : Dashboard, Prêts, Nouveau prêt, Profil
- [ ] Configurer les couleurs de navigation (burgundy `#800020`)

### 10.2 Store Auth (Zustand)
- [ ] Créer `src/store/auth.store.ts`
  - State : `user`, `accessToken`, `isAuthenticated`, `isLoading`
  - Actions : `login(email, password)`, `register(data)`, `logout()`, `restoreSession()`
  - Persister le token dans `expo-secure-store`

### 10.3 Écran d'accueil / Splash
- [ ] Créer `src/screens/auth/SplashScreen.tsx`
  - Logo Ya Mi centré
  - Fond crème `#FAF7F2`
  - Vérifier si un token existe → rediriger vers App ou Auth
  - Durée : 2 secondes max

### 10.4 Écran Register
- [ ] Créer `src/screens/auth/RegisterScreen.tsx`
  - Champs : Nom complet, Email, Téléphone, Mot de passe, Confirmer mot de passe
  - Bouton CTA burgundy "Créer mon compte"
  - Lien vers Login
  - Validation des champs avant envoi
  - Afficher les erreurs API sous chaque champ
  - Loading state sur le bouton pendant la requête

### 10.5 Écran Login
- [ ] Créer `src/screens/auth/LoginScreen.tsx`
  - Champs : Email, Mot de passe
  - Bouton CTA burgundy "Se connecter"
  - Lien vers Register
  - Lien "Mot de passe oublié ?"
  - Loading state

### 10.6 Tests Auth Mobile
- [ ] Lancer l'app : `npx expo start`
- [ ] Tester le flux register → redirection vers Dashboard
- [ ] Tester le flux login → redirection vers Dashboard
- [ ] Fermer l'app et la rouvrir → vérifier que la session est restaurée
- [ ] Tester les erreurs de validation (email invalide, mot de passe trop court)
- [ ] Tester la déconnexion → redirection vers Login

---

## PHASE 11 — Mobile : Dashboard
> Objectif : tableau de bord avec statistiques et liste des prêts récents.

### 11.1 Setup TanStack Query
- [ ] Configurer `QueryClient` dans `App.tsx`
- [ ] Créer `src/api/loans.api.ts` — fonctions d'appel API pour les prêts
- [ ] Créer `src/api/borrowers.api.ts`
- [ ] Créer hook `src/hooks/useLoans.ts` — wrapper TanStack Query

### 11.2 Composants communs
- [ ] Créer `src/components/common/Button.tsx`
  - Variantes : primary (burgundy), secondary (outlined), accent (mustard), ghost
  - Props : label, onPress, loading, disabled, icon
- [ ] Créer `src/components/common/Card.tsx`
  - Fond blanc, border-radius 12, shadow légère, border `#E8E4DC`
- [ ] Créer `src/components/common/Badge.tsx`
  - Variantes : active, overdue, paid, partial, new
  - Couleurs Ya Mi
- [ ] Créer `src/components/common/Avatar.tsx`
  - Initiales de l'emprunteur, cercle, fond `#80002015`, texte `#800020`
- [ ] Créer `src/components/common/EmptyState.tsx`
  - Icône + texte + bouton CTA quand liste vide
- [ ] Créer `src/components/common/LoadingSpinner.tsx`
  - Spinner couleur burgundy

### 11.3 Écran Dashboard
- [ ] Créer `src/screens/dashboard/DashboardScreen.tsx`
  - Header : "Bonjour, [Prénom] 👋" + icône cloche notifications
  - 4 cartes de statistiques :
    - Total prêtés (burgundy, border-left)
    - À recevoir (mustard, border-left)
    - Prêts actifs (gris, border-left)
    - En retard (tertiary, border-left) — rouge si > 0
  - Section alerte retard (visible uniquement si prêts en retard)
  - Section "Prêts récents" → 5 derniers prêts
  - Pull-to-refresh
  - Loading skeleton pendant le chargement

### 11.4 Composant LoanCard
- [ ] Créer `src/components/loans/LoanCard.tsx`
  - Avatar avec initiales de l'emprunteur
  - Nom de l'emprunteur + date d'échéance
  - Montant prêté + total à rembourser
  - Badge de statut
  - Chevron droit → navigable vers le détail

### 11.5 Tests Dashboard
- [ ] Dashboard s'affiche avec les vraies données de l'API
- [ ] Pull-to-refresh fonctionne
- [ ] Les stats sont correctes (vérifier avec les données seed)
- [ ] Naviguer vers un prêt depuis la liste récente

---

## PHASE 12 — Mobile : Gestion des Prêts
> Objectif : créer, voir, gérer les prêts depuis l'app.

### 12.1 Écran Liste des Prêts
- [ ] Créer `src/screens/loans/LoansListScreen.tsx`
  - Barre de recherche (filtrer par nom d'emprunteur)
  - Filtres par statut : Tous / Actifs / En retard / Remboursés
  - Liste complète avec `LoanCard`
  - FAB bouton "+" pour créer un prêt (burgundy)
  - État vide avec `EmptyState`
  - Pull-to-refresh

### 12.2 Écran Création de Prêt
- [ ] Créer `src/screens/loans/CreateLoanScreen.tsx`
  - **Étape 1 — Emprunteur** :
    - Sélectionner dans la liste des emprunteurs existants
    - Ou créer un nouvel emprunteur (modal) : nom, téléphone
  - **Étape 2 — Conditions** :
    - Montant (clavier numérique)
    - Taux d'intérêt (%)
    - Durée + unité (mois / semaines)
    - Date de début (date picker)
    - Notes (optionnel)
  - **Calcul en temps réel** (visible dès que les champs sont remplis) :
    - Intérêts : X FCFA
    - Mensualité : X FCFA
    - Total à rembourser : X FCFA (en gras, mustard)
    - Date d'échéance calculée
  - Bouton "Créer le prêt" (CTA burgundy)
  - Validation complète avant soumission
  - Loading state pendant la création

### 12.3 Écran Détail d'un Prêt
- [ ] Créer `src/screens/loans/LoanDetailScreen.tsx`
  - Header : nom de l'emprunteur + badge statut
  - Tableau des conditions : montant, taux, durée, intérêts, mensualité, total, dates
  - Section notes si présentes
  - **Barre de progression remboursement** : X% remboursé (couleur burgundy)
  - Section "Actions rapides" :
    - Bouton "Ticket WhatsApp" (mustard)
    - Bouton "Partager"
    - Bouton "Voir le contrat PDF"
    - Bouton "Enregistrer un paiement"
    - Bouton "Marquer comme remboursé"
    - Bouton "Supprimer" (rouge/tertiary)
  - Accordéon "Échéancier" — liste des échéances avec statut (à venir / en retard / payé)
  - Accordéon "Historique des paiements"

### 12.4 Partage du Ticket
- [ ] Créer `src/services/sharing.service.ts`
  - `shareWhatsApp(loan)` : ouvrir `https://wa.me/PHONE?text=TICKET` via `Linking.openURL`
  - `shareTicket(loan)` : utiliser `expo-sharing` pour partager sur n'importe quelle app
  - `copyTicket(loan)` : copier dans le presse-papiers via `Clipboard`
  - `shareTelegram(loan)` : ouvrir Telegram avec le texte
- [ ] Intégrer dans `LoanDetailScreen` — bottom sheet avec les options de partage

### 12.5 Tests Gestion Prêts
- [ ] Créer un prêt → vérifier redirection vers le détail
- [ ] Calcul en temps réel pendant la saisie
- [ ] Partage WhatsApp → vérifier que le lien ouvre WhatsApp avec le bon texte
- [ ] Partager → vérifier que le texte du ticket est correct
- [ ] Marquer comme remboursé → badge passe à "Remboursé"
- [ ] Supprimer → prêt disparaît de la liste

---

## PHASE 13 — Mobile : Paiements & Notifications
> Objectif : enregistrer les paiements et recevoir les alertes push.

### 13.1 Écran Enregistrer un Paiement
- [ ] Créer `src/screens/payments/AddPaymentScreen.tsx`
  - Montant payé (clavier numérique)
  - Type : Complet / Partiel / En avance
  - Date du paiement (date picker, défaut : aujourd'hui)
  - Méthode : MTN MoMo / Orange Money / Moov / Cash / Autre
  - Notes (optionnel)
  - Afficher le solde restant calculé en temps réel
  - Bouton "Enregistrer" (CTA burgundy)

### 13.2 Historique des Paiements
- [ ] Créer `src/components/payments/PaymentHistoryList.tsx`
  - Liste chronologique des paiements
  - Chaque item : date, montant, type, méthode, icône selon type
  - Option supprimer un paiement (swipe gauche)

### 13.3 Notifications Push
- [ ] Créer `src/services/notifications.service.ts`
  - Demander la permission de notifications au démarrage
  - Récupérer le token Expo Push
  - Envoyer le token à l'API (`PUT /api/users/fcm-token`)
  - Gérer les notifications reçues quand l'app est ouverte (foreground)
  - Gérer le tap sur une notification → naviguer vers le bon prêt
- [ ] Intégrer dans `App.tsx`

### 13.4 Tests Paiements & Notifications
- [ ] Enregistrer un paiement partiel → vérifier le solde restant
- [ ] Enregistrer le paiement final → prêt passe à "Remboursé"
- [ ] Supprimer un paiement → solde recalculé
- [ ] Tester la réception d'une notification push (via Firebase Console)
- [ ] Taper sur la notification → naviguer vers le bon prêt

---

## PHASE 14 — Mobile : Contrats & Exports
> Objectif : afficher, télécharger et partager les contrats PDF depuis l'app.

### 14.1 Contrat PDF
- [ ] Créer `src/screens/loans/ContractScreen.tsx`
  - Bouton "Générer le contrat" → appel API
  - Loading state pendant la génération
  - Aperçu du PDF dans une WebView (`react-native-webview`)
  - Bouton "Télécharger" (expo-file-system)
  - Bouton "Partager" (expo-sharing)

### 14.2 Export Excel
- [ ] Ajouter option "Exporter en Excel" dans l'écran Profil ou la liste des prêts
- [ ] Appeler `GET /api/reports/excel`
- [ ] Télécharger le fichier avec `expo-file-system`
- [ ] Ouvrir avec `expo-sharing` pour envoyer vers WhatsApp, email, etc.

### 14.3 Tests Contrats & Exports
- [ ] Générer un contrat → PDF s'affiche
- [ ] Partager le PDF via WhatsApp
- [ ] Exporter en Excel → fichier reçu et correct

---

## PHASE 15 — Mobile : Polices & UI Finale
> Objectif : appliquer les vraies polices Ya Mi et finaliser l'UI.

### 15.1 Polices personnalisées
- [ ] Télécharger **Libre Caslon Text** depuis Google Fonts (Regular, Bold, Italic)
- [ ] Télécharger **Plus Jakarta Sans** depuis Google Fonts (Regular 400, Medium 500, Bold 700)
- [ ] Placer les fichiers dans `assets/fonts/`
- [ ] Charger les polices dans `App.tsx` avec `expo-font` :
  ```tsx
  const [fontsLoaded] = useFonts({
    'LibreCaslon-Regular': require('./assets/fonts/LibreCaslon-Regular.ttf'),
    'LibreCaslon-Bold': require('./assets/fonts/LibreCaslon-Bold.ttf'),
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('./assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
  });
  ```
- [ ] Créer `src/components/common/Text.tsx` — wrapper avec les polices Ya Mi
  - `variant` prop : `headline` (Libre Caslon), `body`, `label` (Plus Jakarta Sans)
- [ ] Remplacer tous les `<Text>` natifs par le composant custom

### 15.2 Révision UI complète
- [ ] Passer en revue chaque écran avec la maquette Stitch
- [ ] Corriger les espacements, couleurs, border-radius
- [ ] Vérifier le fond crème `#FAF7F2` sur tous les écrans
- [ ] Vérifier les boutons (CTA burgundy, outlined, mustard)
- [ ] Vérifier les badges de statut
- [ ] Tester sur Android ET iOS (simulateur ou vrai téléphone)

### 15.3 Écran Profil
- [ ] Créer `src/screens/profile/ProfileScreen.tsx`
  - Avatar avec initiales
  - Nom, email, téléphone
  - Bouton "Exporter mes données (Excel)"
  - Bouton "Se déconnecter"
  - Version de l'app

---

## PHASE 16 — Tests finaux & Déploiement
> Objectif : l'app est stable, sécurisée et déployée en production.

### 16.1 Tests end-to-end complets
- [ ] Flux complet register → créer emprunteur → créer prêt → ticket WhatsApp
- [ ] Flux paiement partiel → solde mis à jour → notification reçue
- [ ] Flux paiement final → prêt remboursé → export Excel
- [ ] Flux prêt en retard → alerte reçue → relancer via WhatsApp
- [ ] Tester avec 2 comptes différents → vérifier isolation des données
- [ ] Tester sur Android
- [ ] Tester sur iOS

### 16.2 Sécurité — checklist finale
- [ ] Vérifier que `.env` n'est pas dans le repo Git
- [ ] Vérifier les headers de sécurité : `curl -I https://ya-mi-backend.railway.app/health`
- [ ] Tester le rate limiting sur `/api/auth/login` (6 tentatives → bloqué)
- [ ] Vérifier qu'un token expiré retourne 401
- [ ] Vérifier qu'un user ne peut pas accéder aux données d'un autre user
- [ ] Vérifier que les mots de passe sont bien hashés en base (pas en clair)

### 16.3 Performance
- [ ] Ajouter pagination sur `GET /api/loans` (page, limit)
- [ ] Ajouter les index Prisma sur les colonnes fréquemment cherchées :
  ```prisma
  @@index([user_id])
  @@index([status])
  @@index([end_date])
  ```
- [ ] Vérifier les temps de réponse API (< 500ms pour les listes)

### 16.4 Déploiement final
- [ ] Backend : déployer la version finale sur Railway
- [ ] Vérifier les logs Railway (aucune erreur au démarrage)
- [ ] Vérifier le cron des notifications (Railway → Cron Jobs ou process interne)
- [ ] Générer l'APK Android avec EAS Build :
  ```bash
  cd ya-mi/mobile
  eas build --platform android --profile preview
  ```
- [ ] Tester l'APK sur un vrai téléphone Android
- [ ] (Optionnel) Soumettre sur Google Play Store

---

## RÉCAPITULATIF DES PHASES

| Phase | Description | Semaine |
|-------|-------------|---------|
| 0 | Préparation & Environnement | 1 |
| 1 | Base de données & Prisma | 1 |
| 2 | Backend : Authentification | 2 |
| 3 | Backend : Emprunteurs | 2 |
| 4 | Backend : Prêts | 3 |
| 5 | Backend : Paiements | 3 |
| 6 | Backend : Contrats PDF | 4 |
| 7 | Backend : Notifications | 4 |
| 8 | Backend : Exports | 5 |
| 9 | Backend : Déploiement | 5 |
| 10 | Mobile : Authentification | 6 |
| 11 | Mobile : Dashboard | 6 |
| 12 | Mobile : Gestion des Prêts | 7 |
| 13 | Mobile : Paiements & Notifications | 8 |
| 14 | Mobile : Contrats & Exports | 8 |
| 15 | Mobile : Polices & UI Finale | 9 |
| 16 | Tests finaux & Déploiement | 10 |

---

## RÈGLES À SUIVRE ABSOLUMENT

1. **Une tâche à la fois** — ne pas passer à la suivante si la précédente n'est pas cochée
2. **Committer après chaque tâche majeure** — pas de gros commits fourre-tout
3. **Tester dans Postman avant de passer au mobile** — ne pas coupler frontend et backend non testés
4. **Jamais de secrets dans le code** — toujours dans `.env`
5. **Mobile-first** — tester sur vrai téléphone, pas seulement le simulateur
6. **Ne pas ajouter de features V2** avant que toutes les cases MVP soient cochées

---

> _Ya Mi n'est PAS une banque._
> _Ya Mi est une plateforme intelligente de gestion de prêts personnels._