import { jest } from '@jest/globals';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockPopulate = jest.fn();
const mockSort = jest.fn();
const mockConsultazioneFind = jest.fn();

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
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
  RispostaConsultazione: { aggregate: jest.fn() },
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

  it('chiama populate("ID_domande") e restituisce 200 con i sondaggi', async () => {
    const fakeSondaggi = [
      {
        _id: SONDAGGIO_ID,
        tipo: 'sondaggio',
        stato: 'attivo',
        titolo: 'Test sondaggio',
        ID_domande: [{ _id: DOMANDA_ID, titolo: 'Domanda 1', tipo: 'risposta_singola', opzioni: [] }],
      },
    ];

    // Chain: find(...).populate(...).sort(...)
    mockSort.mockResolvedValue(fakeSondaggi);
    mockPopulate.mockReturnValue({ sort: mockSort });
    mockConsultazioneFind.mockReturnValue({ populate: mockPopulate });

    const req = { user: { _id: CITTADINO_ID, ruolo: 'cittadino' } };
    const res = makeRes();

    await getSondaggiAvaiable(req, res);

    // populate deve essere stato chiamato con 'ID_domande'
    expect(mockPopulate).toHaveBeenCalledWith('ID_domande');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        sondaggi: fakeSondaggi,
      })
    );
  });

  it('restituisce 200 con messaggio se non ci sono sondaggi disponibili', async () => {
    mockSort.mockResolvedValue([]);
    mockPopulate.mockReturnValue({ sort: mockSort });
    mockConsultazioneFind.mockReturnValue({ populate: mockPopulate });

    const req = { user: { _id: CITTADINO_ID, ruolo: 'cittadino' } };
    const res = makeRes();

    await getSondaggiAvaiable(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('restituisce 500 in caso di errore del database', async () => {
    mockConsultazioneFind.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      }),
    });

    const req = { user: { _id: CITTADINO_ID, ruolo: 'cittadino' } };
    const res = makeRes();

    await getSondaggiAvaiable(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
