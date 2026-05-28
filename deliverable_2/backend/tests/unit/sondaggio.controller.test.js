import { jest } from '@jest/globals';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockPopulate = jest.fn();
const mockSort = jest.fn();
const mockConsultazioneFind = jest.fn();
const mockSkip = jest.fn();
const mockLimit = jest.fn();
const mockRispostaFind = jest.fn();
const mockSondaggioCountDocuments = jest.fn();

jest.unstable_mockModule('../../src/models/domanda.js', () => ({
  Domanda: { create: jest.fn() },
}));

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

jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
  RispostaConsultazione: { aggregate: jest.fn(), find: mockRispostaFind },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const CITTADINO_ID = '507f1f77bcf86cd799439011';
const SONDAGGIO_ID = '507f1f77bcf86cd799439022';
const DOMANDA_ID   = '507f1f77bcf86cd799439033';

// ── Shared mock state ─────────────────────────────────────────────────────────

let mockConsultazioneFindOne;
let mockRispostaAggregate;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sondaggio controller – getSondaggiAvaiable', () => {
  let getSondaggiAvaiable;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/sondaggio.controller.js');
    getSondaggiAvaiable = mod.getSondaggiAvaiable;
  });

  beforeEach(() => jest.clearAllMocks());

  it('restituisce 401 se manca req.user', async () => {
    const req = { user: null };
    const res = makeRes();

    await getSondaggiAvaiable(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

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
});

describe('sondaggio controller – getRiepilogoSintetico', () => {
  let getRiepilogoSintetico;

  const OPZIONE_ID = '507f1f77bcf86cd799439044';

  const fakeDomanda = {
    _id: { toString: () => DOMANDA_ID, equals: (id) => id.toString() === DOMANDA_ID },
    titolo: 'Domanda 1',
    tipo: 'risposta_singola',
    opzioni: [{ _id: { toString: () => OPZIONE_ID, equals: (id) => id.toString() === OPZIONE_ID }, testo: 'Opzione A' }],
  };

  const fakeSondaggio = {
    _id: SONDAGGIO_ID,
    titolo: 'Sondaggio Test',
    tipo: 'sondaggio',
    ID_domande: [fakeDomanda],
  };

  beforeAll(async () => {
    const mod = await import('../../src/controllers/sondaggio.controller.js');
    getRiepilogoSintetico = mod.getRiepilogoSintetico;

    const { Consultazione } = await import('../../src/models/consultazione.js');
    const { RispostaConsultazione } = await import('../../src/models/risposta_consultazione.js');
    mockConsultazioneFindOne = Consultazione.findOne;
    mockRispostaAggregate = RispostaConsultazione.aggregate;
  });

  beforeEach(() => jest.clearAllMocks());

  it('restituisce 400 se l\'ID non è valido', async () => {
    const req = { params: { id: 'id-non-valido' }, user: { _id: CITTADINO_ID } };
    const res = makeRes();
    await getRiepilogoSintetico(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('restituisce 404 se il sondaggio non esiste', async () => {
    mockConsultazioneFindOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const req = { params: { id: SONDAGGIO_ID }, user: { _id: CITTADINO_ID } };
    const res = makeRes();
    await getRiepilogoSintetico(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('restituisce 200 con riepilogoPerDomanda e chiama aggregate esattamente 2 volte', async () => {
    mockConsultazioneFindOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeSondaggio) });
    mockRispostaAggregate
      .mockResolvedValueOnce([{ totale: 3 }])
      .mockResolvedValueOnce([{ _id: { domanda: { toString: () => DOMANDA_ID }, opzione: { toString: () => OPZIONE_ID, equals: (id) => id.toString() === OPZIONE_ID } }, voti: 3 }]);

    const req = { params: { id: SONDAGGIO_ID }, user: { _id: CITTADINO_ID } };
    const res = makeRes();
    await getRiepilogoSintetico(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockRispostaAggregate).toHaveBeenCalledTimes(2);

    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('riepilogoPerDomanda');
    expect(body.totaleVotiUnici).toBe(3);
    expect(body.riepilogoPerDomanda).toHaveLength(1);
    expect(body.riepilogoPerDomanda[0].risultati[0].testoOpzione).toBe('Opzione A');
    expect(body.riepilogoPerDomanda[0].risultati[0].percentuale).toBe(100);
  });

  it('restituisce 500 in caso di errore del database', async () => {
    mockConsultazioneFindOne.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('DB error')) });
    const req = { params: { id: SONDAGGIO_ID }, user: { _id: CITTADINO_ID } };
    const res = makeRes();
    await getRiepilogoSintetico(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('sondaggio controller – getRiepilogoConFiltri', () => {
  let getRiepilogoConFiltri;

  const OPZIONE_ID = '507f1f77bcf86cd799439055';

  const fakeDomanda = {
    _id: { toString: () => DOMANDA_ID, equals: (id) => id.toString() === DOMANDA_ID },
    titolo: 'Domanda 1',
    tipo: 'risposta_singola',
    opzioni: [{ _id: { toString: () => OPZIONE_ID, equals: (id) => id.toString() === OPZIONE_ID }, testo: 'Opzione B' }],
  };

  const fakeSondaggio = {
    _id: SONDAGGIO_ID,
    titolo: 'Sondaggio Filtrato',
    tipo: 'sondaggio',
    ID_domande: [fakeDomanda],
  };

  beforeAll(async () => {
    const mod = await import('../../src/controllers/sondaggio.controller.js');
    getRiepilogoConFiltri = mod.getRiepilogoConFiltri;

    const { Consultazione } = await import('../../src/models/consultazione.js');
    const { RispostaConsultazione } = await import('../../src/models/risposta_consultazione.js');
    mockConsultazioneFindOne = Consultazione.findOne;
    mockRispostaAggregate = RispostaConsultazione.aggregate;
  });

  beforeEach(() => jest.clearAllMocks());

  it('restituisce 200 senza filtri e chiama aggregate esattamente 2 volte', async () => {
    mockConsultazioneFindOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeSondaggio) });
    mockRispostaAggregate
      .mockResolvedValueOnce([{ totale: 2 }])
      .mockResolvedValueOnce([{ _id: { domanda: { toString: () => DOMANDA_ID }, opzione: { toString: () => OPZIONE_ID, equals: (id) => id.toString() === OPZIONE_ID } }, voti: 2 }]);

    const req = { params: { id: SONDAGGIO_ID }, body: {}, user: { _id: '507f1f77bcf86cd799439099' } };
    const res = makeRes();
    await getRiepilogoConFiltri(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockRispostaAggregate).toHaveBeenCalledTimes(2);

    const body = res.json.mock.calls[0][0];
    expect(body.totaleVotiUnici).toBe(2);
    expect(body.riepilogoPerDomanda).toHaveLength(1);
  });

  it('restituisce 200 con filtri demografici presenti', async () => {
    mockConsultazioneFindOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeSondaggio) });
    mockRispostaAggregate
      .mockResolvedValueOnce([{ totale: 1 }])
      .mockResolvedValueOnce([{ _id: { domanda: { toString: () => DOMANDA_ID }, opzione: { toString: () => OPZIONE_ID, equals: (id) => id.toString() === OPZIONE_ID } }, voti: 1 }]);

    const req = {
      params: { id: SONDAGGIO_ID },
      body: { filters: { genere: 'M', age: [18, 30] } },
      user: { _id: '507f1f77bcf86cd799439099' },
    };
    const res = makeRes();
    await getRiepilogoConFiltri(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockRispostaAggregate).toHaveBeenCalledTimes(2);
  });
});
