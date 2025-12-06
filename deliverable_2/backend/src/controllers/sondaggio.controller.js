import { Domanda } from "../models/domanda.js";
import { Consultazione } from "../models/consultazione.js";
import mongoose from 'mongoose';

// POST: Creazione sondaggio
export const createSondaggio = async (req, res) => {
    
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

// GET: Ricerca sondaggi (per ora tutti, filtrabili per operatore)
export const getSondaggi = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                message: "Operatore non autenticato."
            });
        }

        const sondaggi = await Consultazione.find({ creatoDa: user._id, tipo: 'sondaggio' })
            .populate('ID_domande')
            .sort({ data_inizio: -1 });

        if (!sondaggi || sondaggi.length === 0) {
            return res.status(200).json({
                message: "Nessun sondaggio trovato con i criteri specificati.",
                sondaggi: []
            });
        }
        else{
            return res.status(200).json({
                message: "Sondaggi trovati con successo:",
                sondaggi
            });
        }
    } catch (error) {
        console.error("Errore nella ricerca dei sondaggi:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la ricerca dei sondaggi.",
            error: error.message
        });
    }
};