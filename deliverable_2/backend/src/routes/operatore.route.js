import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
    getByCredentials,
    getOperatoreData,
    createOperatore,
    promoteOperatoreToRoot,
    changePassword
} from '../controllers/operatore.controller.js'; // ⚠️ NECESSARIO per interagire con il DB
import {
    protect,
    restrictTo
} from '../middleware/auth_middleware.js'

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Troppi tentativi di login. Riprova tra 15 minuti.' },
});

const router = Router();

//POST METHODS
router.post('/login', loginLimiter, getByCredentials);
router.post('/register', protect,restrictTo(['operatore']), createOperatore);

//GET METHODS
router.get('/profile',protect,restrictTo(['operatore']),getOperatoreData);

// PATCH METHODS
router.patch('/me/password', protect, restrictTo(['operatore']), changePassword);
router.patch('/:operatoreId/promote', protect, restrictTo(['operatore']), promoteOperatoreToRoot);

export default router;