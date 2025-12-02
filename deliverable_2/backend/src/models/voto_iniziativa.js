import mongoose from 'mongoose';

const votoIniziativaSchema = new mongoose.Schema({
    ID_iniziativa : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Iniziativa',
        required : [true,'ID iniziativa obbligatorio']
    },

    ID_cittadino : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Cittadino',
        required : [true, 'ID cittadino richiesto']
    }

},
{
    timestamps : true
});

votoIniziativaSchema.index({ ID_cittadino: 1, ID_iniziativa: 1 }, { unique: true });

export const VotoIniziativa = mongoose.model('VotoIniziativa', votoIniziativaSchema);