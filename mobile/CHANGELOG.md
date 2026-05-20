# Changelog - Ya Mi Mobile

Tous les changements notables de ce projet seront documentés dans ce fichier.

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
