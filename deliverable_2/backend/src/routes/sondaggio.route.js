import { Router } from "express";
import {archiveSondaggio, creaSondaggio, deleteSondaggio, getSondaggi, getSondaggioById, publishSondaggio, updateSondaggio} from "../controllers/sondaggio.controller.js";
import {
    protect,
    restrictTo
} from "../middleware/auth_middleware.js";

const router = Router();

// POST: Crea nuova categoria per iniziativa
router.post("/",protect,restrictTo(['operatore']),creaSondaggio); 

router.get("/",protect,getSondaggi);

router.get("/:id",protect,getSondaggioById);

router.patch("/:id", protect,restrictTo(['operatore']), updateSondaggio);

router.delete("/:id", protect,restrictTo(['operatore']), deleteSondaggio);

router.patch("/:id/publish", protect,restrictTo(['operatore']), publishSondaggio);

router.patch("/:id/archive", protect,restrictTo(['operatore']), archiveSondaggio);

export default router;