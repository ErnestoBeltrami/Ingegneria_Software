import { Router } from 'express';
import { getNotifiche, marcaLetta, marcaTutteLette } from '../controllers/notifica.controller.js';
import { protect, restrictTo, validateObjectId } from '../middleware/auth_middleware.js';

const router = Router();

router.get('/', protect, restrictTo(['cittadino']), getNotifiche);
router.patch('/leggi-tutte', protect, restrictTo(['cittadino']), marcaTutteLette);
router.patch('/:id/letta', protect, restrictTo(['cittadino']), validateObjectId, marcaLetta);

export default router;
