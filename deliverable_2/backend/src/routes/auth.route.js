import { Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { Cittadino } from "../models/cittadino.js";
import { protect, restrictTo } from "../middleware/auth_middleware.js";

const completeProfileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Troppi tentativi. Riprova tra 15 minuti.' },
});

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
    session: false,
  }),
  (req, res) => {
    const cittadino = req.user;
    const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!cittadino.profiloCompleto) {
      const onboardingToken = jwt.sign(
        { id: cittadino._id, ruolo: 'cittadino' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
      const params = new URLSearchParams({
        onboardingToken,
        nome: cittadino.nome || '',
        email: cittadino.email || '',
        picture: cittadino._googlePicture || '',
      });
      return res.redirect(`${FRONTEND}/completa-profilo?${params}`);
    }

    const payload = { id: cittadino._id, ruolo: 'cittadino' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND}/auth/callback?token=${encodeURIComponent(token)}`);
  }
);

router.post('/complete-profile', completeProfileLimiter, protect, restrictTo(['cittadino']), async (req, res) => {
  const { dataNascita, circoscrizione, genere, categoria } = req.body;
  const cittadinoId = req.user._id;

  // Validazione campi obbligatori
  if (!dataNascita || !circoscrizione || !genere || !categoria) {
    return res.status(400).json({ message: 'Tutti i campi del profilo sono obbligatori.' });
  }

  // Validazione dataNascita
  const nascita = new Date(dataNascita);
  const oggi = new Date();
  const eta =
    oggi.getFullYear() -
    nascita.getFullYear() -
    (oggi < new Date(oggi.getFullYear(), nascita.getMonth(), nascita.getDate()) ? 1 : 0);

  if (isNaN(nascita.getTime()) || eta < 16 || eta > 120) {
    return res.status(400).json({ message: 'Data di nascita non valida.' });
  }

  // Validazione genere
  const generiValidi = ['Uomo','Donna'];
  if (!generiValidi.includes(genere)) {
    return res.status(400).json({ message: `Genere non valido. Valori ammessi: ${generiValidi.join(', ')}.` });
  }

  // Validazione categoria
  const categorieValide = ['Lavoratore', 'Disoccupato', 'Pensionato', 'Studente', 'Altro'];
  if (!categorieValide.includes(categoria)) {
    return res.status(400).json({ message: `Categoria non valida. Valori ammessi: ${categorieValide.join(', ')}.` });
  }

  try {
    const cittadino = await Cittadino.findByIdAndUpdate(
      cittadinoId,
      {
        $set: {
          dataNascita: nascita,
          circoscrizione,
          genere,
          categoria,
          profiloCompleto: true
        }
      },
      { new: true, runValidators: false }
    );

    if (!cittadino) {
      return res.status(404).json({ message: 'Cittadino non trovato.' });
    }

    const payload = { id: cittadino._id, ruolo: 'cittadino' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Profilo completato!', token });
  } catch (error) {
    res.status(500).json({ message: 'Errore interno del server.' });
  }
});
export default router;
