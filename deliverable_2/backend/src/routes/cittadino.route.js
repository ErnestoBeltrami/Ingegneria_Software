import { Router } from "express";
import { answerSondaggio, answerVote, getCittadinoData, votaIniziativa, logout, rimuoviVotoIniziativa, updateCittadinoData } from "../controllers/cittadino_controller.js";
import { protect, restrictTo, validateObjectId } from "../middleware/auth_middleware.js";

const router = Router();

router.get('/profile', protect, getCittadinoData);
router.patch('/me', protect, restrictTo(['cittadino']), updateCittadinoData);
router.post('/logout', protect, restrictTo(['cittadino']), logout);

router.post('/vote/votazione',protect,restrictTo(['cittadino']),answerVote);

router.post('/vote/iniziativa', protect, restrictTo(['cittadino']), votaIniziativa);
router.delete('/vote/iniziativa/:id', protect, restrictTo(['cittadino']), validateObjectId, rimuoviVotoIniziativa);

router.post('/vote/sondaggio',protect,restrictTo(['cittadino']),answerSondaggio);

export default router;