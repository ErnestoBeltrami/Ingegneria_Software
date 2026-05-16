import { jest } from '@jest/globals';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockDomandaCreate = jest.fn();
const mockConsultazioneCreate = jest.fn();
const mockConsultazioneFind = jest.fn();
const mockConsultazioneFindOne = jest.fn();
const mockConsultazioneFindById = jest.fn();
const mockConsultazioneCountDocuments = jest.fn();

jest.unstable_mockModule('../../src/models/domanda.js', () => ({
  Domanda: { create: mockDomandaCreate },
}));

jest.unstable_mockModule('../../src/models/consultazione.js', () => ({
  Consultazione: {
    create: mockConsultazioneCreate,
    find: mockConsultazioneFind,
    findOne: mockConsultazioneFindOne,
    findById: mockConsultazioneFindById,
    countDocuments: mockConsultazioneCountDocuments,
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

const OPERATORE_ID = '507f1f77bcf86cd799439011';
const VOTAZIONE_ID = '507f1f77bcf86cd799439022';
const DOMANDA_ID = '507f1f77bcf86cd799439033';

const validBody = {
  descrizione: 'Descrizione della votazione',
  data_inizio: '2027-01-10T10:00:00.000Z',
  data_fine: '2027-01-20T18:00:00.000Z',
  data_discussione: '2027-01-08T18:00:00.000Z',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('votazione controller', () => {
  let getVotazioni;
  let updateVotazione;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/votazione.controller.js');
    getVotazioni = mod.getVotazioni;
    updateVotazione = mod.updateVotazione;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── getVotazioni ───────────────────────────────────────────────────────────

  describe('getVotazioni', () => {
    it('restituisce 401 se manca req.user', async () => {
      const req = { user: null, query: {} };
      const res = makeRes();
      await getVotazioni(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce 400 per stato non valido', async () => {
      const req = { user: { _id: OPERATORE_ID }, query: { stato: 'invalido' } };
      const res = makeRes();
      await getVotazioni(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce lista paginata', async () => {
      const fakeVotazioni = [{ _id: VOTAZIONE_ID, titolo: 'Test' }];
      const chainable = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(fakeVotazioni),
      };
      mockConsultazioneFind.mockReturnValueOnce(chainable);
      mockConsultazioneCountDocuments.mockResolvedValueOnce(1);

      const req = { user: { _id: OPERATORE_ID }, query: { stato: 'bozza', page: '1', limit: '10' } };
      const res = makeRes();
      await getVotazioni(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          votazioni: fakeVotazioni,
          paginazione: expect.objectContaining({ totale: 1 }),
        })
      );
    });
  });

  // ── updateVotazione ────────────────────────────────────────────────────────

  describe('updateVotazione', () => {
    it('restituisce 404 se non trovata', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce(null);
      const req = {
        user: { _id: OPERATORE_ID },
        params: { id: VOTAZIONE_ID },
        body: { titolo: 'Nuovo' },
      };
      const res = makeRes();
      await updateVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 400 se non è in bozza', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo', save: jest.fn() });
      const req = {
        user: { _id: OPERATORE_ID },
        params: { id: VOTAZIONE_ID },
        body: { titolo: 'Nuovo' },
      };
      const res = makeRes();
      await updateVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('bozza') })
      );
    });

    it('aggiorna i campi ammessi e restituisce 200', async () => {
      const fakeVot = {
        _id: VOTAZIONE_ID,
        stato: 'bozza',
        titolo: 'Vecchio',
        descrizione: 'Desc',
        save: jest.fn().mockResolvedValueOnce(true),
      };
      mockConsultazioneFindOne.mockResolvedValueOnce(fakeVot);
      mockConsultazioneFindById.mockReturnValue({
        populate: jest.fn().mockResolvedValueOnce(fakeVot),
      });

      const req = {
        user: { _id: OPERATORE_ID },
        params: { id: VOTAZIONE_ID },
        body: { titolo: 'Nuovo', descrizione: 'Nuova desc' },
      };
      const res = makeRes();
      await updateVotazione(req, res);

      expect(fakeVot.titolo).toBe('Nuovo');
      expect(fakeVot.descrizione).toBe('Nuova desc');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

});
