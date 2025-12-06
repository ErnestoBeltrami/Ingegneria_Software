import { Router } from "express";
import {
    createCategoria,
    getCategorie,
    getCategoriaById,
    updateCategoria,
    deleteCategoria
} from "../controllers/categoria.controller.js";

import {
    protect,
    restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea nuova categoria per iniziativa
router.post("/", protect, restrictTo(['operatore']), createCategoria);

// GET: Ritorna lista di tutte le categorie
router.get("/", protect, restrictTo(['cittadino, operatore']), getCategorie);

// GET: Ritorna dettagli categoria
router.get("/:id", protect, restrictTo(['cittadino, operatore']), getCategoriaById);

// PATCH: Aggiorna categoria
router.patch("/:id", protect, restrictTo(['operatore']), updateCategoria);

// DELETE: Elimina categoria
router.delete("/:id", protect, restrictTo(['operatore']), deleteCategoria);

export default router;