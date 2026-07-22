# Cabinet Conseil Algérie — Site vitrine QSE / HSE / Environnement

Monorepo du site institutionnel premium d’un cabinet de conseil **QSE / HSE / Environnement** basé en Algérie, avec rayonnement Afrique & International, et back-office super-admin (CMS) pour tout éditer sans toucher au code.

## Stack

| Couche | Techno |
|--------|--------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, react-i18next, React Router v6 |
| Backend | Node.js, Express, TypeScript, Prisma, MySQL |
| Auth admin | JWT + bcrypt, cookie httpOnly |
| Médias | Multer + Sharp (WebP), `/uploads` |
| Déploiement | o2switch (Apache + Node via cPanel) |

## Structure du monorepo

```
/
├── client/          # App React (Vite)
├── server/          # API Express + Prisma
├── shared/          # Types TypeScript partagés
├── package.json     # Workspaces npm
├── .env.example
└── README.md
```

## Prérequis

- Node.js **≥ 18**
- npm **≥ 9**
- MySQL **8** (local WAMP ou distant o2switch)

## Installation

```bash
# 1. Cloner / se placer à la racine du projet
cd "CABINET CONSEIL ALGERIE"

# 2. Copier les variables d'environnement
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux
copy .env.example server\.env   # recommandé : dotenv côté server

# 3. Éditer DATABASE_URL, JWT_SECRET, ADMIN_*, SMTP_* dans .env

# 4. Installer les dépendances (workspaces)
npm install

# 5. Générer le client Prisma
npm run db:generate

# 6. Créer la base MySQL puis migrer (Phase suivante / dès que la DB est prête)
# npm run db:migrate
```

## Développement local

Deux terminaux :

```bash
# Terminal 1 — API (port 3001)
npm run dev:server

# Terminal 2 — Frontend Vite (port 5173, proxy /api → 3001)
npm run dev:client
```

- Site : [http://localhost:5173](http://localhost:5173)
- Santé API : [http://localhost:3001/api/health](http://localhost:3001/api/health)

Scripts utiles :

| Commande | Description |
|----------|-------------|
| `npm run build` | Build shared + client + server |
| `npm run lint` | ESLint sur le monorepo |
| `npm run format` | Prettier |
| `npm run db:studio` | Prisma Studio |
| `npm run db:migrate` | Migrations Prisma (dev) |

## Design (rappel)

Palette **bleu nuit + ocre / terre** (+ vert émeraude sobre en second accent), typographies **Fraunces** (titres) + **IBM Plex Sans** (corps). Pas de thème Tailwind « SaaS violet » par défaut — config custom dans `client/tailwind.config.js`.

## Déploiement o2switch (aperçu)

Le guide détaillé arrivera en Phase 6 (`DEPLOY-O2SWITCH.md`). En résumé :

1. Créer une base MySQL dans cPanel
2. Créer une application Node.js (cPanel → Setup Node.js App)
3. Définir les variables d’environnement (dont `DATABASE_URL`, `JWT_SECRET`)
4. `npm install` + `npm run build` + `npx prisma migrate deploy`
5. Servir le `client/dist` en static + proxy `/api` vers l’app Node (`.htaccess`)

## Phases du projet

| Phase | Statut |
|-------|--------|
| 1 — Setup monorepo | ✅ |
| 2 — Schéma Prisma | ✅ (schema uniquement) |
| 3 — API Express | ⏳ |
| 4 — Interface Admin | ⏳ |
| 5 — Site public | ⏳ |
| 6 — Git + déploiement o2switch | ⏳ |

## Licence

Usage privé — Cabinet Conseil Algérie.
