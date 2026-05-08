import { jest } from '@jest/globals';

const mockDomandaCreate = jest.fn();
const mockDomandaFindByIdAndDelete = jest.fn();
const mockConsultazioneCreate = jest.fn();
const mockConsultazioneFindOne = jest.fn();
const mockConsultazioneFindByIdAndDelete = jest.fn();

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
        findByIdAndDelete: mockConsultazioneFindByIdAndDelete,
    },
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

function makeRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const OPERATORE_ID = '507f1f77bcf86cd799439011';
const CONSULTAZIONE_ID = '507f1f77bcf86cd799439022';
const DOMANDA_ID = '507f1f77bcf86cd799439033';

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
    let publishConsultazione;
    let archiveConsultazione;
    let deleteConsultazione;

    beforeAll(async () => {
        const mod = await import('../../src/controllers/consultazione.controller.js');
        creaConsultazione = mod.creaConsultazione;
        publishConsultazione = mod.publishConsultazione;
        archiveConsultazione = mod.archiveConsultazione;
        deleteConsultazione = mod.deleteConsultazione;
    });

    beforeEach(() => jest.clearAllMocks());

    // ── creaConsultazione ──────────────────────────────────────────────────────

    describe('creaConsultazione', () => {
        it('restituisce 400 per tipo non valido', async () => {
            const req = { user: { _id: OPERATORE_ID }, body: { ...validVotazioneBody, tipo: 'invalido' } };
            const res = makeRes();
            await creaConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining("tipo deve essere") })
            );
        });

        it('restituisce 400 se mancano campi obbligatori', async () => {
            const req = { user: { _id: OPERATORE_ID }, body: { tipo: 'votazione', titolo: 'Solo titolo' } };
            const res = makeRes();
            await creaConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('obbligatori') })
            );
        });

        it('restituisce 400 se la domanda votazione ha meno di 2 opzioni', async () => {
            const req = {
                user: { _id: OPERATORE_ID },
                body: {
                    ...validVotazioneBody,
                    domanda: { titolo: 'D', tipo: 'risposta_singola', opzioni: [{ testo: 'Solo una' }] },
                },
            };
            const res = makeRes();
            await creaConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('almeno due opzioni') })
            );
        });

        it('crea domanda e votazione, restituisce 201', async () => {
            const domandaFake = { _id: DOMANDA_ID };
            const consultazioneFake = { _id: CONSULTAZIONE_ID };
            mockDomandaCreate.mockResolvedValueOnce(domandaFake);
            mockConsultazioneCreate.mockResolvedValueOnce(consultazioneFake);

            const req = { user: { _id: OPERATORE_ID }, body: validVotazioneBody };
            const res = makeRes();
            await creaConsultazione(req, res);

            expect(mockDomandaCreate).toHaveBeenCalledWith(
                expect.objectContaining({ titolo: validVotazioneBody.domanda.titolo })
            );
            expect(mockConsultazioneCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    tipo: 'votazione',
                    titolo: validVotazioneBody.titolo,
                    ID_domanda: DOMANDA_ID,
                    creatoDa: OPERATORE_ID,
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ consultazioneId: CONSULTAZIONE_ID })
            );
        });

        it('restituisce 500 in caso di errore imprevisto', async () => {
            mockDomandaCreate.mockRejectedValueOnce(new Error('DB down'));
            const req = { user: { _id: OPERATORE_ID }, body: validVotazioneBody };
            const res = makeRes();
            await creaConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ── publishConsultazione ───────────────────────────────────────────────────

    describe('publishConsultazione', () => {
        it('restituisce 404 se non trovata', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce(null);
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await publishConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('restituisce 400 se non è in bozza', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo', save: jest.fn() });
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await publishConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('bozze') })
            );
        });

        it('porta lo stato a "attivo" e restituisce 200', async () => {
            const fake = { stato: 'bozza', save: jest.fn().mockResolvedValueOnce(true) };
            mockConsultazioneFindOne.mockResolvedValueOnce(fake);
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await publishConsultazione(req, res);
            expect(fake.stato).toBe('attivo');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // ── archiveConsultazione ───────────────────────────────────────────────────

    describe('archiveConsultazione', () => {
        it('restituisce 400 se non è in stato concluso', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo', save: jest.fn() });
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await archiveConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('porta lo stato a "archiviato" e restituisce 200', async () => {
            const fake = { stato: 'concluso', save: jest.fn().mockResolvedValueOnce(true) };
            mockConsultazioneFindOne.mockResolvedValueOnce(fake);
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await archiveConsultazione(req, res);
            expect(fake.stato).toBe('archiviato');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // ── deleteConsultazione ────────────────────────────────────────────────────

    describe('deleteConsultazione', () => {
        it('restituisce 400 se non è in bozza', async () => {
            mockConsultazioneFindOne.mockResolvedValueOnce({ stato: 'attivo' });
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await deleteConsultazione(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('elimina la consultazione e restituisce 200', async () => {
            const fake = { stato: 'bozza', deleteOne: jest.fn().mockResolvedValueOnce(true) };
            mockConsultazioneFindOne.mockResolvedValueOnce(fake);
            const req = { user: { _id: OPERATORE_ID }, params: { id: CONSULTAZIONE_ID } };
            const res = makeRes();
            await deleteConsultazione(req, res);
            expect(fake.deleteOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
