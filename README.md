# Vitilink

Plateforme B2B de mise en relation dans le secteur vitivinicole — producteurs, coopératives, négociants.

---

## Sommaire

- [Stack](#stack)
- [Prérequis](#prérequis)
- [Démarrage rapide (dev)](#démarrage-rapide-dev)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes utiles](#commandes-utiles)
- [Migrations Prisma](#migrations-prisma)
- [Branches & workflow Git](#branches--workflow-git)
- [Déploiement prod](#déploiement-prod)
- [Architecture](#architecture)

---

## Stack

| Couche | Techno |
|---|---|
| Frontend | SvelteKit 2 + Tailwind CSS 3 |
| Mobile | Capacitor 7 (iOS / Android) |
| Backend | NestJS 11 + TypeScript 5 |
| ORM | Prisma 5 |
| Base de données | PostgreSQL 16 |
| Temps réel | Socket.io 4 |
| Auth | JWT + Passport |
| Conteneurs | Docker + Docker Compose |

---

## Prérequis

- **Node.js** ≥ 20
- **Docker** + **Docker Compose** (pour la DB et l'environnement complet)
- **npm** ≥ 10

---

## Démarrage rapide (dev)

### Option A — Docker Compose (recommandé)

Lance la DB, le backend et le frontend en une commande :

```bash
# 1. Copier et remplir les variables d'environnement
cp .env.example .env               # racine (DB + ports globaux)
cp backend/.env.example backend/.env
cp front/.env.example front/.env

# 2. Démarrer tous les services
docker compose up --build
```

Les services sont accessibles sur :

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5434 |

> Les volumes Docker sont montés sur `backend/src/` et `front/src/` — le hot-reload fonctionne sans rebuild.

---

### Option B — Dev local sans Docker

Utile si tu veux déboguer le backend en dehors de Docker.

**1. Démarrer uniquement la base de données**

```bash
docker compose up db
```

**2. Backend**

```bash
cd backend
cp .env.example .env    # ajuster DATABASE_URL si besoin
npm install
npm run start:dev       # hot-reload via ts-node-dev
```

**3. Frontend** (dans un autre terminal)

```bash
cd front
cp .env.example .env
npm install
npm run dev
```

---

## Variables d'environnement

Un seul fichier `.env` à la racine suffit — Docker Compose injecte tout depuis là.
`backend/.env` et `front/.env` ne servent **qu'en dev local sans Docker** (Option B).

### `.env` racine — dev

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=vitilink

JWT_SECRET=change_me_with_a_long_random_string   # openssl rand -hex 32
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### `.env` racine — **production** (sur le serveur uniquement, jamais versionné)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mot_de_passe_fort>            # générer : openssl rand -hex 16
POSTGRES_DB=vitilink

JWT_SECRET=<secret_64_chars>                     # générer : openssl rand -hex 32
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://vitilink.app                 # domaine prod exact, pas localhost
VITE_API_URL=https://vitilink.app/api            # ⚠️ Vite bake cette valeur au build
```

> **`VITE_API_URL` est injectée au moment du `docker compose build`**, pas à l'exécution.
> Si elle vaut `localhost` au build, le frontend en prod continuera de pointer sur localhost.
> Toujours vérifier sa valeur dans le `.env` serveur **avant** de lancer `docker compose up --build`.

### `backend/.env` (dev local sans Docker uniquement)

```env
DATABASE_URL=postgresql://postgres:changeme@localhost:5434/vitilink?schema=public
JWT_SECRET=change_me_with_a_long_random_string
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### `front/.env` (dev local sans Docker uniquement)

```env
VITE_API_URL=http://localhost:3000
```

> Ne jamais committer de fichier `.env` contenant de vraies valeurs.

---

## Commandes utiles

### Backend

```bash
cd backend
npm run start:dev        # démarrage avec hot-reload
npm run build            # compilation TypeScript → dist/
npm run lint             # ESLint + Prettier
npm run test             # tests unitaires (Jest)
npm run test:e2e         # tests end-to-end
```

### Frontend

```bash
cd front
npm run dev              # serveur de développement (Vite)
npm run build            # build de production
npm run preview          # prévisualiser le build de prod
npm run check            # vérification TypeScript + Svelte
```

---

## Migrations Prisma

Le schéma Prisma est à la racine dans `prisma/schema.prisma`.

```bash
# Créer et appliquer une migration (dev)
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations existantes (prod / CI)
npx prisma migrate deploy

# Ouvrir l'interface Prisma Studio (visualiser la DB)
npx prisma studio

# Régénérer le client Prisma après un changement de schéma
npx prisma generate
```

> En développement Docker, les migrations sont appliquées automatiquement au démarrage du container backend (`migrate deploy`).

---

## Branches & workflow Git

| Branche | Rôle |
|---|---|
| `dev` | Branche principale d'intégration — base de toutes les PR |
| `feat/*` | Feature branches — une par fonctionnalité |
| `prod` | Branche de production — merge depuis `dev` uniquement |

### Workflow standard

```bash
# Partir de dev à jour
git checkout dev && git pull

# Créer ta branche
git checkout -b feat/ma-feature

# ... développement ...

git push origin feat/ma-feature
# → ouvrir une PR vers dev
```

> Ne jamais pusher directement sur `dev` ou `prod`.

### Nommage des branches

```
feat/module-conversation
feat/upload-documents
fix/jwt-expiry
chore/update-deps
```

---

## Déploiement prod

### Infrastructure

| Élément | Valeur |
|---|---|
| Serveur | VM Ubuntu 24.04 — `51.38.222.104` |
| Domaine | `vitilink.app` |
| Reverse proxy | Nginx |
| Branche | `prod` |

### ⚠️ Avant le premier déploiement — setup serveur

Ces étapes ne se font **qu'une fois** lors de l'installation initiale.

```bash
# Se connecter au serveur
ssh user@51.38.222.104

# Cloner le dépôt
cd /srv
git clone <url-du-repo> vitilink-app
cd vitilink-app

# Créer le .env de production (ne jamais le versionner)
cp .env.example .env
nano .env   # remplir toutes les valeurs prod (voir section Variables ci-dessus)
            # ⚠️ VITE_API_URL doit valoir https://vitilink.app/api
            # ⚠️ JWT_SECRET doit être un vrai secret (openssl rand -hex 32)
            # ⚠️ POSTGRES_PASSWORD doit être un vrai mot de passe fort

# Vérifier que le .env est correct avant de build
cat .env
```

> **Le `docker-compose.yml` actuel monte les sources en volume** (`./backend/src`) pour le hot-reload dev.
> En production ces volumes font planter le backend (ils écrasent le code compilé).
> Solution temporaire : commenter les lignes `volumes:` du service `backend` et `frontend` dans `docker-compose.yml` sur le serveur,
> ou créer un `docker-compose.prod.yml` sans ces montages.

### Procédure de déploiement

```bash
# ── En local ──────────────────────────────────────────────

# 1. Merger dev → prod
git checkout prod
git merge dev
git push origin prod

# ── Sur le serveur ────────────────────────────────────────

ssh user@51.38.222.104
cd /srv/vitilink-app

# 2. Récupérer le code
git pull origin prod

# 3. Vérifier le .env avant de rebuild (surtout VITE_API_URL)
cat .env | grep VITE_API_URL    # doit afficher https://vitilink.app/api

# 4. Rebuild et redémarrer
docker compose up --build -d

# 5. Appliquer les migrations DB (si le schéma a changé)
docker compose exec backend npx prisma migrate deploy

# 6. Vérifier que tout tourne
docker compose ps
docker compose logs --tail=50 backend
docker compose logs --tail=50 frontend
```

### Checklist avant chaque déploiement

- [ ] `VITE_API_URL=https://vitilink.app/api` dans le `.env` serveur
- [ ] `NODE_ENV=production` dans le `.env` serveur
- [ ] `CORS_ORIGIN=https://vitilink.app` dans le `.env` serveur
- [ ] Migrations Prisma jouées si `prisma/schema.prisma` a changé
- [ ] Logs backend OK après redémarrage (`docker compose logs backend`)

---

## Architecture

```
vitilink-app/
├── backend/              # API REST + WebSocket (NestJS)
│   └── src/
│       ├── auth/         # Authentification JWT
│       ├── users/        # Gestion des utilisateurs
│       ├── entreprise/   # Gestion des entreprises
│       ├── conversation/ # Conversations
│       ├── message/      # Messages + WebSocket gateway
│       └── prisma/       # Service Prisma partagé
├── front/                # Application web (SvelteKit)
│   └── src/routes/
│       ├── (landing)/    # Pages publiques
│       ├── home/         # Dashboard
│       ├── onboarding/   # Inscription entreprise
│       ├── signIn/       # Connexion
│       ├── signUp/       # Création de compte
│       ├── profil/       # Profil utilisateur
│       └── conversations/# Messagerie
├── prisma/
│   └── schema.prisma     # Schéma de base de données
├── docs/                 # Documentation technique
│   ├── ARCHITECTURE.md   # Doc complète stack & architecture
│   └── SUIVI_PROJET.md   # Suivi des features par dev
└── docker-compose.yml
```

Pour la documentation complète (schéma DB, flux d'auth, WebSocket…), voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
