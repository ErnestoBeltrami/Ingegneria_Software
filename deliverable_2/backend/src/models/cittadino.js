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
    /*ID_univoco_esterno: { 
        type: String, // Usiamo Stringa, più comune per ID di sistemi esterni
        required: [true, 'ID esterno obbligatorio per l autenticazione.'],
        unique: true, // Cruciale per l'univocità (RF12)
        trim: true
    },*/
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
    },
    email : {
        type : String,
        trim : true,
        required : [true,'email obbligatoria'],
        unique : true
    },
    password : {
        type : String,
        required : [true, 'Password obbligatoria'],
        trim : true,
        select : false
    }
});

Cittadino.pre('save', async function(next) {
    if (!this.isModified('password')) { // Solo se la password è stata modificata
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metodo helper per confrontare la password (usato nel Controller)
Cittadino.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('cittadino', Cittadino); // Esporta il modello