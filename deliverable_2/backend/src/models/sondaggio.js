// Nel file: ./model/Sondaggio.js
const mongoose = require('mongoose');

const Sondaggio = new mongoose.Schema({ // Rinominato a SondaggioSchema per convenzione

    stato: {
        type: String,
        enum: ['attivo', 'bozza', 'concluso', 'archiviato'], 
        default: 'bozza',
        required: [true, 'Lo stato è obbligatorio.'], 
        trim: true
    },

    titolo: {
        type: String,
        trim: true,
        required: [true, 'Titolo necessario.'],
        unique: true
    },

    descrizione: {
        type: String,
        required: [true, 'Descrizione obbligatoria.'],
        trim: true // Corretto a true
    },

    creatoDa: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Operatore', 
        required: [true, "L'ID dell'operatore creatore è obbligatorio."]
    },

    data_inizio: {
        type: Date,
        required: [true, 'Data di inizio necessaria.'],
    },

    data_fine: {
        type: Date,
        // Corretto il messaggio d'errore e sistemato required
        required: [true, 'Data di fine necessaria.'], 
        validate: {
            validator: function(v) {
                return v >= this.data_inizio;
            },
            message: props => `La data di fine (${props.value}) non può essere antecedente alla data di inizio.`
        }
    }
}, {
    timestamps: true // Utile per audit (data creazione)
});

module.exports = mongoose.model('sondaggio', Sondaggio);