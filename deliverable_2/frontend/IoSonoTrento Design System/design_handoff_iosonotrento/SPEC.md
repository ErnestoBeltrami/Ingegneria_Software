# ProfiloOperatorePage — Spec design

Riferimento di design per la **sola pagina Profilo Operatore** di IoSonoTrento.
Tutti i valori sono presi 1:1 dal componente reale (`ProfiloOperatorePage.jsx` + `.css`).

---

## 1 · Font

| Ruolo | Famiglia | Pesi usati | Fallback |
|---|---|---|---|
| **Titoli** (h1, nome utente nella sidebar) | **Playfair Display** | 700 | `Georgia, serif` |
| **Tutto il resto** (body, label, bottoni, badge, input) | **Montserrat** | 400, 500, 600, 700 | `system-ui, sans-serif` |

Caricati da Google Fonts:
```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;500;600;700&display=swap
```

### Scala tipografica

| Elemento | Family | Size | Weight | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|
| `h1` "Il tuo profilo" | Playfair Display | **24 px** | 700 | 32 px | -0.3 px | `#ffffff` |
| Subtitle "Gestisci…" | Montserrat | 14 px | 400 | 20 px | — | `rgba(255,255,255,0.65)` |
| Back link "Profilo operatore" | Montserrat | 13 px | 500 | — | — | `rgba(255,255,255,0.55)` |
| Nome utente sidebar | Playfair Display | **20 px** | 700 | 1.2 | — | `#ffffff` |
| Username sidebar (`@m.rossi`) | Montserrat | 14 px | 400 | 1.2 | — | `rgba(255,255,255,0.5)` |
| Avatar iniziali | Montserrat | 22 px | 700 | — | — | `#ffffff` |
| Section label ("Informazioni", "Sicurezza") | Montserrat | **11 px** | 600 | — | **0.7 px** UPPERCASE | `rgba(255,255,255,0.35)` |
| Riga info — chiave | Montserrat | 13 px | 400 | — | — | `rgba(255,255,255,0.65)` |
| Riga info — valore | Montserrat | 14 px | 500 | — | — | `rgba(255,255,255,0.82)` |
| Field label | Montserrat | 14 px | 600 | 20 px | — | `rgba(255,255,255,0.82)` |
| Input value | Montserrat | 14 px | 400 | — | — | `#ffffff` |
| Input placeholder | Montserrat | 14 px | 400 | — | — | `rgba(255,255,255,0.32)` |
| Bottone (primary + secondary) | Montserrat | 14 px | 600 | — | — | vedi sezione bottoni |
| Badge ruolo (Root/Operatore) | Montserrat | 11 px | 700 | 22 px | — | vedi sezione badge |
| Status "Account attivo" | Montserrat | 13 px | 400 | — | — | `rgba(255,255,255,0.65)` |
| Messaggio errore/successo | Montserrat | 13 px | 500 | — | — | error `#ff6b6b` / success `#00d48a` |
| Asterisco campo obbligatorio `*` | Montserrat | 14 px | 600 | — | — | `#ff6b6b` |

---

## 2 · Colori (hex / rgba)

### Sfondi
| Token | Valore | Uso |
|---|---|---|
| Page background | `#080808` | sfondo della pagina |
| Card background | `rgba(255,255,255,0.07)` | tutte le card glass |
| Card border | `rgba(255,255,255,0.14)` | bordo card |
| Input background | `rgba(255,255,255,0.07)` | sfondo input |
| Input background (focus) | `rgba(255,255,255,0.10)` | sfondo input al focus |
| Input border | `rgba(255,255,255,0.14)` | bordo input |
| Input border (focus) | `rgba(255,255,255,0.35)` | bordo input al focus |
| Avatar background | `rgba(255,255,255,0.12)` | cerchio iniziali |
| Divider | `rgba(255,255,255,0.08)` | linea separatrice |
| Row separator | `rgba(255,255,255,0.07)` | bordo inferiore righe info |
| Header border-bottom | `rgba(255,255,255,0.08)` | sotto l'header |

### Testo (scala bianco con opacità)
| Token | Valore | Uso |
|---|---|---|
| Text 100 | `#ffffff` | titoli, nome, valori principali |
| Text 82 | `rgba(255,255,255,0.82)` | label form, valori riga info |
| Text 65 | `rgba(255,255,255,0.65)` | subtitle, chiavi riga info, status |
| Text 55 | `rgba(255,255,255,0.55)` | back link |
| Text 50 | `rgba(255,255,255,0.5)` | username sidebar, eye icon idle |
| Text 45 | `rgba(255,255,255,0.45)` | hint |
| Text 35 | `rgba(255,255,255,0.35)` | section label |
| Text 32 | `rgba(255,255,255,0.32)` | placeholder |

### Brand · Blu (primary)
| Token | Valore | Uso |
|---|---|---|
| **Blue primary** | `#1f3a89` | background bottone primario |
| **Blue accent** | `#829aff` | testo badge Root |
| Blue glow border | `rgba(100,130,255,0.25)` | bordo bottone primario |
| Blue badge bg | `rgba(31,58,137,0.25)` | background badge Root |
| Blue badge border | `rgba(100,130,255,0.30)` | bordo badge Root |
| Blue shadow | `rgba(31,58,137,0.45)` | shadow bottone primario |

### Stati semantici
| Token | Valore | Uso |
|---|---|---|
| **Error** | `#ff6b6b` | testo bottone Annulla, asterisco `*`, msg errore |
| Error bg | `rgba(231,0,11,0.12)` | background bottone Annulla |
| Error border | `rgba(231,0,11,0.25)` | bordo bottone Annulla |
| **Success** | `#00d48a` | pallino "Account attivo", msg successo |
| Success pulse | `rgba(0,212,138,0.6)` → `rgba(0,212,138,0)` | animazione box-shadow del pallino |

### Pill neutra (badge Operatore)
| Token | Valore |
|---|---|
| bg | `rgba(255,255,255,0.10)` |
| text | `rgba(255,255,255,0.65)` |
| border | `rgba(255,255,255,0.16)` |

---

## 3 · Border radius

| Elemento | Valore |
|---|---|
| Card | **16 px** |
| Input | **14 px** |
| Bottone | **14 px** |
| Badge / pill | **9999 px** |
| Avatar (cerchio) | **50 %** |
| Pallino status | **50 %** |

## 4 · Shadow

| Elemento | Valore |
|---|---|
| Bottone primario | `0 4px 16px rgba(31,58,137,0.45)` |
| Pulse pallino "Account attivo" | `0 0 0 0 rgba(0,212,138,0.6)` → `0 0 0 8px rgba(0,212,138,0)` (animato) |

## 5 · Spacing & sizing

| Elemento | Valore |
|---|---|
| Shell max-width | 900 px |
| Shell padding | 32 px (20 px sotto 720 px) |
| Gap verticale shell | 24 px |
| Header padding-bottom | 28 px |
| Layout grid | `280px 1fr`, gap 20 px (collassa a 1 colonna < 720 px) |
| Card padding | 20 px |
| Card gap interno | 16 px |
| Avatar | 72 × 72 px |
| Pallino status | 8 × 8 px |
| Badge | h 22 px, padding 0 10 px |
| Input | padding 10 px 42 px 10 px 14 px |
| Bottone | h 44 px, padding 0 18 px, gap icona 8 px |
| Bottone Annulla | flex 1 |
| Bottone Aggiorna | flex 2 |
| Riga info | padding 12 px 0 |
| Eye icon size | 16 px |
| Shield icon size | 15 px |
| ArrowLeft icon size | 14 px |

## 6 · Transizioni

Tutte le interazioni: `0.15s ease` su `border-color`, `background`, `color`, `opacity`.

| Elemento | Hover |
|---|---|
| Back link | color → `rgba(255,255,255,0.95)` |
| Eye toggle | color → `#ffffff` |
| Bottoni (primary + secondary) | opacity → 0.88 |

## 7 · Animazione "Account attivo"

```css
@keyframes po-pulse {
  0%   { box-shadow: 0 0 0 0   rgba(0,212,138,0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(0,212,138,0); }
  100% { box-shadow: 0 0 0 0   rgba(0,212,138,0); }
}
/* applicato a .po-status__dot, durata 2s, ease-out, infinite */
```

## 8 · Icone (lucide-react)

| Nome | Dove | Size | Stroke |
|---|---|---|---|
| `ArrowLeft` | back link | 14 | 2 |
| `Eye` / `EyeOff` | toggle password | 16 | 2 |
| `Shield` | bottone "Aggiorna password" | 15 | 2 |

Tutte con `currentColor`, stroke 2, linecap/linejoin `round`.
