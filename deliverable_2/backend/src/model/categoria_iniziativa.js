const mongoose = require('mongoose');

const CategoriaIniziativa = new mongoose.Schema({
    nome : {type : String, trim : true, required : [true, 'Nome categoria obbligatorio'] }
});

module.exports = mongoose.model('categoria_iniziativa', CategoriaIniziativa);