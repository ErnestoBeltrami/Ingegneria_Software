import { jest } from '@jest/globals';

// Mocks dei modelli e delle funzioni
const mockDomandaCreate = jest.fn();
const mockDomandaFindByIdAndDelete = jest.fn();
const mockConsultazioneCreate = jest.fn();
const mockConsultazioneFindOne = jest.fn();
const mockRispostaConsultazioneExists = jest.fn(); // Mock per il controllo del voto del cittadino

// Registrazione dei moduli mockati (ESM)
jest.unstable_mockModule('../../src/models/domanda.js', () => ({
    Domanda: {
        create: mockDomandaCreate,
        findByIdAndDelete: mockDomandaFindByIdAndDelete,
    },
}));

jest.unstable_mockModule('../../src/models/consultazione.js', () => ({
    Consultazione: {
        create: mockConsultazioneCreate,
        findOne: mockConsultazioneFindOne,
    },
}));

// Verifica che questo percorso corrisponda a quello reale nel tuo progetto
jest.unstable_mockModule('../../src/models/risposta_consultazione.js', () => ({
    RispostaConsultazione: {
        exists: mockRispostaConsultazioneExists,
    },
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

// Helper per simulare l'oggetto Express Response
function makeRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
}

const OPERATORE_ID = '507f1f77bcf86cd799439011';
const CONSULTAZIONE_ID = '507f1f77bcf86cd799439022';

const validVotazioneBody = {
    tipo: 'votazione',
    titolo: 'Votazione di prova',
    descrizione: 'Descrizione',
    data_inizio: '2027-01-10T10:00:00.000Z',
    data_fine: '2027-01-20T18:00:00.000Z',
    data_discussione: '2027-01-08T18:00:00.000Z',
    domanda: {
        titolo: 'Sei favorevole?',
        tipo: 'risposta_singola',
        opzioni: [{ testo: 'Sì' }, { testo: 'No' }],
    },
};

describe('consultazione controller', () => {
    let creaConsultazione;
    let getConsultazioneById;
    let publishConsultazione;
    let archiveConsultazione;
    let deleteConsultazione;

    beforeAll(async () => {
        const mod = await import('../../src/controllers/consultazione.controller.js');
        creaConsultazione = mod.creaConsultazione;
        getConsultazioneById = mod.getConsultazioneById;
        publishConsultazione = mod.publishConsultazione;
        archiveConsultazione = mod.archiveConsultazione;
        deleteConsultazione = mod.deleteConsultazione;
    });

    beforeEach(() => jest.clearAllMocks());

    // ───────────────────────── CREA ─────────────────────────

    describe('creaConsultazione', () => {
        it('400 tipo invalido', async () => {
            const req = { user: { _id: OPERATORE_ID }, body: { ...validVotazioneBody, tipo: 'x' } };
            const res = makeRes();

            await creaConsultazione(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('400 mancano campi', async () => {
            const req = { user: { _id: OPERATORE_ID }, body: { tipo: 'votazione' } };
            const res = makeRes();

            await creaConsultazione(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('201 crea votazione', async () => {
            mockDomandaCreate.mockResolvedValueOnce({ _id: 'dom1' });
            mockConsultazioneCreate.mockResolvedValueOnce({ _id: 'cons1' });

            const req = { user: { _id: OPERATORE_ID }, body: validVotazioneBody };
            const res = makeRes();

            await creaConsultazione(req, res);

            expect(mockConsultazioneCreate).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('500 errore DB', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockDomandaCreate.mockRejectedValueOnce(new Error('DB down'));

            const req = { user: { _id: OPERATORE_ID }, body: validVotazioneBody };
            const res = makeRes();

            await creaConsultazione(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            consoleSpy.mockRestore();
        });
    });

    // ───────────────────────── GET BY ID ─────────────────────────

    describe('getConsultazioneById', () => {
        it('404 non esiste', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce(null);

            const req = { params: { id: CONSULTAZIONE_ID }, ruolo: 'operatore' };
            const res = makeRes();

            await getConsultazioneById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('200 operatore ok', async () => {
            const fake = {
                tipo: 'votazione',
                stato: 'attivo',
                populate: jest.fn().mockReturnThis(),
            };

            mockConsultazioneFindOne.mockResolvedValueOnce(fake);

            const req = { params: { id: CONSULTAZIONE_ID }, ruolo: 'operatore' };
            const res = makeRes();

            await getConsultazioneById(req, res);

            expect(fake.populate).toHaveBeenCalledWith('ID_domanda');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('200 cittadino attivo', async () => {
            const fake = {
                tipo: 'votazione',
                stato: 'attivo',
                populate: jest.fn().mockReturnThis(), 
            };

            mockConsultazioneFindOne.mockResolvedValueOnce(fake);
            // Simula che il cittadino non abbia ancora risposto a questa consultazione
            mockRispostaConsultazioneExists.mockResolvedValueOnce(false); 

            const req = {
                params: { id: CONSULTAZIONE_ID },
                ruolo: 'cittadino',
                user: { _id: OPERATORE_ID },
            };

            const res = makeRes();

            await getConsultazioneById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(mockRispostaConsultazioneExists).toHaveBeenCalled();
        });
    });

    // ───────────────────────── PUBLISH ─────────────────────────

    describe('publishConsultazione', () => {
        it('404 non trovata', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce(null);

            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();

            await publishConsultazione(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ───────────────────────── ARCHIVE ─────────────────────────

    describe('archiveConsultazione', () => {
        it('400 stato sbagliato', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo' });

            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();

            await archiveConsultazione(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ───────────────────────── DELETE ─────────────────────────

    describe('deleteConsultazione', () => {
        it('404 non trovata', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce(null);

            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();

            await deleteConsultazione(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});