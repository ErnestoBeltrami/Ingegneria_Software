# Theme Toggle — Design Spec

**Data:** 2026-05-05
**Branch:** feature/light-mode
**Scope:** Frontend (deliverable_2/frontend)

---

## Obiettivo

Aggiungere un bottone nella TopBar che permette di switchare tra dark mode (default attuale) e light mode. La preferenza viene persistita in `localStorage` e, in assenza di una preferenza salvata, segue `prefers-color-scheme` del sistema operativo.

---

## Architettura

### ThemeContext (`src/contexts/ThemeContext.jsx`)

Unica fonte di verità per il tema. Logica di inizializzazione:

1. Legge `localStorage.getItem('theme')`
2. Se assente, legge `window.matchMedia('(prefers-color-scheme: dark)').matches`
3. Imposta `document.documentElement.setAttribute('data-theme', theme)`

Espone `{ theme, toggleTheme }` via React Context.

`toggleTheme` aggiorna atomicamente `document.documentElement` e `localStorage`.

### App.jsx

Wrappato con `<ThemeProvider>` come root wrapper, così il context è disponibile in tutti i componenti.

---

## Token CSS

Definiti in `src/index.css`. Il dark mode è il default (`:root`), il light mode sovrascrive con `[data-theme="light"]`.

```css
:root {
  --color-bg:            #080808;
  --color-surface:       rgba(8, 8, 8, 0.92);
  --color-border:        rgba(255, 255, 255, 0.08);
  --color-text:          #ffffff;
  --color-text-muted:    rgba(255, 255, 255, 0.6);
  --color-overlay:       rgba(255, 255, 255, 0.1);
  --color-overlay-hover: rgba(255, 255, 255, 0.18);
  --color-avatar-bg:     rgba(255, 255, 255, 0.3);
}

[data-theme="light"] {
  --color-bg:            #f4f4f0;
  --color-surface:       rgba(255, 255, 255, 0.95);
  --color-border:        rgba(0, 0, 0, 0.1);
  --color-text:          #1a1a1a;
  --color-text-muted:    rgba(0, 0, 0, 0.5);
  --color-overlay:       rgba(0, 0, 0, 0.06);
  --color-overlay-hover: rgba(0, 0, 0, 0.12);
  --color-avatar-bg:     rgba(0, 0, 0, 0.15);
}
```

---

## Componenti modificati

| File | Modifica |
|---|---|
| `src/index.css` | Token CSS aggiunti; `body` usa `--color-bg` e `--color-text` |
| `src/contexts/ThemeContext.jsx` | **Nuovo** — context + provider |
| `src/App.jsx` | Wrappato con `<ThemeProvider>` |
| `src/components/TopBar.jsx` | Bottone Sun/Moon aggiunto in `topbar__right` |
| `src/components/TopBar.css` | Colori hardcodati → variabili CSS |
| `src/pages/**/*.css` | Tutti i file CSS delle pagine migrati alle variabili |

---

## Bottone nella TopBar

- Posizione: in `topbar__right`, tra il campanello e il profilo utente
- Icona: `Moon` quando tema è dark (click → passa a light), `Sun` quando tema è light (click → passa a dark) — entrambe da `lucide-react`, già dipendenza del progetto
- Stile: identico al bottone `.topbar__bell` esistente (28×28px, background none, opacity 0.85 → 1 su hover)
- `aria-label`: "Attiva modalità chiara" / "Attiva modalità scura" in base allo stato

---

## Comportamento atteso

- Prima visita senza localStorage: tema segue `prefers-color-scheme`
- Toggle: inverte il tema corrente e salva in localStorage
- Reload pagina: ripristina il tema da localStorage istantaneamente (nessun flash)
- Il listener `matchMedia` non è necessario: la preferenza di sistema viene letta solo all'inizializzazione
