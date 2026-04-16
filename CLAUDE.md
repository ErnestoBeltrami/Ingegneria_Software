# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IoSonoTrento** — a civic participation platform for the city of Trento. Citizens can vote on consultations, submit initiatives, and answer surveys. Municipal operators manage and moderate content.

The repository is structured by academic deliverables. Active backend code lives in `deliverable_2/`. Deliverables 3 and 4 are placeholders for future frontend work.

---

## Backend (deliverable_2/)

All commands must be run from `deliverable_2/`, not the repo root.

```bash
cd deliverable_2

npm run dev          # start with nodemon (auto-reload)
npm start            # start without auto-reload
npm test             # Jest unit tests (ESM mode)
npm run test:watch   # Jest in watch mode
npm run test:coverage

# Manual API tests via .rest files
npm run test:api                         # all requests in route.rest
npm run test:api:votazione
npm run test:api:operatore
npm run test:api:cittadino
```

Health check: `http://localhost:8000/health`
Swagger docs: `http://localhost:8000/docs`

### Environment Setup

Copy and fill `deliverable_2/.env`:

```
PORT=8000
SESSION_SECRET=...
JWT_SECRET=...
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=IoSonoTrento
GOOGLE_CLIENT_ID=       # optional, Google OAuth disabled if empty
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
```

On first boot, `seedRoot.js` auto-creates an `isRoot` operatore with credentials `root` / `rootPassword123`.

---

## Architecture

### Two user roles

- **Operatore** — municipal employee, username/password auth, JWT token (`ruolo: 'operatore'`)
- **Cittadino** — citizen, Google OAuth only, JWT token (`ruolo: 'cittadino'`). New Google users get a `profiloCompleto: false` flag and must call `POST /auth/complete-profile` before receiving a token.

### Auth flow

All protected routes use `protect` middleware (JWT Bearer token). Role gating uses `restrictTo(['operatore'])` or `restrictTo(['cittadino'])`. `validateObjectId` middleware guards routes with `/:id` params.

### Domain models (`backend/src/models/`)

| Model | Key fields |
|---|---|
| `Operatore` | username, password (bcrypt), isRoot |
| `Cittadino` | email, ID_univoco_esterno (Google ID), profiloCompleto, loggedIn |
| `Consultazione` | tipo (`votazione`\|`sondaggio`), stato (`bozza`→`attivo`→`concluso`→`archiviato`), data_inizio, data_fine, data_discussione, creatoDa |
| `Domanda` | titolo, opzioni[], tipo (`risposta_singola`\|`risposta_multipla`) |
| `Iniziativa` | titolo, descrizione, ID_cittadino, ID_categoria, stato (`in_attesa`\|`approvata`\|`rifiutata`), motivazione_moderazione |
| `VotoIniziativa` | join between Cittadino and Iniziativa |
| `RispostaConsultazione` | citizen answer to a Consultazione |

**Key constraint:** `Consultazione` uses a discriminated structure — `votazione` has a single `ID_domanda`; `sondaggio` has an `ID_domande[]` array. These are mutually exclusive and enforced by Mongoose validators.

### Scheduler

`utils/scheduleConsultazioni.js` runs hourly via `node-cron` to transition `Consultazione` states: `bozza→attivo` when `data_inizio` passes, `attivo→concluso` when `data_fine` passes. It also runs immediately at startup.

### Route map

```
POST   /operatore/login
POST   /operatore/register          (operatore only)
GET    /operatore/profile            (operatore only)
PATCH  /operatore/me/password        (operatore only)
PATCH  /operatore/:id/promote        (operatore only)

GET    /auth/google
GET    /auth/google/callback
POST   /auth/complete-profile

GET    /cittadino/profile
POST   /cittadino/logout
POST   /cittadino/vote/votazione     (cittadino only)
POST   /cittadino/vote/iniziativa    (cittadino only)
DELETE /cittadino/vote/iniziativa/:id (cittadino only)
POST   /cittadino/vote/sondaggio     (cittadino only)

GET/POST /votazioni/...              (operatore manages, cittadino reads)
GET/POST/PATCH/DELETE /iniziative/...
PATCH  /iniziative/:id/modera        (operatore only)
GET/POST /sondaggio/...
GET/POST /categorie/...
```

### Swagger

API documentation is defined in `backend/src/swagger/*.paths.js` files (one per domain) and assembled in `config/swagger.js`. Always update the relevant `.paths.js` file when adding or changing endpoints.

### Manual API testing

Test files live in `backend/tests/rest/*.rest`. The test runner script (`tests/scripts/test-api.js`) handles JWT auto-login using `backend/tests/scripts/.test-config.json` (copy from `.test-config.json.example`). Dynamic variables like `{{TOKEN_OPERATORE}}`, `{{VOTAZIONE_ID}}` are resolved automatically between requests in the same file.
