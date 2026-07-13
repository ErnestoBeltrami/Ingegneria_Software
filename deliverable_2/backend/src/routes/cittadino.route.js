import { Router } from "express";
import { answerSondaggio, answerVote, getCittadinoData, votaIniziativa, logout, rimuoviVotoIniziativa, updateCittadinoData } from "../controllers/cittadino_controller.js";
import { protect, restrictTo, validateObjectId,requireProfiloCompleto } from "../middleware/auth_middleware.js";

const router = Router();

router.get('/profile', protect, getCittadinoData);
router.patch('/me', protect, restrictTo(['cittadino']), updateCittadinoData);
router.post('/logout', protect, restrictTo(['cittadino']), logout);

router.post('/vote/votazione',protect,restrictTo(['cittadino']),requireProfiloCompleto,answerVote);

router.post('/vote/iniziativa', protect, restrictTo(['cittadino']),requireProfiloCompleto ,votaIniziativa);
router.delete('/vote/iniziativa/:id', protect, restrictTo(['cittadino']), requireProfiloCompleto,validateObjectId, rimuoviVotoIniziativa);

router.post('/vote/sondaggio',protect,restrictTo(['cittadino']),requireProfiloCompleto,answerSondaggio);

export default router;