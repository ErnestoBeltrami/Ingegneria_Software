import logger from '../config/logger.js';
import { Operatore } from '../models/operatore.js';
import bcrypt from 'bcryptjs';

export const createRootOperatore = async () => {
    const esistente = await Operatore.findOne({ isRoot: true });
    if (!esistente) {
        await Operatore.create({
            username: 'root',
            password: "rootPassword123",
            nome: 'Root',
            cognome: 'Admin',
            isRoot: true
        });
        logger.info('Utente root creato');
    } else {
        logger.info('Utente root già presente');
    }
};
