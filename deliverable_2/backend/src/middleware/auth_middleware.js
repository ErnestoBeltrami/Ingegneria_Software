// Nel file: ./middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { Cittadino } from '../models/Cittadino.js';
import { Operatore } from '../models/Operatore.js'; // Assumi che questo sia il tuo modello Operatore
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            let UserModel;
            if (decoded.ruolo === 'operatore') {
                UserModel = Operatore;
            } else if (decoded.ruolo === 'cittadino') {
                UserModel = Cittadino;
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