# Handoff — CompletaProfiloPage (IoSonoTrento)

## Cosa è

Pagina di **onboarding cittadino** mostrata una volta dopo il primo login con Google su IoSonoTrento, prima di poter accedere alle funzioni di voto e sondaggi. Raccoglie i 3 campi che Google non fornisce: **data di nascita**, **comune di residenza** (drop-down sui comuni della Provincia Autonoma di Trento), **circoscrizione** (condizionale: solo se il comune è Trento).

## Sui file

I file in questo bundle sono **codice React production-ready** (non un prototipo). `CompletaProfiloPage.jsx` usa `import` ESM, `export default`, e dipende da `lucide-react` per le icone. `CompletaProfiloPage.css` è completamente scoped col prefisso `.cp-` e non richiede token globali.

## Fidelity

**Hi-fi.** Colori, tipografia, spacing, radius e shadow sono finali. Ricreare 1:1.

## Files

```
handoff_CompletaProfiloPage/
├── README.md                       ← questo file
├── CompletaProfiloPage.jsx         ← componente React drop-in
├── CompletaProfiloPage.css         ← CSS scoped self-contained
└── preview.html                    ← anteprima standalone in browser
```

## Drop-in

```bash
cp -r CompletaProfiloPage/ <repo>/src/pages/
npm i lucide-react   # se non già presente
```

```jsx
import CompletaProfiloPage from './pages/CompletaProfiloPage/CompletaProfiloPage';

<Route path="/completa-profilo" element={
  <CompletaProfiloPage
    googleUser={{ nome, email, picture }}            // dall'oggetto Google identity
    onSubmit={async ({ dataNascita, comuneResidenza, circoscrizione }) => {
      await api.post('/cittadino/profilo', { dataNascita, comuneResidenza, circoscrizione });
      navigate('/');
    }}
  />
}/>
```

Mostra questa pagina **solo se** il backend dice che il profilo del cittadino non è ancora completo (es. `user.profileCompleted === false`). Dopo il submit, il backend deve marcare il profilo come completo e i prossimi login devono saltarla.

## Props

| prop | tipo | obbligatoria | descrizione |
|---|---|---|---|
| `googleUser` | `{ nome, email, picture }` | sì (default demo) | Dati read-only mostrati nella card in alto. `picture` è l'URL dell'avatar Google; se assente vengono mostrate le iniziali. |
| `onSubmit` | `({ dataNascita, comuneResidenza, circoscrizione }) => Promise<void>` | sì | Chiamata dopo la validazione client. `circoscrizione` è `null` se il comune non è Trento. Throwa un `Error` con `message` per mostrare un messaggio rosso. |

## Validazione lato client

In ordine, primo errore vince:

1. `dataNascita` obbligatoria → "Inserisci la tua data di nascita"
2. `dataNascita` parsabile → altrimenti "Data di nascita non valida"
3. Età ≥ 16 anni → altrimenti "Devi avere almeno 16 anni per partecipare"
4. Età ≤ 120 anni → altrimenti "Data di nascita non valida"
5. `comuneResidenza` obbligatoria → "Seleziona il tuo comune di residenza"
6. Se `comuneResidenza === 'Trento'`, `circoscrizione` obbligatoria → "Seleziona la tua circoscrizione"

Tutto il resto va validato lato server e propagato come `Error.message`.

## Design tokens usati

### Font
- **Playfair Display 700** — wordmark, h1
- **Montserrat 400/500/600/700** — tutto il resto
- Caricati da Google Fonts via `@import` nel CSS

### Colori (hex)
| Uso | Valore |
|---|---|
| Background page | `#080808` |
| Glow blu (top-right) | `radial-gradient … rgba(31,58,137,0.30)` |
| Glow verde (bottom-left) | `radial-gradient … rgba(0,122,82,0.18)` |
| Card fill | `rgba(255,255,255,0.07)` |
| Card border | `rgba(255,255,255,0.14)` |
| Input focus border | `rgba(255,255,255,0.35)` |
| Input focus bg | `rgba(255,255,255,0.10)` |
| Testo titoli | `#ffffff` |
| Label | `rgba(255,255,255,0.82)` |
| Subtitle / sottotesto | `rgba(255,255,255,0.65)` |
| Hint / placeholder | `rgba(255,255,255,0.45)` / `rgba(255,255,255,0.32)` |
| Accent blu (italic h1, eyebrow) | `#829aff` |
| Primary CTA bg | `#1f3a89` |
| Primary CTA shadow | `0 4px 16px rgba(31,58,137,0.45)` |
| Errore | `#ff6b6b` |
| Successo | `#00d48a` |

### Radius / spacing / shadow
- Card: `border-radius: 16px`, `padding: 24px`
- Input / button: `border-radius: 14px`, input padding `12px 14px`
- Pill "da Google": `border-radius: 9999px`, padding `5px 10px`
- Avatar Google: 48×48 cerchio
- CTA height: 52 px
- Shell max-width 720 px, padding 48/32 px (top-bottom / sides)

### Iconografia
- [lucide-react](https://lucide.dev) — usate solo `Check` (12 px) e `Lock` (11 px), `currentColor`, `stroke-width: 2.2`.

## Open questions

1. **Endpoint backend** — `POST /cittadino/profilo` non esiste ancora nel codebase upstream. Va aggiunto con bcrypt-non-richiesto, salva i 3 campi e setta `profileCompleted = true`.
2. **Età minima** — il client blocca a 16 anni. Confermare con il committente: per i voti civici alcuni Comuni richiedono 18.
3. **Lista comuni** — codificata inline nel `.jsx` (lista canonica 2024 della Provincia Autonoma di Trento). Se il backend ha già una tabella comuni, sostituire con `useEffect` + `fetch`.
