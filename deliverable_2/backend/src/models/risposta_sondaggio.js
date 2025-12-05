// Wrapper per retrocompatibilità: RispostaSondaggio usa RispostaConsultazione
import mongoose from 'mongoose';
import { RispostaConsultazione } from './risposta_consultazione.js';

// Crea discriminator per sondaggi
// NOTA: I controlli sono necessari per gestire i riavvii di nodemon (vedi votazione.js)
const rispostaSondaggioSchema = new mongoose.Schema({}, { discriminatorKey: 'tipo_consultazione' });

let RispostaSondaggioModel;
try {
    RispostaSondaggioModel = RispostaConsultazione.discriminator('sondaggio', rispostaSondaggioSchema);
} catch (error) {
    if (error.name === 'OverwriteModelError') {
        RispostaSondaggioModel = mongoose.models.RispostaSondaggio || RispostaConsultazione.discriminators?.['sondaggio'];
    } else {
        throw error;
    }
}

// Wrapper per mappare i metodi
class RispostaSondaggioWrapper {
    static async create(data) {
        const mappedData = {
            ...data,
            tipo_consultazione: 'sondaggio',
            ID_consultazione: data.ID_sondaggio || data.ID_consultazione
        };
        delete mappedData.ID_sondaggio;
        return await RispostaSondaggioModel.create(mappedData);
    }

    static async findOne(query) {
        const mappedQuery = { ...query, tipo_consultazione: 'sondaggio' };
        if (mappedQuery.ID_sondaggio) {
            mappedQuery.ID_consultazione = mappedQuery.ID_sondaggio;
            delete mappedQuery.ID_sondaggio;
        }
        return await RispostaSondaggioModel.findOne(mappedQuery);
    }

    static async find(query) {
        const mappedQuery = { ...query, tipo_consultazione: 'sondaggio' };
        if (mappedQuery.ID_sondaggio) {
            mappedQuery.ID_consultazione = mappedQuery.ID_sondaggio;
            delete mappedQuery.ID_sondaggio;
        }
        return await RispostaSondaggioModel.find(mappedQuery);
    }

    // Delega tutti gli altri metodi al modello
    static get model() {
        return RispostaSondaggioModel;
    }
}

// Aggiungi metodi Mongoose comuni
['findById', 'findOneAndUpdate', 'findOneAndDelete', 'deleteOne', 'deleteMany', 'updateOne', 'updateMany', 'countDocuments'].forEach(method => {
    RispostaSondaggioWrapper[method] = function(...args) {
        // Mappa ID_sondaggio a ID_consultazione nei query
        if (args[0] && args[0].ID_sondaggio) {
            args[0] = { ...args[0], ID_consultazione: args[0].ID_sondaggio, tipo_consultazione: 'sondaggio' };
            delete args[0].ID_sondaggio;
        } else if (args[0]) {
            args[0] = { ...args[0], tipo_consultazione: 'sondaggio' };
        }
        return RispostaSondaggioModel[method](...args);
    };
});

export const RispostaSondaggio = RispostaSondaggioWrapper;