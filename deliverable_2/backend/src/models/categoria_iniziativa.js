import mongoose from 'mongoose';

const categoriaIniziativaSchema = new mongoose.Schema({
    nome : {type : String,
            trim : true,
            required : [true, 'Nome categoria obbligatorio'] 
        }
});

export const CategoriaIniziativa = mongoose.model('CategoriaIniziativa', categoriaIniziativaSchema);