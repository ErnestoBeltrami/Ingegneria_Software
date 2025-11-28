import {OperatoreComune} from '../models/operatore';

const generateToken = (id) => {
    // Usa il tuo JWT_SECRET definito in .env
    return jwt.sign({ id, ruolo: 'operatore' }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const getByCredentials = async  (req,res) => {
    try{
        const {username, password_inserita} = req.body;
        const operatore = await OperatoreComune.findOne({username}).select('+password');
        
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
            return res.status(404).json({
                message: "Credenziali non valide",
            });
        }
    }
    catch(errore){
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
} 