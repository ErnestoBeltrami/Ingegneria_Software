// Nel file: ./model/NomeModello.js
const mongoose = require('mongoose'); // Carica Mongoose (necessario)

const Cittadino = new mongoose.Schema({
    nome : {
        type : String,
        required : [true,'Nome obbligatorio'],
        trim : true,
    },
    cognome : {
        type : String,
        required : [true,'Cognome obbligatorio'],
        trim : true,
    },
    age : {
        type : Number,
        required : [true,'Età obbligatoria'],
        min : 18
    },
    ID_univoco_esterno: { 
        type: String, // Usiamo Stringa, più comune per ID di sistemi esterni
        required: [true, 'ID esterno obbligatorio per l autenticazione.'],
        unique: true, // Cruciale per l'univocità (RF12)
        trim: true
    },
    genere : {
        type : String,
        enum : ['Uomo', 'Donna'],
        default : 'Uomo',
        required : true,
        trim : true
    },
    categoria : {
        type : String,
        enum : ['Lavoratore','Disoccupato','Pensionato','Studente','Altro'],
        required : [true,'Categoria obbligatoria'],
        trim : true
    }

});

module.exports = mongoose.model('cittadino', Cittadino); // Esporta il modello