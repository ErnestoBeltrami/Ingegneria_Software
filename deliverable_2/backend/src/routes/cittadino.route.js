import { Router } from "express";
import { answerSondaggio, answerVote, getCittadinoData, votaIniziativa } from "../controllers/cittadino_controller.js";
import { protect, restrictTo } from "../middleware/auth_middleware.js";

const router = Router();

router.get('/profile',protect,getCittadinoData);

router.post('/vote/votazione',protect,restrictTo(['cittadino']),answerVote);

router.post('/vote/iniziativa',protect, restrictTo(['cittadino']), votaIniziativa);

router.post('/vote/sondaggio',protect,restrictTo(['cittadino']),answerSondaggio);

export default router;