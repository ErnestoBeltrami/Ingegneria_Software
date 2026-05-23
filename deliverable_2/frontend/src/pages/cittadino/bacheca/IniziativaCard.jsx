import { Users, TrendingUp } from 'lucide-react';

export default function IniziativaCard({ iniziativa }) {
    const { categoria, titolo, descrizione, sostenitori, propostoDa } = iniziativa;

    return (
        <div className="bac-card">
            <span className="bac-badge">{categoria}</span>
            <h2 className="bac-card__title">{titolo}</h2>
            <p className="bac-card__desc">{descrizione}</p>
            <div className="bac-card__sostenitori">
                <Users size={16} />
                Sostenitori: <strong>{sostenitori}</strong>
            </div>
            <div className="bac-card__footer">
                <span className="bac-card__proposto">
                    Proposto da <strong>{propostoDa}</strong>
                </span>
                <button className="bac-sostieni-btn">
                    Sostieni <TrendingUp size={14} />
                </button>
            </div>
        </div>
    );
}
