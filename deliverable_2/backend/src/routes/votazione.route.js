import { Router } from "express";
import { 
  createVotazione,
  getVotazioni,
  getVotazioneById,
  updateVotazione,
  deleteVotazione,
  publishVotazione,
  archiveVotazione
} from "../controllers/votazione.controller.js";
import { protect } from "../middleware/auth_middleware.js";

const router = Router();

// GET /votazioni - Lista votazioni dell'operatore
router.get("/", protect, getVotazioni);

// GET /votazioni/:id - Dettaglio singola votazione
router.get("/:id", protect, getVotazioneById);

// POST /votazioni - Creazione di una nuova votazione (solo operatore autenticato)
router.post("/", protect, createVotazione);

// PATCH /votazioni/:id - Modifica votazione (solo stato "bozza")
router.patch("/:id", protect, updateVotazione);

// DELETE /votazioni/:id - Eliminazione votazione (solo stato "bozza")
router.delete("/:id", protect, deleteVotazione);

// PATCH /votazioni/:id/publish - Pubblicazione votazione (bozza -> attivo)
router.patch("/:id/publish", protect, publishVotazione);

// PATCH /votazioni/:id/archive - Archiviazione votazione (concluso -> archiviato)
router.patch("/:id/archive", protect, archiveVotazione);

export default router;

