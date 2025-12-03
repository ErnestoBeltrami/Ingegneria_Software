import { Router } from "express";
import { createVotazione } from "../controllers/votazione.controller.js";
import { protect } from "../middleware/auth_middleware.js";

const router = Router();

// POST /votazioni - Creazione di una nuova votazione (solo operatore autenticato)
router.post("/", protect, createVotazione);

export default router;


