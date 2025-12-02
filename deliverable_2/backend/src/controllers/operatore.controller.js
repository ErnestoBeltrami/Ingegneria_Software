import jwt from 'jsonwebtoken';
import { Operatore } from '../models/operatore.js';

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