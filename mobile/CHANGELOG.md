# Changelog - Ya Mi Mobile

Tous les changements notables de ce projet seront documentés dans ce fichier.

## [1.1.0] - 2026-05-26

### Added
- **Mode offline** complet avec cache local et queue de mutations
  - `store/cache.store.ts` — cache AsyncStorage (prêts, emprunteurs, paiements)
  - `store/mutationQueue.store.ts` — file d'attente des mutations offline
  - `store/network.store.ts` — détection de connectivité via NetInfo
  - `services/sync.service.ts` — replay des mutations + résolution des IDs temporaires
  - `components/common/OfflineBanner.tsx` — bannière "Mode hors-ligne · X en attente"
  - Sync automatique à la reconnexion dans `App.tsx`
- **Internationalisation FR/EN** avec i18next + react-i18next + expo-localization
  - `i18n/fr.json` et `i18n/en.json` — ~250 clés de traduction chacun
  - Toggle de langue dans le Profil
  - Détection automatique de la langue du téléphone
  - 22 fichiers écrans/composants modifiés pour utiliser `t()`
- **Onboarding swipeable** — 3 pages avec icônes, dots de pagination, boutons Suivant/Passer/CTA
- **Splash screen animé** (Reanimated) — fond burgundy, logo scale+fade, texte slide-up, 3 dots loader pulsants, cercles décoratifs, footer "Fintech for Africa"
- **Eye toggle** mot de passe sur LoginScreen (1 champ) et SignupScreen (2 champs)
- Types navigation : `ForgotPasswordProps`, `AddBorrowerProps`
- `ScheduleItem` type dans `types/index.ts`
- Configuration EAS Build (`eas.json`) — profiles preview (APK) et production (AAB)

### Changed
- **Type safety complète** — suppression de 57 instances de `: any`
  - Navigation props typées sur 5 écrans
  - `useNavigation<any>()` → `NativeStackNavigationProp<RootStackParamList>`
  - `catch (e: any)` → `catch (e: unknown)` avec type guard (~20 catch blocks)
  - `useState<any[]>` → types spécifiques
- `app.json` : nom `"mobile"` → `"Ya Mi"`, slug `"ya-mi"`, bundle ID `com.yami.app`, splash background burgundy
- `CreateLoanScreen` : layout compact sans scroll, taux + durée côte à côte, notes en ligne simple
- `Logo.tsx` : chemin d'import corrigé (`../../../assets/`)
- `ProfileScreen.tsx` : syntaxe JSX corrigée, ajout toggle langue FR/EN
- `useLoans.ts` / `useBorrowers` : fallback au cache en cas d'erreur réseau
- `auth.store.ts` : session maintenue offline si cache existe, clear cache + queue au logout
- Écrans mutations (Create/Edit Loan, Payment, Borrower) : queue offline + optimistic updates
- `RootNavigator` : splash animé avec durée minimum 2.5s, `newArchEnabled: false`
- StatusBar `"auto"` sur l'app, `"light"` sur le splash burgundy

### Dependencies
- `@react-native-async-storage/async-storage` — cache offline
- `@react-native-community/netinfo` — détection réseau
- `i18next` + `react-i18next` — internationalisation
- `expo-localization` — langue du téléphone
- `babel-preset-expo` — build Expo

## [1.0.0] - 2026-05-20

### Added
- Interface mobile avec React Native + Expo
- Authentification JWT avec gestion de sessions
- Création et gestion de prêts (montant, taux, durée)
- Calcul automatique des intérêts et mensualités
- Suivi des remboursements (complet, partiel, retard)
- Système de notifications pour les échéances
- Partage de tickets via WhatsApp, Telegram, SMS
- Génération de contrats PDF avec QR code
- Export de données (Excel, CSV, PDF)
- Historique complet des transactions
- Interface utilisateur avec NativeWind (Tailwind CSS)
- Configuration Expo pour déploiement mobile
- Logo et icône de l'application (utilisés pour splash screen, app icon, adaptive icon, favicon)
- Composant Logo réutilisable avec multiple tailles (small, medium, large)
- Mode sombre/clair avec toggle dans paramètres
- Persistance du thème avec SecureStore
- TypeScript pour type safety
- Jest pour testing

### Changed
- Structure du projet organisée avec src/
- Configuration metro bundler optimisée
- Intégration du logo dans tous les écrans d'authentification (SplashScreen, LoginScreen, SignupScreen, OnboardingScreen)
- Intégration du logo dans les écrans principaux (DashboardScreen, MyLoansScreen, BorrowersScreen, PayScreen, NotificationsScreen)
- Intégration du logo dans les écrans d'édition/création (CreateLoanScreen, EditLoanScreen, AddBorrowerScreen, EditBorrowerScreen, AddPaymentScreen, ContractScreen, LoanDetailScreen)
- app.json maintenant pointe vers yami_logo.png pour tous les assets
- Refactorisation des headers pour utiliser composant Logo cohérent partout
- Remplacement de tous les textes "Y" par le logo réel
- Tous les écrans supportent maintenant le dark mode avec couleurs dynamiques
- ProfileScreen inclut toggle dark/light mode avec animation
- Colors.ts réorganisée en palettes light et dark avec helper getColors()
- Palette couleurs dark mode: fondclairs (#191113), surfaces (#261d1f), primaire rose (#ffb2b9), secondaire or (#e6c443)

### Features Dark Mode
- Toggle sun/moon dans ProfileScreen
- Persistance du thème entre sessions
- Couleurs adaptées au thème sur tous les écrans
- Support complet du mode sombre conformément au design system

### Fixed
- Gestion des erreurs d'authentification
- Synchronisation des données avec le backend

## [0.1.0] - 2026-01-01

### Added
- Initialisation du projet mobile
- Setup Expo et React Native
- Configuration TypeScript
- Configuration Tailwind CSS avec NativeWind
