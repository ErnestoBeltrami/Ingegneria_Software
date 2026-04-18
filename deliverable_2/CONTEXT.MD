# IoSonoTrento - Application Context

## Overview
**IoSonoTrento** is a civic participation web application designed for the municipality of Trento. It facilitates engagement between citizens and the local administration through initiatives, polls, and voting. 

The application is structured as a full-stack JavaScript project using a decoupled Client-Server architecture (Frontend and Backend split into separate directories).

## Repository Structure
- `backend/`: Node.js/Express API.
- `frontend/`: React single-page application built with Vite.
- `package.json` (Root): Useful scripts to run both environments simultaneously (e.g., `npm run dev:all` using concurrently).

---

## Backend (`/backend`)

### Technology Stack
- **Runtime & Framework**: Node.js, Express.js (v5.x)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: 
  - **Citizens**: Google OAuth 2.0 (using `passport` and `passport-google-oauth20`)
  - **Operators**: Local authentication using JWT (`jsonwebtoken`) and `bcrypt`
- **Testing**: Jest with Supertest

### Domain Models
The database relies on several Mongoose schemas outlining the application entities:
- `cittadino`: User accounts for citizens.
- `operatore`: User accounts for municipal administration operators.
- `iniziativa`: Civic proposals/initiatives.
- `categoria_iniziativa`: Categories mapping to type of initiatives.
- `voto_iniziativa`: Mapping for votes placed by citizens on specific initiatives.
- `consultazione`: Consultations/surveys opened by operators.
- `domanda`: Represents questions in a consultation.
- `risposta_consultazione`: Answers recorded from citizens on surveyed questions.

### API Routes Architecture
The backend serves several RESTful endpoints handling specific entity domains:
- `auth.route.js`: Handles Google OAuth and Operator Logins.
- `cittadino.route.js`: Handlers specific to citizen profiles and actions.
- `operatore.route.js`: Handlers for administration operators.
- `iniziativa.route.js`: CRUD and logic around civic initiatives.
- `categoria.route.js`: Categories management.
- `sondaggio.route.js`: Management of surveys/polls for users.
- `votazione.route.js`: Logistics handling and recording votes.

---

## Frontend (`/frontend`)

### Technology Stack
- **Framework & Bundler**: React 18 (using Hooks), Vite
- **Routing**: `react-router-dom` (BrowserRouter, Routes, Route)
- **Styling**: Vanilla CSS (e.g., `index.css`, `LoginPage.css`). *Note: Tailwind CSS or CSS Modules are currently not in use.*
- **Icons**: `lucide-react`

### Structure and State
- **Root**: `main.jsx` and `App.jsx` setup global routing.
- **Pages**:
  - `LoginPage.js` / `.css`: Entry point for both Citizens (via Google redirect) and Operators (via local form). Handles routing to the Dashboard depending on role.
  - `dashboard/`: Contains components related to the internal dashboard. Notable WIP components: `ActivityCard.jsx` / `ActivityCard.css`.
- **Environment Handling**: Uses `VITE_BACKEND_URL` from `.env` to route requests towards the API. Default fallback typically points to `http://localhost:8000`.

## Key User Roles
1. **Cittadino (Citizen)**: Logs in using Google OAuth. Can view initiatives, propose them, and vote/respond to polls and surveys (consultazioni).
2. **Operatore (Operator)**: Authorized administrative users. Managed using local credentials (username/password). Used to manage categories, polls, and monitor platform engagement.
