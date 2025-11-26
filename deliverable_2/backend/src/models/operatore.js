// Nel file: ./model/NomeModello.js
const mongoose = require('mongoose'); // Carica Mongoose (necessario)

const OperatoreComune = new mongoose.Schema({
    password_hash: {
        type: String,
        required : [true,'password obbligatoria'],
        unique : false,
        trim : true,
        select : false
    },
    username : {
        type : String,
        required : [true,'username obbligatorio'],
        unique : true,
        trim : true
    },
    nome : {
        type : String,
        required : true,
        trim : true
    },
    cognome : {
        type : String,
        required : true,
        trim : true
    }


});

module.exports = mongoose.model('operatore', OperatoreComune); // Esporta il modello