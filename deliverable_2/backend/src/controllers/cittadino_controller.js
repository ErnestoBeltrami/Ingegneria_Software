// Nel file: ./controllers/cittadinoController.js (Esempio)
import { Cittadino } from '../models/cittadino';

export const getCittadinoData = async (req, res) => {
    try {
        const userFromMiddleware = req.user; 
        
        if (!userFromMiddleware) {
            return res.status(404).json({
                message: "Utente non identificato dal sistema (Internal Error)"
            });
        } 
        const cittadino = await Cittadino.findById(userFromMiddleware.id).select('-password'); 

        if (cittadino) {
            
            const datiPubblici = {
                id: cittadino._id,
                ruolo: "cittadino",
                nome: cittadino.nome,
                cognome: cittadino.cognome,
                email: cittadino.email,
                eta: cittadino.eta,
                genere: cittadino.genere,
                categoria: cittadino.categoria,
                profiloCompleto: cittadino.profiloCompleto
            };

            return res.status(200).json({
                message: "Dati cittadino recuperati con successo",
                data: datiPubblici
            });
        }
        else {
            return res.status(404).json({
                message: "Risorsa utente non trovata nel database"
            });
        }

    }
    catch (error) {
        console.error("Errore nel recupero dati cittadino:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero dei dati.",
            error: error.message
        });
    }
};