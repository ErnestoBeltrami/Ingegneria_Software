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
});
