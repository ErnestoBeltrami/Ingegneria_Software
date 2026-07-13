import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

jest.unstable_mockModule('../../src/config/env.js', () => ({}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: jest.fn().mockReturnValue('fake-token') },
}));

const mockOperatoreFindOne   = jest.fn();
const mockOperatoreFindById  = jest.fn();
const mockOperatoreCreate    = jest.fn();

jest.unstable_mockModule('../../src/models/operatore.js', () => ({
  Operatore: {
    findOne:  mockOperatoreFindOne,
    findById: mockOperatoreFindById,
    create:   mockOperatoreCreate,
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

const OPERATORE_ID      = '507f1f77bcf86cd799439011';
const OPERATORE_ID_2    = '507f1f77bcf86cd799439022';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('operatore controller', () => {
  let getByCredentials, getOperatoreData, createOperatore, changePassword, promoteOperatoreToRoot;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/operatore.controller.js');
    getByCredentials        = mod.getByCredentials;
    getOperatoreData        = mod.getOperatoreData;
    createOperatore         = mod.createOperatore;
    changePassword          = mod.changePassword;
    promoteOperatoreToRoot  = mod.promoteOperatoreToRoot;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── getByCredentials ───────────────────────────────────────────────────────

  describe('getByCredentials', () => {
    it('restituisce 401 se le credenziali non sono valide', async () => {
      mockOperatoreFindOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(null),
      });
      const req = { body: { username: 'admin', password_inserita: 'wrong' } };
      const res = makeRes();
      await getByCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce 401 se la password è errata', async () => {
      const fakeOp = {
        _id: OPERATORE_ID,
        username: 'admin',
        matchPassword: jest.fn().mockResolvedValueOnce(false),
        toObject: jest.fn().mockReturnValue({ _id: OPERATORE_ID, username: 'admin', password: 'hash' }),
      };
      mockOperatoreFindOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(fakeOp),
      });
      const req = { body: { username: 'admin', password_inserita: 'wrong' } };
      const res = makeRes();
      await getByCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce 200 con token se le credenziali sono corrette', async () => {
      const fakeOp = {
        _id: OPERATORE_ID,
        username: 'admin',
        matchPassword: jest.fn().mockResolvedValueOnce(true),
        toObject: jest.fn().mockReturnValue({ _id: OPERATORE_ID, username: 'admin', password: 'hash' }),
      };
      mockOperatoreFindOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(fakeOp),
      });
      const req = { body: { username: 'admin', password_inserita: 'Correct1!' } };
      const res = makeRes();
      await getByCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockOperatoreFindOne.mockReturnValueOnce({
        select: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });
      const req = { body: { username: 'admin', password_inserita: 'pass' } };
      const res = makeRes();
      await getByCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getOperatoreData ───────────────────────────────────────────────────────

  describe('getOperatoreData', () => {
    it('restituisce 404 se manca req.user', async () => {
      const req = { user: null };
      const res = makeRes();
      await getOperatoreData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 con i dati pubblici', async () => {
      mockOperatoreFindById.mockResolvedValueOnce({
        _id: OPERATORE_ID, username: 'admin', nome: 'Mario', cognome: 'Rossi',
      });
      const req = { user: { _id: OPERATORE_ID } };
      const res = makeRes();
      await getOperatoreData(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ username: 'admin' }),
        })
      );
    });

    it('restituisce 404 se operatore non trovato nel DB', async () => {
      mockOperatoreFindById.mockResolvedValueOnce(null);
      const req = { user: { _id: OPERATORE_ID } };
      const res = makeRes();
      await getOperatoreData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── createOperatore ────────────────────────────────────────────────────────

  describe('createOperatore', () => {
    it('restituisce 403 se req.user non è root', async () => {
      const req = { user: { _id: OPERATORE_ID, isRoot: false }, body: {} };
      const res = makeRes();
      await createOperatore(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 403 se manca req.user', async () => {
      const req = { user: null, body: {} };
      const res = makeRes();
      await createOperatore(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 400 se mancano campi obbligatori', async () => {
      const req = { user: { _id: OPERATORE_ID, isRoot: true }, body: { username: 'nuovo' } };
      const res = makeRes();
      await createOperatore(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 409 se username già in uso', async () => {
      mockOperatoreFindOne.mockResolvedValueOnce({ _id: 'esistente' });
      const req = {
        user: { _id: OPERATORE_ID, isRoot: true },
        body: { username: 'admin', password: 'Pass1!', nome: 'Mario', cognome: 'Rossi' },
      };
      const res = makeRes();
      await createOperatore(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('restituisce 201 con i dati del nuovo operatore', async () => {
      mockOperatoreFindOne.mockResolvedValueOnce(null);
      mockOperatoreCreate.mockResolvedValueOnce({
        _id: OPERATORE_ID_2, username: 'nuovo', nome: 'Luca', cognome: 'Bianchi', isRoot: false,
      });
      const req = {
        user: { _id: OPERATORE_ID, isRoot: true },
        body: { username: 'nuovo', password: 'Pass1!', nome: 'Luca', cognome: 'Bianchi' },
      };
      const res = makeRes();
      await createOperatore(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          operatore: expect.objectContaining({ username: 'nuovo' }),
        })
      );
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────────

  describe('changePassword', () => {
    const validBody = { vecchia_password: 'OldPass1!', nuova_password: 'NewPass1!' };

    it('restituisce 400 se mancano le password', async () => {
      const req = { user: { _id: OPERATORE_ID }, body: { vecchia_password: 'old' } };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 400 se nuova password troppo corta', async () => {
      const req = { user: { _id: OPERATORE_ID }, body: { vecchia_password: 'old', nuova_password: 'Ab1!' } };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 400 se nuova password senza maiuscola', async () => {
      const req = { user: { _id: OPERATORE_ID }, body: { vecchia_password: 'old', nuova_password: 'newpass1!' } };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 400 se nuova password senza numero', async () => {
      const req = { user: { _id: OPERATORE_ID }, body: { vecchia_password: 'old', nuova_password: 'NewPass!!' } };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 400 se nuova password senza carattere speciale', async () => {
      const req = { user: { _id: OPERATORE_ID }, body: { vecchia_password: 'old', nuova_password: 'NewPass11' } };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 404 se operatore non trovato', async () => {
      mockOperatoreFindById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(null),
      });
      const req = { user: { _id: OPERATORE_ID }, body: validBody };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 401 se vecchia password errata', async () => {
      mockOperatoreFindById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          _id: OPERATORE_ID,
          matchPassword: jest.fn().mockResolvedValueOnce(false),
        }),
      });
      const req = { user: { _id: OPERATORE_ID }, body: validBody };
      const res = makeRes();
      await changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('restituisce 200 se la password viene aggiornata', async () => {
      const fakeOp = {
        _id: OPERATORE_ID,
        password: 'OldPass1!',
        matchPassword: jest.fn().mockResolvedValueOnce(true),
        save: jest.fn().mockResolvedValueOnce(true),
      };
      mockOperatoreFindById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(fakeOp),
      });
      const req = { user: { _id: OPERATORE_ID }, body: validBody };
      const res = makeRes();
      await changePassword(req, res);
      expect(fakeOp.password).toBe(validBody.nuova_password);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ── promoteOperatoreToRoot ─────────────────────────────────────────────────

  describe('promoteOperatoreToRoot', () => {
    it('restituisce 403 se req.user non è root', async () => {
      const req = { user: { _id: OPERATORE_ID, isRoot: false }, params: { operatoreId: OPERATORE_ID_2 } };
      const res = makeRes();
      await promoteOperatoreToRoot(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('restituisce 404 se operatore da promuovere non esiste', async () => {
      mockOperatoreFindById.mockResolvedValueOnce(null);
      const req = { user: { _id: OPERATORE_ID, isRoot: true }, params: { operatoreId: OPERATORE_ID_2 } };
      const res = makeRes();
      await promoteOperatoreToRoot(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 400 se operatore è già root', async () => {
      mockOperatoreFindById.mockResolvedValueOnce({ _id: OPERATORE_ID_2, isRoot: true });
      const req = { user: { _id: OPERATORE_ID, isRoot: true }, params: { operatoreId: OPERATORE_ID_2 } };
      const res = makeRes();
      await promoteOperatoreToRoot(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 200 e promuove operatore a root', async () => {
      const fakeOp = {
        _id: OPERATORE_ID_2, username: 'nuovo', isRoot: false,
        save: jest.fn().mockResolvedValueOnce(true),
      };
      mockOperatoreFindById.mockResolvedValueOnce(fakeOp);
      const req = { user: { _id: OPERATORE_ID, isRoot: true }, params: { operatoreId: OPERATORE_ID_2 } };
      const res = makeRes();
      await promoteOperatoreToRoot(req, res);
      expect(fakeOp.isRoot).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});