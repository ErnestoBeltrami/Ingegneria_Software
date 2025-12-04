import { Router } from "express";
import {
    createCategoria
} from "../controllers/categoria.controller.js";

import {
    protect,
    restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea nuova categoria per iniziativa
router.post("/", protect, restrictTo(['cittadino']), createCategoria);

export default router;