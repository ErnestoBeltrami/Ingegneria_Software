import logger from '../config/logger.js';
import { Domanda } from "../models/domanda.js";
import { Consultazione } from "../models/consultazione.js";

const creaDomande = async (domande) => {
    const promises = domande.map(domanda => {
        if (!domanda.titolo || !domanda.tipo || !domanda.opzioni || !Array.isArray(domanda.opzioni)) {
            throw new Error("Tutte le domande devono avere titolo, tipo e un array di opzioni valido.");
        }
        return Domanda.create({ titolo: domanda.titolo, opzioni: domanda.opzioni, tipo: domanda.tipo });
    });
    return Promise.all(promises);
};

const cleanupDomande = async (domande) => {
    if (domande.length > 0) {
        await Promise.all(domande.map(d =>
            Domanda.findByIdAndDelete(d._id).catch(err => logger.error('cleanup domanda fallito:', err))
        ));
    }
};

// POST: Creazione consultazione (votazione o sondaggio)
export const creaConsultazione = async (req, res) => {
    const user = req.user;
    const { tipo, titolo, descrizione, data_inizio, data_fine, data_discussione, domande, domanda } = req.body;

    let domandeCreate = [];
    let consultazione = null;

    try {
        if (!tipo || !['votazione', 'sondaggio'].includes(tipo)) {
            return res.status(400).json({ message: "Il tipo deve essere 'votazione' o 'sondaggio'." });
        }

        if (!titolo || !descrizione || !data_inizio || !data_fine || !data_discussione) {
            return res.status(400).json({ message: "Inserire tutti i campi obbligatori (titolo, descrizione, date)." });
        }

        const dataInizio = new Date(data_inizio);
        const dataFine = new Date(data_fine);
        const dataDiscussione = new Date(data_discussione);

        if (dataInizio >= dataFine) {
            return res.status(400).json({ message: "La data di inizio deve essere antecedente alla data di fine." });
        }
        if (dataDiscussione >= dataInizio) {
            return res.status(400).json({ message: "La data di discussione deve essere antecedente alla data di inizio." });
        }

        const consultazioneData = {
            tipo,
            stato: "bozza",
            titolo,
            descrizione,
            data_inizio: dataInizio,
            data_fine: dataFine,
            data_discussione: dataDiscussione,
            creatoDa: user._id,
        };

        if (tipo === 'sondaggio') {
            if (!domande || !Array.isArray(domande) || domande.length === 0) {
                return res.status(400).json({ message: "Il sondaggio deve avere almeno una domanda." });
            }
            domandeCreate = await creaDomande(domande);
            consultazioneData.ID_domande = domandeCreate.map(d => d._id);
        } else {
            if (!domanda || !domanda.titolo || !domanda.tipo || !domanda.opzioni || !Array.isArray(domanda.opzioni) || domanda.opzioni.length < 2) {
                return res.status(400).json({ message: "La votazione deve avere una domanda con titolo, tipo e almeno due opzioni." });
            }
            domandeCreate = await creaDomande([domanda]);
            consultazioneData.ID_domanda = domandeCreate[0]._id;
        }

        consultazione = await Consultazione.create(consultazioneData);

        return res.status(201).json({
            message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} creata con successo.`,
            consultazioneId: consultazione._id,
        });

    } catch (error) {
        if (consultazione?._id) {
            await Consultazione.findByIdAndDelete(consultazione._id)
                .catch(err => logger.error('cleanup consultazione fallito:', err));
        } else {
            await cleanupDomande(domandeCreate);
        }

        logger.error("Errore nella creazione della consultazione:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Errore di validazione." });
        }
        if (error.message.includes("Tutte le domande devono avere")) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Errore interno del server." });
    }
};

// PATCH: Pubblicare consultazione (bozza -> attivo)
export const publishConsultazione = async (req, res) => {
    try {
        const { id } = req.params;
        const consultazione = await Consultazione.findOne({ _id: id, creatoDa: req.user._id });

        if (!consultazione) {
            return res.status(404).json({ message: 'Consultazione non trovata.' });
        }

        if (consultazione.stato !== 'bozza') {
            return res.status(400).json({ message: 'Solo le bozze possono essere pubblicate.' });
        }

        consultazione.stato = 'attivo';
        await consultazione.save();

        return res.status(200).json({ message: 'Consultazione pubblicata con successo.', consultazione });
    } catch (error) {
        logger.error('Errore nella pubblicazione della consultazione:', error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};

// PATCH: Archiviare consultazione (concluso -> archiviato)
export const archiveConsultazione = async (req, res) => {
    try {
        const { id } = req.params;
        const consultazione = await Consultazione.findOne({ _id: id, creatoDa: req.user._id });

        if (!consultazione) {
            return res.status(404).json({ message: 'Consultazione non trovata.' });
        }

        if (consultazione.stato !== 'concluso') {
            return res.status(400).json({ message: 'Solo le consultazioni in stato "concluso" possono essere archiviate.' });
        }

        consultazione.stato = 'archiviato';
        await consultazione.save();

        return res.status(200).json({ message: 'Consultazione archiviata con successo.', consultazione });
    } catch (error) {
        logger.error("Errore nell'archiviazione della consultazione:", error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};

// DELETE: Eliminazione consultazione (solo in stato "bozza")
export const deleteConsultazione = async (req, res) => {
    try {
        const { id } = req.params;
        const consultazione = await Consultazione.findOne({ _id: id, creatoDa: req.user._id });

        if (!consultazione) {
            return res.status(404).json({ message: 'Consultazione non trovata.' });
        }

        if (consultazione.stato !== 'bozza') {
            return res.status(400).json({ message: 'Solo le consultazioni in stato "bozza" possono essere eliminate.' });
        }

        await consultazione.deleteOne();

        return res.status(200).json({ message: 'Consultazione eliminata con successo.' });
    } catch (error) {
        logger.error("Errore nell'eliminazione della consultazione:", error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};
