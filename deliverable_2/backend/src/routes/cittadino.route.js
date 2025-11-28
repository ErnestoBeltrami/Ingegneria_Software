import { Router } from "express";
import { loginCittadino, registerCittadino } from "../controllers/cittadino_controller";

const router = Router();

router.post('/cittadino/login',loginCittadino);
router.post('/cittadino/register',registerCittadino);

export default router;