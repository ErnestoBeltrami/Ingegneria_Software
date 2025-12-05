import mongoose from 'mongoose';
import { Consultazione } from './consultazione.js';

// Wrapper per retrocompatibilità: Votazione usa lo schema unificato Consultazione
// con tipo: 'votazione' predefinito
const votazioneSchema = new mongoose.Schema({}, { discriminatorKey: 'tipo' });

// Crea il discriminator per votazioni
// NOTA: I controlli sono necessari perché quando nodemon riavvia il server, i moduli vengono
// ricaricati ma Mongoose mantiene i modelli in memoria. Senza questi controlli, si verifica
// un OverwriteModelError quando si tenta di creare di nuovo il discriminator.
let Votazione;
try {
    Votazione = Consultazione.discriminator('votazione', votazioneSchema);
} catch (error) {
    // Se il modello esiste già (riavvio nodemon), recuperalo
    if (error.name === 'OverwriteModelError') {
        Votazione = mongoose.models.Votazione || Consultazione.discriminators?.['votazione'];
    } else {
        throw error;
    }
}

export { Votazione };