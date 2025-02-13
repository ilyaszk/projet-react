# Projet de Jeu

Ce projet est une application de jeu web basée sur un frontend React et un backend Fastify. Le jeu permet aux utilisateurs de s'inscrire, de se connecter et de jouer à un jeu de Pong en temps réel les uns contre les autres.

## Structure du Projet

.idea/ api/ front/

### Backend (API)

Le backend est construit en utilisant Fastify et Sequelize pour la gestion de la base de données.

- **Controllers** : Contient la logique pour gérer les requêtes.
- **Models** : Définit le schéma de la base de données en utilisant Sequelize.
- **Routes** : Définit les points de terminaison de l'API et leurs gestionnaires.

### Frontend (React)

Le frontend est construit en utilisant React et Tailwind CSS pour le style.

- **Components** : Contient les composants React utilisés dans l'application.
- **Services** : Contient les fonctions pour effectuer des requêtes API.

## Prise en Main

### Prérequis

- Node.js
- npm ou yarn

### Installation

1. Clonez le dépôt :

   ```sh
   git clone https://github.com/yourusername/game-project.git
   cd game-project
   ```

2. Installez les dépendances pour le backend :

   ```sh
   cd api
   npm install
   ```

3. Installez les dépendances pour le frontend :
   ```sh
   cd ../front
   npm install
   ```

### Variables d'Environnement

Créez un fichier [.env](http://_vscodecontentref_/1) dans les répertoires [api](http://_vscodecontentref_/2) et [front](http://_vscodecontentref_/3) avec le contenu suivant :

#### API

```env
DB_NAME=nom_de_la_base_de_données
DB_USER=utilisateur
DB_PASSWORD=mot_de_passe
DB_HOST=hôte
DB_PORT=port
MDP_APP=mot_de_passe_application
HOST="localhost"
PORT="3000"
```

````env
Lancement du Projet
Démarrez le backend :

```sh
cd api
npm run dev
````

Démarrez le frontend :

```sh
cd front
npm run dev
```

Inscrivez-vous, connectez-vous et commencez à jouer !
Fonctionnalités

- Inscription et connexion des utilisateurs
- mail de confirmation
- Jeu de Pong en temps réel
- Tableau des scores
- Dark mode

Technologies Utilisées

- React
- Fastify
- Sequelize
- Tailwind CSS
- Socket.io
