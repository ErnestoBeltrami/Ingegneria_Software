# ProfiloOperatorePage

Pagina **profilo operatore** per IoSonoTrento — coerente con il resto del design system (dark premium, glass card, Playfair Display + Montserrat, accenti blu).

## Files

| File | Cosa è |
|---|---|
| `ProfiloOperatorePage.jsx` | Componente React production-ready (usa `import`, `lucide-react`, `export default`). |
| `ProfiloOperatorePage.css` | CSS scoped (prefisso `.po-`), self-contained — non dipende dal design system globale. |
| `preview.html` | Anteprima standalone in browser (inline-Babel, icone lucide stub-ate). Aprire questo file per vedere la pagina. |

## Uso (codebase reale)

```bash
npm i lucide-react
```

```jsx
import ProfiloOperatorePage from './components/ProfiloOperatorePage/ProfiloOperatorePage';

function App() {
  const utente = { nome: 'Marco', cognome: 'Rossi', username: 'm.rossi', ruolo: 'root' };

  return (
    <ProfiloOperatorePage
      user={utente}
      onBack={() => navigate('/operatore')}
      onSubmit={async ({ passwordAttuale, nuovaPassword }) => {
        await api.put('/operatore/password', { passwordAttuale, nuovaPassword });
      }}
    />
  );
}
```

## Props

| prop | tipo | default | descrizione |
|---|---|---|---|
| `user` | `{ nome, cognome, username, ruolo }` | `{ nome:'Marco', cognome:'Rossi', username:'m.rossi', ruolo:'root' }` | Dati visualizzati nella sidebar e nella card "Informazioni". `ruolo` può essere `'operatore'` o `'root'`. |
| `onBack` | `() => void` | — | Se passata, mostra il link "← Profilo operatore" in alto. |
| `onSubmit` | `({ passwordAttuale, nuovaPassword }) => Promise<void>` | demo locale (ritardo 600 ms) | Chiamata al submit dopo la validazione lato client. Solleva un `Error` per mostrare un messaggio rosso. |

## Validazione lato client

- Tutti e tre i campi sono obbligatori → `"Compila tutti i campi"`.
- Conferma deve coincidere → `"Le password non coincidono"`.
- Nuova password ≥ 8 caratteri → `"La nuova password deve essere di almeno 8 caratteri"`.

Tutto il resto (complessità, controllo password attuale corretta, blacklist, …) va validato lato server e propagato come `Error.message`.

## Note di design

- **Layout 280 px + 1fr** che collassa a singola colonna sotto 720 px.
- **Avatar 72 px** con iniziali in Montserrat 700.
- **Stato Account attivo** = pallino verde `#00d48a` con `box-shadow` pulsante (2 s).
- **Pulsante primario** blu `#1f3a89` con `box-shadow 0 4px 16px rgba(31,58,137,0.45)`.
- **Pulsante Annulla** rosso `#ff6b6b` su sfondo `rgba(231,0,11,0.12)` — uso esclusivamente per azioni distruttive / di abbandono.
- Tutti i radius: 14 px (input/btn), 16 px (card), 9999 px (pill), 50 % (avatar/dot).
