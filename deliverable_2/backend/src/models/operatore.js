import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const operatoreSchema = new mongoose.Schema({
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

operatoreSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { 
        return next();
    }
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

operatoreSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const Operatore = mongoose.model('Operatore', operatoreSchema);