// Nel file: ./controllers/cittadinoController.js
import { Cittadino } from '../models/cittadino.js';
import {RispostaVotazione} from '../models/risposta_votazione.js';
import mongoose from 'mongoose';
import { VotoIniziativa } from '../models/voto_iniziativa.js';
import { Iniziativa } from '../models/iniziativa.js';

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

export const answerVote = async (req,res) => {
    try
    {
        const userFromMiddleware = req.user; 
        
        if (!userFromMiddleware) {
            return res.status(404).json({
                message: "Cittadino non identificato dal sistema (Internal Error)"
            });
        } 

        const opzione_scelta = req.body.opzioneId;
        const votazione = req.body.votazioneId;

        if(!opzione_scelta){
            return res.status(400).json({
                message: "Scegliere almeno un opzione."
            });
        }

        const duplicato = await RispostaVotazione.findOne({
            ID_cittadino : userFromMiddleware._id,
            ID_votazione : votazione
        });

        if(duplicato){
            return res.status(403).json({
                message : "L'utente ha gia votato questa Votazione."
            });
        }

        await RispostaVotazione.create({
            ID_opzione : opzione_scelta,
            ID_cittadino : userFromMiddleware._id,
            ID_votazione : votazione
        });

        return res.status(200).json({
            message : "Votazione avvenuta con successo."
        });

    }
    catch(error)
    {
        console.error('Errore nella votazione', error);
        return res.status(500).json({
            message: 'Errore interno del server durante la votazione.',
            error: error.message
        });
    }
};

export const votaIniziativa = async (req,res) => {
   
   try{    
        const user = req.user;
        const iniziativa = req.body.iniziativaID;

        if(!iniziativa || !(await Iniziativa.findById(iniziativa))){
            return res.status(404).json({
                    message: "Iniziativa non trovata"
            });
        }
        

        if (!user) {
                return res.status(404).json({
                    message: "Cittadino non identificato dal sistema (Internal Error)"
                });
        }

        const duplicato_check = await VotoIniziativa.findOne({
            ID_iniziativa : iniziativa,
            ID_cittadino : user._id
        });

        if(duplicato_check){    
            return res.status(403).json({
                message : "Hai gia votato per questa iniziativa"
            });
        }

        await VotoIniziativa.create({
            ID_iniziativa: iniziativa,
            ID_cittadino : user._id,
        });

        return res.status(200).json({
            message : "Votazione avvenuta con successo."
        });

    }
    catch(error){
        console.error('Errore nella votazione', error);
        return res.status(500).json({
            message: 'Errore interno del server durante la votazione.',
            error: error.message
        });
    }
};