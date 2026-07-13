import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const mockNotificaFind       = jest.fn();
const mockNotificaFindOne    = jest.fn();
const mockNotificaUpdateMany = jest.fn();

jest.unstable_mockModule('../../src/models/notifica.js', () => ({
  Notifica: {
    find:        mockNotificaFind,
    findOne:     mockNotificaFindOne,
    updateMany:  mockNotificaUpdateMany,
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

const CITTADINO_ID  = '507f1f77bcf86cd799439011';
const NOTIFICA_ID   = '507f1f77bcf86cd799439022';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('notifica controller', () => {
  let getNotifiche, marcaLetta, marcaTutteLette;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/notifica.controller.js');
    getNotifiche     = mod.getNotifiche;
    marcaLetta       = mod.marcaLetta;
    marcaTutteLette  = mod.marcaTutteLette;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── getNotifiche ───────────────────────────────────────────────────────────

  describe('getNotifiche', () => {
    it('restituisce 200 con lista notifiche', async () => {
      const fakeNotifiche = [
        { _id: NOTIFICA_ID, messaggio: 'Test', letta: false },
      ];
      mockNotificaFind.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce(fakeNotifiche),
      });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await getNotifiche(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ notifiche: fakeNotifiche })
      );
    });

    it('restituisce 200 con array vuoto se nessuna notifica', async () => {
      mockNotificaFind.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValueOnce([]),
      });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await getNotifiche(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ notifiche: [] })
      );
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockNotificaFind.mockReturnValueOnce({
        sort: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await getNotifiche(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── marcaLetta ─────────────────────────────────────────────────────────────

  describe('marcaLetta', () => {
    it('restituisce 404 se la notifica non esiste', async () => {
      mockNotificaFindOne.mockResolvedValueOnce(null);
      const req = { user: { _id: CITTADINO_ID }, params: { id: NOTIFICA_ID } };
      const res = makeRes();
      await marcaLetta(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 e imposta letta a true', async () => {
      const fakeNotifica = {
        _id: NOTIFICA_ID, messaggio: 'Test', letta: false,
        save: jest.fn().mockResolvedValueOnce(true),
      };
      mockNotificaFindOne.mockResolvedValueOnce(fakeNotifica);
      const req = { user: { _id: CITTADINO_ID }, params: { id: NOTIFICA_ID } };
      const res = makeRes();
      await marcaLetta(req, res);
      expect(fakeNotifica.letta).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ notifica: fakeNotifica })
      );
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockNotificaFindOne.mockRejectedValueOnce(new Error('DB error'));
      const req = { user: { _id: CITTADINO_ID }, params: { id: NOTIFICA_ID } };
      const res = makeRes();
      await marcaLetta(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── marcaTutteLette ────────────────────────────────────────────────────────

  describe('marcaTutteLette', () => {
    it('restituisce 200 e aggiorna tutte le notifiche non lette', async () => {
      mockNotificaUpdateMany.mockResolvedValueOnce({ modifiedCount: 3 });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await marcaTutteLette(req, res);
      expect(mockNotificaUpdateMany).toHaveBeenCalledWith(
        { ID_destinatario: CITTADINO_ID, letta: false },
        { letta: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('restituisce 200 anche se non ci sono notifiche da aggiornare', async () => {
      mockNotificaUpdateMany.mockResolvedValueOnce({ modifiedCount: 0 });
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await marcaTutteLette(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockNotificaUpdateMany.mockRejectedValueOnce(new Error('DB error'));
      const req = { user: { _id: CITTADINO_ID } };
      const res = makeRes();
      await marcaTutteLette(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});