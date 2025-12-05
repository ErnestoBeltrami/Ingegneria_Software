import { CategoriaIniziativa } from '../models/categoria_iniziativa.js'; // o il file corretto

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
