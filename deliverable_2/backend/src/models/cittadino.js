import mongoose from 'mongoose';

const cittadinoSchema = new mongoose.Schema({
    nome : {
        type : String,
        trim : true,
    },
    cognome : {
        type : String,
        trim : true,
    },
    dataNascita : {
        type : Date,
    },
    comuneResidenza : {
        type : String,
        trim : true,
    },
    circoscrizione : {
        type : String,
        trim : true,
    },
    ID_univoco_esterno: { 
        type: String, 
        unique: true, 
        trim: true,
        sparse : true
    },
    genere : {
        type : String,
        enum : ['Uomo', 'Donna'],
        default : 'Uomo',
        trim : true
    },
    categoria : {
        type : String,
        enum : ['Lavoratore','Disoccupato','Pensionato','Studente','Altro'],
        trim : true
    },
    email : {
        type : String,
        trim : true,
        unique : true
    },
    /*password : {
        type : String,
        required : [true, 'Password obbligatoria'],
        trim : true,
        select : false
    }*/
    loggedIn : {
        type : Boolean,
        default : false
   },
   profiloCompleto : {
    type : Boolean,
    default : false
   }
});

/*Cittadino.pre('save', async function(next) {
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
*/


export const Cittadino = mongoose.model('Cittadino', cittadinoSchema);