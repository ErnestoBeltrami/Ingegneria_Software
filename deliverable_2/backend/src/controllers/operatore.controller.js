import logger from '../config/logger.js';
import {Operatore} from '../models/operatore.js';
import jwt from 'jsonwebtoken';
import '../config/env.js';

const generateToken = (id) => {
    return jwt.sign({ id, ruolo: 'operatore' }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const getByCredentials = async  (req,res) => {
    try{
        const {username, password_inserita} = req.body;
        const operatore = await Operatore.findOne({username}).select('+password');
        
        if(operatore && (await operatore.matchPassword(password_inserita))){
            
            const token = generateToken(operatore._id);
            
            const datiPubblici = operatore.toObject(); 
            delete datiPubblici.password;

            return res.status(200).json({
                message: "Login operatore riuscito",
                token: token,
                operatore: datiPubblici
            });
        }
        else{
            return res.status(401).json({
                message: "Credenziali non valide",
            });
        }
    }
    catch(error){
        return res.status(500).json({
            message: "Errore interno del server durante il login."
        });
    }
}

export const getOperatoreData = async (req,res) => {
    const userFromMiddleware = req.user;
    if(!userFromMiddleware){
        return res.status(404).json({
            message : "Utente non identificato nel sistema."
        });
    }

    try
    {
        const operatore = await Operatore.findById(userFromMiddleware._id);
        if(operatore){
            const datiPubblici = {
                id : operatore._id,
                username : operatore.username,
                nome : operatore.nome,
                cognome : operatore.cognome
            };
            return res.status(200).json({
                message : "Operatore trovato con successo",
                data : datiPubblici
            });
        } else {
            return res.status(404).json({
                message: "Operatore non trovato nel database"
            });
        }
    }
    catch(error)
    {
        logger.error("Errore nel recupero dati operatore:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero dei dati."
        });
    }
} 

// Registrazione / creazione di un nuovo operatore
export const createOperatore = async (req, res) => {
    try {
        const userFromMiddleware = req.user;

        // Controllo: solo root può creare nuovi operatori
        if (!userFromMiddleware || !userFromMiddleware.isRoot) {
            return res.status(403).json({
                message: "Solo l'utente root può creare nuovi operatori."
            });
        }

        const { username, password, nome, cognome } = req.body;

        if (!username || !password || !nome || !cognome) {
            return res.status(400).json({
                message: "username, password, nome e cognome sono obbligatori."
            });
        }

        const esistente = await Operatore.findOne({ username });
        if (esistente) {
            return res.status(409).json({
                message: "Username già in uso."
            });
        }

        const nuovoOperatore = await Operatore.create({
            username,
            password,
            nome,
            cognome,
            isRoot: false // nessuno può creare un altro root
        });

        const datiPubblici = {
            id: nuovoOperatore._id,
            username: nuovoOperatore.username,
            nome: nuovoOperatore.nome,
            cognome: nuovoOperatore.cognome
        };

        return res.status(201).json({
            message: "Operatore creato con successo.",
            operatore: datiPubblici
        });
    } catch (error) {
        logger.error("Errore nella creazione operatore:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la creazione dell'operatore."
        });
    }
}

export const changePassword = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { vecchia_password, nuova_password } = req.body;

        if (!vecchia_password || !nuova_password) {
            return res.status(400).json({
                message: 'Vecchia password e nuova password sono obbligatorie.'
            });
        }

        if (nuova_password.length < 8) {
            return res.status(400).json({
                message: 'La nuova password deve essere di almeno 8 caratteri.'
            });
        }
        if (!/[A-Z]/.test(nuova_password)) {
            return res.status(400).json({
                message: 'La nuova password deve contenere almeno una lettera maiuscola.'
            });
        }
        if (!/[a-z]/.test(nuova_password)) {
            return res.status(400).json({
                message: 'La nuova password deve contenere almeno una lettera minuscola.'
            });
        }
        if (!/[0-9]/.test(nuova_password)) {
            return res.status(400).json({
                message: 'La nuova password deve contenere almeno un numero.'
            });
        }
        if (!/[^A-Za-z0-9]/.test(nuova_password)) {
            return res.status(400).json({
                message: 'La nuova password deve contenere almeno un carattere speciale.'
            });
        }

        const operatore = await Operatore.findById(userFromMiddleware._id).select('+password');

        if (!operatore) {
            return res.status(404).json({ message: 'Operatore non trovato.' });
        }

        const passwordCorretta = await operatore.matchPassword(vecchia_password);
        if (!passwordCorretta) {
            return res.status(401).json({ message: 'Vecchia password non corretta.' });
        }

        operatore.password = nuova_password;
        await operatore.save();

        return res.status(200).json({ message: 'Password aggiornata con successo.' });

    } catch (error) {
        logger.error('Errore nel cambio password:', error);
        return res.status(500).json({
            message: 'Errore interno del server durante il cambio password.'
        });
    }
};

export const promoteOperatoreToRoot = async (req, res) => {
    try {
        const userFromMiddleware = req.user;
        const { operatoreId } = req.params;

        // Solo root può promuovere
        if (!userFromMiddleware?.isRoot) {
            return res.status(403).json({ message: "Solo l'utente root può promuovere operatori." });
        }

        const operatore = await Operatore.findById(operatoreId);

        if (!operatore) {
            return res.status(404).json({ message: "Operatore non trovato." });
        }

        if (operatore.isRoot) {
            return res.status(400).json({ message: "Questo operatore è già root." });
        }

        operatore.isRoot = true;
        await operatore.save();

        return res.status(200).json({
            message: "Operatore promosso a root con successo.",
            operatore: {
                id: operatore._id,
                username: operatore.username,
                isRoot: operatore.isRoot
            }
        });

    } catch (error) {
        logger.error("Errore nella promozione dell'operatore:", error);
        return res.status(500).json({
            message: "Errore interno del server."
        });
    }
};
