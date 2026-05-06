# Handoff — IoSonoTrento Design System & Profilo Operatore

## Overview

This bundle ships the **IoSonoTrento** design system (dark, glassmorphic, editorial — Playfair Display + Montserrat) plus a fully-built **ProfiloOperatorePage** for the operator (municipal employee) area.

The target codebase is `ErnestoBeltrami/Ingegneria_Software`, branch `main`, folder `deliverable_2/frontend/` — a React 18 + Vite app. Existing operator pages there (`DashboardOperatorePage`, `GestioneVotazioniPage`, `CreaVotazionePage`, `GestioneSondaggiPage`, `RiepilogoVotazionePage`, …) currently use Montserrat with ad-hoc per-page CSS. This handoff brings them under one design language.

## About the design files

The files in this bundle are **design references built in HTML / React-via-Babel-in-browser** — prototypes showing intended look and behaviour, not production code to drop in untouched. The task is to **recreate the designs in the target codebase's existing environment** (React 18 + Vite + plain CSS files, lucide-react for icons), reusing its established patterns:

- One `.jsx` + one `.css` file per page (matches existing `LoginPage.jsx` / `LoginPage.css` style)
- React Router for navigation (the codebase already has `react-router-dom`)
- `lucide-react` for icons (already a dep — confirm in `package.json`)
- No CSS framework — plain CSS with custom properties, scoped via class prefix per page

The one component that's already production-shaped — `components/ProfiloOperatorePage/` — can be copied across **almost** verbatim (see "Drop-in path" below).

## Fidelity

**High-fidelity.** Final colors, typography, spacing, radii, shadows, hover/focus states, animations. Recreate pixel-perfectly. The single source of truth for tokens is `tokens/colors_and_type.css`.

---

## What's in this bundle

```
design_handoff_iosonotrento/
├── README.md                              ← you are here
├── DESIGN_SYSTEM.md                       ← full design system spec (content, voice, visual rules, iconography)
├── tokens/
│   └── colors_and_type.css                ← all CSS custom properties + base utility classes
├── fonts/
│   ├── PlayfairDisplay-VariableFont_wght.ttf
│   ├── PlayfairDisplay-Italic-VariableFont_wght.ttf
│   ├── Montserrat-VariableFont_wght.ttf
│   └── Montserrat-Italic-VariableFont_wght.ttf
├── components/
│   └── ProfiloOperatorePage/              ← drop-in React component
│       ├── ProfiloOperatorePage.jsx
│       ├── ProfiloOperatorePage.css
│       ├── preview.html                   ← standalone browser demo
│       └── README.md                      ← props / usage
└── ui_kits/operatore/                     ← reference prototypes for surrounding screens
    ├── index.html                         ← click-thru: Dashboard ↔ Profilo ↔ Crea Votazione
    ├── styles.css
    ├── TopBar.jsx                         ← (Babel-in-browser, NOT production-shaped)
    ├── DashboardOperatorePage.jsx
    ├── CreaVotazionePage.jsx
    ├── ProfiloOperatorePage.jsx           ← older Babel-in-browser version; ignore — use the one in components/
    ├── Icons.jsx
    └── README.md
```

`ui_kits/operatore/*.jsx` are written for in-browser Babel (no `import`, `export`, or `lucide-react`). Use them as **visual specs**, not source. The production-shaped module is `components/ProfiloOperatorePage/`.

---

## Drop-in path (recommended)

### 1. Vendor the fonts

Copy `fonts/*.ttf` into `deliverable_2/frontend/src/assets/fonts/` (or `public/fonts/` — match where existing assets live). Update the `@font-face` URLs in `tokens/colors_and_type.css` to point there.

### 2. Add design tokens at app root

Copy `tokens/colors_and_type.css` to `src/styles/colors_and_type.css` and import it once in `src/main.jsx` (or wherever `index.css` is currently imported):

```jsx
import './styles/colors_and_type.css';
```

This makes every CSS custom property (`--blue-primary`, `--bg-card`, `--text-65`, etc.) available app-wide. Existing pages can migrate to these tokens incrementally.

### 3. Drop in the Profilo page

```bash
cp -r components/ProfiloOperatorePage src/pages/
npm i lucide-react   # if not already installed
```

Wire it up in your router:

```jsx
import ProfiloOperatorePage from './pages/ProfiloOperatorePage/ProfiloOperatorePage';

<Route path="/operatore/profilo" element={
  <ProfiloOperatorePage
    user={currentUser}
    onBack={() => navigate('/operatore')}
    onSubmit={async ({ passwordAttuale, nuovaPassword }) => {
      await api.put('/operatore/password', { passwordAttuale, nuovaPassword });
    }}
  />
} />
```

The CSS file is self-contained (prefix `.po-`), no global tokens required — but if you've already wired up `colors_and_type.css` you can refactor `ProfiloOperatorePage.css` to consume vars instead of literal hex.

---

## Screens

### Profilo Operatore (`/operatore/profilo`) — production-ready

**Purpose:** the operator views their identity, role, and changes their password.

**Layout:** centered shell, `max-width: 900px`, `padding: 32px`, vertical gap 24 px. Below: a CSS grid with `grid-template-columns: 280px 1fr`, gap 20 px, `align-items: start`. Collapses to a single column under 720 px viewport.

**Components:**

- **Back link (top-left)**: `← Profilo operatore`. Montserrat 13/500, color `rgba(255,255,255,0.55)` → `0.95` on hover. Icon size 14 px, gap 6 px. Renders only if `onBack` prop is passed.

- **Page header**: padding-bottom 28 px, `border-bottom: 1px solid rgba(255,255,255,0.08)`.
  - h1 "Il tuo profilo" — Playfair Display 700, 24/32, `letter-spacing: -0.3px`.
  - p "Gestisci le informazioni del tuo account" — Montserrat 400, 14/20, color `rgba(255,255,255,0.65)`, `margin-top: 4px`.

- **Sidebar identity card** (left column, glass card 20 px padding, `border-radius: 16px`, `bg rgba(255,255,255,0.07)`, `border 1px rgba(255,255,255,0.14)`):
  - Avatar 72×72, `border-radius: 50%`, `bg rgba(255,255,255,0.12)`, initials in Montserrat 700/22, white.
  - Name "Marco Rossi" — Playfair Display 700/20, line-height 1.2.
  - Username "@m.rossi" — Montserrat 400/14, color `rgba(255,255,255,0.5)`.
  - Role badge: 22 px tall, padding 0 10 px, `border-radius: 9999px`, font 11/700.
    - Operatore: `bg rgba(255,255,255,0.10)`, color `rgba(255,255,255,0.65)`, `border rgba(255,255,255,0.16)`.
    - Root: `bg rgba(31,58,137,0.25)`, color `#829aff`, `border rgba(100,130,255,0.30)`.
  - Divider: full-width 1 px line, `bg rgba(255,255,255,0.08)`.
  - Status row: 8 px green dot `#00d48a` with pulsing `box-shadow` (2 s ease-out infinite, 0 → 8 px → 0) + text "Account attivo" in 13/400, `rgba(255,255,255,0.65)`.

- **Information card** (right column, top):
  - Section label "INFORMAZIONI" — 11/600, `letter-spacing: 0.7px`, uppercase, color `rgba(255,255,255,0.35)`.
  - Three rows: Nome / Cognome / Username. Each row: `padding: 12px 0`, `border-bottom: 1px solid rgba(255,255,255,0.07)` (last row none), `display: flex; justify-content: space-between`. Key 13/400 color `rgba(255,255,255,0.65)`. Value 14/500 color `rgba(255,255,255,0.82)`.

- **Security card** (right column, bottom — `<form>`):
  - Section label "SICUREZZA".
  - Three password fields: "Password attuale", "Nuova password", "Conferma nuova password". Each field:
    - Label 14/600 color `rgba(255,255,255,0.82)` with red `*` (`color #ff6b6b`).
    - Input: `bg rgba(255,255,255,0.07)`, `border 1px rgba(255,255,255,0.14)`, `border-radius: 14px`, `padding: 10px 42px 10px 14px`, font 14, color white, placeholder `rgba(255,255,255,0.32)`. On focus: `border-color rgba(255,255,255,0.35)`, `bg rgba(255,255,255,0.10)`. No outline ring. Transition 0.15 s ease.
    - Eye/eye-off toggle button absolutely positioned `right: 12px`, `top: 50%`, color `rgba(255,255,255,0.5)` → white on hover. Icon 16 px (lucide).
  - Form messages: 13/500. Error `#ff6b6b`, success `#00d48a`.
  - Action row: flex, gap 10 px.
    - Annulla (secondary): flex 1, height 44 px, `border-radius: 14px`, `bg rgba(231,0,11,0.12)`, `border rgba(231,0,11,0.25)`, color `#ff6b6b`, font 14/600. Hover opacity 0.88.
    - Aggiorna password (primary): flex 2, same height/radius, `bg #1f3a89`, `border 1px rgba(100,130,255,0.25)`, white text, `box-shadow: 0 4px 16px rgba(31,58,137,0.45)`. With shield icon (lucide, 15 px). Disabled state opacity 0.4. Loading copy: "Aggiornamento…".

### Surrounding screens (reference only — re-implement in your codebase)

The `ui_kits/operatore/` HTML prototypes show the canonical look for:

- **Dashboard** (`DashboardOperatorePage`): greeting "Ciao, Marco 👋" (Playfair 700/30, `letter-spacing: -0.3px`), three nav cards (votazioni / sondaggi / moderazione bacheca, each 44 px icon chip + label + desc + "Vai →" link), two big action buttons (Crea votazione primary blue, Crea sondaggio secondary glass), search bar, four filter pills, activity grid 2-col with type badge + state badge + title + termine + "Riepilogo" pill.
- **Crea Votazione** (`CreaVotazionePage`): two-column form 1fr / 298 px. Left: titolo, descrizione (textarea 116 px min), opzioni dinamiche (radio-style cards with delete button + "Aggiungi opzione" link). Right: date inizio/fine, "Risposte multiple" toggle, Annulla/Salva action card.

The current upstream pages (in `deliverable_2/frontend/src/pages/operatore/*`) implement the same flows but with weaker styling — re-skin them to match these prototypes.

---

## Interactions & behavior

### ProfiloOperatorePage

- **Back link** triggers `onBack()` prop.
- **Eye toggles** flip password input `type` between `"password"` and `"text"` independently for each of the 3 fields (`useState({ attuale, nuova, conferma })`).
- **Annulla** clears all three password fields, error and success messages.
- **Aggiorna password** (form submit):
  1. Client-side validation, in order:
     - All three fields required → `"Compila tutti i campi"`.
     - `nuovaPassword === confermaPassword` → else `"Le password non coincidono"`.
     - `nuovaPassword.length >= 8` → else `"La nuova password deve essere di almeno 8 caratteri"`.
  2. Set `saving=true`, button text becomes "Aggiornamento…", `disabled`.
  3. Call `onSubmit({ passwordAttuale, nuovaPassword })`. If it throws, show `err.message` (or generic fallback) as red message. If it resolves, show `"Password aggiornata con successo"` in green and clear all three fields.
  4. `saving=false`.

### Animations / transitions

- All hover/focus transitions: `0.15s ease`.
- Status dot pulse: `@keyframes po-pulse` 2 s ease-out infinite, `box-shadow` from `0 0 0 0 rgba(0,212,138,0.6)` → `0 0 0 8px rgba(0,212,138,0)` → `0 0 0 0`.
- Hover on card: only on the Dashboard's nav cards and activity cards — `bg rgba(255,255,255,0.07)→0.10`, `border 0.14→0.24`.

### Responsive

- Profilo grid collapses single-column under 720 px (`@media (max-width: 720px)`), shell padding drops 32 → 20 px.
- The other operator pages keep their 900 px max-width but should also collapse stacked grids on mobile.

---

## State management

### ProfiloOperatorePage local state

```js
passwordAttuale, nuovaPassword, confermaPassword: string
showPwd: { attuale: bool, nuova: bool, conferma: bool }
saving: bool
error: string
success: string
```

No external state manager required. The `onSubmit` prop is the only side-effect surface — wire it to the existing API client (the codebase has Axios calls in `src/api/`).

### Auth / user data

`user` is passed as a prop. In the live app, source it from wherever the existing `LoginPage.jsx` writes the operator session (currently localStorage in the upstream code — confirm). Shape: `{ nome, cognome, username, ruolo: 'operatore' | 'root' }`.

---

## Design tokens

All values codified in `tokens/colors_and_type.css`. Reference highlights:

### Colors

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#080808` | App background |
| `--bg-card` | `rgba(255,255,255,0.07)` | Glass card fill |
| `--bg-card-hover` | `rgba(255,255,255,0.10)` | Glass card hover |
| `--border` | `rgba(255,255,255,0.14)` | Default border |
| `--border-strong` | `rgba(255,255,255,0.35)` | Focus border |
| `--border-soft` | `rgba(255,255,255,0.08)` | Separators |
| `--blue-primary` | `#1f3a89` | Primary button bg |
| `--blue-accent` | `#829aff` | Links, Root pill text |
| `--blue-shadow` | `rgba(31,58,137,0.45)` | Primary button shadow |
| `--green` | `#007a52` | Citizen / success accent |
| `--green-bright` | `#00d48a` | Success text, status dot |
| `--error` | `#ff6b6b` | Destructive text |
| `--error-bg` | `rgba(231,0,11,0.12)` | Annulla button bg |
| `--error-border` | `rgba(231,0,11,0.25)` | Annulla button border |
| `--warning` | `#f5c842` | Warning / draft state |
| `--text-100` | `#ffffff` | Titles |
| `--text-82` | `rgba(255,255,255,0.82)` | Labels |
| `--text-65` | `rgba(255,255,255,0.65)` | Subtitle / row keys |
| `--text-45` | `rgba(255,255,255,0.45)` | Hints |
| `--text-32` | `rgba(255,255,255,0.32)` | Placeholders |

### Typography

| Token | Value |
|---|---|
| `--font-display` | `'Playfair Display', Georgia, serif` |
| `--font-body` | `'Montserrat', system-ui, sans-serif` |
| `--font-ui` | `'Inter', 'Montserrat', sans-serif` (landing only) |

Roles: h1 24/700 -0.3px (Playfair), h2 20/700 (Playfair), section-label 11/600 +0.7px uppercase (Montserrat), label 14/600, body 14/400, hint 12/400.

### Spacing / radii / shadow

| Token | Value | Usage |
|---|---|---|
| `--r-card` | `16px` | Card corners |
| `--r-input` | `14px` | Input corners |
| `--r-btn` | `14px` | Button corners |
| `--r-pill` | `9999px` | Badges, status pills |
| `--pad-card` | `20px` | Card padding |
| `--gap-stack` | `16px` | Vertical stack gap |
| `--shadow-primary` | `0 4px 16px rgba(31,58,137,0.45)` | Primary CTA |
| `--shadow-blue-soft` | `0 2px 10px rgba(31,58,137,0.40)` | Active filter pill |
| `--transition` | `0.15s ease` | All hover/focus |

### Iconography

[lucide-react](https://lucide.dev), 18–20 px, `stroke-width: 2`, `currentColor`. Used in this page: `ArrowLeft`, `Eye`, `EyeOff`, `Shield`. **No emoji** anywhere on this page (the only allowed emoji in the whole app is `👋` in the dashboard greeting).

---

## Assets

- **Variable fonts** (4 files in `fonts/`): Playfair Display + Montserrat, regular + italic. Self-hosted `.ttf` variable axes (full 100–900 weight range).
- **Icons**: lucide-react (already a dep — verify in `package.json`).
- **No images** are required for the Profilo page. The wider design system uses `assets/buonconsiglio.jpeg` (Castello del Buonconsiglio) on the public Landing/Login surface only — not relevant here.

---

## Files in this bundle

| File | Role |
|---|---|
| `README.md` | This handoff document. |
| `DESIGN_SYSTEM.md` | Full design system spec — content fundamentals, voice, visual foundations, iconography. Read this **before** building any other page. |
| `tokens/colors_and_type.css` | Single source of truth for tokens. Drop into `src/styles/`. |
| `fonts/*.ttf` | Variable font files. Vendor into `src/assets/fonts/` (or `public/fonts/`). |
| `components/ProfiloOperatorePage/ProfiloOperatorePage.jsx` | Production-ready React module. |
| `components/ProfiloOperatorePage/ProfiloOperatorePage.css` | Self-contained scoped CSS. |
| `components/ProfiloOperatorePage/preview.html` | Standalone browser demo. Open it locally. |
| `components/ProfiloOperatorePage/README.md` | Props / usage notes for this one component. |
| `ui_kits/operatore/index.html` | Click-thru visual reference for Dashboard / Profilo / Crea Votazione. **Open this first** to see the target look-and-feel. |
| `ui_kits/operatore/styles.css` | Reference CSS for Dashboard + Crea pages. |
| `ui_kits/operatore/{TopBar,DashboardOperatorePage,CreaVotazionePage,Icons}.jsx` | Babel-in-browser reference components. Re-implement using your codebase's React patterns. |

---

## Open questions / decisions for the developer

1. **Where to vendor fonts** — `src/assets/fonts/` vs `public/fonts/`. Match what the rest of `deliverable_2/frontend/` does.
2. **Token migration strategy** — keep existing per-page CSS untouched and only style new pages with tokens, or do a full sweep refactoring `LoginPage.css`, `DashboardOperatorePage.css`, etc. to consume `var(--…)`. Recommended: full sweep, one PR per page.
3. **Auth source for `user` prop** — confirm the codebase exposes the current operator via context, hook, or localStorage, and wire `<ProfiloOperatorePage user={…} />` accordingly.
4. **API endpoint for password change** — the upstream code may not have one yet. Check `deliverable_2/backend/` and add `PUT /operatore/password` if missing, with bcrypt-compare on `passwordAttuale`.
