import logger from '../config/logger.js';
import { Consultazione } from '../models/consultazione.js';
import { Domanda } from '../models/domanda.js';
import { RispostaConsultazione } from '../models/risposta_consultazione.js';
import mongoose from 'mongoose';

// GET: Lista votazioni filtrabili per stato con paginazione
export const getVotazioni = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: 'Operatore non autenticato.'
            });
        }

        const statiValidi = ['bozza', 'attivo', 'concluso', 'archiviato'];
        const { stato, page = 1, limit = 10 } = req.query;

        if (stato && !statiValidi.includes(stato)) {
            return res.status(400).json({
                message: `Stato non valido. Valori ammessi: ${statiValidi.join(', ')}.`
            });
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const filtro = { creatoDa: userFromMiddleware._id, tipo: 'votazione' };
        if (stato) filtro.stato = stato;

        const [votazioni, totale] = await Promise.all([
            Consultazione.find(filtro)
                .populate('ID_domanda')
                .sort({ data_inizio: -1 })
                .skip(skip)
                .limit(limitNum),
            Consultazione.countDocuments(filtro)
        ]);

        return res.status(200).json({
            message: 'Votazioni recuperate con successo.',
            votazioni,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });
    } catch (error) {
        logger.error('Errore nel recupero delle votazioni:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero delle votazioni.'
        });
    }
};

//GET: Ritorna le votazioni attive e concluse visibili ai cittadini
export const getVotazioniAvailable = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: 'Cittadino non autenticato.'
            });
        }

        const { page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const filtro = { stato: { $in: ['attivo', 'concluso'] }, tipo: 'votazione' };

        const [votazioni, totale] = await Promise.all([
            Consultazione.find(filtro).sort({ data_inizio: -1 }).skip(skip).limit(limitNum),
            Consultazione.countDocuments(filtro)
        ]);

        const risposte = await RispostaConsultazione.find({
            ID_cittadino: userFromMiddleware._id,
            tipo_consultazione: 'votazione'
        }).select('ID_consultazione');
        const votedIds = new Set(risposte.map(r => r.ID_consultazione.toString()));

        const votazioniWithVoted = votazioni.map(v => ({
            ...v.toObject(),
            voted: votedIds.has(v._id.toString())
        }));

        return res.status(200).json({
            message: 'Votazioni recuperate con successo.',
            votazioni: votazioniWithVoted,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });
    } catch (error) {
        logger.error('Errore nel recupero delle votazioni:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero delle votazioni.'
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

        // Aggiorna la domanda (opzioni e tipo) se fornita
        if (updateData.domanda) {
            const domanda = await Domanda.findById(votazione.ID_domanda);
            if (domanda) {
                const { tipo, opzioni } = updateData.domanda;
                if (tipo && ['risposta_singola', 'risposta_multipla'].includes(tipo)) {
                    domanda.tipo = tipo;
                }
                if (Array.isArray(opzioni) && opzioni.length >= 2) {
                    domanda.opzioni = opzioni.map((o) => ({ testo: typeof o === 'string' ? o : o.testo }));
                }
                await domanda.save();
            }
        }

        const votazioneAggiornata = await Consultazione.findById(votazione._id).populate('ID_domanda');

        return res.status(200).json({
            message: 'Votazione aggiornata con successo.',
            votazione: votazioneAggiornata
        });
    } catch (error) {
        logger.error('Errore nell\'aggiornamento della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'aggiornamento della votazione.'
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
             return res.status(400).json({ message: 'ID Votazione non valido.' });
        }
        logger.error('Errore nel riepilogo della votazione:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il riepilogo della votazione.'
        });
    }
};

export const getRiepilogoDemografico = async (req, res) => {
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
        const opzioniMap = Object.fromEntries(
            domanda.opzioni.map(o => [o._id.toString(), o.testo])
        );

        const baseMatch = { $match: { ID_consultazione: objectIdVotazione, tipo_consultazione: 'votazione', ID_opzione: { $ne: null, $exists: true } } };
        const projectOpzioneStr = { $project: { ID_opzione_str: { $toString: '$ID_opzione' }, ID_cittadino: 1, createdAt: 1 } };
        const lookupCittadino = {
            $lookup: { from: 'cittadinos', localField: 'ID_cittadino', foreignField: '_id', as: 'cittadino' }
        };
        const unwindCittadino = { $unwind: { path: '$cittadino', preserveNullAndEmptyArrays: false } };

        const [perGenere, perFasciaEta, partecipazioneGiornaliera] = await Promise.all([
            // A) Per genere
            RispostaConsultazione.aggregate([
                baseMatch,
                projectOpzioneStr,
                lookupCittadino,
                unwindCittadino,
                { $group: { _id: { genere: '$cittadino.genere', opzione: '$ID_opzione_str' }, voti: { $sum: 1 } } },
                { $project: { _id: 0, genere: '$_id.genere', opzioneId: '$_id.opzione', voti: 1 } }
            ]),

            // B) Per fascia d'età
            RispostaConsultazione.aggregate([
                baseMatch,
                projectOpzioneStr,
                lookupCittadino,
                unwindCittadino,
                {
                    $addFields: {
                        _eta: {
                            $floor: {
                                $divide: [
                                    { $dateDiff: { startDate: '$cittadino.dataNascita', endDate: '$$NOW', unit: 'day' } },
                                    365.25
                                ]
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        fascia: {
                            $switch: {
                                branches: [
                                    { case: { $lte: ['$_eta', 25] }, then: '18-25' },
                                    { case: { $lte: ['$_eta', 35] }, then: '26-35' },
                                    { case: { $lte: ['$_eta', 50] }, then: '36-50' },
                                    { case: { $lte: ['$_eta', 65] }, then: '51-65' },
                                ],
                                default: '66+'
                            }
                        }
                    }
                },
                { $group: { _id: { fascia: '$fascia', opzione: '$ID_opzione_str' }, voti: { $sum: 1 } } },
                { $project: { _id: 0, fascia: '$_id.fascia', opzioneId: '$_id.opzione', voti: 1 } }
            ]),

            // C) Partecipazione giornaliera
            RispostaConsultazione.aggregate([
                baseMatch,
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        voti: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } },
                { $project: { _id: 0, data: '$_id', voti: 1 } }
            ])
        ]);

        return res.status(200).json({
            message: 'Riepilogo demografico recuperato.',
            votazione: votazione.titolo,
            stato: votazione.stato,
            data_inizio: votazione.data_inizio,
            data_fine: votazione.data_fine,
            opzioniMap,
            perGenere,
            perFasciaEta,
            partecipazioneGiornaliera
        });

    } catch (error) {
        if (error.name === 'BSONTypeError' || error.name === 'CastError') {
            return res.status(400).json({ message: 'ID Votazione non valido.' });
        }
        logger.error('Errore nel riepilogo demografico:', error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};