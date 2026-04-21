import { Router } from "express";
import { answerSondaggio, answerVote, getCittadinoData, votaIniziativa, logout, rimuoviVotoIniziativa } from "../controllers/cittadino_controller.js";
import { protect, restrictTo } from "../middleware/auth_middleware.js";

const router = Router();

router.get('/profile', protect, getCittadinoData);
router.post('/logout', protect, restrictTo(['cittadino']), logout);

router.post('/vote/votazione',protect,restrictTo(['cittadino']),answerVote);

router.post('/vote/iniziativa', protect, restrictTo(['cittadino']), votaIniziativa);
router.delete('/vote/iniziativa/:iniziativaId', protect, restrictTo(['cittadino']), rimuoviVotoIniziativa);

router.post('/vote/sondaggio',protect,restrictTo(['cittadino']),answerSondaggio);

export default router;