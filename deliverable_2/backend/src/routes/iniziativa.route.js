import { Router } from "express";
import {
    createIniziativa,
    getIniziative,
    ricercaIniziativa
} from "../controllers/iniziativa.controller.js";

import { 
  protect,
  restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea votazione se sei cittadino
router.post("/", protect, restrictTo(['cittadino']), createIniziativa);

//GET: Ritorna tutte le iniziative filtrate per data e numero di voti
router.get("/",protect,getIniziative);

router.post("/ricerca", protect,ricercaIniziativa);

export default router;