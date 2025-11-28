// Nel file: ./routes/authRoutes.js

import { Router } from "express";
import passport from "../config/passport.js";
import jwt from 'jsonwebtoken'; // ⚠️ NECESSARIO per firmare il JWT
import { Cittadino } from '../models/Cittadino.js'; // ⚠️ NECESSARIO per interagire con il DB

const router = Router();

// ===========================================
// 1. INIZIAZIONE LOGIN GOOGLE
// GET /auth/google
// ===========================================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


// ===========================================
// 2. CALLBACK DI GOOGLE (Controllo Profilo)
// GET /auth/google/callback
// ===========================================
router.get(
    '/google/callback',
    // Passport esegue l'autenticazione e la logica 'Upsert'
    passport.authenticate('google', { failureRedirect: '/login-error', session: false }),
    (req, res) => {
        const cittadino = req.user;
        
        // Controllo se i dati del profilo obbligatori sono stati inseriti
        if (!cittadino.profiloCompleto) { // Basta controllare il flag di stato
            
            return res.status(202).json({ 
                message: 'Profilo incompleto. Completamento necessario.',
                status: 'INCOMPLETE_PROFILE', 
                cittadinoId: cittadino._id, 
                email: cittadino.email
            });
        }

        // Se il profilo è COMPLETO: Genera e invia il Token JWT
        const payload = { id: cittadino.id, ruolo: 'cittadino' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login riuscito!',
            token: token,
            status: 'COMPLETE'
        });
    }
);

// ===========================================
// 3. API COMPLETAMENTO PROFILO (Successivo al primo login)
// POST /auth/complete-profile
// ===========================================
router.post('/complete-profile', async (req, res) => {
    // Riceviamo i dati e l'ID del cittadino che deve completare il profilo
    const { cittadinoId, nome, cognome, eta, genere, categoria } = req.body;

    // Assumiamo che qui sia necessario controllare che tutti i campi siano presenti
    if (!nome || !cognome || !eta || !genere || !categoria) {
         return res.status(400).json({ error: 'Tutti i campi del profilo sono obbligatori.' });
    }

    try {
        // Cerca il cittadino nel DB
        const cittadino = await Cittadino.findById(cittadinoId);

        if (!cittadino) {
            return res.status(404).json({ error: 'Cittadino non trovato.' });
        }
        
        // Aggiorna i campi e imposta il flag a true
        cittadino.nome = nome;
        cittadino.cognome = cognome;
        cittadino.eta = eta;
        cittadino.genere = genere;
        cittadino.categoria = categoria;
        cittadino.profiloCompleto = true; 
        
        await cittadino.save(); // Salva e Mongoose valida (es. età >= 18)

        // Genera il Token JWT (l'utente ora ha completato la registrazione)
        const payload = { id: cittadino.id, ruolo: 'cittadino' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Profilo completato, accesso eseguito!',
            token: token
        });

    } catch (error) {
        // Gestisce errori di validazione Mongoose
        res.status(400).json({ error: 'Errore di validazione o server.', details: error.message });
    }
});


export default router;