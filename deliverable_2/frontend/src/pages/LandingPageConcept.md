# Concept: Landing Page IoSonoTrento

## Riferimento visivo
`landingpageinspo.webp` — estetica dark, premium, civic tech.
Sfondo nero puro, headline editoriale grande, floating card previews, glow ambrato nella CTA.

---

## Tipografia

L'inspo usa due registri: un **display serif/sans pesante** per le headline e un **sans-serif pulito** per il corpo.

### Font consigliati (Google Fonts, free)

```html
<!-- In index.html, sostituisce o affianca Montserrat -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

| Ruolo             | Font               | Peso    | Uso                            |
|-------------------|--------------------|---------|--------------------------------|
| Headline hero     | Playfair Display   | 800     | H1 landing, titolo sezioni     |
      {/* Pannello sinistro — branding */}
{/* Pannello sinistro — branding */}
<div className="flex w-1/2 flex-col items-center bg-[#090a0a] px-14 pt-16 pb-10 text-center text-white">
  
  {/* Branding top */}
  <div className="flex flex-col gap-2 mb-16">
    <h1 className="text-4xl font-bold leading-10">IoSonoTrento</h1>
    <p className="text-base text-white/50">La tua voce per la tua città</p>
  </div>

  {/* Hero text — pushed down with auto margin to center the middle content */}
  <div className="flex flex-col gap-4 mb-12">
    <h2 className="text-3xl font-bold leading-snug">
      Partecipa alla vita<br />della tua città
    </h2>
    <p className="max-w-sm text-base leading-relaxed text-white/60">
      Vota sulle iniziative locali, proponi idee e contribuisci a costruire una Trento migliore.
    </p>
  </div>

  {/* Features */}
  <div className="flex flex-col gap-4 mb-auto">
    {features.map(({ icon: Icon, name, desc }) => (
      <div key={name} className="flex items-center gap-4 text-left">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-white/10">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-white/50">{desc}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Footer */}
  <p className="text-xs text-white/30 pt-10">Servizio offerto dal Comune di Trento</p>

</div>
| Subheadline / UI  | Inter              | 400–600 | Body, label, bottoni, nav      |
| Resto dell'app    | Montserrat         | 400–700 | Invariato nelle pagine interne |

> La landing usa Playfair + Inter. Le pagine operative (dashboard, gestione) restano in Montserrat — coerenza con il design system esistente.

---

## Palette & accenti

Dall'analisi dell'inspo:

```css
/* Sfondo */
--bg:            #080808;
--bg-card:       rgba(255, 255, 255, 0.05);
--bg-card-hover: rgba(255, 255, 255, 0.09);

/* Testo */
--text-primary:   #ffffff;
--text-secondary: rgba(255, 255, 255, 0.55);
--text-dimmed:    rgba(255, 255, 255, 0.30);

/* Bordi */
--border:         rgba(255, 255, 255, 0.10);
--border-strong:  rgba(255, 255, 255, 0.18);

/* Glow hero — blu/verde (palette IoSonoTrento) */
--glow-hero: radial-gradient(ellipse 60% 40% at 50% 60%,
               rgba(31, 58, 137, 0.35) 0%,
               rgba(0, 122, 82, 0.15) 50%,
               transparent 100%);

/* Glow CTA finale — ambrato, come nell'inspo */
--glow-cta: radial-gradient(ellipse 50% 60% at 50% 80%,
              rgba(200, 150, 60, 0.25) 0%,
              transparent 70%);

/* Accent esistenti (invariati) */
--blue:  #1f3a89;
--green: #007a52;
```

---

## Struttura sezioni

### 1. Navbar fissa
- Sfondo `#080808` con `backdrop-filter: blur(12px)` allo scroll
- Logo "IoSonoTrento" a sinistra — **Playfair Display 700**, bianco
- Bottone **"Accedi"** a destra — outline `--border-strong`, hover filled `--blue`

### 2. Hero (full-width, dark)
- Headline: **Playfair Display 800**, 52–60px
  *"Partecipa alla vita della tua città"*
- Subheadline: **Inter 400**, 18px, `--text-secondary`
  *"Vota, proponi e lascia la tua voce sulle decisioni che contano a Trento."*
- Due CTA:
  - **"Accedi con Google"** — filled `--green`
  - **"Sei un operatore?"** — testo dimmed
- Floating preview cards (screenshot stilizzati dell'app)
- `--glow-hero` come `::before` assoluto con `filter: blur(80px)`

### 3. Feature grid — "Cosa puoi fare"
3 card `--bg-card`, bordo `--border`, radius 16px:
- Icona Lucide + titolo **Inter 600** + descrizione **Inter 400** `--text-secondary`

### 4. "Come funziona" — 3 step
Step 01/02/03, numeri grandi **Playfair Display 700** come decorazione, testo **Inter**.

### 5. CTA finale
- `--glow-cta` pronunciato (effetto luce calda ambrata come nell'inspo)
- Headline **Playfair Display 800**: *"Pronto a fare la differenza?"*
- Bottone grande **"Accedi ora"**

### 6. Footer minimal
- **Inter 400**, `--text-dimmed`
- Bordo top `--border`

---

## Login page semplificata

Coerente con la landing:
- Sfondo `#080808`
- Card centrata con bordo `--border`, background `--bg-card`
- Font **Inter** per il form, logo in **Playfair Display**
- Bottoni invariati (`--green` cittadino, `--blue` operatore)
- Link "← Torna alla home" — **Inter 400** `--text-dimmed`

---

## Note di routing

| Route    | Prima             | Dopo              |
|----------|-------------------|-------------------|
| `/`      | Redirect a /login | `LandingPage`     |
| `/login` | LoginPage split   | LoginPage minimal |
| `*`      | Redirect a /login | Redirect a `/`    |

---

## Note implementative
- Aggiungere il `<link>` Google Fonts in `frontend/index.html`
- Il glow è un `<div className="glow">` assoluto, `pointer-events: none`, `z-index: 0`
- Le floating preview card sono `<div>` con screenshot placeholder PNG/SVG — non screenshot reali
- Nessuna libreria aggiuntiva necessaria
