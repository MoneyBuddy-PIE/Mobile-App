# MoneyBuddy 💰

Une application mobile d'éducation financière qui permet aux enfants d'apprendre la gestion de l'argent de manière ludique et interactive, avec l'accompagnement de leurs parents.

## 📱 Description

MoneyBuddy combine apprentissage gamifié et gestion budgétaire personnalisée, permettant aux jeunes de développer de bonnes habitudes financières dès le départ. L'application rend l'éducation financière fun, interactive et accessible grâce à des interfaces adaptées selon les rôles.

### Fonctionnalités principales

#### Pour les parents 👨‍👩‍👧‍👦

- **Tableau de bord familial** : Vue d'ensemble des comptes enfants
- **Gestion de l'argent de poche** : Versements et suivi des soldes
- **Création de tâches** : Attribution de missions avec récompenses
- **Cours d'éducation** : Modules d'apprentissage pour mieux accompagner
- **Suivi des progrès** : Statistiques et évolution des enfants

#### Pour les enfants 🔸

- **Interface ludique** : Design adapté et gamifié
- **Gestion d'argent de poche** : Suivi du solde personnel
- **Tâches et récompenses** : Missions à accomplir pour gagner de l'argent
- **Éducation financière** : Cours interactifs et quiz
- **Historique des transactions** : Suivi des gains et dépenses

## 🛠 Technologies

- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **Expo Router** pour la navigation
- **Axios** pour les appels API
- **AsyncStorage** pour le stockage local
- **React Native Reanimated** pour les animations
- **React Native SVG** pour les graphiques vectoriels

## 📂 Structure du projet

```
├── app/                          # Pages et navigation (Expo Router)
│   ├── (auth)/                   # Pages d'authentification
│   ├── (app)/                    # Pages principales de l'application
│   └── index.tsx                 # Page d'accueil
├── components/                   # Composants réutilisables
├── contexts/                     # Contextes React (AuthContext)
├── services/                     # Services API
├── types/                        # Définitions TypeScript
├── utils/                        # Utilitaires (storage, logger)
├── styles/                       # Styles globaux et typographie
└── assets/                       # Images, icônes, polices
```

## 🚀 Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI : `npm install -g @expo/cli`
- Un émulateur mobile ou l'application Expo Go

### Étapes d'installation

1. **Cloner le repository**

    ```bash
    git clone [URL_DU_REPO]
    cd moneybuddy-front
    ```

2. **Installer les dépendances**

    ```bash
    npm install
    # ou
    yarn install
    ```

3. **Configuration de l'environnement**

    ```bash
    # Créer un fichier .env à la racine du projet
    cp .env.example .env

    # Configurer l'URL de l'API
    EXPO_PUBLIC_BASE_URL=https://votre-api.com
    ```

4. **Lancer l'application**
    ```bash
    npm start
    # ou
    yarn start
    ```

## 📱 Utilisation

### Première connexion

1. **Inscription** : Créez un compte parent principal
2. **Configuration du PIN** : Sécurisez votre compte avec un code à 4 chiffres
3. **Création de profils** : Ajoutez des comptes enfants ou co-parents
4. **Navigation** : Utilisez les onglets de navigation adaptés à votre rôle

### Workflow typique

#### Parents

1. Créer des tâches pour les enfants
2. Verser de l'argent de poche
3. Suivre les progrès via le tableau de bord
4. Consulter les cours d'éducation financière

#### Enfants

1. Consulter les tâches à accomplir
2. Marquer les tâches comme terminées
3. Suivre son solde d'argent de poche
4. Enregistrer ses dépenses
5. Suivre les cours interactifs

## 🔐 Sécurité

- **Authentification** : Système de tokens JWT
- **Protection des comptes** : Code PIN pour chaque profil
- **Stockage sécurisé** : Données sensibles chiffrées localement
- **Validation des données** : Contrôles côté client et serveur

## 🎨 Design

L'application utilise :

- **Polices personnalisées** : DM Sans, Corben, Plus Jakarta Sans
- **Palette de couleurs** adaptée aux enfants et parents
- **Composants Material Design** avec une touche personnalisée
- **Animations fluides** avec React Native Reanimated

## 📦 Scripts disponibles

```bash
# Développement
npm start              # Démarrer le serveur de développement
npm run android        # Lancer sur Android
npm run ios           # Lancer sur iOS
npm run web           # Lancer sur web

# Build
expo build:android    # Build Android
expo build:ios        # Build iOS
```

## 🔧 Configuration

### Variables d'environnement

```env
EXPO_PUBLIC_BASE_URL=https://api.moneybuddy.com
```

### Configuration Expo

Le fichier `app.json` contient la configuration Expo :

- Nom de l'application : MoneyBuddy
- Slug : moneybuddy
- Icônes et splash screen personnalisés
- Support iOS et Android

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence [MIT](LICENSE).

## 📞 Support

Pour toute question ou problème :

- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**MoneyBuddy** - _Construisez l'avenir financier de votre enfant, 5 minutes par jour !_ 🚀
