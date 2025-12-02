// Nel file: ./controllers/cittadinoController.js (Esempio)
import { Cittadino } from '../models/cittadino';

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