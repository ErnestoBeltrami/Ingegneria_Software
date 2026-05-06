# IoSonoTrento — Design System

> Civic participation platform for the city of Trento. Citizens vote on consultations, submit initiatives, answer surveys; municipal operators (and a "root" admin) manage and moderate content.

## Sources

- **GitHub repo:** [`ErnestoBeltrami/Ingegneria_Software`](https://github.com/ErnestoBeltrami/Ingegneria_Software) — Software Engineering university project. The active code lives in `deliverable_2/frontend/` (React + Vite). Imported into this project under `deliverable_2/frontend/src/` for reference.
- **Specification:** the operator-profile page spec the user supplied (see "Profilo Operatore" mock in `ui_kits/operatore`) — defines the canonical token rules this system codifies.
- **Hero photo:** `assets/buonconsiglio.jpeg` — Castello del Buonconsiglio, the Trento landmark used as login + landing background.

The codebase has both `LandingPage` (public-facing, Inter-flavoured) and `operatore/*` pages (internal, Montserrat). The user's spec **standardises on Playfair Display + Montserrat for everything internal** — that's the rule this design system enforces. Inter remains acceptable on the marketing/landing surface only.

---

## Index

| File | What it is |
|---|---|
| `colors_and_type.css` | All design tokens (colors, fonts, radii, shadows) + base utility classes. **Import this in any new page.** |
| `assets/` | Logos, hero photo, icons. |
| `preview/` | Per-token specimen cards rendered in the Design System tab. |
| `ui_kits/operatore/` | High-fidelity recreation of the operator app — TopBar, ProfiloOperatorePage, Dashboard, Crea Votazione, components factored into JSX. |
| `SKILL.md` | Cross-compatible Agent Skill manifest. |
| `deliverable_2/` | Read-only mirror of the upstream codebase, kept for reference. |

---

## Content fundamentals

**Language:** Italian (formal "tu" — second person singular, friendly).
**Voice:** civic, sober, slightly editorial. Not playful, not bureaucratic. The Playfair page titles set the editorial tone; Montserrat keeps everything else clean and operational.
**Casing:** Title case for page titles ("Il tuo profilo", "Cambia password"). UPPERCASE with letter-spacing for **section labels only** ("INFORMAZIONI", "SICUREZZA"). Sentence case everywhere else.
**Pronouns:** "Tu" (you-singular). Never "Lei" formal. Subject is often dropped: "Gestisci le informazioni…", "Esprimi la tua opinione…".
**Microcopy patterns:**
- Page subtitle restates the action: *"Gestisci le informazioni del tuo account"*, *"Crea e monitora le votazioni"*.
- Empty state: *"Nessuna attività trovata."*
- Loading: *"Caricamento…"* (with ellipsis).
- Errors: short, lowercase, no period — *"Le password non coincidono"*, *"Credenziali non valide"*.
- CTA verbs: **Accedi · Crea · Salva · Aggiorna · Annulla · Pubblica · Elimina · Modifica · Vai · Riepilogo**. Always imperative, single word where possible.
- Button with secondary action: just the verb ("Annulla"), never "Annulla operazione".
- Greeting: *"Ciao, {nome} 👋"* — the **only** place an emoji appears in the UI.

**Tone examples:**
- Hero: *"Partecipa alla vita della tua città"* — editorial, italic-feeling Playfair.
- Civic framing: *"La tua voce per la tua città"*, *"Servizio offerto dal Comune di Trento"*.
- Operator framing: *"Gestisci…"*, *"Crea…"*, *"Modera…"* — all action-first.

---

## Visual foundations

**Vibe:** dark civic-tech. Glassmorphic, editorial display type, restrained color, blue-led. Trento landmarks appear *only* in the public surfaces (landing, login) — internal pages are pure black with translucent white panels.

**Background:** flat `#080808`. Never gradients on internal pages. Public surfaces (landing/login) layer the Buonconsiglio photo under a heavy dark gradient + a subtle radial glow (`rgba(0,122,82,0.18)` green → `rgba(31,58,137,0.10)` blue, 70% × 50% ellipse at 40/40).

**Color usage rules:**
- **Blue (`#1f3a89`)** = primary actions, active filters, operator role accents. Always with `border 1px rgba(100,130,255,0.25)` and `box-shadow 0 4px 16px rgba(31,58,137,0.45)` for raised buttons.
- **Blue accent (`#829aff`)** = links, "Vai" arrows, role-Root chip, the only true coloured text on dark.
- **Green (`#007a52` / `#00d48a`)** = citizen path on public surface; success/active state internally; never used for primary CTAs in operator UI.
- **Red (`#ff6b6b`)** = destructive only — Annulla, Elimina, validation errors, required-asterisk.
- **Yellow (`#f5c842`)** = warning / draft state only.

**Type:** Playfair Display 700 (display), Montserrat 400/500/600/700 (body), Inter 400/500/600 (landing only). Page titles are Playfair 24px / 700 with `letter-spacing -0.3px`. Editorial heroes go up to 66px (login left panel) or `clamp(40px, 5vw, 58px)` (landing).

**Cards:** glassmorphism — `rgba(255,255,255,0.07)` over `border 1px rgba(255,255,255,0.14)` over `border-radius 16px` over `padding 20px`. **No drop shadows** on internal cards (only on raised CTAs). Hover lifts the bg to `0.10` and border to `0.24` over 0.15s ease.

**Borders:** always white at low opacity. `rgba(255,255,255,0.07)` for separators, `0.14` for default borders, `0.35` for focus.

**Shadows:** only two, both blue:
- Primary CTA: `0 4px 16px rgba(31,58,137,0.45)`
- Active filter pill: `0 2px 10px rgba(31,58,137,0.40)`
Glass cards have **no shadow**. The design relies on layered translucent surfaces, not elevation.

**Layout:** `max-width: 900px`, `margin: 0 auto`, `padding: 32px`. TopBar is sticky at top (60px tall, `backdrop-filter: blur(12px)`). Page header has `border-bottom: 1px solid rgba(255,255,255,0.08)` separating it from content.

**Hover states:** raise opacity (`0.88` for raised buttons), lighten glass (`+0.03` bg, `+0.10` border), or bump text from 65% → 90%. Always 0.15s ease. Never scale.
**Focus states:** input border `rgba(255,255,255,0.35)` + bg `rgba(255,255,255,0.10)`. No outline rings.
**Press states:** none — the platform doesn't use active/pressed colour shifts.

**Transitions:** universally `0.15s ease`. The slow ones (0.3s) are reserved for the landing page's nav bg/blur fade-on-scroll.

**Backdrop blur:** used on TopBar (`12px`) and on the login right panel (`20px`). Internal cards are *not* blurred — they're flat translucent.

**Radii:** **14px** for inputs and buttons, **16px** for cards, **9999px** for pills/badges, **50%** for avatars. Don't mix.

**Avatars:** circles with `rgba(255,255,255,0.30)` (TopBar) or `rgba(255,255,255,0.12)` (large profile, 72px). Initials in Montserrat 700, white.

**Imagery:** the Buonconsiglio photo is the **only** photographic asset and appears only on public surfaces with a heavy dark overlay. No illustrations. No stock. The brand "imagery" is mostly typographic + glass.

**Animation:** sparing. The only animation in the spec is the `Account attivo` pulsing green dot. Otherwise: fade transitions on hover/focus, that's it.

---

## Iconography

**Icon library:** [lucide-react](https://lucide.dev) — already a `package.json` dep in the codebase. **Always 18–20px, stroke-width 2, currentColor.** Common icons used: `Vote, BarChart2, LayoutGrid, Plus, Search, Activity, ChevronRight, Bell, ArrowLeft, Shield, ShieldCheck, Eye, EyeOff, Users, Vote`.

**Icon containers:** when an icon needs a chip behind it, use a 36–44px rounded square (`border-radius: 14px`) tinted with the icon's semantic color at low opacity:
- Blue features: `bg rgba(31,58,137,0.18)`, `border rgba(100,130,255,0.20)`, icon `#829aff`.
- Green features: `bg rgba(0,122,82,0.15)`, `border rgba(0,122,82,0.25)`, icon `#00c47a`.
- Amber features: `bg rgba(146,64,14,0.18)`, icon `#f59e0b`.

**Emoji:** essentially never. The single allowed instance is `👋` in the dashboard greeting *"Ciao, {nome} 👋"*. Nothing else.

**Unicode chars:** the back button uses a literal `←` followed by text ("← Profilo operatore"). Bullet separators use `·`. Otherwise no decorative unicode.

**No SVG illustrations** were found in the codebase — only icons and one photo. If a hand-drawn illustration is needed, it should be commissioned, not invented.

**Substitution note:** Playfair Display and Montserrat are **self-hosted** as variable .ttf files in `fonts/` (uploaded by the user). Inter still loads from Google Fonts CDN via `@import` in `colors_and_type.css` and is only used on the public-facing landing surface.

---

## Quick start

```html
<link rel="stylesheet" href="colors_and_type.css">

<!-- A canonical operator page header -->
<header class="page-header">
  <h1>Il tuo profilo</h1>
  <p class="subtitle">Gestisci le informazioni del tuo account</p>
</header>

<!-- A glass card with section + form row -->
<div class="card">
  <span class="section-label">Informazioni</span>
  <div class="row"><span class="hint">Nome</span><span class="label">Marco</span></div>
</div>

<!-- A primary action -->
<button class="btn-primary">Aggiorna password</button>
```

See `ui_kits/operatore/index.html` for a complete working example.
