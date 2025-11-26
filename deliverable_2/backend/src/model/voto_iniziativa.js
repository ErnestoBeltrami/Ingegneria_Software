const mongoose = require('mongoose');

const VotoIniziativa = new mongoose.Schema({
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

VotoIniziativa.index({ ID_cittadino: 1, ID_iniziativa: 1 }, { unique: true });

module.exports = mongoose.model('iniziativa', Iniziativa);