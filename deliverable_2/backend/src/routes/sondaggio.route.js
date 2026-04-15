import { Router } from "express";
import {archiveSondaggio, creaSondaggio, deleteSondaggio, getRiepilogoSintetico, getSondaggi, getSondaggioById, publishSondaggio, updateSondaggio,getSondaggiAvaiable} from "../controllers/sondaggio.controller.js";
import {
    protect,
    restrictTo,
    validateObjectId
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea nuova categoria per iniziativa
router.post("/",protect,restrictTo(['operatore']),creaSondaggio); 

router.get("/",protect,getSondaggi);

router.get("/cittadino",protect,restrictTo(['cittadino']),getSondaggiAvaiable);

router.get("/:id", protect, validateObjectId, getSondaggioById);

router.patch("/:id", protect, validateObjectId, restrictTo(['operatore']), updateSondaggio);

router.delete("/:id", protect, validateObjectId, restrictTo(['operatore']), deleteSondaggio);

router.patch("/:id/publish", protect, validateObjectId, restrictTo(['operatore']), publishSondaggio);

router.patch("/:id/archive", protect, validateObjectId, restrictTo(['operatore']), archiveSondaggio);

router.get("/:id/riepilogo", protect, validateObjectId, getRiepilogoSintetico);

export default router;