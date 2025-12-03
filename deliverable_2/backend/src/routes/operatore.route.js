import { Router } from "express";
import { 
    getByCredentials,
    getOperatoreData,
    createOperatore
} from '../controllers/operatore.controller.js'; // ⚠️ NECESSARIO per interagire con il DB
import { 
    protect    
} from '../middleware/auth_middleware.js'

const router = Router();

//POST METHODS
router.post('/login', getByCredentials);
router.post('/register', createOperatore);

//GET METHODS
router.get('/profile',protect,getOperatoreData);

export default router;