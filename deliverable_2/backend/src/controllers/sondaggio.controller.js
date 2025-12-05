import { Domanda } from "../models/domanda.js";
import { Sondaggio } from "../models/sondaggio.js";
import mongoose from 'mongoose';

export const creaSondaggio = async (req, res) => {
    
    const user = req.user;
    const data = req.body;
    const domande = req.body.domande;
    let sondaggio = null; 

    try {
        if (!user) {
            return res.status(401).json({
                message: "Operatore non autenticato."
            });
        }

        if (!data.titolo || !data.descrizione || !data.data_inizio || !data.data_fine || !domande || !Array.isArray(domande) || domande.length === 0) {
            return res.status(400).json({
                message: "Inserire correttamente tutti i campi (titolo, descrizione, date e almeno una domanda)."
            });
        }

        const dataInizio = new Date(data.data_inizio);
        const dataFine = new Date(data.data_fine);

        if (dataInizio >= dataFine) {
            return res.status(400).json({
                message: "La data di inizio deve essere antecedente alla data di fine."
            });
        }
        
        sondaggio = await Sondaggio.create({
            stato: "bozza",
            titolo: data.titolo,
            descrizione: data.descrizione,
            data_inizio: dataInizio,
            data_fine: dataFine,
            creatoDa: user._id
        });

        const creazioneDomandePromises = domande.map(domanda => {
            if (!domanda.titolo || !domanda.tipo || !domanda.opzioni || !Array.isArray(domanda.opzioni)) {
                throw new Error("Tutte le domande devono avere titolo, tipo e un array di opzioni valido.");
            }
            
            return Domanda.create({
                id_sondaggio: sondaggio._id,
                titolo: domanda.titolo,
                opzioni: domanda.opzioni,
                tipo: domanda.tipo
            });
        });

        await Promise.all(creazioneDomandePromises);

        return res.status(201).json({
            message: "Creazione sondaggio e domande avvenuta con successo.",
            sondaggioId: sondaggio._id
        });

    } catch (error) {
        if (sondaggio && sondaggio._id) {
            await Sondaggio.findByIdAndDelete(sondaggio._id).catch(err => 
                console.error(err)
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