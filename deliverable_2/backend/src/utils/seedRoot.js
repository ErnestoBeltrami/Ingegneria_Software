import { Operatore } from '../models/operatore.js';
import bcrypt from 'bcrypt';

export const createRootOperatore = async () => {
    const esistente = await Operatore.findOne({ isRoot: true });
    if (!esistente) {
        await Operatore.create({
            username: 'root',
            password: "rootPassword123",
            nome: 'Root',
            cognome: 'Admin',
            isRoot: true
        });
        console.log('Utente root creato');
    } else {
        console.log('Utente root già presente');
    }
};
