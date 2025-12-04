import { Router } from "express";
import { 
  createVotazione,
  getVotazioni,
  getVotazioneById,
  updateVotazione,
  deleteVotazione,
  publishVotazione,
  archiveVotazione,
  getRiepilogoSintetico
} from "../controllers/votazione.controller.js";

import { 
  protect,
  restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// GET /votazioni - Lista votazioni dell'operatore
router.get("/", protect, restrictTo(['operatore']), getVotazioni);

// GET /votazioni/:id - Dettaglio singola votazione
router.get("/:id", protect,restrictTo(['operatore']), getVotazioneById);

// GET /votazioni/:id - Riepilogo Sintetico votazione
router.get("/:id/riepilogo",protect,getRiepilogoSintetico);

// POST /votazioni - Creazione di una nuova votazione (solo operatore autenticato)
router.post("/", protect,restrictTo(['operatore']), createVotazione);

// PATCH /votazioni/:id - Modifica votazione (solo stato "bozza")
router.patch("/:id", protect,restrictTo(['operatore']), updateVotazione);

// DELETE /votazioni/:id - Eliminazione votazione (solo stato "bozza")
router.delete("/:id", protect,restrictTo(['operatore']), deleteVotazione);

// PATCH /votazioni/:id/publish - Pubblicazione votazione (bozza -> attivo)
router.patch("/:id/publish", protect,restrictTo(['operatore']), publishVotazione);

// PATCH /votazioni/:id/archive - Archiviazione votazione (concluso -> archiviato)
router.patch("/:id/archive", protect,restrictTo(['operatore']), archiveVotazione);

export default router;

