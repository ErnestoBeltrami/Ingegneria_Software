import mongoose from 'mongoose';
import { Consultazione } from './consultazione.js';

// Wrapper per retrocompatibilità: Sondaggio usa lo schema unificato Consultazione
// con tipo: 'sondaggio' predefinito
const sondaggioSchema = new mongoose.Schema({}, { discriminatorKey: 'tipo' });

// Crea il discriminator per sondaggi
// NOTA: I controlli sono necessari per gestire i riavvii di nodemon (vedi votazione.js)
let Sondaggio;
try {
    Sondaggio = Consultazione.discriminator('sondaggio', sondaggioSchema);
} catch (error) {
    if (error.name === 'OverwriteModelError') {
        Sondaggio = mongoose.models.Sondaggio || Consultazione.discriminators?.['sondaggio'];
    } else {
        throw error;
    }
}

export { Sondaggio };