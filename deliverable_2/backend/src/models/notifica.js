import mongoose from 'mongoose';

const notificaSchema = new mongoose.Schema({
    ID_destinatario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cittadino',
        required: true,
    },
    tipo: {
        type: String,
        enum: ['iniziativa_approvata', 'iniziativa_rifiutata'],
        required: true,
    },
    messaggio: {
        type: String,
        required: true,
    },
    ID_iniziativa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Iniziativa',
    },
    letta: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export const Notifica = mongoose.model('Notifica', notificaSchema);
