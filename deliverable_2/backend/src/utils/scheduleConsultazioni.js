import logger from '../config/logger.js';
import cron from 'node-cron';
import { Consultazione } from '../models/consultazione.js';

const aggiornaStatiConsultazioni = async () => {
    const ora = new Date();

    try {
        // bozza → attivo: data_inizio è passata
        const attivate = await Consultazione.updateMany(
            { stato: 'bozza', data_inizio: { $lte: ora } },
            { $set: { stato: 'attivo' } }
        );

        // attivo → concluso: data_fine è passata
        const concluse = await Consultazione.updateMany(
            { stato: 'attivo', data_fine: { $lte: ora } },
            { $set: { stato: 'concluso' } }
        );

        if (attivate.modifiedCount > 0 || concluse.modifiedCount > 0) {
            logger.info(
                `[Scheduler] Consultazioni aggiornate — attivate: ${attivate.modifiedCount}, concluse: ${concluse.modifiedCount}`
            );
        }
    } catch (error) {
        logger.error('[Scheduler] Errore durante l\'aggiornamento degli stati:', error);
    }
};

// Esegue ogni ora (minuto 0 di ogni ora)
export const avviaScheduler = () => {
    cron.schedule('0 * * * *', aggiornaStatiConsultazioni);
    logger.info('[Scheduler] Avviato — aggiornamento stati consultazioni ogni ora.');

    // Esegue subito all'avvio per allineare eventuali stati rimasti indietro
    aggiornaStatiConsultazioni();
};
