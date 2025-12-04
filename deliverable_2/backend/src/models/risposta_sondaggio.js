import mongoose from 'mongoose';

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


const rispostaSondaggioSchema = new mongoose.Schema({

    ID_cittadino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cittadino',
        required: [true, "L'ID del cittadino inviante è obbligatorio."]
    },

    ID_sondaggio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sondaggio',
        required: [true, "L'ID del sondaggio è obbligatorio."]
    },

    
    dettagliRisposte: {
        type: [dettaglioRispostaSchema],
        required: true,
        validate: {
            validator: function(v) { return v && v.length > 0; },
            message: 'Il sondaggio deve contenere almeno una risposta.'
        }
    }

}, {
    timestamps: true 
});
rispostaSondaggioSchema.index({ ID_cittadino: 1, ID_sondaggio: 1 }, { unique: true });

export const RispostaSondaggio = mongoose.model('RispostaSondaggio', rispostaSondaggioSchema);