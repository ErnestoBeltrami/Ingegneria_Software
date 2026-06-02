import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockCittadinoFindById = jest.fn();
const mockCittadinoFindByIdAndUpdate = jest.fn();

jest.unstable_mockModule('../../src/models/cittadino.js', () => ({
  Cittadino: {
    findById: mockCittadinoFindById,
    findByIdAndUpdate: mockCittadinoFindByIdAndUpdate,
  },
}));

const mockRispostaFindOne = jest.fn();
const mockRispostaCreate = jest.fn();

jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
  RispostaConsultazione: {
    findOne: mockRispostaFindOne,
    create: mockRispostaCreate,
  },
}));

const mockVotoFindOne = jest.fn();
const mockVotoCreate = jest.fn();
const mockVotoFindOneAndDelete = jest.fn();

jest.unstable_mockModule('../../src/models/voto_iniziativa.js', () => ({
  VotoIniziativa: {
    findOne: mockVotoFindOne,
    create: mockVotoCreate,
    findOneAndDelete: mockVotoFindOneAndDelete,
  },
}));

const mockIniziativaFindById = jest.fn();

jest.unstable_mockModule('../../src/models/iniziativa.js', () => ({
  Iniziativa: {
    findById: mockIniziativaFindById,
  },
}));

const mockConsultazioneFindOne = jest.fn();
const mockConsultazioneFindById = jest.fn();

jest.unstable_mockModule('../../src/models/consultazione.js', () => ({
  Consultazione: {
    findOne: mockConsultazioneFindOne,
    findById: mockConsultazioneFindById,
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const CITTADINO_ID = '507f1f77bcf86cd799439011';
const VOTAZIONE_ID = '507f1f77bcf86cd799439022';
const SONDAGGIO_ID = '507f1f77bcf86cd799439033';
const INIZIATIVA_ID = '507f1f77bcf86cd799439044';
const DOMANDA_ID    = '507f1f77bcf86cd799439055';
const OPZIONE_ID    = '507f1f77bcf86cd799439066';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('cittadino controller', () => {
  let logout,
    getCittadinoData,
    updateCittadinoData,
    answerVote,
    answerSondaggio,
    votaIniziativa,
    rimuoviVotoIniziativa;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/cittadino_controller.js');
    logout = mod.logout;
    getCittadinoData = mod.getCittadinoData;
    updateCittadinoData = mod.updateCittadinoData;
    answerVote = mod.answerVote;
    answerSondaggio = mod.answerSondaggio;
    votaIniziativa = mod.votaIniziativa;
    rimuoviVotoIniziativa = mod.rimuoviVotoIniziativa;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('restituisce 200 e aggiorna loggedIn a false', async () => {
      mockCittadinoFindByIdAndUpdate.mockResolvedValueOnce({});
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await logout(req, res);
      expect(mockCittadinoFindByIdAndUpdate).toHaveBeenCalledWith(
        CITTADINO_ID,
        { loggedIn: false }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockCittadinoFindByIdAndUpdate.mockRejectedValueOnce(new Error('DB error'));
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await logout(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getCittadinoData ───────────────────────────────────────────────────────

  describe('getCittadinoData', () => {
    it('restituisce 404 se manca req.user', async () => {
      const req = { user: null };
      const res = makeRes();
      await getCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 con i dati pubblici del cittadino', async () => {
      const fakeCittadino = {
        _id: CITTADINO_ID,
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@test.it',
        dataNascita: '1990-01-01',
        comuneResidenza: 'Milano',
        circoscrizione: '1',
        genere: 'M',
        categoria: 'standard',
        profiloCompleto: true,
      };
      mockCittadinoFindById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(fakeCittadino),
      });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await getCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nome: 'Mario', cognome: 'Rossi' }),
        })
      );
    });

    it('restituisce 404 se il cittadino non esiste nel DB', async () => {
      mockCittadinoFindById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(null),
      });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await getCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockCittadinoFindById.mockReturnValueOnce({
        select: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await getCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── updateCittadinoData ────────────────────────────────────────────────────

  describe('updateCittadinoData', () => {
    it('restituisce 400 se nome o cognome mancano', async () => {
      const req = { user: { _id: CITTADINO_ID }, body: { nome: '', cognome: 'Rossi' } };
      const res = makeRes();
      await updateCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 400 se nome è solo spazi', async () => {
      const req = { user: { _id: CITTADINO_ID }, body: { nome: '   ', cognome: 'Rossi' } };
      const res = makeRes();
      await updateCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 404 se il cittadino non esiste nel DB', async () => {
      mockCittadinoFindByIdAndUpdate.mockResolvedValueOnce(null);
      const req = { user: { _id: CITTADINO_ID }, body: { nome: 'Mario', cognome: 'Rossi' } };
      const res = makeRes();
      await updateCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 con i dati aggiornati', async () => {
      mockCittadinoFindByIdAndUpdate.mockResolvedValueOnce({ nome: 'Mario', cognome: 'Verdi' });
      const req = { user: { _id: CITTADINO_ID }, body: { nome: 'Mario', cognome: 'Verdi' } };
      const res = makeRes();
      await updateCittadinoData(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nome: 'Mario', cognome: 'Verdi' }),
        })
      );
    });
  });

  // ── answerVote ─────────────────────────────────────────────────────────────

  describe('answerVote', () => {
    it('restituisce 404 se manca req.user', async () => {
      const req = { user: null, body: { opzioneId: OPZIONE_ID, votazioneId: VOTAZIONE_ID } };
      const res = makeRes();
      await answerVote(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 400 se manca opzioneId', async () => {
      const req = { user: { _id: CITTADINO_ID }, body: { votazioneId: VOTAZIONE_ID } };
      const res = makeRes();
      await answerVote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 403 se la votazione non è attiva', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'bozza' });
      const req = { user: { _id: CITTADINO_ID }, body: { opzioneId: OPZIONE_ID, votazioneId: VOTAZIONE_ID } };
      const res = makeRes();
      await answerVote(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 403 se il cittadino ha gia votato', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo' });
      mockRispostaFindOne.mockResolvedValueOnce({ _id: 'esistente' });
      const req = { user: { _id: CITTADINO_ID }, body: { opzioneId: OPZIONE_ID, votazioneId: VOTAZIONE_ID } };
      const res = makeRes();
      await answerVote(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('gia votato') })
      );
    });

    it('restituisce 201 se il voto va a buon fine', async () => {
      mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo' });
      mockRispostaFindOne.mockResolvedValueOnce(null);
      mockRispostaCreate.mockResolvedValueOnce({});
      const req = { user: { _id: CITTADINO_ID }, body: { opzioneId: OPZIONE_ID, votazioneId: VOTAZIONE_ID } };
      const res = makeRes();
      await answerVote(req, res);
      expect(mockRispostaCreate).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_consultazione: 'votazione', ID_opzione: OPZIONE_ID })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ── answerSondaggio ────────────────────────────────────────────────────────

  describe('answerSondaggio', () => {
    const fakeDomanda = {
      _id: { equals: (id) => id.toString() === DOMANDA_ID, toString: () => DOMANDA_ID },
      tipo: 'risposta_singola',
      opzioni: [
        { _id: { toString: () => OPZIONE_ID } },
      ],
    };

    const fakeSondaggio = {
      _id: SONDAGGIO_ID,
      tipo: 'sondaggio',
      stato: 'attivo',
      ID_domande: [fakeDomanda],
    };

    const validDettagli = [
      { ID_domanda: DOMANDA_ID, opzioniScelte: [OPZIONE_ID] },
    ];

    it('restituisce 401 se manca req.user', async () => {
      const req = { user: null, body: { sondaggioId: SONDAGGIO_ID, dettagliRisposte: validDettagli } };
      const res = makeRes();
      await answerSondaggio(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce 400 se dettagliRisposte è assente o vuoto', async () => {
      const req = { user: { _id: CITTADINO_ID }, body: { sondaggioId: SONDAGGIO_ID, dettagliRisposte: [] } };
      const res = makeRes();
      await answerSondaggio(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 403 se il cittadino ha già risposto', async () => {
      mockRispostaFindOne.mockResolvedValueOnce({ _id: 'esistente' });
      const req = { user: { _id: CITTADINO_ID }, body: { sondaggioId: SONDAGGIO_ID, dettagliRisposte: validDettagli } };
      const res = makeRes();
      await answerSondaggio(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 403 se il sondaggio non è attivo', async () => {
      mockRispostaFindOne.mockResolvedValueOnce(null);
      mockConsultazioneFindById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce({ ...fakeSondaggio, stato: 'concluso' }),
      });
      const req = { user: { _id: CITTADINO_ID }, body: { sondaggioId: SONDAGGIO_ID, dettagliRisposte: validDettagli } };
      const res = makeRes();
      await answerSondaggio(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 400 se il numero di risposte non corrisponde alle domande', async () => {
      mockRispostaFindOne.mockResolvedValueOnce(null);
      mockConsultazioneFindById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(fakeSondaggio),
      });
      const req = {
        user: { _id: CITTADINO_ID },
        body: {
          sondaggioId: SONDAGGIO_ID,
          dettagliRisposte: [
            { ID_domanda: DOMANDA_ID, opzioniScelte: [OPZIONE_ID] },
            { ID_domanda: 'altro_id', opzioniScelte: [OPZIONE_ID] }, // domanda in più
          ],
        },
      };
      const res = makeRes();
      await answerSondaggio(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 201 se la risposta va a buon fine', async () => {
      mockRispostaFindOne.mockResolvedValueOnce(null);
      mockConsultazioneFindById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(fakeSondaggio),
      });
      mockRispostaCreate.mockResolvedValueOnce({});
      const req = { user: { _id: CITTADINO_ID }, body: { sondaggioId: SONDAGGIO_ID, dettagliRisposte: validDettagli } };
      const res = makeRes();
      await answerSondaggio(req, res);
      expect(mockRispostaCreate).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_consultazione: 'sondaggio' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ── votaIniziativa ─────────────────────────────────────────────────────────

  describe('votaIniziativa', () => {
    it('restituisce 404 se l\'iniziativa non esiste', async () => {
      mockIniziativaFindById.mockResolvedValueOnce(null);
      const req = { user: { _id: CITTADINO_ID }, body: { iniziativaID: INIZIATIVA_ID } };
      const res = makeRes();
      await votaIniziativa(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 403 se il cittadino ha gia votato', async () => {
      mockIniziativaFindById.mockResolvedValueOnce({ _id: INIZIATIVA_ID });
      mockVotoFindOne.mockResolvedValueOnce({ _id: 'esistente' });
      const req = { user: { _id: CITTADINO_ID }, body: { iniziativaID: INIZIATIVA_ID } };
      const res = makeRes();
      await votaIniziativa(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 200 se il voto va a buon fine', async () => {
      mockIniziativaFindById.mockResolvedValueOnce({ _id: INIZIATIVA_ID });
      mockVotoFindOne.mockResolvedValueOnce(null);
      mockVotoCreate.mockResolvedValueOnce({});
      const req = { user: { _id: CITTADINO_ID }, body: { iniziativaID: INIZIATIVA_ID } };
      const res = makeRes();
      await votaIniziativa(req, res);
      expect(mockVotoCreate).toHaveBeenCalledWith(
        expect.objectContaining({ ID_iniziativa: INIZIATIVA_ID, ID_cittadino: CITTADINO_ID })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ── rimuoviVotoIniziativa ──────────────────────────────────────────────────

  describe('rimuoviVotoIniziativa', () => {
    it('restituisce 404 se il voto non esiste', async () => {
      mockVotoFindOneAndDelete.mockResolvedValueOnce(null);
      const req = { user: { _id: CITTADINO_ID }, params: { id: INIZIATIVA_ID } };
      const res = makeRes();
      await rimuoviVotoIniziativa(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 se il voto viene rimosso', async () => {
      mockVotoFindOneAndDelete.mockResolvedValueOnce({ _id: 'voto123' });
      const req = { user: { _id: CITTADINO_ID }, params: { id: INIZIATIVA_ID } };
      const res = makeRes();
      await rimuoviVotoIniziativa(req, res);
      expect(mockVotoFindOneAndDelete).toHaveBeenCalledWith({
        ID_iniziativa: INIZIATIVA_ID,
        ID_cittadino: CITTADINO_ID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockVotoFindOneAndDelete.mockRejectedValueOnce(new Error('DB error'));
      const req = { user: { _id: CITTADINO_ID }, params: { id: INIZIATIVA_ID } };
      const res = makeRes();
      await rimuoviVotoIniziativa(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});