import { Router } from "express";
import {creaSondaggio} from "../controllers/sondaggio.controller.js";
import {
    protect,
    restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea nuova categoria per iniziativa
router.post("/",protect,restrictTo(['operatore']),creaSondaggio); 

export default router;