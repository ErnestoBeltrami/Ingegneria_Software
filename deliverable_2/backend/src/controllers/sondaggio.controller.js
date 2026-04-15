import { Domanda } from "../models/domanda.js";
import { Consultazione } from "../models/consultazione.js";
import mongoose from 'mongoose';
import { RispostaConsultazione } from "../models/risposta_consultazione.js";

// POST: Creazione sondaggio
export const creaSondaggio = async (req, res) => {
    
    const user = req.user;
    const data = req.body;
    const domande = req.body.domande;
    let sondaggio = null;
    let domandeCreate = []; 

    try {
        if (!user) {
            return res.status(401).json({
                message: "Operatore non autenticato."
            });
        }

        if (!data.titolo || !data.descrizione || !data.data_inizio || !data.data_fine || !data.data_discussione || !domande || !Array.isArray(domande) || domande.length === 0) {
            return res.status(400).json({
                message: "Inserire correttamente tutti i campi (titolo, descrizione, date, data_discussione e almeno una domanda)."
            });
        }

        const dataInizio = new Date(data.data_inizio);
        const dataFine = new Date(data.data_fine);
        const dataDiscussione = new Date(data.data_discussione);

        if (dataInizio >= dataFine) {
            return res.status(400).json({
                message: "La data di inizio deve essere antecedente alla data di fine."
            });
        }

        if (dataDiscussione >= dataInizio) {
            return res.status(400).json({
                message: "La data di discussione deve essere antecedente alla data di inizio."
            });
        }
        
        // Crea prima tutte le domande
        const creazioneDomandePromises = domande.map(domanda => {
            if (!domanda.titolo || !domanda.tipo || !domanda.opzioni || !Array.isArray(domanda.opzioni)) {
                throw new Error("Tutte le domande devono avere titolo, tipo e un array di opzioni valido.");
            }
            
            return Domanda.create({
                titolo: domanda.titolo,
                opzioni: domanda.opzioni,
                tipo: domanda.tipo
            });
        });

        const domandeCreate = await Promise.all(creazioneDomandePromises);
        const domandeIds = domandeCreate.map(d => d._id);

        // Crea il sondaggio con ID_domande già popolato
        sondaggio = await Consultazione.create({
            tipo: 'sondaggio',
            stato: "bozza",
            titolo: data.titolo,
            descrizione: data.descrizione,
            data_inizio: dataInizio,
            data_fine: dataFine,
            data_discussione: dataDiscussione,
            creatoDa: user._id,
            ID_domande: domandeIds
        });

        return res.status(201).json({
            message: "Creazione sondaggio e domande avvenuta con successo.",
            sondaggioId: sondaggio._id
        });

    } catch (error) {
        // Cleanup: elimina il sondaggio se è stato creato
        if (sondaggio && sondaggio._id) {
            await Consultazione.findByIdAndDelete(sondaggio._id).catch(err => 
                console.error(err)
            );
        }
        
        // Cleanup: elimina le domande create se il sondaggio non è stato creato o è fallito
        if (domandeCreate.length > 0 && (!sondaggio || !sondaggio._id)) {
            await Promise.all(
                domandeCreate.map(d => Domanda.findByIdAndDelete(d._id).catch(err => console.error(err)))
            );
        }

        console.error("Errore nella creazione del sondaggio:", error);
        
        if (error.name === 'ValidationError') {
             return res.status(400).json({ 
                 message: `Errore di validazione in Mongoose: ${error.message}` 
             });
        }
        
        if (error.message.includes("Tutte le domande devono avere")) {
             return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Errore interno del server durante la creazione del sondaggio.",
            error: error.message
        });
    }
};

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
        console.error('Errore nel recupero dei sondaggi:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero dei sondaggi.',
            error: error.message
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

        const votazioni = await Consultazione.find({
            stato: { $in: ["attivo", "concluso"] },
            tipo: 'sondaggio'
        }).sort({ data_inizio: -1 });

        if(!votazioni){
            return res.status(200).json({
                message : 'Nessun sondaggio disponibile al momento'
            });
        }

        return res.status(200).json({
            message: 'Sondaggi recuperati con successo.',
            votazioni
        });
    } catch (error) {
        console.error('Errore nel recupero dei sondaggi:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero dei sondaggi.',
            error: error.message
        });
    }
};

// GET: Dettaglio singola sondaggio
export const getSondaggioById = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;
        
        const sondaggio = await Consultazione.findOne({
            _id: id,
            creatoDa: userFromMiddleware._id,
            tipo: 'sondaggio'
        }).populate('ID_domande');

        if (!sondaggio) {
            return res.status(404).json({
                message: 'Sondaggio non trovato.'
            });
        }

        return res.status(200).json({
            message: 'Sondaggio trovato con successo.',
            sondaggio
        });
    } catch (error) {
        console.error('Errore nel recupero del sondaggio:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il recupero del sondaggio.',
            error: error.message
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

        await sondaggio.save();

        return res.status(200).json({
            message: 'Sondaggio aggiornato con successo.',
            sondaggio
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della sondaggio:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'aggiornamento del sondaggio.',
            error: error.message
        });
    }
};

// DELETE: Eliminazione sondaggio (solo in stato "bozza")
export const deleteSondaggio = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

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
                message: 'Solo i sondaggi in stato "bozza" possono essere eliminati.'
            });
        }

        await sondaggio.deleteOne();

        return res.status(200).json({
            message: 'Sondaggio eliminato con successo.'
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione del sondaggio:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'eliminazione del sondaggio.',
            error: error.message
        });
    }
};

// PATCH: Pubblicare sondaggio (bozza -> attivo)
export const publishSondaggio = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

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
                message: 'Solo i sondaggi in stato "bozza" possono essere pubblicate.'
            });
        }

        sondaggio.stato = 'attivo';
        await sondaggio.save();

        return res.status(200).json({
            message: 'Sondaggio pubblicato con successo.',
            sondaggio
        });
    } catch (error) {
        console.error('Errore nella pubblicazione del sondaggio:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante la pubblicazione del sondaggio.',
            error: error.message
        });
    }
};

// PATCH: Archiviare sondaggio (concluso -> archiviato)
export const archiveSondaggio = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { id } = req.params;

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

        if (sondaggio.stato !== 'concluso') {
            return res.status(400).json({
                message: 'Solo i sondaggi in stato "concluso" possono essere archiviate.'
            });
        }

        sondaggio.stato = 'archiviato';
        await sondaggio.save();

        return res.status(200).json({
            message: 'Sondaggio archiviato con successo.',
            sondaggio
        });
    } catch (error) {
        console.error('Errore nell\'archiviazione del sondaggio:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante l\'archiviazione del sondaggio.',
            error: error.message
        });
    }
};

export const getRiepilogoSintetico = async (req, res) => {
    const sondaggioId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(sondaggioId)) {
            return res.status(400).json({ message: "ID Sondaggio non valido." });
        }
        
        const objectIdSondaggio = new mongoose.Types.ObjectId(sondaggioId);
        let totaleVotiUnici = 0; // Contatore per il numero di cittadini che hanno risposto

        const sondaggio = await Consultazione.findOne({
            _id: objectIdSondaggio,
            tipo: 'sondaggio'
        }).populate('ID_domande');

        if (!sondaggio || sondaggio.ID_domande.length === 0) {
            return res.status(404).json({
                message: 'Sondaggio non trovato o domande mancanti.'
            });
        }
        
        // Trova il numero totale di partecipanti (risposte uniche)
        const totalVotiResult = await RispostaConsultazione.aggregate([
            {$match: {ID_consultazione: objectIdSondaggio, tipo_consultazione: 'sondaggio'}},
            {$count: 'totale'}
        ]);

        totaleVotiUnici = totalVotiResult.length > 0 ? totalVotiResult[0].totale : 0;
        
        const array_domande = sondaggio.ID_domande;
        const riepilogoRisultati = []; // Array che conterrà il riepilogo finale

        // Iterazione su tutte le domande del sondaggio
        for (const domanda of array_domande) {
            const domandaId = domanda._id;
            
            const risultatiAggregati = await RispostaConsultazione.aggregate([
                // 1. Filtra per il sondaggio specifico
                {$match: {ID_consultazione: objectIdSondaggio, tipo_consultazione: 'sondaggio'}},

                // 2. Espande l'array di oggetti 'dettagliRisposte'
                {$unwind: '$dettagliRisposte'},
                
                // 3. Filtra per isolare solo la risposta della domanda corrente
                {$match: {'dettagliRisposte.ID_domanda': domandaId}},
                
                // 4. Espande l'array 'opzioniScelte'
                {$unwind: '$dettagliRisposte.opzioniScelte'},
                
                // 5. Raggruppa per ID dell'opzione e conta i voti
                {$group: {
                    _id: '$dettagliRisposte.opzioniScelte',
                    voti: {$sum: 1}
                }}
            ]);

            // Formattazione dei risultati per la risposta JSON
            const risultatiFormattati = risultatiAggregati.map(res => {
                const opzioneCorrispondente = domanda.opzioni.find(op => op._id.equals(res._id));
                const testoOpzione = opzioneCorrispondente ? opzioneCorrispondente.testo : 'Opzione Sconosciuta';
                
                return {
                    opzioneId: res._id,
                    testoOpzione: testoOpzione,
                    voti: res.voti,
                    percentuale: totaleVotiUnici > 0 ? parseFloat(((res.voti / totaleVotiUnici) * 100).toFixed(2)) : 0
                };
            });
            
            riepilogoRisultati.push({
                domandaId: domandaId,
                titoloDomanda: domanda.titolo,
                risultati: risultatiFormattati
            });
        } // Fine del ciclo for...of

        return res.status(200).json({
            message: "Riepilogo sintetico recuperato con successo.",
            sondaggio: sondaggio.titolo,
            totaleVotiUnici: totaleVotiUnici,
            riepilogoPerDomanda: riepilogoRisultati
        });

    } catch (error) {
        console.error('Errore nel recupero del riepilogo sintetico:', error);
        return res.status(500).json({
            message: 'Errore interno del server.',
            error: error.message
        });
    }
};
