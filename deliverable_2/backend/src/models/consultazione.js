import mongoose from 'mongoose';

const consultazioneSchema = new mongoose.Schema({ 
    
    tipo: {
        type: String,
        enum: ['votazione', 'sondaggio'],
        required: [true, 'Il tipo di consultazione è obbligatorio.'],
        trim: true
    },

    stato: {
        type: String,
        enum: ['attivo', 'bozza', 'concluso', 'archiviato'], 
        default: 'bozza',
        required: [true, 'Lo stato è obbligatorio.'], 
        trim: true
    },

    ID_domanda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domanda',
        required: [true, 'ID_domanda è obbligatorio per tutte le consultazioni.']
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
        trim: true
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
        required: [true, 'Data di fine necessaria.'], 
        validate: {
            validator: function(v) {
                return v >= this.data_inizio;
            },
            message: props => `La data di fine (${props.value}) non può essere antecedente alla data di inizio.`
        }
    },

    data_discussione: {
        type: Date,
        required: [true, 'Data di discussione necessaria per tutte le consultazioni.'],
        validate: {
            validator: function(v) {
                // La data di discussione deve essere presente e prima di data_inizio
                return v != null && v < this.data_inizio;
            },
            message: props => `La data di discussione (${props.value}) non può essere dopo la data di inizio.`
        }
    }
}, {
    timestamps: true
});

// Indice composto per migliorare le query
consultazioneSchema.index({ tipo: 1, stato: 1 });
consultazioneSchema.index({ creatoDa: 1, tipo: 1 });

// Crea il modello solo se non esiste già
// NOTA: Questo controllo è necessario perché quando nodemon riavvia, Mongoose mantiene
// i modelli in memoria. Senza questo controllo, si verifica un OverwriteModelError.
export const Consultazione = mongoose.models.Consultazione || mongoose.model('Consultazione', consultazioneSchema);

