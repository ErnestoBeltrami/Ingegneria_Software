import { Router } from "express";
import {
  createVotazione,
  getVotazioni,
  getVotazioneById,
  updateVotazione,
  deleteVotazione,
  publishVotazione,
  archiveVotazione,
  getRiepilogoSintetico,
  getRiepilogoDemografico,
  getVotazioniAvailable
} from "../controllers/votazione.controller.js";

import {
  protect,
  restrictTo,
  validateObjectId
} from "../middleware/auth_middleware.js";

const router = Router();

// GET /votazioni - Lista votazioni dell'operatore
router.get("/", protect, restrictTo(['operatore']), getVotazioni);

// GET /votazioni/cittadino 
router.get("/cittadino",protect,restrictTo(['cittadino']),getVotazioniAvailable);

//DA FINIRE SWAGGER

// GET /votazioni/:id - Dettaglio singola votazione (operatore: tutti gli stati; cittadino: attivo/concluso + voted)
router.get("/:id", protect, validateObjectId, getVotazioneById);

// GET /votazioni/:id/riepilogo/demografico - Riepilogo demografico (genere, età, partecipazione)
router.get("/:id/riepilogo/demografico", protect, validateObjectId, restrictTo(['operatore']), getRiepilogoDemografico);

// GET /votazioni/:id/riepilogo - Riepilogo Sintetico votazione
router.get("/:id/riepilogo", protect, validateObjectId, getRiepilogoSintetico);

// POST /votazioni - Creazione di una nuova votazione (solo operatore autenticato)
router.post("/", protect, restrictTo(['operatore']), createVotazione);

// PATCH /votazioni/:id - Modifica votazione (solo stato "bozza")
router.patch("/:id", protect, validateObjectId, restrictTo(['operatore']), updateVotazione);

// DELETE /votazioni/:id - Eliminazione votazione (solo stato "bozza")
router.delete("/:id", protect, validateObjectId, restrictTo(['operatore']), deleteVotazione);

// PATCH /votazioni/:id/publish - Pubblicazione votazione (bozza -> attivo)
router.patch("/:id/publish", protect, validateObjectId, restrictTo(['operatore']), publishVotazione);

// PATCH /votazioni/:id/archive - Archiviazione votazione (concluso -> archiviato)
router.patch("/:id/archive", protect, validateObjectId, restrictTo(['operatore']), archiveVotazione);

export default router;

