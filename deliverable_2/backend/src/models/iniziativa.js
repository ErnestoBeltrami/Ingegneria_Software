import mongoose from 'mongoose';

const iniziativaSchema = new mongoose.Schema({
    ID_categoria : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'CategoriaIniziativa',
        required : [true,'ID categoria obbligatorio']
    },
    titolo : {
        type : String,
        trim : true,
        required : [true,'Titolo obbligatorio'],
        unique : true
    },
    ID_cittadino : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Cittadino',
        required : [true, 'ID cittadino richiesto']
    },

    descrizione : {
        type : String,
        trim : true,
        required : [true, 'Descrizione iniziativa obbligatoria']
    }

},
{
    timestamps : true
});

iniziativaSchema.index({titolo : 'text',descrizione : 'text'});
export const Iniziativa = mongoose.model('Iniziativa', iniziativaSchema);