import logger from '../config/logger.js';
import { Domanda } from "../models/domanda.js";
import { Consultazione } from "../models/consultazione.js";
import mongoose from 'mongoose';
import { RispostaConsultazione } from "../models/risposta_consultazione.js";

export const getSondaggi = async (req, res) => {
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

        const filtro = { creatoDa: userFromMiddleware._id, tipo: 'sondaggio' };
        if (stato) filtro.stato = stato;

        const [sondaggi, totale] = await Promise.all([
            Consultazione.find(filtro)
                .populate('ID_domande')
                .sort({ data_inizio: -1 })
                .skip(skip)
                .limit(limitNum),
            Consultazione.countDocuments(filtro)
        ]);

        return res.status(200).json({
            message: 'Sondaggi recuperati con successo.',
            sondaggi,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });

    } catch (error) {
        logger.error('Errore nel recupero dei sondaggi:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero dei sondaggi.'
        });
    }
};

export const getSondaggiAvaiable = async (req, res) => {
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

        const filtro = { stato: { $in: ['attivo', 'concluso'] }, tipo: 'sondaggio' };

        const [sondaggi, totale] = await Promise.all([
            Consultazione.find(filtro).populate('ID_domande').sort({ data_inizio: -1 }).skip(skip).limit(limitNum),
            Consultazione.countDocuments(filtro)
        ]);

        const risposte = await RispostaConsultazione.find({
            ID_cittadino: userFromMiddleware._id,
            tipo_consultazione: 'sondaggio'
        }).select('ID_consultazione');
        const votedIds = new Set(risposte.map(r => r.ID_consultazione.toString()));

        const sondaggiWithVoted = sondaggi.map(s => ({
            ...s.toObject(),
            voted: votedIds.has(s._id.toString())
        }));

        return res.status(200).json({
            message: 'Sondaggi recuperati con successo.',
            sondaggi: sondaggiWithVoted,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });
    } catch (error) {
        logger.error('Errore nel recupero dei sondaggi:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero dei sondaggi.'
        });
    }
};

export const updateSondaggio = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;
        const updateData = req.body;

        const sondaggio = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'sondaggio'
        });

        if (!sondaggio) {
            return res.status(404).json({
                message: 'Sondaggio non trovato.'
            });
        }

        if (sondaggio.stato !== 'bozza') {
            return res.status(400).json({
                message: 'Solo i sondaggi in stato "bozza" possono essere modificate.',
            });
        }

        // Aggiorna solo i campi ammessi
        const campiAmmessi = ['titolo', 'descrizione', 'data_inizio', 'data_fine', 'data_discussione'];
        campiAmmessi.forEach((campo) => {
            if (updateData[campo] !== undefined) {
                sondaggio[campo] = updateData[campo];
            }
        });

        // Aggiorna le domande se fornite — sostituisce integralmente (bozza = nessun voto)
        if (Array.isArray(updateData.domande) && updateData.domande.length > 0) {
            const vecchieIds = sondaggio.ID_domande;

            const nuoveDomande = await Promise.all(
                updateData.domande.map((d) => Domanda.create({
                    titolo: d.titolo,
                    tipo: d.tipo || 'risposta_singola',
                    opzioni: d.opzioni.map((o) => ({ testo: typeof o === 'string' ? o : o.testo })),
                }))
            );

            sondaggio.ID_domande = nuoveDomande.map((d) => d._id);
            await sondaggio.save();

            // Elimina le vecchie domande dopo aver salvato
            await Domanda.deleteMany({ _id: { $in: vecchieIds } });
        } else {
            await sondaggio.save();
        }

        const sondaggioAggiornato = await Consultazione.findById(sondaggio._id).populate('ID_domande');

        return res.status(200).json({
            message: 'Sondaggio aggiornato con successo.',
            sondaggio: sondaggioAggiornato
        });
    } catch (error) {
        logger.error('Errore nell\'aggiornamento della sondaggio:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'aggiornamento del sondaggio.'
        });
    }
};


export const getRiepilogoSintetico = async (req, res) => {
    const sondaggioId = req.params.id;
    const t0 = Date.now();

    try {
        if (!mongoose.Types.ObjectId.isValid(sondaggioId)) {
            return res.status(400).json({ message: "ID Sondaggio non valido." });
        }

        const objectIdSondaggio = new mongoose.Types.ObjectId(sondaggioId);
        let totaleVotiUnici = 0;

        const sondaggio = await Consultazione.findOne({
            _id: objectIdSondaggio,
            tipo: 'sondaggio'
        }).populate('ID_domande');
        logger.debug({ ms: Date.now() - t0, sondaggioId }, 'riepilogoSintetico: findOne+populate');

        if (!sondaggio || sondaggio.ID_domande.length === 0) {
            return res.status(404).json({
                message: 'Sondaggio non trovato o domande mancanti.'
            });
        }

        const tAgg0 = Date.now();
        const totalVotiResult = await RispostaConsultazione.aggregate([
            {$match: {ID_consultazione: objectIdSondaggio, tipo_consultazione: 'sondaggio'}},
            {$count: 'totale'}
        ]);

        totaleVotiUnici = totalVotiResult.length > 0 ? totalVotiResult[0].totale : 0;

        const array_domande = sondaggio.ID_domande;
        const riepilogoRisultati = [];

        const risultatiTotali = await RispostaConsultazione.aggregate([
            { $match: { ID_consultazione: objectIdSondaggio, tipo_consultazione: 'sondaggio' } },
            { $unwind: '$dettagliRisposte' },
            { $unwind: '$dettagliRisposte.opzioniScelte' },
            { $group: { _id: { domanda: '$dettagliRisposte.ID_domanda', opzione: '$dettagliRisposte.opzioniScelte' }, voti: { $sum: 1 } } }
        ]);
        logger.debug({ ms: Date.now() - tAgg0, nDomande: array_domande.length }, 'riepilogoSintetico: aggregazioni (2 query fisse)');

        const votiPerDomanda = new Map();
        for (const entry of risultatiTotali) {
            const key = entry._id.domanda.toString();
            if (!votiPerDomanda.has(key)) votiPerDomanda.set(key, []);
            votiPerDomanda.get(key).push({ opzioneId: entry._id.opzione, voti: entry.voti });
        }

        for (const domanda of array_domande) {
            const voti = votiPerDomanda.get(domanda._id.toString()) || [];
            const risultatiFormattati = voti.map(({ opzioneId, voti: v }) => {
                const opzioneCorrispondente = domanda.opzioni.find(op => op._id.equals(opzioneId));
                const testoOpzione = opzioneCorrispondente ? opzioneCorrispondente.testo : 'Opzione Sconosciuta';
                return {
                    opzioneId,
                    testoOpzione,
                    voti: v,
                    percentuale: totaleVotiUnici > 0 ? parseFloat(((v / totaleVotiUnici) * 100).toFixed(2)) : 0
                };
            });
            riepilogoRisultati.push({
                domandaId: domanda._id,
                titoloDomanda: domanda.titolo,
                risultati: risultatiFormattati
            });
        }

        logger.info({ ms: Date.now() - t0, sondaggioId, nDomande: array_domande.length }, 'riepilogoSintetico: completato');
        return res.status(200).json({
            message: "Riepilogo sintetico recuperato con successo.",
            sondaggio: sondaggio.titolo,
            totaleVotiUnici: totaleVotiUnici,
            riepilogoPerDomanda: riepilogoRisultati
        });

    } catch (error) {
        logger.error('Errore nel recupero del riepilogo sintetico:', error);
        return res.status(500).json({
            message: 'Errore interno del server.'
        });
    }
};

// ── SONDAGGIO ────────────────────────────────────────────────────────────────
 
export const getRiepilogoConFiltri = async (req, res) => {
    const sondaggioId = req.params.id;
    const t0 = Date.now();
 
    try {
        if (!mongoose.Types.ObjectId.isValid(sondaggioId)) {
            return res.status(400).json({ message: "ID Sondaggio non valido." });
        }
 
        const objectIdSondaggio = new mongoose.Types.ObjectId(sondaggioId);
 
        const sondaggio = await Consultazione.findOne({
            _id: objectIdSondaggio,
            tipo: 'sondaggio'
        }).populate('ID_domande');
        logger.debug({ ms: Date.now() - t0, sondaggioId }, 'riepilogoDemograficoSondaggio: findOne+populate');
 
        if (!sondaggio || sondaggio.ID_domande.length === 0) {
            return res.status(404).json({
                message: 'Sondaggio non trovato o domande mancanti.'
            });
        }
 
        const baseMatch = {
            $match: { ID_consultazione: objectIdSondaggio, tipo_consultazione: 'sondaggio' }
        };
        const lookupCittadino = {
            $lookup: { from: 'cittadinos', localField: 'ID_cittadino', foreignField: '_id', as: 'cittadino' }
        };
        const unwindCittadino = {
            $unwind: { path: '$cittadino', preserveNullAndEmptyArrays: false }
        };
        const unwindRisposte = { $unwind: '$dettagliRisposte' };
        const unwindOpzioni  = { $unwind: '$dettagliRisposte.opzioniScelte' };
 
        const [perGenere, perFasciaEta, perCategoria, partecipazioneGiornaliera] = await Promise.all([
 
            // A) Per genere
            RispostaConsultazione.aggregate([
                baseMatch,
                lookupCittadino,
                unwindCittadino,
                unwindRisposte,
                unwindOpzioni,
                {
                    $group: {
                        _id: {
                            genere: '$cittadino.genere',
                            domanda: '$dettagliRisposte.ID_domanda',
                            opzione: '$dettagliRisposte.opzioniScelte'
                        },
                        voti: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        genere: '$_id.genere',
                        domandaId: '$_id.domanda',
                        opzioneId: '$_id.opzione',
                        voti: 1
                    }
                }
            ]),
 
            // B) Per fascia d'età
            RispostaConsultazione.aggregate([
                baseMatch,
                lookupCittadino,
                unwindCittadino,
                unwindRisposte,
                unwindOpzioni,
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
                {
                    $group: {
                        _id: {
                            fascia: '$fascia',
                            domanda: '$dettagliRisposte.ID_domanda',
                            opzione: '$dettagliRisposte.opzioniScelte'
                        },
                        voti: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        fascia: '$_id.fascia',
                        domandaId: '$_id.domanda',
                        opzioneId: '$_id.opzione',
                        voti: 1
                    }
                }
            ]),
 
            // C) Per categoria
            RispostaConsultazione.aggregate([
                baseMatch,
                lookupCittadino,
                unwindCittadino,
                unwindRisposte,
                unwindOpzioni,
                {
                    $group: {
                        _id: {
                            categoria: '$cittadino.categoria',
                            domanda: '$dettagliRisposte.ID_domanda',
                            opzione: '$dettagliRisposte.opzioniScelte'
                        },
                        voti: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        categoria: '$_id.categoria',
                        domandaId: '$_id.domanda',
                        opzioneId: '$_id.opzione',
                        voti: 1
                    }
                }
            ]),
 
            // D) Partecipazione giornaliera
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
 
        logger.info({ ms: Date.now() - t0, sondaggioId, nDomande: sondaggio.ID_domande.length }, 'riepilogoDemograficoSondaggio: completato');
 
        // Mappa domandaId → titolo per comodità del frontend
        const domandeMap = Object.fromEntries(
            sondaggio.ID_domande.map(d => [d._id.toString(), d.titolo])
        );
 
        return res.status(200).json({
            message: 'Riepilogo demografico recuperato.',
            sondaggio: sondaggio.titolo,
            stato: sondaggio.stato,
            data_inizio: sondaggio.data_inizio,
            data_fine: sondaggio.data_fine,
            domandeMap,
            perGenere,
            perFasciaEta,
            perCategoria,
            partecipazioneGiornaliera
        });
 
    } catch (error) {
        if (error.name === 'BSONTypeError' || error.name === 'CastError') {
            return res.status(400).json({ message: 'ID Sondaggio non valido.' });
        }
        logger.error('Errore nel riepilogo demografico sondaggio:', error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};
 
 
 
