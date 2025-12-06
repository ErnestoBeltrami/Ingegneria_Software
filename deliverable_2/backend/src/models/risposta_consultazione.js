import mongoose from 'mongoose';

// Schema per i dettagli delle risposte (usato per sondaggi)
const dettaglioRispostaSchema = new mongoose.Schema({
    ID_domanda: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Domanda'
    },
    opzioniScelte: {
        type: [mongoose.Schema.Types.ObjectId],
        required: [true, 'Devi selezionare almeno una opzione.'],
        validate: {
            validator: function(v) { return v && v.length > 0; },
            message: 'Almeno una opzione deve essere selezionata.'
        }
    }
}, { _id: false });

const rispostaConsultazioneSchema = new mongoose.Schema({
    
    tipo_consultazione: {
        type: String,
        enum: ['votazione', 'sondaggio'],
        required: [true, 'Il tipo di consultazione è obbligatorio.'],
        trim: true
    },

    ID_consultazione: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultazione',
        required: [true, "L'ID della consultazione è obbligatorio."]
    },

    ID_cittadino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cittadino',
        required: [true, "L'ID del cittadino è obbligatorio."]
    },

    // Per votazioni: singola opzione
    ID_opzione: {
        type: mongoose.Schema.Types.ObjectId,
        required: function() {
            return this.tipo_consultazione === 'votazione';
        },
        validate: {
            validator: function(v) {
                if (this.tipo_consultazione === 'votazione') {
                    return v != null;
                }
                // Per sondaggi, ID_opzione non deve essere presente
                return v == null;
            },
            message: 'ID_opzione è obbligatorio per votazioni e non permesso per sondaggi.'
        }
    },

    // Per sondaggi: array di dettagli risposte
    dettagliRisposte: {
        type: [dettaglioRispostaSchema],
        required: function() {
            return this.tipo_consultazione === 'sondaggio';
        },
        validate: {
            validator: function(v) {
                if (this.tipo_consultazione === 'sondaggio') {
                    return v != null && v.length > 0;
                }
                // Per votazioni, dettagliRisposte non deve essere presente
                return v == null || v.length === 0;
            },
            message: 'dettagliRisposte è obbligatorio per sondaggi (almeno una risposta) e non permesso per votazioni.'
        }
    }

}, {
    timestamps: true
});

// Indice univoco: un cittadino può rispondere una sola volta a una consultazione
rispostaConsultazioneSchema.index({ ID_cittadino: 1, ID_consultazione: 1 }, { unique: true });

// Indice per migliorare le query per tipo
rispostaConsultazioneSchema.index({ tipo_consultazione: 1, ID_consultazione: 1 });

// Crea il modello solo se non esiste già
// NOTA: Questo controllo è necessario per gestire i riavvii di nodemon (vedi consultazione.js)
export const RispostaConsultazione = mongoose.models.RispostaConsultazione || mongoose.model('RispostaConsultazione', rispostaConsultazioneSchema);

