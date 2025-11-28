// Nel file: ./model/OperatoreComune.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ⚠️ Importa bcrypt

const OperatoreComune = new mongoose.Schema({
    password: { // Rinominato per convenzione
        type: String,
        required: [true, 'Password obbligatoria'],
        unique: false,
        trim: true,
        select: false 
    },
    username: {
        type: String,
        required: [true, 'Username obbligatorio'],
        unique: true,
        trim: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    cognome: {
        type: String,
        required: true,
        trim: true
    }
});

OperatoreComune.pre('save', async function(next) {
    if (!this.isModified('password')) { 
        return next();
    }
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

OperatoreComune.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('OperatoreComune', OperatoreComune); 