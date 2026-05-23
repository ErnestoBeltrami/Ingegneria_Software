import logger from '../config/logger.js';
import { Iniziativa } from '../models/iniziativa.js';
import { CategoriaIniziativa } from '../models/categoria_iniziativa.js';
import { Cittadino } from '../models/cittadino.js';
import { Notifica } from '../models/notifica.js';
import mongoose from 'mongoose';

// POST: Crea iniziativa
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
            descrizione
        } = req.body;

        const ID_cittadino = req.user._id;

        // Validazione campi
        if (!ID_categoria || !titolo || !descrizione) {
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
            ID_cittadino: userFromMiddleware._id,
            descrizione
        });

        return res.status(201).json({
            message: "Iniziativa creata con successo.",
            iniziativa: nuovaIniziativa
        });

    } catch (error) {
        logger.error("Errore nella creazione dell'iniziativa:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la creazione dell'iniziativa."
        });
    }
};

// GET: ritorna l'elenco completo di iniziative
export const getIniziative = async (req,res) => {
    try{
        const user = req.user;

        if(!user){
            return res.status(401).json({
                message : "Errore nell'autenticazione"
            });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const matchStato = req.ruolo === 'operatore' ? {} : { stato: 'approvata' };

        const pipeline = [
            { $match: matchStato },
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
                    descrizione: 1,
                    stato: 1,
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
        ];

        const [iniziative, countResult] = await Promise.all([
            Iniziativa.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
            Iniziativa.aggregate([{ $match: matchStato }, { $count: 'totale' }])
        ]);

        const totale = countResult[0]?.totale ?? 0;

        return res.status(200).json({
            message: iniziative.length === 0 ? "Nessuna iniziativa disponibile." : "Iniziative trovate:",
            iniziative,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });

    }
    catch(error){
        logger.error("Errore nel recupero delle iniziative:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero delle iniziative."
        });
    }
};

// GET: Ricerca iniziativa per Id
export const getIniziativaById = async (req, res) => {
    try {
        const { id } = req.params;
        const iniziativa = await Iniziativa.findById(id);
        if (!iniziativa) {
            return res.status(404).json({
                message: "Iniziativa non trovata.",
                iniziativa: null
            });
        }
        else{
            return res.status(200).json({
                message: "Iniziativa trovata con successo.",
                iniziativa
            });
        }
    }
    catch(error){
        logger.error("Errore nel recupero dell'iniziativa con l'ID specificato:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero dell'iniziativa con l'ID specificato."
        });
    }
};

// PATCH: Aggiorna iniziativa
export const updateIniziativa = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { titolo, descrizione, ID_categoria } = req.body;
        const iniziativa = await Iniziativa.findById(id);
        const cittadino = await Cittadino.findById(user._id);

        if (!cittadino) {
            return res.status(401).json({
                message: "Errore nell'autenticazione"
            });
        }
        if (!iniziativa) {
            return res.status(404).json({
                message: "Iniziativa non trovata.",
            });
        }
        if (!iniziativa.ID_cittadino.equals(cittadino._id)) {
            return res.status(403).json({
                message: "Accesso negato: non sei il creatore dell'iniziativa.",
            });
        }
        if (iniziativa.stato !== 'in_attesa') {
            return res.status(400).json({
                message: "Solo le iniziative in stato \"in_attesa\" possono essere modificate."
            });
        }
        if (!titolo && !descrizione && !ID_categoria) {
            return res.status(400).json({
                message: "Almeno un campo deve essere aggiornato.",
            });
        }
        
        if (titolo) {
            const esistente = await Iniziativa.findOne({ titolo: titolo });
            if (esistente) {
                return res.status(400).json({
                    message: "Titolo già esistente.",
                });
            }
            iniziativa.titolo = titolo;
        }
        if (descrizione) {
            iniziativa.descrizione = descrizione;
        }
        if (ID_categoria) {
            const categoriaEsistente = await CategoriaIniziativa.findById(ID_categoria);
            if (!categoriaEsistente) {
                return res.status(404).json({
                    message: "Categoria iniziativa non trovata."
                });
            }
            iniziativa.ID_categoria = ID_categoria;
        }
        await iniziativa.save();
        return res.status(200).json({
            message: "Iniziativa aggiornata con successo.",
            iniziativa
        });
    }
    catch(error){
        logger.error("Errore nell'aggiornamento dell'iniziativa con l'ID specificato:", error);
        return res.status(500).json({
            message: "Errore interno del server durante l'aggiornamento dell'iniziativa con l'ID specificato."
        });
    }
};

// DELETE: Elimina iniziativa
export const deleteIniziativa = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const cittadino = await Cittadino.findById(user._id);
        const iniziativa = await Iniziativa.findById(id);

        if (!cittadino) {
            return res.status(401).json({
                message: "Errore nell'autenticazione"
            });
        }
        if (!iniziativa) {
            return res.status(404).json({
                message: "Iniziativa non trovata.",
            });
        }
        if (!iniziativa.ID_cittadino.equals(cittadino._id)) {
            return res.status(403).json({
                message: "Accesso negato: non sei il creatore dell'iniziativa.",
            });
        }
        await iniziativa.deleteOne();
        return res.status(200).json({
            message: "Iniziativa eliminata con successo.",
        });
    }
    catch(error){
        return res.status(500).json({
            message: "Errore interno del server durante l'eliminazione dell'iniziativa con l'ID specificato."
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

        const { page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const { parola_chiave, filtri } = req.body;
        const categorie = filtri?.categorie_id || [];
        const ordina_per = filtri?.ordina_per;
        const ordine = filtri?.ordine || -1;

        let matchStage = req.ruolo === 'operatore' ? {} : { stato: 'approvata' };

        const categorieObjectId = categorie.map(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                logger.warn(`ID Categoria non valido: ${id}`);
                return null;
            }
            return new mongoose.Types.ObjectId(id);
        }).filter(id => id !== null);

        if (categorieObjectId.length > 0) {
            matchStage.ID_categoria = { $in: categorieObjectId };
        }
        if (parola_chiave && parola_chiave.trim() !== '') {
            matchStage.$text = { $search: parola_chiave };
        }

        let sortCriteria = {};
        if (ordina_per === 'voti') {
            sortCriteria.numero_voti = ordine;
            sortCriteria.createdAt = -1;
        } else if (ordina_per === 'data') {
            sortCriteria.createdAt = ordine;
            sortCriteria.numero_voti = -1;
        } else if (parola_chiave && parola_chiave.trim() !== '') {
            sortCriteria.score = { $meta: "textScore" };
        } else {
            sortCriteria.createdAt = -1;
            sortCriteria.numero_voti = -1;
        }

        const pipeline = [];

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

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

        if (parola_chiave && parola_chiave.trim() !== '') {
            pipeline.push({
                $project: {
                    score: { $meta: "textScore" },
                    _id: 1,
                    ID_categoria: 1,
                    titolo: 1,
                    ID_cittadino: 1,
                    numero_voti: 1,
                    createdAt: 1
                }
            });
        }

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
                    numero_voti: 1,
                    createdAt: 1
                }
            },
            { $sort: sortCriteria }
        );

        const countPipeline = Object.keys(matchStage).length > 0
            ? [{ $match: matchStage }, { $count: 'totale' }]
            : [{ $count: 'totale' }];

        const [iniziative, countResult] = await Promise.all([
            Iniziativa.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
            Iniziativa.aggregate(countPipeline)
        ]);

        const totale = countResult[0]?.totale ?? 0;

        return res.status(200).json({
            message: iniziative.length === 0
                ? "Nessuna iniziativa disponibile con i criteri specificati."
                : "Iniziative trovate:",
            iniziative,
            paginazione: {
                totale,
                pagina: pageNum,
                limite: limitNum,
                pagine: Math.ceil(totale / limitNum)
            }
        });

    } catch (error) {
        logger.error("Errore nel recupero delle iniziative:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero delle iniziative."
        });
    }
};

// PATCH: Modera iniziativa (solo operatore)
export const moderaIniziativa = async (req, res) => {
    try {
        const { id } = req.params;
        const { stato, motivazione } = req.body;

        const statiValidi = ['approvata', 'rifiutata'];
        if (!stato || !statiValidi.includes(stato)) {
            return res.status(400).json({
                message: `Stato non valido. Valori ammessi: ${statiValidi.join(', ')}.`
            });
        }

        const iniziativa = await Iniziativa.findById(id);

        if (!iniziativa) {
            return res.status(404).json({
                message: "Iniziativa non trovata."
            });
        }

        if (iniziativa.stato !== 'in_attesa') {
            return res.status(400).json({
                message: "Solo le iniziative in stato \"in_attesa\" possono essere moderate."
            });
        }

        iniziativa.stato = stato;
        if (motivazione) iniziativa.motivazione_moderazione = motivazione;
        await iniziativa.save();

        const messaggio = stato === 'approvata'
            ? `La tua iniziativa "${iniziativa.titolo}" è stata approvata e pubblicata.`
            : `La tua iniziativa "${iniziativa.titolo}" è stata rifiutata. Motivazione: ${motivazione || 'nessuna motivazione fornita'}.`;

        await Notifica.create({
            ID_destinatario: iniziativa.ID_cittadino,
            tipo: stato === 'approvata' ? 'iniziativa_approvata' : 'iniziativa_rifiutata',
            messaggio,
            ID_iniziativa: iniziativa._id,
        });

        return res.status(200).json({
            message: `Iniziativa ${stato} con successo.`,
            iniziativa
        });

    } catch (error) {
        logger.error("Errore nella moderazione dell'iniziativa:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la moderazione dell'iniziativa."
        });
    }
};