import { Router } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { Cittadino } from "../models/cittadino.js";

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
      const params = new URLSearchParams({
        cittadinoId: cittadino._id.toString(),
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

router.post('/complete-profile', async (req, res) => {
  const { dataNascita, comuneResidenza, circoscrizione } = req.body;
  const cittadinoId = req.body.cittadinoId?.trim();

  if (!dataNascita || !comuneResidenza) {
    return res.status(400).json({ message: 'Tutti i campi del profilo sono obbligatori.' });
  }

  const nascita = new Date(dataNascita);
  const oggi = new Date();
  const eta =
    oggi.getFullYear() -
    nascita.getFullYear() -
    (oggi < new Date(oggi.getFullYear(), nascita.getMonth(), nascita.getDate()) ? 1 : 0);

  if (isNaN(nascita.getTime()) || eta < 16 || eta > 120) {
    return res.status(400).json({ message: 'Data di nascita non valida.' });
  }

  if (comuneResidenza === 'Trento' && !circoscrizione) {
    return res.status(400).json({ message: 'Seleziona la tua circoscrizione.' });
  }

  try {
    const cittadino = await Cittadino.findByIdAndUpdate(
      cittadinoId,
      { $set: { dataNascita: nascita, comuneResidenza, circoscrizione: circoscrizione || null, profiloCompleto: true } },
      { new: true, runValidators: false }
    );

    if (!cittadino) {
      return res.status(404).json({ message: 'Cittadino non trovato.' });
    }

    const payload = { id: cittadino._id, ruolo: 'cittadino' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Profilo completato!', token });
  } catch (error) {
    res.status(400).json({ message: 'Errore di validazione o server.', details: error.message });
  }
});

export default router;
