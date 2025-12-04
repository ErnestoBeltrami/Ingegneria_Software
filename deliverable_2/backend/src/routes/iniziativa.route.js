import { Router } from "express";
import {
    createIniziativa
} from "../controllers/iniziativa.controller.js";

import { 
  protect,
  restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea votazione se sei cittadino
router.post("/", protect, restrictTo(['cittadino']), createIniziativa);

export default router;