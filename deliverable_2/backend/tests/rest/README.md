# Test API — File .rest

Questa cartella contiene i file `.rest` per il test manuale delle API di IoSonoTrento.
Vengono eseguiti tramite lo script `backend/tests/scripts/test-api.js`.

## Prerequisiti

1. Backend avviato: `npm run dev` (o `npm run dev:all` dalla root di `deliverable_2/`)
2. MongoDB attivo e raggiungibile
3. File `.test-config.json` configurato (vedi [README dello script](../scripts/README.md))

Verifica che `baseUrl` in `.test-config.json` punti alla porta corretta (`http://localhost:8000`).

---

## Test disponibili

### Test di sviluppo (file esistenti)

| Script npm | File | Descrizione |
|---|---|---|
| `npm run test:api:operatore` | `operatore.rest` | CRUD operatore, login, promozione |
| `npm run test:api:votazione` | `votazione.rest` | Ciclo completo votazione |
| `npm run test:api:cittadino` | `cittadino.rest` | Voto cittadino su votazioni/sondaggi |
| `npm run test:api` | `votazione.rest` | Default (alias di test:api:votazione) |

File aggiuntivi senza script npm dedicato (eseguibili con `node backend/tests/scripts/test-api.js <file>`):

| File | Descrizione |
|---|---|
| `auth.rest` | Autenticazione Google OAuth |
| `sondaggio.rest` | Ciclo completo sondaggio |
| `iniziativa.rest` | Gestione iniziative cittadino |
| `categoria.rest` | Gestione categorie |

---

### Test di integrazione (nuovi)

| Script npm | File | Descrizione |
|---|---|---|
| `npm run test:login` | `test-login-operatore.rest` | Verifica login operatore |
| `npm run test:dashboard` | `test-dashboard-flow.rest` | Crea votazione/sondaggio e verifica in dashboard |

---

## `test-login-operatore.rest`

Verifica il funzionamento del login operatore in tutti gli scenari.

**Esecuzione:**
```bash
cd deliverable_2
npm run test:login
```

**Step eseguiti:**

| # | Richiesta | Esito atteso |
|---|---|---|
| 1 | `POST /operatore/login` con credenziali corrette | `200` — token JWT restituito |
| 2 | `POST /operatore/login` con password sbagliata | `401` — "Credenziali non valide" |
| 3 | `POST /operatore/login` con username inesistente | `401` — "Credenziali non valide" |
| 4 | `GET /operatore/profile` con il token ottenuto | `200` — dati profilo restituiti |

**Nota:** lo step 4 usa `{{TOKEN_OPERATORE}}`, che viene ottenuto automaticamente dal login configurato in `.test-config.json`. Questo verifica anche che il token funzioni per accedere a endpoint protetti.

---

## `test-dashboard-flow.rest`

Verifica il flusso completo di creazione e pubblicazione di una votazione e un sondaggio, e che questi appaiano nella lista "attivi" usata dalla dashboard operatore.

**Esecuzione:**
```bash
cd deliverable_2
npm run test:dashboard
```

**Step eseguiti:**

| # | Richiesta | Esito atteso |
|---|---|---|
| 1 | `POST /votazioni` — crea votazione in bozza | `201` — `VOTAZIONE_ID` estratto automaticamente |
| 2 | `PATCH /votazioni/{{VOTAZIONE_ID}}/publish` | `200` — stato diventa `attivo` |
| 3 | `GET /votazioni?stato=attivo` | `200` — la votazione appare nella lista |
| 4 | `POST /sondaggio` — crea sondaggio in bozza | `201` — `SONDAGGIO_ID` estratto automaticamente |
| 5 | `PATCH /sondaggio/{{SONDAGGIO_ID}}/publish` | `200` — stato diventa `attivo` |
| 6 | `GET /sondaggio?stato=attivo` | `200` — il sondaggio appare nella lista |

**Idempotenza:** i titoli includono `{{TIMESTAMP}}` (6 cifre, univoco per run) per evitare errori di chiave duplicata su esecuzioni ripetute. Esempio: `"Votazione di test dashboard 316111"`.

**Nota:** una volta pubblicati, votazioni e sondaggi non possono essere eliminati. I dati di test si accumulano nel DB. Per un ambiente di test pulito, usare un database dedicato oppure cancellare manualmente i documenti con titolo `"*di test dashboard*"`.

---

## Variabili dinamiche disponibili

| Variabile | Estratta da | Usata in |
|---|---|---|
| `{{TOKEN_OPERATORE}}` | login automatico con `.test-config.json` | header `Authorization` |
| `{{TOKEN_CITTADINO}}` | login automatico con `.test-config.json` | header `Authorization` |
| `{{VOTAZIONE_ID}}` | risposta creazione/lista votazione | URL, body |
| `{{SONDAGGIO_ID}}` | risposta creazione sondaggio (`sondaggioId`) | URL, body |
| `{{INIZIATIVA_ID}}` | risposta creazione iniziativa | URL, body |
| `{{CATEGORIA_ID}}` | risposta creazione categoria | URL, body |
| `{{OPERATORE_ID}}` | risposta login/profilo operatore | URL, body |
| `{{CITTADINO_ID}}` | risposta login cittadino | URL, body |
| `{{TIMESTAMP}}` | generato a runtime (ms univoci per run) | body (titoli unici) |
