// Nel file: ./model/Domanda.js
const mongoose = require('mongoose');

// Sotto-schema per le Opzioni (sono semplici stringhe in questo caso)
const OpzioneSchema = new mongoose.Schema({
    testo: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false }); // Non è necessario un ID per ogni singola opzione di testo

const Domanda = new mongoose.Schema({ 
    
    // Riferimenti (opzionali per permettere l'associazione a Sondaggio o Votazione)
    id_sondaggio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sondaggio',
        required: false // Non obbligatorio, perché potrebbe essere associato a Votazione
    },

    titolo: {
        type: String,
        trim: true,
        required: [true, 'Testo della domanda obbligatorio.']
    },
    
    // Contenuto critico: le opzioni di risposta
    opzioni: {
        type: [OpzioneSchema],
        required: [true, 'La domanda deve avere opzioni di risposta.'],
        validate: {
            validator: function(v) { return v && v.length >= 2; },
            message: 'Devi specificare almeno due opzioni di risposta.'
        }
    },
    
    tipo: { // Definisce se è possibile una sola scelta o più scelte
        type: String,
        enum: ['risposta_multipla', 'risposta_singola'], // Usiamo snake_case per consistenza
        default: 'risposta_singola',
        required: [true, 'Tipo domanda obbligatorio.'],
        trim: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('domanda', Domanda);