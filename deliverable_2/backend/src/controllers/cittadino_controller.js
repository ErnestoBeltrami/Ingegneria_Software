// Nel file: ./controllers/cittadinoController.js
import { Cittadino } from '../models/cittadino.js';

export const loginCittadino = async (req,res) => {
    try{    const {email,password} = req.body;

        const cittadino = await Cittadino.findOne({email}).select('+password');

        if(cittadino && (await cittadino.matchPassword(password))){
            res.json({
                _id : cittadino._id,
                email : cittadino.email,
                token : generateToken(cittadino._id)
            });
        
        }
        else{
            res.status(401).json({message : 'Email o password non validi'});
        }
    }
    catch(error){
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }

};

export const registerCittadino = async (req,res) => {
    try
    {    const {nome,cognome,age,genere,categoria,email,password} = req.body;

        if (!nome || !cognome || !email || !password || !age || !genere || !categoria ){
                return res.status(400).json({
                    message: "Inserire tutti i campi"
                });
            }

        const already_existing = await Cittadino.findOne(email);
        if(already_existing){
            return res.status(400).json({
                message : 'Utente già creato'
            })
        }

        const cittadino = Cittadino.create({
            nome,
            cognome, 
            age, 
            genere, 
            categoria,
            email : email.toLowerCase(), 
            password
        });

        res.status(201).json({
            message : 'Utente registrato!',
            user : {
                id : cittadino._id,
                email : cittadino.email,
                nome : cittadino.nome,
                cognome : cittadino.cognome
            }
        });
    }
    catch(error){
        res.status(500).json({ 
            message: "Internal server error",
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