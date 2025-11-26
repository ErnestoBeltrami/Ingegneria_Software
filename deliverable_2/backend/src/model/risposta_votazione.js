// Nel file: ./model/Sondaggio.js
const mongoose = require('mongoose');

const RispostaVotazione = new mongoose.Schema({ // Rinominato a SondaggioSchema per convenzione

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
RispostaVotazione.index({ ID_cittadino: 1, ID_votazione: 1 }, { unique: true });

module.exports = mongoose.model('risposta_votazione', RispostaVotazione);