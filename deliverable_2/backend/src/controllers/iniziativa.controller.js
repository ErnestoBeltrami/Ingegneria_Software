import { Iniziativa } from '../models/iniziativa.js';
import { CategoriaIniziativa } from '../models/categoria_iniziativa.js';
import { VotoIniziativa } from '../models/voto_iniziativa.js';
import { Cittadino } from '../models/cittadino.js';
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

//ritorna l'elenco completo di iniziative
export const getIniziative = async (req,res) => {
    try{    
        const user = req.user;

        if(!user){
            return res.status(401).json({
                message : "Errore nell'autenticazione"
            });
        }

        
        const iniziative = await Iniziativa.aggregate([
        {
            $lookup: {
                from: "votoiniziativas",
                localField: "_id",
                foreignField: "ID_iniziativa",
                as: "voti"
            }
        },
        {
            $addFields: {
                numero_voti: { $size: "$voti" }
            }
        },
        {
            $lookup: {
                from: "cittadinos",
                localField: "ID_cittadino",
                foreignField: "_id",
                as: "cittadino_dettagli"
            }
        },
        { $unwind: "$cittadino_dettagli" },
        {
            $lookup: {
                from: "categoriainiziativas",
                localField: "ID_categoria",
                foreignField: "_id",
                as: "categoria_dettagli"
            }
        },
        { $unwind: "$categoria_dettagli" },
        {
            $project: {
                _id: 1,
                ID_categoria: 1,
                categoria: "$categoria_dettagli.nome",
                titolo: 1,
                nome_cittadino: "$cittadino_dettagli.nome",
                cognome_cittadino: "$cittadino_dettagli.cognome",
                numero_voti: "$numero_voti",
                createdAt: 1 
            }
        },
        {
            $sort: {
                createdAt: -1,
                numero_voti: -1
            }
        }
        ]);

        if (iniziative.length === 0) { // Controlla se l'array è vuoto
            return res.status(200).json({ // Usa il punto, non la virgola
                message: "Nessuna iniziativa disponibile.",
                iniziative: [] // Buona pratica restituire l'array vuoto
            });
        }
        else{
            return res.status(200).json({
                message : "Iniziative trovate:",
                iniziative
            });
        }

    }
    catch(error){
        console.error("Errore nel recupero delle iniziative:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero delle iniziative.",
            error: error.message
        });
    }
    


}