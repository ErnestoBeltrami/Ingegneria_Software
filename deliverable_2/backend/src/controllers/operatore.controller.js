import {Operatore} from '../models/operatore.js';
import jwt from 'jsonwebtoken';
import '../config/env.js';

const generateToken = (id) => {
    console.log('JWT_SECRET in generateToken:', process.env.JWT_SECRET);
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
        res.status(500).json({
            message: "Internal server error",
            error: error.message
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
        console.error("Errore nel recupero dati operatore:", error);
        return res.status(500).json({
            message: "Errore interno del server durante il recupero dei dati.",
            error: error.message
        });
    }
} 

// Registrazione / creazione di un nuovo operatore
export const createOperatore = async (req, res) => {
    try {
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
            cognome
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
        console.error("Errore nella creazione operatore:", error);
        return res.status(500).json({
            message: "Errore interno del server durante la creazione dell'operatore.",
            error: error.message
        });
    }
}