import { Votazione } from '../models/votazione.js';
import { Domanda } from '../models/domanda.js';

// Creazione di una nuova votazione da parte di un operatore autenticato
export const createVotazione = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: 'Operatore non autenticato.'
            });
        }

        const {
            titoloVotazione,
            descrizione,
            data_inizio,
            data_fine,
            data_discussione,
            domanda
        } = req.body;

        if (!titoloVotazione || !descrizione || !data_inizio || !data_fine || !data_discussione || !domanda) {
            return res.status(400).json({
                message: 'Dati mancanti per la creazione della votazione.'
            });
        }

        const { titolo, tipo, opzioni } = domanda;

        if (!titolo || !tipo || !opzioni || !Array.isArray(opzioni) || opzioni.length < 2) {
            return res.status(400).json({
                message: 'La domanda deve avere titolo, tipo e almeno due opzioni.'
            });
        }

        // 1) Creazione della domanda
        const nuovaDomanda = await Domanda.create({
            titolo,
            tipo,
            opzioni
        });

        // 2) Creazione della votazione collegata alla domanda e all'operatore
        const nuovaVotazione = await Votazione.create({
            titolo: titoloVotazione,
            descrizione,
            data_inizio,
            data_fine,
            data_discussione,
            creatoDa: userFromMiddleware._id,
            ID_domanda: nuovaDomanda._id
        });

        return res.status(201).json({
            message: 'Votazione creata con successo.',
            votazione: nuovaVotazione
        });
    } catch (error) {
        console.error('Errore nella creazione della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante la creazione della votazione.',
            error: error.message
        });
    }
};


