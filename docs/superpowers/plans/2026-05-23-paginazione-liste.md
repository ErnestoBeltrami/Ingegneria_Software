# Paginazione liste endpoint cittadino — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere paginazione `?page=&limit=` a `GET /iniziative`, `POST /iniziative/ricerca`, `GET /votazioni/cittadino`, `GET /sondaggi/cittadino`.

**Architecture:** Offset-based pagination identica agli endpoint operatore già esistenti. I controller con aggregate MongoDB aggiungono `$skip`+`$limit` in coda alla pipeline e un'aggregate leggera parallela per il conteggio. I controller con `.find()` usano `Promise.all([find().skip().limit(), countDocuments()])`.

**Tech Stack:** Node.js/Express, Mongoose, Jest (ESM con `jest.unstable_mockModule`)

---

## File Map

| File | Azione |
|---|---|
| `backend/tests/unit/iniziativa.controller.test.js` | Crea (nuovo) |
| `backend/src/controllers/iniziativa.controller.js` | Modifica — `getIniziative` (righe 71-157), `ricercaIniziativa` (righe 291-449) |
| `backend/tests/unit/votazione.controller.test.js` | Modifica — aggiungi mock + describe `getVotazioniAvailable` |
| `backend/src/controllers/votazione.controller.js` | Modifica — `getVotazioniAvailable` (righe 62-104) |
| `backend/tests/unit/sondaggio.controller.test.js` | Modifica — aggiorna chain mock, aggiorna test esistenti, aggiungi test paginazione |
| `backend/src/controllers/sondaggio.controller.js` | Modifica — `getSondaggiAvaiable` (righe 61-103) |
| `backend/src/swagger/iniziativa.paths.js` | Modifica — aggiungi page/limit a GET e POST /ricerca |
| `backend/src/swagger/votazione.paths.js` | Modifica — aggiungi page/limit alla sezione `/votazioni/cittadino` |
| `backend/src/swagger/sondaggio.paths.js` | Modifica — aggiungi page/limit alla sezione sondaggi cittadino |
| `backend/tests/rest/iniziativa.rest` | Modifica — aggiungi esempi paginati |
| `backend/tests/rest/votazione.rest` | Modifica — aggiungi esempio paginato |
| `backend/tests/rest/sondaggio.rest` | Modifica — aggiungi esempio paginato |

Tutti i comandi vanno eseguiti da `deliverable_2/`.

---

## Task 1: Paginate `getIniziative`

**Files:**
- Crea: `backend/tests/unit/iniziativa.controller.test.js`
- Modifica: `backend/src/controllers/iniziativa.controller.js`

- [ ] **Step 1: Crea il file di test con mock e test failing**

Crea `backend/tests/unit/iniziativa.controller.test.js`:

```js
import { jest } from '@jest/globals';

const mockIniziativaAggregate = jest.fn();

jest.unstable_mockModule('../../src/models/iniziativa.js', () => ({
  Iniziativa: { aggregate: mockIniziativaAggregate },
}));
jest.unstable_mockModule('../../src/models/categoria_iniziativa.js', () => ({
  CategoriaIniziativa: { findById: jest.fn() },
}));
jest.unstable_mockModule('../../src/models/cittadino.js', () => ({
  Cittadino: { findById: jest.fn() },
}));
jest.unstable_mockModule('../../src/models/notifica.js', () => ({
  Notifica: { create: jest.fn() },
}));

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const CITTADINO_ID = '507f1f77bcf86cd799439011';

describe('iniziativa controller', () => {
  let getIniziative;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/iniziativa.controller.js');
    getIniziative = mod.getIniziative;
  });

  beforeEach(() => jest.clearAllMocks());

  describe('getIniziative', () => {
    it('restituisce 401 se manca req.user', async () => {
      const req = { user: null, query: {}, ruolo: 'cittadino' };
      const res = makeRes();
      await getIniziative(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce lista paginata con oggetto paginazione', async () => {
      const fakeItem = { _id: '507f1f77bcf86cd799439022', titolo: 'Test' };
      mockIniziativaAggregate
        .mockResolvedValueOnce([fakeItem])           // pipeline dati
        .mockResolvedValueOnce([{ totale: 1 }]);     // pipeline count

      const req = { user: { _id: CITTADINO_ID }, query: { page: '1', limit: '10' }, ruolo: 'cittadino' };
      const res = makeRes();
      await getIniziative(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          iniziative: [fakeItem],
          paginazione: expect.objectContaining({ totale: 1, pagina: 1, limite: 10, pagine: 1 }),
        })
      );
    });

    it('paginazione.totale è 0 se count restituisce array vuoto', async () => {
      mockIniziativaAggregate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const req = { user: { _id: CITTADINO_ID }, query: {}, ruolo: 'cittadino' };
      const res = makeRes();
      await getIniziative(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          paginazione: expect.objectContaining({ totale: 0 }),
        })
      );
    });
  });
});
```

- [ ] **Step 2: Verifica che il test fallisca**

```bash
npm test -- --testPathPattern=iniziativa.controller
```

Expected: FAIL — `paginazione` non è nella risposta.

- [ ] **Step 3: Aggiorna `getIniziative` nel controller**

In `backend/src/controllers/iniziativa.controller.js`, sostituisci l'intera funzione `getIniziative` (righe 71-157):

```js
export const getIniziative = async (req,res) => {
    try{
        const user = req.user;

        if(!user){
            return res.status(401).json({
                message : "Errore nell'autenticazione"
            });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const matchStato = req.ruolo === 'operatore' ? {} : { stato: 'approvata' };

        const pipeline = [
            { $match: matchStato },
            {
                $lookup: {
                    from: "votoiniziativas",
                    localField: "_id",
                    foreignField: "ID_iniziativa",
                    as: "voti"
                }
            },
            {
                $addFields: {
                    numero_voti: { $size: "$voti" }
                }
            },
            {
                $lookup: {
                    from: "cittadinos",
                    localField: "ID_cittadino",
                    foreignField: "_id",
                    as: "cittadino_dettagli"
                }
            },
            { $unwind: "$cittadino_dettagli" },
            {
                $lookup: {
                    from: "categoriainiziativas",
                    localField: "ID_categoria",
                    foreignField: "_id",
                    as: "categoria_dettagli"
                }
            },
            { $unwind: "$categoria_dettagli" },
            {
                $project: {
                    _id: 1,
                    ID_categoria: 1,
                    categoria: "$categoria_dettagli.nome",
                    titolo: 1,
                    descrizione: 1,
                    stato: 1,
                    nome_cittadino: "$cittadino_dettagli.nome",
                    cognome_cittadino: "$cittadino_dettagli.cognome",
                    numero_voti: "$numero_voti",
                    createdAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1,
                    numero_voti: -1
                }
            }
        ];

        const [iniziative, countResult] = await Promise.all([
            Iniziativa.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
            Iniziativa.aggregate([{ $match: matchStato }, { $count: 'totale' }])
        ]);

        const totale = countResult[0]?.totale ?? 0;

        return res.status(200).json({
            message: iniziative.length === 0 ? "Nessuna iniziativa disponibile." : "Iniziative trovate:",
            iniziative,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });

    }
    catch(error){
        logger.error("Errore nel recupero delle iniziative:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero delle iniziative."
        });
    }
};
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- --testPathPattern=iniziativa.controller
```

Expected: PASS — tutti e 3 i test verdi.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/iniziativa.controller.js backend/tests/unit/iniziativa.controller.test.js
git commit -m "feat: paginazione GET /iniziative"
```

---

## Task 2: Paginate `ricercaIniziativa`

**Files:**
- Modifica: `backend/tests/unit/iniziativa.controller.test.js` (aggiungi describe block)
- Modifica: `backend/src/controllers/iniziativa.controller.js` (funzione `ricercaIniziativa`, righe 291-449)

- [ ] **Step 1: Aggiungi test failing per ricercaIniziativa**

Aggiungi questa sezione alla fine del `describe('iniziativa controller')` in `backend/tests/unit/iniziativa.controller.test.js`, prima della chiusura `});`:

```js
  describe('ricercaIniziativa', () => {
    let ricercaIniziativa;

    beforeAll(async () => {
      const mod = await import('../../src/controllers/iniziativa.controller.js');
      ricercaIniziativa = mod.ricercaIniziativa;
    });

    it('restituisce lista paginata con oggetto paginazione', async () => {
      const fakeItem = { _id: '507f1f77bcf86cd799439033', titolo: 'Ricerca' };
      mockIniziativaAggregate
        .mockResolvedValueOnce([fakeItem])
        .mockResolvedValueOnce([{ totale: 5 }]);

      const req = {
        user: { _id: CITTADINO_ID },
        query: { page: '2', limit: '5' },
        ruolo: 'cittadino',
        body: { parola_chiave: '', filtri: {} },
      };
      const res = makeRes();
      await ricercaIniziativa(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          iniziative: [fakeItem],
          paginazione: expect.objectContaining({ totale: 5, pagina: 2, limite: 5, pagine: 1 }),
        })
      );
    });
  });
```

- [ ] **Step 2: Verifica che il test fallisca**

```bash
npm test -- --testPathPattern=iniziativa.controller
```

Expected: il nuovo test FAIL, i test Task 1 ancora PASS.

- [ ] **Step 3: Aggiorna `ricercaIniziativa` nel controller**

In `backend/src/controllers/iniziativa.controller.js`, sostituisci la funzione `ricercaIniziativa` (righe 291-449):

```js
export const ricercaIniziativa = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Errore nell'autenticazione"
            });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const { parola_chiave, filtri } = req.body;
        const categorie = filtri?.categorie_id || [];
        const ordina_per = filtri?.ordina_per;
        const ordine = filtri?.ordine || -1;

        let matchStage = req.ruolo === 'operatore' ? {} : { stato: 'approvata' };

        const categorieObjectId = categorie.map(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                logger.warn(`ID Categoria non valido: ${id}`);
                return null;
            }
            return new mongoose.Types.ObjectId(id);
        }).filter(id => id !== null);

        if (categorieObjectId.length > 0) {
            matchStage.ID_categoria = { $in: categorieObjectId };
        }
        if (parola_chiave && parola_chiave.trim() !== '') {
            matchStage.$text = { $search: parola_chiave };
        }

        let sortCriteria = {};
        if (ordina_per === 'voti') {
            sortCriteria.numero_voti = ordine;
            sortCriteria.createdAt = -1;
        } else if (ordina_per === 'data') {
            sortCriteria.createdAt = ordine;
            sortCriteria.numero_voti = -1;
        } else if (parola_chiave && parola_chiave.trim() !== '') {
            sortCriteria.score = { $meta: "textScore" };
        } else {
            sortCriteria.createdAt = -1;
            sortCriteria.numero_voti = -1;
        }

        const pipeline = [];

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            {
                $lookup: {
                    from: "votoiniziativas",
                    localField: "_id",
                    foreignField: "ID_iniziativa",
                    as: "voti"
                }
            },
            {
                $addFields: {
                    numero_voti: { $size: "$voti" }
                }
            }
        );

        if (parola_chiave && parola_chiave.trim() !== '') {
            pipeline.push({
                $project: {
                    score: { $meta: "textScore" },
                    _id: 1,
                    ID_categoria: 1,
                    titolo: 1,
                    ID_cittadino: 1,
                    numero_voti: 1,
                    createdAt: 1
                }
            });
        }

        pipeline.push(
            {
                $lookup: {
                    from: "cittadinos",
                    localField: "ID_cittadino",
                    foreignField: "_id",
                    as: "cittadino_dettagli"
                }
            },
            { $unwind: "$cittadino_dettagli" },
            {
                $lookup: {
                    from: "categoriainiziativas",
                    localField: "ID_categoria",
                    foreignField: "_id",
                    as: "categoria_dettagli"
                }
            },
            { $unwind: "$categoria_dettagli" },
            {
                $project: {
                    _id: 1,
                    ID_categoria: 1,
                    categoria: "$categoria_dettagli.nome",
                    titolo: 1,
                    nome_cittadino: "$cittadino_dettagli.nome",
                    cognome_cittadino: "$cittadino_dettagli.cognome",
                    numero_voti: 1,
                    createdAt: 1
                }
            },
            { $sort: sortCriteria }
        );

        const countPipeline = Object.keys(matchStage).length > 0
            ? [{ $match: matchStage }, { $count: 'totale' }]
            : [{ $count: 'totale' }];

        const [iniziative, countResult] = await Promise.all([
            Iniziativa.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
            Iniziativa.aggregate(countPipeline)
        ]);

        const totale = countResult[0]?.totale ?? 0;

        return res.status(200).json({
            message: iniziative.length === 0
                ? "Nessuna iniziativa disponibile con i criteri specificati."
                : "Iniziative trovate:",
            iniziative,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });

    } catch (error) {
        logger.error("Errore nel recupero delle iniziative:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero delle iniziative."
        });
    }
};
```

- [ ] **Step 4: Verifica che tutti i test passino**

```bash
npm test -- --testPathPattern=iniziativa.controller
```

Expected: PASS — tutti e 4 i test verdi.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/iniziativa.controller.js backend/tests/unit/iniziativa.controller.test.js
git commit -m "feat: paginazione POST /iniziative/ricerca"
```

---

## Task 3: Paginate `getVotazioniAvailable`

**Files:**
- Modifica: `backend/tests/unit/votazione.controller.test.js`
- Modifica: `backend/src/controllers/votazione.controller.js`

- [ ] **Step 1: Aggiorna il mock setup in votazione.controller.test.js**

In `backend/tests/unit/votazione.controller.test.js`, nella sezione `// ── Mocks ──` in cima al file:

1. Aggiungi dopo le dichiarazioni dei mock esistenti:
```js
const mockRispostaFind = jest.fn();
```

2. Aggiorna il mock di `risposta_consultazione.js` da:
```js
jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
  RispostaConsultazione: { aggregate: jest.fn() },
}));
```
a:
```js
jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
  RispostaConsultazione: { aggregate: jest.fn(), find: mockRispostaFind },
}));
```

3. Nel `beforeAll` del `describe('votazione controller')`, aggiungi `getVotazioniAvailable`:
```js
let getVotazioni, updateVotazione, getVotazioniAvailable;

beforeAll(async () => {
    const mod = await import('../../src/controllers/votazione.controller.js');
    getVotazioni = mod.getVotazioni;
    updateVotazione = mod.updateVotazione;
    getVotazioniAvailable = mod.getVotazioniAvailable;
});
```

- [ ] **Step 2: Aggiungi test failing per getVotazioniAvailable**

Aggiungi alla fine del `describe('votazione controller')`, prima della chiusura `});`:

```js
  describe('getVotazioniAvailable', () => {
    it('restituisce 401 se manca req.user', async () => {
      const req = { user: null, query: {} };
      const res = makeRes();
      await getVotazioniAvailable(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce lista paginata con paginazione', async () => {
      const fakeVot = {
        _id: VOTAZIONE_ID,
        titolo: 'Test',
        toObject: () => ({ _id: VOTAZIONE_ID, titolo: 'Test' }),
      };
      const chainable = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce([fakeVot]),
      };
      mockConsultazioneFind.mockReturnValueOnce(chainable);
      mockConsultazioneCountDocuments.mockResolvedValueOnce(7);

      const risposteChain = { select: jest.fn().mockResolvedValueOnce([]) };
      mockRispostaFind.mockReturnValueOnce(risposteChain);

      const req = { user: { _id: OPERATORE_ID }, query: { page: '1', limit: '5' } };
      const res = makeRes();
      await getVotazioniAvailable(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          paginazione: expect.objectContaining({ totale: 7, pagina: 1, limite: 5 }),
        })
      );
    });
  });
```

- [ ] **Step 3: Verifica che il test fallisca**

```bash
npm test -- --testPathPattern=votazione.controller
```

Expected: il nuovo test FAIL, i test esistenti PASS.

- [ ] **Step 4: Aggiorna `getVotazioniAvailable` nel controller**

In `backend/src/controllers/votazione.controller.js`, sostituisci la funzione `getVotazioniAvailable` (righe 62-104):

```js
export const getVotazioniAvailable = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: 'Cittadino non autenticato.'
            });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const filtro = { stato: { $in: ['attivo', 'concluso'] }, tipo: 'votazione' };

        const [votazioni, totale] = await Promise.all([
            Consultazione.find(filtro).sort({ data_inizio: -1 }).skip(skip).limit(limitNum),
            Consultazione.countDocuments(filtro)
        ]);

        const risposte = await RispostaConsultazione.find({
            ID_cittadino: userFromMiddleware._id,
            tipo_consultazione: 'votazione'
        }).select('ID_consultazione');
        const votedIds = new Set(risposte.map(r => r.ID_consultazione.toString()));

        const votazioniWithVoted = votazioni.map(v => ({
            ...v.toObject(),
            voted: votedIds.has(v._id.toString())
        }));

        return res.status(200).json({
            message: 'Votazioni recuperate con successo.',
            votazioni: votazioniWithVoted,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });
    } catch (error) {
        logger.error('Errore nel recupero delle votazioni:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero delle votazioni.'
        });
    }
};
```

- [ ] **Step 5: Verifica che tutti i test passino**

```bash
npm test -- --testPathPattern=votazione.controller
```

Expected: PASS — tutti i test verdi inclusi i nuovi.

- [ ] **Step 6: Commit**

```bash
git add backend/src/controllers/votazione.controller.js backend/tests/unit/votazione.controller.test.js
git commit -m "feat: paginazione GET /votazioni/cittadino"
```

---

## Task 4: Paginate `getSondaggiAvaiable`

**Files:**
- Modifica: `backend/tests/unit/sondaggio.controller.test.js`
- Modifica: `backend/src/controllers/sondaggio.controller.js`

**Nota:** I test esistenti per `getSondaggiAvaiable` usano la vecchia chain `find().populate().sort()` (terminale). Con la modifica la chain diventa `find().populate().sort().skip().limit()`. I test esistenti vanno aggiornati.

- [ ] **Step 1: Aggiorna mock setup in sondaggio.controller.test.js**

In `backend/tests/unit/sondaggio.controller.test.js`, nella sezione `// ── Mocks ──`:

1. Aggiungi dopo i mock esistenti:
```js
const mockSkip = jest.fn();
const mockLimit = jest.fn();
const mockRispostaFind = jest.fn();
const mockSondaggioCountDocuments = jest.fn();
```

2. Aggiorna il mock di `consultazione.js` — sostituisci `countDocuments: jest.fn()` con `countDocuments: mockSondaggioCountDocuments`:
```js
jest.unstable_mockModule('../../src/models/consultazione.js', () => ({
  Consultazione: {
    create: jest.fn(),
    find: mockConsultazioneFind,
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: mockSondaggioCountDocuments,
  },
}));
```

3. Aggiorna il mock di `risposta_consultazione.js`:
```js
jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
  RispostaConsultazione: { aggregate: jest.fn(), find: mockRispostaFind },
}));
```

- [ ] **Step 2: Aggiorna i test esistenti per usare la nuova chain**

I test esistenti mockano la chain come `find().populate().sort()` dove `sort` risolve. Con la modifica la chain termina con `limit`. Aggiorna i tre test esistenti:

**Test "chiama populate(\'ID_domande\') e restituisce 200 con i sondaggi"** — sostituisci il setup del mock e il fake data:

```js
it('restituisce 200 con i sondaggi paginati', async () => {
    const fakeSondaggio = {
      _id: SONDAGGIO_ID,
      tipo: 'sondaggio',
      stato: 'attivo',
      titolo: 'Test sondaggio',
      ID_domande: [],
      toObject: () => ({ _id: SONDAGGIO_ID, tipo: 'sondaggio', stato: 'attivo', titolo: 'Test sondaggio' }),
    };

    mockLimit.mockResolvedValueOnce([fakeSondaggio]);
    mockSkip.mockReturnValue({ limit: mockLimit });
    mockSort.mockReturnValue({ skip: mockSkip });
    mockPopulate.mockReturnValue({ sort: mockSort });
    mockConsultazioneFind.mockReturnValue({ populate: mockPopulate });
    mockSondaggioCountDocuments.mockResolvedValueOnce(1);

    const risposteChain = { select: jest.fn().mockResolvedValueOnce([]) };
    mockRispostaFind.mockReturnValueOnce(risposteChain);

    const req = { user: { _id: CITTADINO_ID }, query: {} };
    const res = makeRes();
    await getSondaggiAvaiable(req, res);

    expect(mockPopulate).toHaveBeenCalledWith('ID_domande');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        paginazione: expect.objectContaining({ totale: 1 }),
      })
    );
});
```

**Test "restituisce 200 con messaggio se non ci sono sondaggi disponibili"** — sostituisci:

```js
it('restituisce 200 se non ci sono sondaggi', async () => {
    mockLimit.mockResolvedValueOnce([]);
    mockSkip.mockReturnValue({ limit: mockLimit });
    mockSort.mockReturnValue({ skip: mockSkip });
    mockPopulate.mockReturnValue({ sort: mockSort });
    mockConsultazioneFind.mockReturnValue({ populate: mockPopulate });
    mockSondaggioCountDocuments.mockResolvedValueOnce(0);

    const risposteChain = { select: jest.fn().mockResolvedValueOnce([]) };
    mockRispostaFind.mockReturnValueOnce(risposteChain);

    const req = { user: { _id: CITTADINO_ID }, query: {} };
    const res = makeRes();
    await getSondaggiAvaiable(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});
```

**Test "restituisce 500 in caso di errore del database"** — sostituisci il setup (il mock che lancia errore rimane, ma la chain cambia):

```js
it('restituisce 500 in caso di errore del database', async () => {
    mockConsultazioneFind.mockReturnValue({
        populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
                })
            })
        })
    });
    mockSondaggioCountDocuments.mockResolvedValueOnce(0);

    const req = { user: { _id: CITTADINO_ID }, query: {} };
    const res = makeRes();
    await getSondaggiAvaiable(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});
```

- [ ] **Step 3: Aggiungi test per la paginazione**

Aggiungi alla fine del `describe`:

```js
  it('rispetta page e limit dalla query string', async () => {
    mockLimit.mockResolvedValueOnce([]);
    mockSkip.mockReturnValue({ limit: mockLimit });
    mockSort.mockReturnValue({ skip: mockSkip });
    mockPopulate.mockReturnValue({ sort: mockSort });
    mockConsultazioneFind.mockReturnValue({ populate: mockPopulate });
    mockSondaggioCountDocuments.mockResolvedValueOnce(25);

    const risposteChain = { select: jest.fn().mockResolvedValueOnce([]) };
    mockRispostaFind.mockReturnValueOnce(risposteChain);

    const req = { user: { _id: CITTADINO_ID }, query: { page: '3', limit: '5' } };
    const res = makeRes();
    await getSondaggiAvaiable(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        paginazione: expect.objectContaining({ totale: 25, pagina: 3, limite: 5, pagine: 5 }),
      })
    );
  });
```

- [ ] **Step 4: Verifica che i test falliscano nel modo atteso**

```bash
npm test -- --testPathPattern=sondaggio.controller
```

Expected: alcuni test FAIL perché il controller non ha ancora paginazione.

- [ ] **Step 5: Aggiorna `getSondaggiAvaiable` nel controller**

In `backend/src/controllers/sondaggio.controller.js`, sostituisci la funzione `getSondaggiAvaiable` (righe 61-103):

```js
export const getSondaggiAvaiable = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: 'Cittadino non autenticato.'
            });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const filtro = { stato: { $in: ['attivo', 'concluso'] }, tipo: 'sondaggio' };

        const [sondaggi, totale] = await Promise.all([
            Consultazione.find(filtro).populate('ID_domande').sort({ data_inizio: -1 }).skip(skip).limit(limitNum),
            Consultazione.countDocuments(filtro)
        ]);

        const risposte = await RispostaConsultazione.find({
            ID_cittadino: userFromMiddleware._id,
            tipo_consultazione: 'sondaggio'
        }).select('ID_consultazione');
        const votedIds = new Set(risposte.map(r => r.ID_consultazione.toString()));

        const sondaggiWithVoted = sondaggi.map(s => ({
            ...s.toObject(),
            voted: votedIds.has(s._id.toString())
        }));

        return res.status(200).json({
            message: 'Sondaggi recuperati con successo.',
            sondaggi: sondaggiWithVoted,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });
    } catch (error) {
        logger.error('Errore nel recupero dei sondaggi:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero dei sondaggi.'
        });
    }
};
```

- [ ] **Step 6: Verifica che tutti i test passino**

```bash
npm test -- --testPathPattern=sondaggio.controller
```

Expected: PASS — tutti i test verdi.

- [ ] **Step 7: Commit**

```bash
git add backend/src/controllers/sondaggio.controller.js backend/tests/unit/sondaggio.controller.test.js
git commit -m "feat: paginazione GET /sondaggi/cittadino"
```

---

## Task 5: Aggiorna Swagger e file .rest

**Files:**
- Modifica: `backend/src/swagger/iniziativa.paths.js`
- Modifica: `backend/src/swagger/votazione.paths.js`
- Modifica: `backend/src/swagger/sondaggio.paths.js`
- Modifica: `backend/tests/rest/iniziativa.rest`
- Modifica: `backend/tests/rest/votazione.rest`
- Modifica: `backend/tests/rest/sondaggio.rest`

- [ ] **Step 1: Aggiorna swagger GET /iniziative**

In `backend/src/swagger/iniziativa.paths.js`, nel blocco `get:` sotto `/iniziative` (riga ~88):

Aggiungi `parameters:` tra `security:` e `responses:`:

```yaml
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Risultati per pagina (max 100, default 10)
```

Aggiorna la descrizione del `get:` da:
```
 *     description: Restituisce l'elenco completo delle iniziative ordinate per data di creazione e numero di voti.
```
a:
```
 *     description: Restituisce la lista paginata delle iniziative ordinate per data di creazione e numero di voti. Supporta paginazione tramite ?page= e ?limit=.
```

Aggiungi `paginazione` nello schema della risposta 200, dopo la proprietà `iniziative`:
```yaml
 *                 paginazione:
 *                   type: object
 *                   properties:
 *                     totale:
 *                       type: integer
 *                       example: 35
 *                     pagina:
 *                       type: integer
 *                       example: 1
 *                     limite:
 *                       type: integer
 *                       example: 10
 *                     pagine:
 *                       type: integer
 *                       example: 4
```

- [ ] **Step 2: Aggiorna swagger POST /iniziative/ricerca**

In `backend/src/swagger/iniziativa.paths.js`, nel blocco `post:` sotto `/iniziative/ricerca` (riga ~148):

Aggiungi `parameters:` tra `security:` e `requestBody:`:

```yaml
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Risultati per pagina (max 100)
```

Aggiungi `paginazione` nello schema della risposta 200 (dopo la proprietà `iniziative`), identico allo step precedente.

- [ ] **Step 3: Aggiorna swagger GET /votazioni/cittadino**

In `backend/src/swagger/votazione.paths.js`, nel blocco `get:` sotto `/votazioni/cittadino` (riga ~591):

Aggiungi `parameters:` tra `security:` e `responses:`:

```yaml
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Risultati per pagina (max 100)
```

Aggiungi `paginazione` nello schema della risposta 200, dopo la proprietà `votazioni`.

- [ ] **Step 4: Aggiorna swagger GET /sondaggi/cittadino**

In `backend/src/swagger/sondaggio.paths.js`, nella sezione endpoint cittadino (riga ~680):

Stessa struttura degli step precedenti: aggiungi `parameters:` con `page` e `limit`, poi `paginazione` nello schema risposta.

- [ ] **Step 5: Aggiorna iniziativa.rest**

In `backend/tests/rest/iniziativa.rest`, dopo la prima chiamata `GET http://localhost:3000/iniziative`, aggiungi:

```
###
### Paginazione: pagina 1
GET http://localhost:3000/iniziative?page=1&limit=5
Authorization: Bearer {{TOKEN_OPERATORE}}
###
### Paginazione: pagina 2
GET http://localhost:3000/iniziative?page=2&limit=5
Authorization: Bearer {{TOKEN_OPERATORE}}
```

- [ ] **Step 6: Aggiorna votazione.rest**

In `backend/tests/rest/votazione.rest`, aggiungi:

```
###
### Votazioni cittadino paginate
GET http://localhost:3000/votazioni/cittadino?page=1&limit=5
Authorization: Bearer {{TOKEN_CITTADINO}}
```

- [ ] **Step 7: Aggiorna sondaggio.rest**

In `backend/tests/rest/sondaggio.rest`, aggiungi:

```
###
### Sondaggi cittadino paginati
GET http://localhost:3000/sondaggi/cittadino?page=1&limit=5
Authorization: Bearer {{TOKEN_CITTADINO}}
```

- [ ] **Step 8: Esegui tutti i test unitari per confermare nulla è rotto**

```bash
npm test
```

Expected: PASS — tutti i test verdi.

- [ ] **Step 9: Commit**

```bash
git add backend/src/swagger/iniziativa.paths.js backend/src/swagger/votazione.paths.js backend/src/swagger/sondaggio.paths.js backend/tests/rest/iniziativa.rest backend/tests/rest/votazione.rest backend/tests/rest/sondaggio.rest
git commit -m "docs: aggiorna swagger e .rest per paginazione liste"
```
