import { Notifica } from '../models/notifica.js';

export const getNotifiche = async (req, res) => {
    try {
        const notifiche = await Notifica.find({ ID_destinatario: req.user._id })
            .sort({ createdAt: -1 });
        return res.status(200).json({ notifiche });
    } catch (error) {
        return res.status(500).json({ message: 'Errore nel recupero delle notifiche.' });
    }
};

export const marcaLetta = async (req, res) => {
    try {
        const notifica = await Notifica.findOne({ _id: req.params.id, ID_destinatario: req.user._id });
        if (!notifica) return res.status(404).json({ message: 'Notifica non trovata.' });
        notifica.letta = true;
        await notifica.save();
        return res.status(200).json({ notifica });
    } catch (error) {
        return res.status(500).json({ message: 'Errore.' });
    }
};

export const marcaTutteLette = async (req, res) => {
    try {
        await Notifica.updateMany({ ID_destinatario: req.user._id, letta: false }, { letta: true });
        return res.status(200).json({ message: 'Tutte le notifiche segnate come lette.' });
    } catch (error) {
        return res.status(500).json({ message: 'Errore.' });
    }
};
