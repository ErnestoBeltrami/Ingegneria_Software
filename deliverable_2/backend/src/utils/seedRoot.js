import logger from '../config/logger.js';
import { Operatore } from '../models/operatore.js';

export const createRootOperatore = async () => {
    const rootPassword = process.env.ROOT_PASSWORD;
    if (!rootPassword) {
        console.error('FATAL: ROOT_PASSWORD required');
        process.exit(1);
    }

    const esistente = await Operatore.findOne({ isRoot: true });
    if (!esistente) {
        await Operatore.create({
            username: 'root',
            password: rootPassword,
            nome: 'Root',
            cognome: 'Admin',
            isRoot: true
        });
        logger.info('Utente root creato');
    } else {
        logger.info('Utente root già presente');
    }
};
