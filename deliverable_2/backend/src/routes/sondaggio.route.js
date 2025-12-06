import { Router } from "express";
import {createSondaggio, getSondaggi} from "../controllers/sondaggio.controller.js";
import {
    protect,
    restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea nuovo sondaggio
router.post("/",protect,restrictTo(['operatore']),createSondaggio); 

// GET: Ricerca sondaggi (per ora tutti, filtrabili per operatore)
router.get("/",protect,restrictTo(['operatore']),getSondaggi);

export default router;