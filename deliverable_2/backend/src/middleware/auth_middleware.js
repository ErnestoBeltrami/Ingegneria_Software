// Nel file: ./middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { Cittadino } from '../models/cittadino.js';
import { Operatore } from '../models/operatore.js'; // Assumi che questo sia il tuo modello Operatore

export const restrictTo = (allowed_roles) => { //Controlla se l'utente è effettivamente un operatore.
    return(req,res,next) => {
        const ruolo = req.ruolo;
        if(!req.user || !allowed_roles.includes(ruolo)){
            return res.status(403).json({
                message : 'Accesso negato. Ruolo non sufficiente'
            });
        }
        next();
    };
}

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            let UserModel;
            if (decoded.ruolo === 'operatore') {
                UserModel = Operatore;
                req.ruolo = 'operatore';
            } else if (decoded.ruolo === 'cittadino') {
                UserModel = Cittadino;
                req.ruolo = 'cittadino';
            } else {
                return res.status(401).json({ message: 'Token non valido, ruolo sconosciuto' });
            }
            
            req.user = await UserModel.findById(decoded.id).select('-password'); 

            if (!req.user) {
                return res.status(401).json({ message: 'Utente non trovato, autorizzazione fallita' });
            }

            next(); 

        } catch (error) {
            console.error("Errore di verifica JWT:", error);
            return res.status(401).json({ message: 'Non autorizzato, token fallito o scaduto' }); 
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Non autorizzato, nessun token' });
    }
};

export default protect;