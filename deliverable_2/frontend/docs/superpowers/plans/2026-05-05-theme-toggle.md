# Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un bottone dark/light nella TopBar con persistenza in localStorage e fallback su `prefers-color-scheme`.

**Architecture:** CSS custom properties su `:root` (dark default) override da `[data-theme="light"]` su `<html>`. ThemeContext gestisce lo stato, legge localStorage/prefers-color-scheme all'init, espone `toggleTheme`. Tutti i CSS hardcodati vengono migrati a token.

**Tech Stack:** React Context API, CSS custom properties, lucide-react (già installato), localStorage

**Dev server:** `cd deliverable_2/frontend && npm run dev` — porta 5173

---

## Token mapping (riferimento per tutti i task CSS)

Usa questa tabella per ogni task di migrazione CSS.

**Regola contestuale:** se il valore appare in `background:` → usa token overlay/surface; se in `border:` → usa token border.

| Valore dark hardcodato | Token | Note |
|---|---|---|
| `background: #080808` | `var(--bg)` | Solo su root di pagina |
| `rgba(8, 8, 8, 0.92)` | `var(--topbar-bg)` | Topbar |
| `rgba(8, 8, 8, 0.85)` | `var(--glass-dark)` | Glassmorphism su foto |
| `rgba(8, 8, 8, 0.75)` | `var(--glass-medium)` | Glassmorphism su foto |
| `rgba(255, 255, 255, 0.04)` – `0.09` (background) | `var(--surface)` | Card/input bg |
| `rgba(255, 255, 255, 0.10)` – `0.12` (background) | `var(--surface-raised)` | Surface elevata |
| `rgba(255, 255, 255, 0.14)` – `0.20` (background) | `var(--surface-hover)` | Hover state |
| `rgba(255, 255, 255, 0.06)` – `0.10` (border) | `var(--border)` | Border sottile |
| `rgba(255, 255, 255, 0.22)` – `0.28` (border) | `var(--border-strong)` | Border forte |
| `rgba(255, 255, 255, 0.35)` (border) | `var(--border-strong)` | Border forte |
| `#ffffff` / `#fff` / `white` (color testo) | `var(--text)` | NON su pulsanti brand |
| `rgba(255, 255, 255, 0.60)` – `0.85` (color) | `var(--text-secondary)` | Testo secondario |
| `rgba(255, 255, 255, 0.45)` – `0.58` (color) | `var(--text-muted)` | Testo attenuato |
| `rgba(255, 255, 255, 0.25)` – `0.40` (color) | `var(--text-faint)` | Testo faint |
| `rgba(255, 255, 255, 0.10)` (overlay background) | `var(--overlay)` | Pill/overlay bg |
| `rgba(255, 255, 255, 0.18)` – `0.20` (hover bg) | `var(--overlay-hover)` | Overlay hover |
| `rgba(255, 255, 255, 0.30)` (avatar bg) | `var(--avatar-bg)` | Avatar circle |
| `rgba(255, 255, 255, 0.06)` (box-shadow) | `var(--shadow-line)` | Topbar shadow |

**NON modificare (brand colors, stessi in entrambi i temi):**
`#1f3a89`, `rgba(31,58,137,X)`, `#007a52`, `#00d48a`, `#00c47a`, `rgba(0,122,82,X)`, `rgba(0,196,122,X)`, `#ff6b6b`, `rgba(231,0,11,X)`, `#f5c842`, `rgba(217,159,12,X)`, `#829aff`, `#9fb3ff`, `#c0ccff`, `rgba(100,130,255,X)`.
`color: white` dentro pulsanti brand (es. `.btn { background: #1f3a89; color: white }`) rimane `white`.

---

## Task 1: CSS token system in index.css

**Files:**
- Modify: `src/index.css`

- [ ] **Sostituisci l'intero contenuto di `src/index.css` con:**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg:              #080808;
  --topbar-bg:       rgba(8, 8, 8, 0.92);
  --glass-dark:      rgba(8, 8, 8, 0.85);
  --glass-medium:    rgba(8, 8, 8, 0.75);
  --surface:         rgba(255, 255, 255, 0.07);
  --surface-raised:  rgba(255, 255, 255, 0.10);
  --surface-hover:   rgba(255, 255, 255, 0.14);
  --border:          rgba(255, 255, 255, 0.08);
  --border-strong:   rgba(255, 255, 255, 0.24);
  --text:            #ffffff;
  --text-secondary:  rgba(255, 255, 255, 0.75);
  --text-muted:      rgba(255, 255, 255, 0.50);
  --text-faint:      rgba(255, 255, 255, 0.30);
  --overlay:         rgba(255, 255, 255, 0.10);
  --overlay-hover:   rgba(255, 255, 255, 0.18);
  --avatar-bg:       rgba(255, 255, 255, 0.30);
  --shadow-line:     rgba(255, 255, 255, 0.06);
}

[data-theme="light"] {
  --bg:              #f4f4f0;
  --topbar-bg:       rgba(255, 255, 255, 0.95);
  --glass-dark:      rgba(255, 255, 255, 0.88);
  --glass-medium:    rgba(255, 255, 255, 0.78);
  --surface:         rgba(0, 0, 0, 0.04);
  --surface-raised:  rgba(0, 0, 0, 0.06);
  --surface-hover:   rgba(0, 0, 0, 0.09);
  --border:          rgba(0, 0, 0, 0.10);
  --border-strong:   rgba(0, 0, 0, 0.20);
  --text:            #1a1a1a;
  --text-secondary:  rgba(0, 0, 0, 0.65);
  --text-muted:      rgba(0, 0, 0, 0.50);
  --text-faint:      rgba(0, 0, 0, 0.30);
  --overlay:         rgba(0, 0, 0, 0.06);
  --overlay-hover:   rgba(0, 0, 0, 0.12);
  --avatar-bg:       rgba(0, 0, 0, 0.15);
  --shadow-line:     rgba(0, 0, 0, 0.06);
}

body {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg);
  color: var(--text);
}
```

- [ ] **Commit**

```bash
git add src/index.css
git commit -m "feat: aggiungi token CSS sistema tema dark/light"
```

---

## Task 2: ThemeContext

**Files:**
- Create: `src/contexts/ThemeContext.jsx`

- [ ] **Crea il file `src/contexts/ThemeContext.jsx` con:**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Commit**

```bash
git add src/contexts/ThemeContext.jsx
git commit -m "feat: aggiungi ThemeContext con persistenza localStorage e fallback prefers-color-scheme"
```

---

## Task 3: Wrap App con ThemeProvider

**Files:**
- Modify: `src/App.jsx`

- [ ] **In `src/App.jsx`, aggiungi l'import in cima:**

```jsx
import { ThemeProvider } from './contexts/ThemeContext';
```

- [ ] **Wrappa il return di `App()` con `<ThemeProvider>`:**

Prima:
```jsx
export default function App() {
  return (
    <BrowserRouter>
```

Dopo:
```jsx
export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
```

E chiudi il tag prima del `return` finale:
```jsx
    </BrowserRouter>
    </ThemeProvider>
  );
}
```

- [ ] **Avvia il dev server e verifica che la pagina carichi senza errori**

```bash
cd deliverable_2 && npm run dev
```

Apri `http://localhost:5173`. Nessun errore in console.

- [ ] **Commit**

```bash
git add src/App.jsx
git commit -m "feat: wrappa App con ThemeProvider"
```

---

## Task 4: Bottone toggle nella TopBar

**Files:**
- Modify: `src/components/TopBar.jsx`
- Modify: `src/components/TopBar.css`

- [ ] **Sostituisci l'intero contenuto di `src/components/TopBar.jsx` con:**

```jsx
import { Bell, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './TopBar.css';

export default function TopBar({ nome = '', cognome = '' }) {
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Operatore';
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <Link to="/dashboard" className="topbar__logo">IoSonoTrento</Link>

      <div className="topbar__right">
        <button className="topbar__bell" aria-label="Notifiche">
          <Bell size={20} />
        </button>

        <button
          className="topbar__bell"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link to="/operatore/profilo" className="topbar__user">
          <div className="topbar__avatar">{initials}</div>
          <span className="topbar__name">{fullName}</span>
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Sostituisci l'intero contenuto di `src/components/TopBar.css` con:**

```css
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--topbar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 var(--shadow-line);
  padding: 0 24px;
  height: 60px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar__logo {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0;
  cursor: pointer;
  text-decoration: none;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar__bell {
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  opacity: 0.85;
  transition: opacity 0.15s ease;
  color: var(--text);
}

.topbar__bell:hover {
  opacity: 1;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--overlay);
  border: 1px solid var(--overlay-hover);
  border-radius: 14px;
  padding: 0 13px;
  height: 42px;
  cursor: pointer;
  transition: background 0.15s ease;
  text-decoration: none;
}

.topbar__user:hover {
  background: var(--overlay-hover);
}

.topbar__avatar {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: var(--avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}

.topbar__name {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
```

- [ ] **Verifica nel browser**

Apri `http://localhost:5173/dashboard`. La TopBar appare con il bottone Moon (dark) o Sun (light). Click sul bottone → tema cambia e si riflette sul body background. Reload → tema persiste.

- [ ] **Commit**

```bash
git add src/components/TopBar.jsx src/components/TopBar.css
git commit -m "feat: aggiungi bottone tema dark/light in TopBar"
```

---

## Task 5: Migra CSS pagine operatore

Applica il token mapping (tabella in cima al piano) ai seguenti file. Per ogni file: apri, applica le sostituzioni elencate, salva.

**Files:**
- Modify: `src/pages/operatore/DashboardOperatorePage.css`
- Modify: `src/pages/operatore/GestioneVotazioniPage.css`
- Modify: `src/pages/operatore/GestioneSondaggiPage.css`
- Modify: `src/pages/operatore/CreaVotazionePage.css`
- Modify: `src/pages/operatore/CreaSondaggioPage.css`
- Modify: `src/pages/operatore/RiepilogoVotazionePage.css`
- Modify: `src/pages/operatore/RiepilogoSondaggioPage.css`
- Modify: `src/pages/operatore/ModificaVotazionePage.css`
- Modify: `src/pages/operatore/ModificaSondaggioPage.css`
- Modify: `src/pages/operatore/ProfiloOperatorePage.css`

- [ ] **DashboardOperatorePage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
border-bottom: 1px solid rgba(255, 255, 255, 0.08)  → border-bottom: 1px solid var(--border)
color: rgba(255, 255, 255, 0.65)  → color: var(--text-secondary)
color: #ffffff               → color: var(--text)
color: rgba(255, 255, 255, 0.75)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.7)   → color: var(--text-secondary)
background: rgba(255, 255, 255, 0.08)  → background: var(--surface)
background: rgba(255, 255, 255, 0.12)  → background: var(--surface-raised)
border-color: rgba(255, 255, 255, 0.28)  → border-color: var(--border-strong)
color: rgba(255, 255, 255, 0.45)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.62)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.58)  → color: var(--text-muted)
background: rgba(255, 255, 255, 0.09)  → background: var(--surface)
background: rgba(255, 255, 255, 0.14)  → background: var(--surface-hover)
background: rgba(255, 255, 255, 0.2)   → background: var(--overlay-hover)
background: rgba(255, 255, 255, 0.07)  → background: var(--surface)
background: rgba(255, 255, 255, 0.11)  → background: var(--surface-raised)
border-color: rgba(255, 255, 255, 0.26)  → border-color: var(--border-strong)
color: rgba(255, 255, 255, 0.9)   → color: var(--text)
color: rgba(255, 255, 255, 0.72)  → color: var(--text-secondary)
```

- [ ] **GestioneVotazioniPage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
color: #ffffff               → color: var(--text)
color: rgba(255, 255, 255, 0.65)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.6)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.58)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.55)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.45)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.75)  → color: var(--text-secondary)
background: rgba(255, 255, 255, 0.07)  → background: var(--surface)
background: rgba(255, 255, 255, 0.10)  → background: var(--surface-raised)
background: rgba(255, 255, 255, 0.08)  → background: var(--surface)
background: rgba(255, 255, 255, 0.05)  → background: var(--surface)
border-color: rgba(255, 255, 255, 0.24)  → border-color: var(--border-strong)
border-color: rgba(255, 255, 255, 0.16)  → border-color: var(--border)
border-color: rgba(255, 255, 255, 0.14)  → border-color: var(--border)
```

- [ ] **GestioneSondaggiPage.css** — stesse sostituzioni di GestioneVotazioniPage.css (palette identica).

- [ ] **CreaVotazionePage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
color: #ffffff               → color: var(--text)
color: rgba(255, 255, 255, 0.7)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.65)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.85)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.55)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.35)  → color: var(--text-faint)
color: rgba(255, 255, 255, 0.30)  → color: var(--text-faint)
color: rgba(255, 255, 255, 0.32)  → color: var(--text-faint)
background: rgba(255, 255, 255, 0.08)  → background: var(--surface)
background: rgba(255, 255, 255, 0.07)  → background: var(--surface)
background: rgba(255, 255, 255, 0.10)  → background: var(--surface-raised)
background: rgba(255, 255, 255, 0.05)  → background: var(--surface)
background: rgba(255, 255, 255, 0.14)  → background: var(--surface-hover)
background: rgba(255, 255, 255, 0.18)  → background: var(--overlay-hover)
border-color: rgba(255, 255, 255, 0.24)  → border-color: var(--border-strong)
border-color: rgba(255, 255, 255, 0.22)  → border-color: var(--border-strong)
border-color: rgba(255, 255, 255, 0.35)  → border-color: var(--border-strong)
```

- [ ] **CreaSondaggioPage.css** — stesse sostituzioni di CreaVotazionePage.css più:

```
background: rgba(255, 255, 255, 0.04)  → background: var(--surface)
border-color: rgba(255, 255, 255, 0.28)  → border-color: var(--border-strong)
color: rgba(255, 255, 255, 0.5)   → color: var(--text-muted)
color: rgba(255, 255, 255, 0.45)  → color: var(--text-muted)
```

- [ ] **RiepilogoVotazionePage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
color: #ffffff               → color: var(--text)
color: rgba(255, 255, 255, 0.5)   → color: var(--text-muted)
color: rgba(255, 255, 255, 0.45)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.55)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.65)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.75)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.82)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.85)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.6)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.4)   → color: var(--text-faint)
background: rgba(255, 255, 255, 0.07)  → background: var(--surface)
background: rgba(255, 255, 255, 0.06)  → background: var(--surface)
background: rgba(255, 255, 255, 0.10)  → background: var(--surface-raised)
background: rgba(255, 255, 255, 0.11)  → background: var(--surface-raised)
border-color: rgba(255, 255, 255, 0.28)  → border-color: var(--border-strong)
```

- [ ] **RiepilogoSondaggioPage.css** — stesse sostituzioni di RiepilogoVotazionePage.css (palette identica).

- [ ] **ModificaVotazionePage.css** — unica sostituzione:

```
color: rgba(255, 255, 255, 0.35)  → color: var(--text-faint)
```

- [ ] **ModificaSondaggioPage.css** — unica sostituzione:

```
color: rgba(255, 255, 255, 0.35)  → color: var(--text-faint)
```

- [ ] **ProfiloOperatorePage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
color: #fff                  → color: var(--text)
color: rgba(255, 255, 255, 0.65)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.55)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.45)  → color: var(--text-muted)
color: rgba(255, 255, 255, 0.35)  → color: var(--text-faint)
color: rgba(255, 255, 255, 0.5)   → color: var(--text-muted)
color: rgba(255, 255, 255, 0.82)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.32)  → color: var(--text-faint)
background: rgba(255, 255, 255, 0.07)  → background: var(--surface)
background: rgba(255, 255, 255, 0.08)  → background: var(--surface)
background: rgba(255, 255, 255, 0.10)  → background: var(--surface-raised)
background: rgba(255, 255, 255, 0.12)  → background: var(--surface-raised)
border-color: rgba(255, 255, 255, 0.35)  → border-color: var(--border-strong)
```

- [ ] **Verifica nel browser**

Apri `/dashboard`, `/votazioni`, `/sondaggi`, `/operatore/profilo`. Switcha il tema dalla TopBar. Verifica che testo, sfondi e bordi cambino correttamente in light mode.

- [ ] **Commit**

```bash
git add src/pages/operatore/
git commit -m "feat: migra CSS pagine operatore a token CSS tema"
```

---

## Task 6: Migra CSS pagine auth/landing

Queste pagine usano background fotografici. La regola per i gradienti scuri (`linear-gradient` con `rgba(9,10,10,X)`) su LoginPage è: **non modificarli** — servono per leggibilità del testo sulla foto e rimangono scuri in entrambi i temi.

**Files:**
- Modify: `src/pages/CompletaProfiloPage.css`
- Modify: `src/pages/LoginPage.css`
- Modify: `src/pages/LandingPage.css`

- [ ] **CompletaProfiloPage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
color: #fff                  → color: var(--text)
color: rgba(255,255,255,0.85)  → color: var(--text-secondary)
color: rgba(255,255,255,0.82)  → color: var(--text-secondary)
color: rgba(255,255,255,0.7)   → color: var(--text-secondary)
color: rgba(255,255,255,0.65)  → color: var(--text-secondary)
color: rgba(255,255,255,0.45)  → color: var(--text-muted)
color: rgba(255,255,255,0.35)  → color: var(--text-faint)
color: rgba(255,255,255,0.32)  → color: var(--text-faint)
background: rgba(255,255,255,0.07)  → background: var(--surface)
background: rgba(255,255,255,0.08)  → background: var(--surface)
background: rgba(255,255,255,0.10)  → background: var(--surface-raised)
background: #141414          → background: var(--surface-raised)
border: 1px solid rgba(255,255,255,0.14)  → border: 1px solid var(--border)
border-color: rgba(255,255,255,0.35)  → border-color: var(--border-strong)
```

- [ ] **LoginPage.css** — sostituzioni (NON toccare `linear-gradient` sinistro):

```
color: rgba(255, 255, 255, 0.5)   → color: var(--text-muted)
color: rgba(255, 255, 255, 0.3)   → color: var(--text-faint)
color: rgba(255, 255, 255, 0.25)  → color: var(--text-faint)
color: rgba(255, 255, 255, 0.7)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.8)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.4)   → color: var(--text-faint)
color: #ffffff                    → color: var(--text)
background: rgba(8, 8, 8, 0.75)  → background: var(--glass-medium)
border-left: 1px solid rgba(255, 255, 255, 0.07)  → border-left: 1px solid var(--border)
background: rgba(255, 255, 255, 0.06)  → background: var(--surface)
background: rgba(255, 255, 255, 0.09)  → background: var(--surface)
border-color: rgba(255, 255, 255, 0.35)  → border-color: var(--border-strong)
color: rgba(255, 255, 255, 0.25)  → color: var(--text-faint)
```

- [ ] **LandingPage.css** — sostituzioni:

```
background: #080808          → background: var(--bg)
color: #ffffff               → color: var(--text)
color: rgba(255, 255, 255, 0.85)  → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.7)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.6)   → color: var(--text-secondary)
color: rgba(255, 255, 255, 0.5)   → color: var(--text-muted)
color: rgba(255, 255, 255, 0.35)  → color: var(--text-faint)
color: rgba(255, 255, 255, 0.3)   → color: var(--text-faint)
background: rgba(8, 8, 8, 0.85)  → background: var(--glass-dark)
background: rgba(255, 255, 255, 0.05)  → background: var(--surface)
background: rgba(255, 255, 255, 0.08)  → background: var(--surface)
background: rgba(255, 255, 255, 0.07)  → background: var(--surface)
background: rgba(255, 255, 255, 0.04)  → background: var(--surface)
background: rgba(255, 255, 255, 0.02)  → background: var(--surface)
background: rgba(255, 255, 255, 0.15)  → background: var(--overlay)
background: rgba(255, 255, 255, 0.20)  → background: var(--overlay-hover)
border-color: rgba(255, 255, 255, 0.08)  → border-color: var(--border)
border-color: rgba(255, 255, 255, 0.14)  → border-color: var(--border)
border-color: rgba(255, 255, 255, 0.35)  → border-color: var(--border-strong)
color: rgba(255, 255, 255, 0.08)  → color: var(--border)
```

- [ ] **Verifica nel browser**

Apri `/` (landing) e `/login`. Switcha il tema (o modifica manualmente `localStorage.setItem('theme','light')` in console + reload). Verifica che testo e sfondi rispondano al tema. I gradienti su foto nella login rimangono scuri — comportamento corretto.

- [ ] **Commit**

```bash
git add src/pages/CompletaProfiloPage.css src/pages/LoginPage.css src/pages/LandingPage.css
git commit -m "feat: migra CSS pagine auth/landing a token CSS tema"
```

---

## Task 7: Verifica finale

- [ ] **Avvia il dev server se non attivo**

```bash
cd deliverable_2 && npm run dev
```

- [ ] **Checklist verifica manuale**

Testa ogni route con il tema light e dark:

| Route | Cosa verificare |
|---|---|
| `/dashboard` | TopBar, card, badge stato, grafici |
| `/votazioni` | Lista, pulsanti, badge |
| `/sondaggi` | Lista, pulsanti, badge |
| `/votazioni/crea` | Form, input, bottoni |
| `/sondaggi/crea` | Form, input, bottoni |
| `/operatore/profilo` | Card, form, input |
| `/login` | Pannello destra glass, form, input |
| `/` | LandingPage nav, sezioni |

Per ogni route: switcha il tema → nessun testo bianco su sfondo bianco, nessun testo nero su sfondo nero.

- [ ] **Verifica persistenza**

1. Imposta light mode
2. Reload pagina → resta light
3. Chiudi e riapri browser → resta light
4. Imposta dark mode → torna dark

- [ ] **Commit finale se necessario**

```bash
git add -p
git commit -m "fix: aggiusta token CSS residui dopo verifica finale"
```
