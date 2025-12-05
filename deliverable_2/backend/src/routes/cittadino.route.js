// Nel file: ./routes/authRoutes.js
import { Router } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { Cittadino } from "../models/cittadino.js";
import { answerVote, getCittadinoData, votaIniziativa } from "../controllers/cittadino_controller.js";
import { protect, restrictTo } from "../middleware/auth_middleware.js";

const router = Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-error', session: false }),
    (req, res) => {
        const cittadino = req.user;
        
        if (!cittadino.profiloCompleto) { // Basta controllare il flag di stato
            
            return res.status(202).json({ 
                message: 'Profilo incompleto. Completamento necessario.',
                status: 'INCOMPLETE_PROFILE', 
                cittadinoId: cittadino._id, 
                email: cittadino.email
            });
        }

        const payload = { id: cittadino.id, ruolo: 'cittadino' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login riuscito!',
            token: token,
            status: 'COMPLETE'
        });
    }
);

router.post('/complete-profile', async (req, res) => {
    const { cittadinoId, nome, cognome, eta, genere, categoria } = req.body;

    if (!nome || !cognome || !eta || !genere || !categoria) {
         return res.status(400).json({ error: 'Tutti i campi del profilo sono obbligatori.' });
    }

    try {
        const cittadino = await Cittadino.findById(cittadinoId);

        if (!cittadino) {
            return res.status(404).json({ error: 'Cittadino non trovato.' });
        }
        
        cittadino.nome = nome;
        cittadino.cognome = cognome;
        cittadino.eta = eta;
        cittadino.genere = genere;
        cittadino.categoria = categoria;
        cittadino.profiloCompleto = true; 
        
        await cittadino.save(); 

        const payload = { id: cittadino._id, ruolo: 'cittadino' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Profilo completato, accesso eseguito!',
            token: token
        });

    } catch (error) {
        res.status(400).json({ error: 'Errore di validazione o server.', details: error.message });
    }
});


router.get('/cittadino/profile',protect,getCittadinoData);

router.post('/cittadino/vote/votazione',protect,restrictTo(['cittadino']),answerVote);

router.post('/cittadino/vote/iniziativa',protect, restrictTo(['cittadino']), votaIniziativa);

export default router;