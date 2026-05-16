import { Router } from "express";
import {
    getRiepilogoSintetico, 
    getSondaggi, 
    updateSondaggio,
    getSondaggiAvaiable, 
    getRiepilogoConFiltri
} from "../controllers/sondaggio.controller.js";

import {
    protect,
    restrictTo,
    validateObjectId
} from "../middleware/auth_middleware.js";

import {
    creaConsultazione,
    publishConsultazione,
    archiveConsultazione,
    deleteConsultazione,
    getConsultazioneById
} from "../controllers/consultazione.controller.js";

const router = Router();

router.post("/", protect, restrictTo(['operatore']), creaConsultazione);

router.get("/",protect,getSondaggi);

router.get("/cittadino",protect,restrictTo(['cittadino']),getSondaggiAvaiable);

router.get("/:id", protect, validateObjectId, restrictTo(['operatore','cittadino']),getConsultazioneById);

router.patch("/:id", protect, validateObjectId, restrictTo(['operatore']), updateSondaggio);

router.delete("/:id", protect, validateObjectId, restrictTo(['operatore']), deleteConsultazione);

router.patch("/:id/publish", protect, validateObjectId, restrictTo(['operatore']), publishConsultazione);

router.patch("/:id/archive", protect, validateObjectId, restrictTo(['operatore']), archiveConsultazione);

router.get("/:id/riepilogo", protect, validateObjectId, getRiepilogoSintetico);

router.post("/:id/riepilogo/aggregato", protect, restrictTo(['operatore']) , getRiepilogoConFiltri);

export default router;