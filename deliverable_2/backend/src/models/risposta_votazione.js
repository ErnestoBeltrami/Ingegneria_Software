// Nel file: ./model/RispostaVotazione.js
import mongoose from 'mongoose';

const rispostaVotazioneSchema = new mongoose.Schema({

    ID_opzione : { 
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "L'ID dell'opzione selezionata è obbligatorio."]
    },

    ID_cittadino : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Cittadino',
        required: [true, "L'ID del cittadino votante è obbligatorio."]
    },

    ID_votazione : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Votazione',
        required: [true, "L'ID della votazione è obbligatorio."]
    }

}, {
    timestamps: true // Utile per audit (data creazione)
});
rispostaVotazioneSchema.index({ ID_cittadino: 1, ID_votazione: 1 }, { unique: true });

export const RispostaVotazione = mongoose.model('RispostaVotazione', rispostaVotazioneSchema);