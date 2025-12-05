import { Consultazione } from '../models/consultazione.js';
import { Domanda } from '../models/domanda.js';
import { RispostaConsultazione } from '../models/risposta_consultazione.js';
import mongoose from 'mongoose';
// POST: Creazione di una nuova votazione da parte di un operatore autenticato
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
        const nuovaVotazione = await Consultazione.create({
            tipo: 'votazione',
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

// GET: Lista votazioni (per ora tutte, filtrabili per operatore)
export const getVotazioni = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: 'Operatore non autenticato.'
            });
        }

        const votazioni = await Consultazione.find({ 
            creatoDa: userFromMiddleware._id,
            tipo: 'votazione'
        })
            .populate('ID_domanda')    
            .sort({ data_inizio: -1 });

        return res.status(200).json({
            message: 'Votazioni recuperate con successo.',
            votazioni
        });
    } catch (error) {
        console.error('Errore nel recupero delle votazioni:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero delle votazioni.',
            error: error.message
        });
    }
};

// GET: Dettaglio singola votazione
export const getVotazioneById = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

        const votazione = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'votazione'
        }).populate('ID_domanda');

        if (!votazione) {
            return res.status(404).json({
                message: 'Votazione non trovata.'
            });
        }

        return res.status(200).json({
            message: 'Votazione trovata con successo.',
            votazione
        });
    } catch (error) {
        console.error('Errore nel recupero della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero della votazione.',
            error: error.message
        });
    }
};

// PATCH: Modifica votazione (solo in stato "bozza")
export const updateVotazione = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;
        const updateData = req.body;

        const votazione = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'votazione'
        });

        if (!votazione) {
            return res.status(404).json({
                message: 'Votazione non trovata.'
            });
        }

        if (votazione.stato !== 'bozza') {
            return res.status(400).json({
                message: 'Solo le votazioni in stato "bozza" possono essere modificate.',
            });
        }

        // Aggiorna solo i campi ammessi
        const campiAmmessi = ['titolo', 'descrizione', 'data_inizio', 'data_fine', 'data_discussione'];
        campiAmmessi.forEach((campo) => {
            if (updateData[campo] !== undefined) {
                votazione[campo] = updateData[campo];
            }
        });

        await votazione.save();

        return res.status(200).json({
            message: 'Votazione aggiornata con successo.',
            votazione
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'aggiornamento della votazione.',
            error: error.message
        });
    }
};

// DELETE: Eliminazione votazione (solo in stato "bozza")
export const deleteVotazione = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

        const votazione = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'votazione'
        });

        if (!votazione) {
            return res.status(404).json({
                message: 'Votazione non trovata.'
            });
        }

        if (votazione.stato !== 'bozza') {
            return res.status(400).json({
                message: 'Solo le votazioni in stato "bozza" possono essere eliminate.'
            });
        }

        await votazione.deleteOne();

        return res.status(200).json({
            message: 'Votazione eliminata con successo.'
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'eliminazione della votazione.',
            error: error.message
        });
    }
};

// PATCH: Pubblicare votazione (bozza -> attivo)
export const publishVotazione = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

        const votazione = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'votazione'
        });

        if (!votazione) {
            return res.status(404).json({
                message: 'Votazione non trovata.'
            });
        }

        if (votazione.stato !== 'bozza') {
            return res.status(400).json({
                message: 'Solo le votazioni in stato "bozza" possono essere pubblicate.'
            });
        }

        votazione.stato = 'attivo';
        await votazione.save();

        return res.status(200).json({
            message: 'Votazione pubblicata con successo.',
            votazione
        });
    } catch (error) {
        console.error('Errore nella pubblicazione della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante la pubblicazione della votazione.',
            error: error.message
        });
    }
};

// PATCH: Archiviare votazione (concluso -> archiviato)
export const archiveVotazione = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

        const votazione = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'votazione'
        });

        if (!votazione) {
            return res.status(404).json({
                message: 'Votazione non trovata.'
            });
        }

        if (votazione.stato !== 'concluso') {
            return res.status(400).json({
                message: 'Solo le votazioni in stato "concluso" possono essere archiviate.'
            });
        }

        votazione.stato = 'archiviato';
        await votazione.save();

        return res.status(200).json({
            message: 'Votazione archiviata con successo.',
            votazione
        });
    } catch (error) {
        console.error('Errore nell\'archiviazione della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'archiviazione della votazione.',
            error: error.message
        });
    }
};

export const getRiepilogoSintetico = async (req, res) => {
    const votazioneId = req.params.id;

    try {
        const objectIdVotazione = new mongoose.Types.ObjectId(votazioneId);

        const votazione = await Consultazione.findOne({
            _id: objectIdVotazione,
            tipo: 'votazione'
        }).populate('ID_domanda');

        if (!votazione || !votazione.ID_domanda) {
            return res.status(404).json({ message: 'Votazione non trovata o domanda collegata mancante.' });
        }
        
        const domanda = votazione.ID_domanda;

        // 2. Pipeline di Aggregazione: Conversione esplicita e Conteggio
        const risultatiVoto = await RispostaConsultazione.aggregate([
            { $match: { ID_consultazione: objectIdVotazione, tipo_consultazione: 'votazione' } }, 
            
            // FILTRO DI ROBUSTEZZA: Esclude ID nulli
            { $match: { ID_opzione: { $ne: null, $exists: true } } }, 
            
            // 🚨 CONVERSIONE AGGREGATION: Proietta l'ID Opzione come Stringa
            {
                $project: {
                    ID_opzione_str: { $toString: "$ID_opzione" },
                    _id: 0, // Rimuove l'ID originale del documento RispostaVotazione
                }
            },
            
            // Raggruppa i documenti (voti) per l'ID dell'opzione convertito
            {
                $group: {
                    _id: "$ID_opzione_str", // Ora il raggruppamento avviene sulla STRINGA
                    conteggio: { $sum: 1 } 
                }
            }
        ]);
        
        const totaleVoti = risultatiVoto.reduce((sum, result) => sum + result.conteggio, 0);

        // 4. Mappa, Unisce e Calcola le Percentuali
        const riepilogoFinale = domanda.opzioni.map(opzione => {
            
            // Ottiene l'ID dell'opzione come stringa per il confronto
            const opzioneIdCorrente = opzione._id.toString(); 

            // Cerca il risultato nell'array aggregato (il cui _id è ora garantito essere una stringa)
            const risultato = risultatiVoto.find(r => r._id === opzioneIdCorrente); 
            
            const conteggio = risultato ? risultato.conteggio : 0;
            
            const percentuale = totaleVoti > 0 ? (conteggio / totaleVoti) * 100 : 0;

            return {
                opzioneId: opzione._id,
                testoOpzione: opzione.testo,
                voti: conteggio,
                percentuale: parseFloat(percentuale.toFixed(2))
            };
        });

        return res.status(200).json({
            message: 'Riepilogo sintetico recuperato.',
            votazione: votazione.titolo,
            domanda: domanda.titolo,
            totaleVoti: totaleVoti,
            risultati: riepilogoFinale
        });

    } catch (error) {
        if (error.name === 'BSONTypeError' || error.name === 'CastError') {
             return res.status(400).json({ message: 'ID Votazione non valido.', error: error.message });
        }
        console.error('Errore nel riepilogo della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il riepilogo della votazione.',
            error: error.message
        });
    }
};