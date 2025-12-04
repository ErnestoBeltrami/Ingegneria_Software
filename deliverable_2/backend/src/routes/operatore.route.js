import { Router } from "express";
import { 
    getByCredentials,
    getOperatoreData,
    createOperatore,
    promoteOperatoreToRoot
} from '../controllers/operatore.controller.js'; // ⚠️ NECESSARIO per interagire con il DB
import { 
    protect    
} from '../middleware/auth_middleware.js'

const router = Router();

//POST METHODS
router.post('/login', getByCredentials);
router.post('/register', protect, createOperatore);

//GET METHODS
router.get('/profile',protect,getOperatoreData);

// PATCH METHODS
router.patch('/:operatoreId/promote', protect, promoteOperatoreToRoot);

export default router;