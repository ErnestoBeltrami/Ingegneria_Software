import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const mockCategoriaFindOne    = jest.fn();
const mockCategoriaFind       = jest.fn();
const mockCategoriaFindById   = jest.fn();
const mockCategoriaCreate     = jest.fn();

jest.unstable_mockModule('../../src/models/categoria_iniziativa.js', () => ({
  CategoriaIniziativa: {
    findOne:  mockCategoriaFindOne,
    find:     mockCategoriaFind,
    findById: mockCategoriaFindById,
    create:   mockCategoriaCreate,
  },
}));

const mockIniziativaFind = jest.fn();

jest.unstable_mockModule('../../src/models/iniziativa.js', () => ({
  Iniziativa: { find: mockIniziativaFind },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

const CATEGORIA_ID = '507f1f77bcf86cd799439011';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('categoria controller', () => {
  let createCategoria, getCategorie, getCategoriaById, updateCategoria, deleteCategoria;

  beforeAll(async () => {
    const mod = await import('../../src/controllers/categoria.controller.js');
    createCategoria  = mod.createCategoria;
    getCategorie     = mod.getCategorie;
    getCategoriaById = mod.getCategoriaById;
    updateCategoria  = mod.updateCategoria;
    deleteCategoria  = mod.deleteCategoria;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── createCategoria ────────────────────────────────────────────────────────

  describe('createCategoria', () => {
    it('restituisce 400 se manca il nome', async () => {
      const req = { body: {} };
      const res = makeRes();
      await createCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 409 se la categoria esiste già', async () => {
      mockCategoriaFindOne.mockResolvedValueOnce({ _id: CATEGORIA_ID, nome: 'Ambiente' });
      const req = { body: { nome: 'Ambiente' } };
      const res = makeRes();
      await createCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('restituisce 201 con la nuova categoria', async () => {
      mockCategoriaFindOne.mockResolvedValueOnce(null);
      mockCategoriaCreate.mockResolvedValueOnce({ _id: CATEGORIA_ID, nome: 'Ambiente' });
      const req = { body: { nome: 'Ambiente' } };
      const res = makeRes();
      await createCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          categoria: expect.objectContaining({ nome: 'Ambiente' }),
        })
      );
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockCategoriaFindOne.mockRejectedValueOnce(new Error('DB error'));
      const req = { body: { nome: 'Ambiente' } };
      const res = makeRes();
      await createCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getCategorie ───────────────────────────────────────────────────────────

  describe('getCategorie', () => {
    it('restituisce 200 con array vuoto se nessuna categoria', async () => {
      mockCategoriaFind.mockResolvedValueOnce([]);
      const req = {};
      const res = makeRes();
      await getCategorie(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ categorie: [] })
      );
    });

    it('restituisce 200 con lista ordinata', async () => {
      const fakeCategorie = [
        { _id: '1', nome: 'Mobilità' },
        { _id: '2', nome: 'Ambiente' },
      ];
      mockCategoriaFind.mockResolvedValueOnce(fakeCategorie);
      const req = {};
      const res = makeRes();
      await getCategorie(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      // ordinate alfabeticamente: Ambiente prima di Mobilità
      expect(body.categorie[0].nome).toBe('Ambiente');
      expect(body.categorie[1].nome).toBe('Mobilità');
    });

    it('restituisce 500 in caso di errore DB', async () => {
      mockCategoriaFind.mockRejectedValueOnce(new Error('DB error'));
      const req = {};
      const res = makeRes();
      await getCategorie(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getCategoriaById ───────────────────────────────────────────────────────

  describe('getCategoriaById', () => {
    it('restituisce 404 se categoria non trovata', async () => {
      mockCategoriaFindById.mockResolvedValueOnce(null);
      const req = { params: { id: CATEGORIA_ID } };
      const res = makeRes();
      await getCategoriaById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 200 con la categoria', async () => {
      mockCategoriaFindById.mockResolvedValueOnce({ _id: CATEGORIA_ID, nome: 'Ambiente' });
      const req = { params: { id: CATEGORIA_ID } };
      const res = makeRes();
      await getCategoriaById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          categoria: expect.objectContaining({ nome: 'Ambiente' }),
        })
      );
    });
  });

  // ── updateCategoria ────────────────────────────────────────────────────────

  describe('updateCategoria', () => {
    it('restituisce 400 se mancano id o newNome', async () => {
      const req = { params: { id: CATEGORIA_ID }, body: {} };
      const res = makeRes();
      await updateCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 404 se categoria non trovata', async () => {
      mockCategoriaFindById.mockResolvedValueOnce(null);
      const req = { params: { id: CATEGORIA_ID }, body: { newNome: 'Cultura' } };
      const res = makeRes();
      await updateCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 409 se il nuovo nome è già in uso', async () => {
      mockCategoriaFindById.mockResolvedValueOnce({ _id: CATEGORIA_ID, nome: 'Ambiente', save: jest.fn() });
      mockCategoriaFindOne.mockResolvedValueOnce({ _id: 'altro', nome: 'Cultura' });
      const req = { params: { id: CATEGORIA_ID }, body: { newNome: 'Cultura' } };
      const res = makeRes();
      await updateCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('restituisce 200 con la categoria aggiornata', async () => {
      const fakeCategoria = { _id: CATEGORIA_ID, nome: 'Ambiente', save: jest.fn().mockResolvedValueOnce(true) };
      mockCategoriaFindById.mockResolvedValueOnce(fakeCategoria);
      mockCategoriaFindOne.mockResolvedValueOnce(null);
      const req = { params: { id: CATEGORIA_ID }, body: { newNome: 'Cultura' } };
      const res = makeRes();
      await updateCategoria(req, res);
      expect(fakeCategoria.nome).toBe('Cultura');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ── deleteCategoria ────────────────────────────────────────────────────────

  describe('deleteCategoria', () => {
    it('restituisce 404 se categoria non trovata', async () => {
      mockCategoriaFindById.mockResolvedValueOnce(null);
      const req = { params: { id: CATEGORIA_ID } };
      const res = makeRes();
      await deleteCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('restituisce 400 se categoria è in uso da iniziative', async () => {
      mockCategoriaFindById.mockResolvedValueOnce({ _id: CATEGORIA_ID, nome: 'Ambiente' });
      mockIniziativaFind.mockResolvedValueOnce([{ _id: 'iniziativa1' }]);
      const req = { params: { id: CATEGORIA_ID } };
      const res = makeRes();
      await deleteCategoria(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('restituisce 200 se categoria eliminata con successo', async () => {
      const fakeCategoria = { _id: CATEGORIA_ID, nome: 'Ambiente', deleteOne: jest.fn().mockResolvedValueOnce(true) };
      mockCategoriaFindById.mockResolvedValueOnce(fakeCategoria);
      mockIniziativaFind.mockResolvedValueOnce([]);
      const req = { params: { id: CATEGORIA_ID } };
      const res = makeRes();
      await deleteCategoria(req, res);
      expect(fakeCategoria.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});