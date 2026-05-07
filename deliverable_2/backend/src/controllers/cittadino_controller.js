import { Cittadino } from '../models/cittadino.js';
import { RispostaConsultazione } from '../models/risposta_consultazione.js';
import mongoose from 'mongoose';
import { VotoIniziativa } from '../models/voto_iniziativa.js';
import { Iniziativa } from '../models/iniziativa.js';
import { Consultazione } from '../models/consultazione.js';

export const logout = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        await Cittadino.findByIdAndUpdate(userFromMiddleware._id, { loggedIn: false });

        return res.status(200).json({
            message: 'Logout effettuato con successo.'
        });
    } catch (error) {
        console.error('Errore durante il logout:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il logout.',
            error: error.message
        });
    }
};

export const getCittadinoData = async (req, res) => {
    try {
        const userFromMiddleware = req.user; 
        
        if (!userFromMiddleware) {
            return res.status(404).json({
                message: "Utente non identificato dal sistema (Internal Error)"
            });
        } 
        const cittadino = await Cittadino.findById(userFromMiddleware._id).select('-password');
        if (cittadino) {
            
            const datiPubblici = {
                id: cittadino._id,
                ruolo: "cittadino",
                nome: cittadino.nome,
                cognome: cittadino.cognome,
                email: cittadino.email,
                dataNascita: cittadino.dataNascita,
                comuneResidenza: cittadino.comuneResidenza,
                circoscrizione: cittadino.circoscrizione,
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

export const updateCittadinoData = async (req, res) => {
    try {
        const { nome, cognome } = req.body;
        if (!nome?.trim() || !cognome?.trim()) {
            return res.status(400).json({ message: 'Nome e cognome sono obbligatori.' });
        }
        const cittadino = await Cittadino.findByIdAndUpdate(
            req.user._id,
            { $set: { nome: nome.trim(), cognome: cognome.trim() } },
            { new: true, runValidators: false }
        );
        if (!cittadino) {
            return res.status(404).json({ message: 'Cittadino non trovato.' });
        }
        return res.status(200).json({
            message: 'Profilo aggiornato con successo.',
            data: { nome: cittadino.nome, cognome: cittadino.cognome },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Errore interno del server.', error: error.message });
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

        const duplicato = await RispostaConsultazione.findOne({
            ID_cittadino: userFromMiddleware._id,
            ID_consultazione: votazione,
            tipo_consultazione: 'votazione'
        });

        if(duplicato){
            return res.status(403).json({
                message : "L'utente ha gia votato questa Votazione."
            });
        }

        await RispostaConsultazione.create({
            tipo_consultazione: 'votazione',
            ID_consultazione: votazione,
            ID_cittadino: userFromMiddleware._id,
            ID_opzione: opzione_scelta
        });

        return res.status(201).json({
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

export const answerSondaggio = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        if (!userFromMiddleware) {
            return res.status(401).json({
                message: "Cittadino non identificato o non autenticato."
            });
        }

        const sondaggioId = req.body.sondaggioId;
        const dettagliRisposte = req.body.dettagliRisposte;

        if (!dettagliRisposte || !Array.isArray(dettagliRisposte) || dettagliRisposte.length === 0) {
            return res.status(400).json({
                message: "Dati di risposta mancanti o non validi."
            });
        }

        const duplicato = await RispostaConsultazione.findOne({
            ID_cittadino: userFromMiddleware._id,
            ID_consultazione: sondaggioId,
            tipo_consultazione: 'sondaggio'
        });

        if (duplicato) {
            return res.status(403).json({
                message: "L'utente ha già votato questo sondaggio."
            });
        }

        const sondaggio = await Consultazione.findById(sondaggioId).populate('ID_domande');

        if (!sondaggio || sondaggio.tipo !== 'sondaggio' || sondaggio.stato !== 'attivo') {
            return res.status(403).json({
                message: "Il sondaggio selezionato non è valido o non è attivo."
            });
        }

        const domandeDelSondaggio = sondaggio.ID_domande;

        if (dettagliRisposte.length !== domandeDelSondaggio.length) {
             return res.status(400).json({
                message: "Il numero di risposte fornite non corrisponde al numero di domande nel sondaggio."
            });
        }

        for (const rispostaUtente of dettagliRisposte) {
            const domandaAssociata = domandeDelSondaggio.find(d => d._id.equals(rispostaUtente.ID_domanda));

            if (!domandaAssociata) {
                return res.status(400).json({
                    message: `Domanda con ID ${rispostaUtente.ID_domanda} non presente nel sondaggio.`
                });
            }

            const opzioniUtente = rispostaUtente.opzioniScelte;

            if (domandaAssociata.tipo === 'risposta_singola' && opzioniUtente.length !== 1) {
                return res.status(400).json({
                    message: `La domanda ${domandaAssociata._id} richiede esattamente una risposta.`
                });
            }

            const opzioniValide = domandaAssociata.opzioni.map(o => o._id.toString());
            const risposteNonValide = opzioniUtente.filter(opId => !opzioniValide.includes(opId.toString()));

            if (risposteNonValide.length > 0) {
                return res.status(400).json({
                    message: `Le risposte per la domanda ${domandaAssociata._id} contengono opzioni non valide: ${risposteNonValide.join(', ')}`
                });
            }
        }

        await RispostaConsultazione.create({
            tipo_consultazione: 'sondaggio',
            ID_consultazione: sondaggioId,
            ID_cittadino: userFromMiddleware._id,
            dettagliRisposte: dettagliRisposte.map(d => ({
                ID_domanda: d.ID_domanda,
                opzioniScelte: d.opzioniScelte
            }))
        });

        return res.status(201).json({
            message: "Risposta sondaggio avvenuta con successo"
        });

    } catch (error) {
        console.error('Errore nella votazione:', error);
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

export const rimuoviVotoIniziativa = async (req, res) => {
    try {
        const user = req.user;
        const { iniziativaId } = req.params;

        const voto = await VotoIniziativa.findOneAndDelete({
            ID_iniziativa: iniziativaId,
            ID_cittadino: user._id
        });

        if (!voto) {
            return res.status(404).json({
                message: "Voto non trovato: non hai votato per questa iniziativa."
            });
        }

        return res.status(200).json({
            message: "Voto rimosso con successo."
        });

    } catch (error) {
        console.error('Errore nella rimozione del voto:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante la rimozione del voto.',
            error: error.message
        });
    }
};