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
    


};

export const ricercaIniziativa = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Errore nell'autenticazione"
            });
        }

        // Dati di filtro dalla richiesta (usiamo i nomi definiti prima)
        const { parola_chiave, filtri } = req.body;
        const categorie = filtri?.categorie_id || [];
        const ordina_per = filtri?.ordina_per;
        const ordine = filtri?.ordine || -1; // Default: Decrescente (-1)

        let matchStage = {}; 

        // 1. CORREZIONE: Mappa l'array di stringhe in array di ObjectId
        const categorieObjectId = categorie.map(id => {
            // Se l'ID non è valido, il costruttore di ObjectId può lanciare un errore
            if (!mongoose.Types.ObjectId.isValid(id)) {
                 // Potresti gestire l'errore qui o lasciare che il try/catch generale lo gestisca
                 console.warn(`ID Categoria non valido: ${id}`);
                 return null; // Esclude ID non validi
            }
            return new mongoose.Types.ObjectId(id);
        }).filter(id => id !== null); // Rimuove eventuali null (ID non validi)


        // 2. FILTRO PER CATEGORIE ($in)
        if (categorieObjectId.length > 0) {
            matchStage.ID_categoria = { $in: categorieObjectId };
        }
        // 2. FILTRO PER PAROLA CHIAVE ($text)
        if (parola_chiave && parola_chiave.trim() !== '') {
            matchStage.$text = { $search: parola_chiave };
        }

        // --- COSTRUZIONE DINAMICA DELL'ORDINAMENTO ---
        let sortCriteria = {};

        if (ordina_per === 'voti') {
            // Se l'utente ordina per voti, la priorità è numero_voti
            sortCriteria.numero_voti = ordine;
            sortCriteria.createdAt = -1; // Data come secondo criterio
        } else if (ordina_per === 'data') {
            // Se l'utente ordina per data, la priorità è createdAt
            sortCriteria.createdAt = ordine;
            sortCriteria.numero_voti = -1; // Voti come secondo criterio
        } else if (parola_chiave && parola_chiave.trim() !== '') {
            // Se c'è una ricerca $text e nessun ordinamento specificato, ordina per rilevanza
            sortCriteria.score = { $meta: "textScore" };
        } else {
            // Ordinamento di default (nessun filtro text o sort specificato): data più recente
            sortCriteria.createdAt = -1;
            sortCriteria.numero_voti = -1;
        }

        // --- PIPELINE DI AGGREGAZIONE ---
        const pipeline = [];

        // 3. Aggiungi lo stage $match se ci sono filtri (categorie o $text)
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        // La pipeline del voto (per calcolare numero_voti)
        pipeline.push(
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
            }
        );

        // Aggiungi il campo score per l'ordinamento se è stata usata la ricerca $text
        if (parola_chiave && parola_chiave.trim() !== '') {
            pipeline.push({
                $project: {
                    score: { $meta: "textScore" }, // Proietta il punteggio di rilevanza
                    _id: 1,
                    ID_categoria: 1,
                    titolo: 1,
                    ID_cittadino: 1, // Necessario per il $lookup successivo
                    numero_voti: 1,
                    createdAt: 1
                }
            });
        }
        
        // Il resto della pipeline per popolare i dettagli (come nella tua funzione base)
        pipeline.push(
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
                    numero_voti: 1, // numero_voti è stato calcolato prima
                    createdAt: 1
                }
            },
            // 4. Aggiungi lo stage $sort con i criteri dinamici
            { $sort: sortCriteria }
        );


        const iniziative = await Iniziativa.aggregate(pipeline);

        // 5. Risposta
        if (iniziative.length === 0) {
            return res.status(200).json({
                message: "Nessuna iniziativa disponibile con i criteri specificati.",
                iniziative: []
            });
        } else {
            return res.status(200).json({
                message: "Iniziative trovate:",
                iniziative
            });
        }

    } catch (error) {
        console.error("Errore nel recupero delle iniziative:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero delle iniziative.",
            error: error.message
        });
    }
};