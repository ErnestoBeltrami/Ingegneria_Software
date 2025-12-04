import { Iniziativa } from '../models/iniziativa.js';
import { CategoriaIniziativa } from '../models/categoria_iniziativa.js';
import mongoose from 'mongoose';

export const createIniziativa = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: "Cittadino non autenticato"
            });
        }

        const {
            ID_categoria,
            titolo,
            ID_cittadino,
            descrizione
        } = req.body;

        // Validazione campi
        if (!ID_categoria || !titolo || !ID_cittadino || !descrizione) {
            return res.status(400).json({
                message: "Dati mancanti per la creazione dell'iniziativa."
            });
        }

        // Verifica ID_categoria valido
        if (!mongoose.Types.ObjectId.isValid(ID_categoria)) {
            return res.status(400).json({
                message: "ID categoria non valido."
            });
        }

        // Verifica che la categoria esista
        const categoria = await CategoriaIniziativa.findById(ID_categoria);
        if (!categoria) {
            return res.status(404).json({
                message: "Categoria iniziativa non trovata."
            });
        }

        // Creazione iniziativa
        const nuovaIniziativa = await Iniziativa.create({
            ID_categoria,
            titolo,
            ID_cittadino,
            descrizione
        });

        return res.status(201).json({
            message: "Iniziativa creata con successo.",
            iniziativa: nuovaIniziativa
        });

    } catch (error) {
        console.error("Errore nella creazione dell'iniziativa:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la creazione dell'iniziativa.",
            error: error.message
        });
    }
};