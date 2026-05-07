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
  titoloVotazione: 'Votazione di prova',
  descrizione: 'Descrizione della votazione',
  data_inizio: '2027-01-10T10:00:00.000Z',
  data_fine: '2027-01-20T18:00:00.000Z',
  data_discussione: '2027-01-08T18:00:00.000Z',
  domanda: {
    titolo: 'Sei favorevole?',
    tipo: 'risposta_singola',
    opzioni: [{ testo: 'Sì' }, { testo: 'No' }],
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('votazione controller', () => {
  let createVotazione;
  let getVotazioni;
  let getVotazioneById;
  let updateVotazione;
  let deleteVotazione;
  let publishVotazione;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/votazione.controller.js');
    createVotazione = mod.createVotazione;
    getVotazioni = mod.getVotazioni;
    getVotazioneById = mod.getVotazioneById;
    updateVotazione = mod.updateVotazione;
    deleteVotazione = mod.deleteVotazione;
    publishVotazione = mod.publishVotazione;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── createVotazione ────────────────────────────────────────────────────────

  describe('createVotazione', () => {
    it('restituisce 401 se manca req.user', async () => {
      const req = { user: null, body: validBody };
      const res = makeRes();
      await createVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce 400 se mancano campi obbligatori', async () => {
      const req = {
        user: { _id: OPERATORE_ID },
        body: { titoloVotazione: 'Solo titolo' },
      };
      const res = makeRes();
      await createVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Dati mancanti') })
      );
    });

    it('restituisce 400 se la domanda ha meno di 2 opzioni', async () => {
      const req = {
        user: { _id: OPERATORE_ID },
        body: {
          ...validBody,
          domanda: { titolo: 'D', tipo: 'risposta_singola', opzioni: [{ testo: 'Solo una' }] },
        },
      };
      const res = makeRes();
      await createVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('almeno due opzioni') })
      );
    });

    it('crea domanda e votazione, restituisce 201', async () => {
      const domandaFake = { _id: DOMANDA_ID };
      const votazioneFake = { _id: VOTAZIONE_ID, titolo: validBody.titoloVotazione };
      mockDomandaCreate.mockResolvedValueOnce(domandaFake);
      mockConsultazioneCreate.mockResolvedValueOnce(votazioneFake);

      const req = { user: { _id: OPERATORE_ID }, body: validBody };
      const res = makeRes();
      await createVotazione(req, res);

      expect(mockDomandaCreate).toHaveBeenCalledWith({
        titolo: validBody.domanda.titolo,
        tipo: validBody.domanda.tipo,
        opzioni: validBody.domanda.opzioni,
      });
      expect(mockConsultazioneCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'votazione',
          titolo: validBody.titoloVotazione,
          ID_domanda: DOMANDA_ID,
          creatoDa: OPERATORE_ID,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Votazione creata con successo.' })
      );
    });

    it('restituisce 500 in caso di errore imprevisto', async () => {
      mockDomandaCreate.mockRejectedValueOnce(new Error('DB down'));
      const req = { user: { _id: OPERATORE_ID }, body: validBody };
      const res = makeRes();
      await createVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

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

  // ── getVotazioneById ───────────────────────────────────────────────────────

  describe('getVotazioneById', () => {
    it('restituisce 404 se non trovata', async () => {
      const chainable = { populate: jest.fn().mockResolvedValueOnce(null) };
      mockConsultazioneFindOne.mockReturnValueOnce(chainable);

      const req = { user: { _id: OPERATORE_ID }, params: { id: VOTAZIONE_ID } };
      const res = makeRes();
      await getVotazioneById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 con la votazione', async () => {
      const fakeVot = { _id: VOTAZIONE_ID, titolo: 'Test' };
      const chainable = { populate: jest.fn().mockResolvedValueOnce(fakeVot) };
      mockConsultazioneFindOne.mockReturnValueOnce(chainable);

      const req = { user: { _id: OPERATORE_ID }, params: { id: VOTAZIONE_ID } };
      const res = makeRes();
      await getVotazioneById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ votazione: fakeVot })
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

  // ── deleteVotazione ────────────────────────────────────────────────────────

  describe('deleteVotazione', () => {
    it('restituisce 400 se non è in bozza', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo' });
      const req = { user: { _id: OPERATORE_ID }, params: { id: VOTAZIONE_ID } };
      const res = makeRes();
      await deleteVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('elimina la votazione e restituisce 200', async () => {
      const fakeVot = { stato: 'bozza', deleteOne: jest.fn().mockResolvedValueOnce(true) };
      mockConsultazioneFindOne.mockResolvedValueOnce(fakeVot);

      const req = { user: { _id: OPERATORE_ID }, params: { id: VOTAZIONE_ID } };
      const res = makeRes();
      await deleteVotazione(req, res);

      expect(fakeVot.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ── publishVotazione ───────────────────────────────────────────────────────

  describe('publishVotazione', () => {
    it('restituisce 400 se non è in bozza', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo', save: jest.fn() });
      const req = { user: { _id: OPERATORE_ID }, params: { id: VOTAZIONE_ID } };
      const res = makeRes();
      await publishVotazione(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('porta lo stato a "attivo" e restituisce 200', async () => {
      const fakeVot = { stato: 'bozza', save: jest.fn().mockResolvedValueOnce(true) };
      mockConsultazioneFindOne.mockResolvedValueOnce(fakeVot);

      const req = { user: { _id: OPERATORE_ID }, params: { id: VOTAZIONE_ID } };
      const res = makeRes();
      await publishVotazione(req, res);

      expect(fakeVot.stato).toBe('attivo');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
