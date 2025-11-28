import { Router } from "express";
import { 
    getByCredentials
 } from '../controllers/operatore.controller.js'; // ⚠️ NECESSARIO per interagire con il DB


const router = Router();

//POST METHODS


//GET METHODS
router.get('/operatore/login',getByCredentials);