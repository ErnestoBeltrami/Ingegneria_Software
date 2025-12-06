import { Router } from "express";
import {
    createIniziativa,
    getIniziative,
    ricercaIniziativa,
    getIniziativaById,
    updateIniziativa,
    deleteIniziativa
} from "../controllers/iniziativa.controller.js";

import { 
  protect,
  restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea votazione se sei cittadino
router.post("/", protect, restrictTo(['cittadino']), createIniziativa);

//GET: Ritorna tutte le iniziative filtrate per data e numero di voti
router.get("/", protect, getIniziative);

// GET: Ricerca iniziativa per Id
router.get("/:id", protect, getIniziativaById);

// GET: Ricerca iniziative
router.post("/ricerca", protect, ricercaIniziativa);

// PATCH: Aggiorna iniziativa
router.patch("/:id", protect, restrictTo(['cittadino']), updateIniziativa);

// DELETE: Elimina iniziativa
router.delete("/:id", protect, restrictTo(['cittadino']), deleteIniziativa);

export default router;