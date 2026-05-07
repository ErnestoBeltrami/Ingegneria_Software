# Production Readiness Review — IoSonoTrento Backend

> Revisione completa del branch `feature/notifiche` — 2026-05-07

---

## Legenda

| Simbolo | Significato |
|---|---|
| ❌ FAIL | Problema concreto da correggere |
| ⚠️ WARN | Non bloccante ma da pianificare |
| ✅ PASS | Controllo superato |
| ℹ️ N/A | Non applicabile al progetto |

---

## 1. Errori & Stabilità

### ✅ PASS — Nessun errore a runtime evidente
Startup corretto: DB → seed → scheduler → listen. Crash esplicito con `process.exit(1)` su DB fail presente (`index.js:27`, `database.js:18`).

### ⚠️ WARN — `error.message` esposto nelle risposte API
**49 endpoint** includono `error: error.message` nella risposta JSON (es. `notifica.controller.js:9`, `operatore.controller.js:75`). In produzione espone nomi di campi MongoDB, stack hint e dettagli interni.

```js
// Da evitare
return res.status(500).json({ message: '...', error: error.message });
// Corretto: loga internamente, risponde genericamente
return res.status(500).json({ message: 'Errore interno del server.' });
```

### ❌ FAIL — Validazione input: due vulnerabilità di sicurezza

**A) ID_cittadino spoofing — `iniziativa.controller.js:21`**
`ID_cittadino` viene accettato dal body invece di essere derivato da `req.user._id`. Un cittadino autenticato può creare iniziative a nome di altri utenti.
```js
// Fix: sostituire la riga con
ID_cittadino: req.user._id,
```

**B) IDOR su `POST /auth/complete-profile` — `auth.route.js:39`**
Endpoint completamente pubblico: accetta `cittadinoId` dal body e restituisce un JWT per quell'utente se i dati sono validi. Chiunque conosca un ID può compromettere quell'account.
```js
// Fix: aggiungere protect middleware e usare req.user._id
router.post('/complete-profile', protect, restrictTo(['cittadino']), async (req, res) => {
  const cittadinoId = req.user._id; // NON dal body
  ...
});
```

### ✅ PASS — Nessun TODO/FIXME critico

### ⚠️ WARN — 17 vulnerabilità npm (3 high, 14 moderate)
Tutte in sotto-dipendenze di `mongosh` (`lodash`, `path-to-regexp`). Radice del problema: `mongosh` è una CLI di sviluppo dichiarata in `dependencies` invece di `devDependencies`.

---

## 2. Struttura & Organizzazione

### ✅ PASS — Struttura cartelle coerente e predicibile
`routes/` → `controllers/` → `models/` con `middleware/`, `config/`, `utils/` separati.

### ⚠️ WARN — Manca il layer service
Tutta la business logic è nei controller. `auth.route.js` mescola routing e logica inline (righe 39-80).

### ⚠️ WARN — Fallback insicuro per SESSION_SECRET
`app.js:24`:
```js
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";
```
Se l'app parte senza `SESSION_SECRET` in produzione, usa una stringa nota pubblicamente.

### ❌ FAIL — Naming inconsistente

| Piano | Problema |
|---|---|
| Campi modello | `ID_cittadino` (prefisso maiuscolo) + `dataNascita` (camelCase) + `data_inizio` (snake_case) |
| File | `cittadino_controller.js` (underscore) vs `votazione.controller.js` (punto) |
| Response key | `getSondaggiAvaiable` restituisce chiave `votazioni` invece di `sondaggi` (`sondaggio.controller.js:188`) |

### ❌ FAIL — File controller troppo lunghi

| File | Righe |
|---|---|
| `sondaggio.controller.js` | **638** |
| `votazione.controller.js` | **567** |
| `iniziativa.controller.js` | **508** |

---

## 3. Ridondanza & Codice Morto

### ✅ PASS — Nessuna funzione esportata ma non chiamata

### ❌ FAIL — Dipendenze inutilizzate in `package.json`

| Package | Problema |
|---|---|
| `bcrypt` | Mai importato; si usa solo `bcryptjs` |
| `mongodb` | Driver nativo mai importato; si usa solo `mongoose` |
| `mongosh` | CLI di sviluppo in `dependencies` (non `devDependencies`) — porta 3 vuln high |
| `recharts` | Libreria React per grafici nel **backend** — appartiene al frontend |
| `es-toolkit` | Mai importato nel codice sorgente |

### ⚠️ WARN — `bcrypt` importato ma inutilizzato in `seedRoot.js:2`
L'hashing è delegato correttamente al pre-save hook di Mongoose.

### ⚠️ WARN — Logica duplicata tra sondaggio e votazione
`creaSondaggio`/`createVotazione`, `publishSondaggio`/`publishVotazione`, `archiveSondaggio`/`archiveVotazione` sono quasi identiche — ~300 righe duplicabili.

### ⚠️ WARN — Credenziali root nel file di test
`backend/tests/scripts/.test-config.json` contiene `root`/`rootPassword123`. File gitignored ma presente su disco.

---

## 4. API & Contratti

### ⚠️ WARN — `POST /iniziative/ricerca` usa il verbo errato
Una ricerca dovrebbe essere `GET /iniziative?q=...` o `GET /iniziative/ricerca`.

### ❌ FAIL — Auth/autorizzazione mancante su alcune route

| Route | Problema |
|---|---|
| `GET /cittadino/profile` | Solo `protect`, no `restrictTo(['cittadino'])` — gli operatori possono chiamarlo |
| `GET /votazioni/:id/riepilogo` | No `restrictTo` — qualsiasi utente autenticato vede i risultati aggregati |
| `POST /auth/complete-profile` | Nessun middleware di autenticazione |
| `DELETE /cittadino/vote/iniziativa/:iniziativaId` | Manca `validateObjectId` |

### ❌ FAIL — Rate limiting assente
Nessun middleware su `POST /operatore/login`, `POST /auth/complete-profile` e tutti gli endpoint pubblici.

### ⚠️ WARN — Status code non standard
`answerVote` e `answerSondaggio` restituiscono **200** per una creazione — dovrebbe essere **201**.

### ❌ FAIL — Paginazione mancante su liste pubbliche

| Endpoint | Stato |
|---|---|
| `GET /iniziative/` | ❌ Nessun limite |
| `GET /votazioni/cittadino` | ❌ Nessun limite |
| `GET /sondaggio/cittadino` | ❌ Nessun limite |
| `GET /votazioni/` (operatore) | ✅ Paginato |
| `GET /sondaggio/` (operatore) | ✅ Paginato |

---

## 5. Osservabilità & Ops

### ❌ FAIL — Logging non strutturato
Tutto il logging usa `console.log/error/warn` plain text. Nessuna correlazione, nessun formato JSON per aggregatori, nessun livello configurabile.

### ❌ FAIL — Health check non verifica MongoDB
`app.js:17` restituisce sempre `200 { status: "ok" }` anche con DB down.
```js
// Fix
app.get('/health', async (_req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ status: 'db_down' });
  res.status(200).json({ status: 'ok' });
});
```

### ❌ FAIL — Variabili d'ambiente non validate all'avvio
`JWT_SECRET` non verificato. Il server parte silenziosamente "rotto" se mancante.
```js
// Fix: aggiungere in index.js prima del resto
for (const key of ['JWT_SECRET', 'SESSION_SECRET', 'MONGODB_URI']) {
  if (!process.env[key]) {
    console.error(`FATAL: env var ${key} is required`);
    process.exit(1);
  }
}
```

### ℹ️ N/A — Migrations del DB
MongoDB/Mongoose è schemaless. Nessun meccanismo formale richiesto, ma cambiare campi `required` su documenti esistenti richiede script manuali.

### ❌ FAIL — Nessun graceful shutdown
Nessun handler per `SIGTERM`/`SIGINT`. In ambiente containerizzato il processo viene killato istantaneamente.
```js
// Fix: aggiungere in index.js
const server = app.listen(port, ...);
process.on('SIGTERM', async () => {
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
});
```

---

## Riepilogo Priorità

### 🔴 Critico

| # | Problema | File |
|---|---|---|
| C1 | IDOR su `/auth/complete-profile` — chiunque ottiene JWT altrui | `auth.route.js:39` |
| C2 | `ID_cittadino` spoofing in `createIniziativa` | `iniziativa.controller.js:21` |
| C3 | Password root hardcoded `rootPassword123` nel codice | `seedRoot.js:9` |

### 🟠 Alto

| # | Problema | File |
|---|---|---|
| A1 | `error.message` esposto in 49 risposte API | tutti i controller |
| A2 | `GET /cittadino/profile` accessibile agli operatori | `cittadino.route.js:7` |
| A3 | `GET /votazioni/:id/riepilogo` senza restrizione di ruolo | `votazione.route.js:38` |
| A4 | `DELETE /vote/iniziativa/:id` senza `validateObjectId` | `cittadino.route.js:14` |
| A5 | Nessuna paginazione su liste pubbliche | controller rispettivi |
| A6 | Dipendenze inutilizzate/errate in produzione | `package.json` |
| A7 | Health check non verifica DB | `app.js:17` |
| A8 | `JWT_SECRET` e `SESSION_SECRET` non validati all'avvio | `index.js`, `app.js` |

### 🟡 Medio

| # | Problema | File |
|---|---|---|
| M1 | Nessun rate limiting su login/auth | — |
| M2 | Nessun graceful shutdown (SIGTERM) | `index.js` |
| M3 | Logging non strutturato (`console.*`) | tutti |
| M4 | Controller > 400 righe | sondaggio, votazione, iniziativa |
| M5 | Naming inconsistente (snake/camel/ID_prefix, file naming) | modelli, file |
| M6 | `POST /iniziative/ricerca` dovrebbe essere GET | `iniziativa.route.js:30` |
| M7 | `getSondaggiAvaiable` restituisce chiave `votazioni` | `sondaggio.controller.js:188` |
| M8 | Logica duplicata tra sondaggio e votazione | controller |
