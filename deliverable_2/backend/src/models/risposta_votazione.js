// Wrapper per retrocompatibilità: RispostaVotazione usa RispostaConsultazione
import mongoose from 'mongoose';
import { RispostaConsultazione } from './risposta_consultazione.js';

// Crea discriminator per votazioni
// NOTA: I controlli sono necessari per gestire i riavvii di nodemon (vedi votazione.js)
const rispostaVotazioneSchema = new mongoose.Schema({}, { discriminatorKey: 'tipo_consultazione' });

let RispostaVotazioneModel;
try {
    RispostaVotazioneModel = RispostaConsultazione.discriminator('votazione', rispostaVotazioneSchema);
} catch (error) {
    if (error.name === 'OverwriteModelError') {
        RispostaVotazioneModel = mongoose.models.RispostaVotazione || RispostaConsultazione.discriminators?.['votazione'];
    } else {
        throw error;
    }
}

// Aggiungi virtual field per retrocompatibilità
rispostaVotazioneSchema.virtual('ID_votazione').get(function() {
    return this.ID_consultazione;
});

rispostaVotazioneSchema.virtual('ID_votazione').set(function(value) {
    this.ID_consultazione = value;
});

// Wrapper per mappare i metodi
class RispostaVotazioneWrapper {
    static async create(data) {
        const mappedData = {
            ...data,
            tipo_consultazione: 'votazione',
            ID_consultazione: data.ID_votazione || data.ID_consultazione
        };
        delete mappedData.ID_votazione;
        return await RispostaVotazioneModel.create(mappedData);
    }

    static async findOne(query) {
        const mappedQuery = { ...query, tipo_consultazione: 'votazione' };
        if (mappedQuery.ID_votazione) {
            mappedQuery.ID_consultazione = mappedQuery.ID_votazione;
            delete mappedQuery.ID_votazione;
        }
        return await RispostaVotazioneModel.findOne(mappedQuery);
    }

    static async aggregate(pipeline) {
        // Mappa ID_votazione a ID_consultazione nella pipeline
        const mappedPipeline = pipeline.map(stage => {
            if (stage.$match) {
                const newMatch = { ...stage.$match };
                // Mappa ID_votazione a ID_consultazione
                if (newMatch.ID_votazione) {
                    newMatch.ID_consultazione = newMatch.ID_votazione;
                    delete newMatch.ID_votazione;
                }
                // Aggiungi sempre il filtro per tipo_consultazione
                newMatch.tipo_consultazione = 'votazione';
                return { $match: newMatch };
            }
            return stage;
        });
        return await RispostaVotazioneModel.aggregate(mappedPipeline);
    }

    // Delega tutti gli altri metodi al modello
    static get model() {
        return RispostaVotazioneModel;
    }
}

// Aggiungi metodi Mongoose comuni
['find', 'findById', 'findOneAndUpdate', 'findOneAndDelete', 'deleteOne', 'deleteMany', 'updateOne', 'updateMany', 'countDocuments'].forEach(method => {
    RispostaVotazioneWrapper[method] = function(...args) {
        // Mappa ID_votazione a ID_consultazione nei query
        if (args[0] && args[0].ID_votazione) {
            args[0] = { ...args[0], ID_consultazione: args[0].ID_votazione, tipo_consultazione: 'votazione' };
            delete args[0].ID_votazione;
        } else if (args[0]) {
            args[0] = { ...args[0], tipo_consultazione: 'votazione' };
        }
        return RispostaVotazioneModel[method](...args);
    };
});

export const RispostaVotazione = RispostaVotazioneWrapper;