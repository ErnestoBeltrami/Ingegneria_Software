import { CategoriaIniziativa } from '../models/categoria_iniziativa.js';
import { Iniziativa } from '../models/iniziativa.js';
import mongoose from 'mongoose';

// POST: Creazione categoria
export const createCategoria = async (req, res) => {
    try {
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({ message: "Nome categoria obbligatorio" });
        } else {
            const esistente = await CategoriaIniziativa.findOne({ nome });
            if (esistente) {
                return res.status(409).json({ message: "Categoria già esistente" });
            }
        }

        const nuovaCategoria = await CategoriaIniziativa.create({ nome });

        return res.status(201).json({
            message: "Categoria creata con successo",
            categoria: nuovaCategoria
        });
    } catch (error) {
        console.error("Errore creazione categoria:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la creazione della categoria",
            error: error.message
        });
    }
};

// GET: Ritorna lista di tutte le categorie
export const getCategorie = async (req, res) => {
    try {
        const categorie = await CategoriaIniziativa.find();
        if (!categorie || categorie.length === 0) {
            return res.status(200).json({
                message: "Nessuna categoria trovata.",
                categorie: []
            });
        }
        else{
        return res.status(200).json({
            message: "Categorie recuperate con successo.",
            categorie: categorie.sort((a, b) => a.nome.localeCompare(b.nome))
        });
        }
    } catch (error) {
        console.error("Errore nella ricerca delle categorie:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la ricerca delle categorie.",
            error: error.message
        });
    }
};

// GET: Ritorna dettagli categoria
export const getCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await CategoriaIniziativa.findById(id);
        if (!categoria) {
            return res.status(404).json({
                message: "Categoria non trovata con l'ID specificato.",
                categoria: null
            });
        }
        else{
        return res.status(200).json({
            message: "Categoria recuperata con successo.",
            categoria: categoria
        });
        }
    } catch (error) {
        console.error("Errore nella ricerca della categoria:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la ricerca della categoria.",
            error: error.message
        });
    }
};

// PATCH: Aggiorna categoria
export const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { newNome } = req.body;
        
        if (!id || !newNome) {
            return res.status(400).json({
                message: "ID e nuovo nome categoria obbligatori.",
                categoria: null
            });
        }

        const categoria = await CategoriaIniziativa.findById(id);
        if (!categoria) {
            return res.status(404).json({
                message: "Categoria non trovata con l'ID specificato.",
                categoria: null
            });
        }

        const esistente = await CategoriaIniziativa.findOne({ nome: newNome });
        if (esistente) {
            return res.status(409).json({
                message: "Impossibile aggiornare la categoria: nome già esistente.",
                categoria: null
            });
        }
        
        categoria.nome = newNome;
        await categoria.save();
    
        return res.status(200).json({
            message: "Categoria aggiornata con successo.",
            categoria: categoria
        });
    } 
    catch (error) {
        console.error("Errore nell'aggiornamento della categoria:", error);
        return res.status(500).json({
            message: "Errore interno del server durante l'aggiornamento della categoria con l'ID specificato.",
            error: error.message
        });
    }
};  

// DELETE: Elimina categoria
export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
     
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID categoria non valido.",
                categoria: null
            });
        }

        const categoria = await CategoriaIniziativa.findById(id);
        if (!categoria) {
            return res.status(404).json({
                message: "Categoria non trovata con l'ID specificato.",
                categoria: null
            });
        }

        const iniziative = await Iniziativa.find({ ID_categoria: id });
        if (iniziative.length > 0) {
            return res.status(400).json({
                message: "Impossibile eliminare la categoria: categoria in uso.",
                categoria: null
            });
        }

        await categoria.deleteOne();
        
        return res.status(200).json({ 
            message: "Categoria eliminata con successo."
        });
    } 
    catch (error) {
        console.error("Errore nell'eliminazione della categoria:", error);
        return res.status(500).json({
            message: "Errore interno del server durante l'eliminazione della categoria con l'ID specificato.",
            error: error.message
        });
    }
};