# Design: Paginazione liste — RNF prestazioni/scalabilità

**Data:** 2026-05-23  
**Branch:** feat/paginazione-liste  
**Stato:** Approvato

---

## Contesto

Nessun endpoint di lista cittadino implementa paginazione. Con 120.000 utenti potenziali, le liste diventano un collo di bottiglia. Gli endpoint operatore (`GET /votazioni`, `GET /sondaggi`) hanno già paginazione offset-based con `?page=&limit=` — questo design estende lo stesso schema agli endpoint mancanti.

## Scope

Quattro endpoint da modificare:

| Endpoint | Controller | Tipo query |
|---|---|---|
| `GET /iniziative` | `getIniziative` | Aggregate MongoDB con lookup multipli |
| `POST /iniziative/cerca` | `ricercaIniziativa` | Aggregate con filtri + text search |
| `GET /votazioni/disponibili` | `getVotazioniAvailable` | `.find()` semplice |
| `GET /sondaggi/disponibili` | `getSondaggiAvaiable` | `.find()` semplice |

## Approccio scelto

**Offset-based pagination**, identico agli endpoint operatore già implementati. Scartato cursor-based per incoerenza con il codice esistente e complessità sproporzionata ai volumi attesi.

## Interfaccia API

### Query parameters (tutti gli endpoint)

| Param | Default | Vincoli | Comportamento fuori range |
|---|---|---|---|
| `page` | `1` | intero ≥ 1 | clamp a 1 |
| `limit` | `10` | intero 1–100 | clamp a [1, 100] |

### Struttura risposta

```json
{
  "message": "Iniziative trovate:",
  "iniziative": [...],
  "paginazione": {
    "totale": 250,
    "pagina": 2,
    "limite": 10,
    "pagine": 25
  }
}
```

Il campo dati usa il nome della risorsa (`iniziative`, `votazioni`, `sondaggi`) — coerente con le risposte esistenti.

Pagina oltre l'ultima → `200` con array vuoto e `paginazione` corretta (no `404`).

## Implementazione per controller

### `getIniziative` e `ricercaIniziativa` (aggregate)

La pipeline termina già con `$sort`. Si aggiungono `$skip` e `$limit` **dopo** il sort.

Il conteggio usa una pipeline parallela leggera che esegue solo il `$match` iniziale + `$count`, senza i `$lookup` costosi:

```js
const [items, countResult] = await Promise.all([
  Iniziativa.aggregate([...pipelineCompleta, { $skip: skip }, { $limit: limitNum }]),
  Iniziativa.aggregate([{ $match: matchStato }, { $count: 'totale' }])
]);
const totale = countResult[0]?.totale ?? 0;
```

Per `ricercaIniziativa`, il `$match` del conteggio include anche il filtro `$text` e le categorie (gli stessi del `matchStage` principale), escludendo i `$lookup`.

### `getVotazioniAvailable` e `getSondaggiAvaiable` (find)

Pattern identico agli endpoint operatore:

```js
const filtro = { stato: { $in: ['attivo', 'concluso'] }, tipo: '<tipo>' };
const [items, totale] = await Promise.all([
  Consultazione.find(filtro).sort({ data_inizio: -1 }).skip(skip).limit(limitNum),
  Consultazione.countDocuments(filtro)
]);
```

Il flag `voted` (se il cittadino ha già risposto) viene applicato dopo, solo agli item della pagina corrente — non sull'intera collezione.

## Documentazione da aggiornare

### Swagger

| File | Endpoint da aggiornare |
|---|---|
| `iniziativa.paths.js` | `GET /iniziative`, `POST /iniziative/cerca` |
| `votazione.paths.js` | sezione cittadino `GET /votazioni/disponibili` (riga ~593) |
| `sondaggio.paths.js` | sezione cittadino `GET /sondaggi/disponibili` (riga ~680) |

Per ognuno aggiungere:
- Query param `page` (integer, default 1, minimum 1)
- Query param `limit` (integer, default 10, minimum 1, maximum 100)
- Campo `paginazione` nello schema della risposta 200

### File .rest

Aggiungere esempi paginati nei file già esistenti:

**`iniziativa.rest`** — 2 chiamate GET con `?page=`:
```
GET http://localhost:8000/iniziative?page=1&limit=5
GET http://localhost:8000/iniziative?page=2&limit=5
```

**`votazione.rest`** e **`sondaggio.rest`** — 1 chiamata ciascuno con `?page=2`:
```
GET http://localhost:8000/votazioni/disponibili?page=2&limit=5
GET http://localhost:8000/sondaggi/disponibili?page=2&limit=5
```

## File coinvolti

```
deliverable_2/backend/src/controllers/iniziativa.controller.js
deliverable_2/backend/src/controllers/votazione.controller.js
deliverable_2/backend/src/controllers/sondaggio.controller.js
deliverable_2/backend/src/swagger/iniziativa.paths.js
deliverable_2/backend/src/swagger/votazione.paths.js
deliverable_2/backend/src/swagger/sondaggio.paths.js
deliverable_2/backend/tests/rest/iniziativa.rest
deliverable_2/backend/tests/rest/votazione.rest
deliverable_2/backend/tests/rest/sondaggio.rest
```

## Non in scope

- Paginazione su `GET /votazioni` e `GET /sondaggi` operatore (già implementata)
- Paginazione su `GET /iniziative/:id`, `GET /votazioni/:id`, ecc. (singoli record, non liste)
- Cursor-based pagination
- Caching delle risposte paginate
