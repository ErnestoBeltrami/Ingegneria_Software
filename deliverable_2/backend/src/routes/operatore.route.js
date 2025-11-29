import { Router } from "express";
import { 
    getByCredentials,
    getOperatoreData

 } from '../controllers/operatore.controller.js'; // ⚠️ NECESSARIO per interagire con il DB
import { 
    protect    
} from '../middleware/auth_middleware.js'

const router = Router();

//POST METHODS
router.post('/operatore/login',getByCredentials);

//GET METHODS
router.get('/operatore/profile',protect,getOperatoreData);

export default router;