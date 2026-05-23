import { Users, TrendingUp, Check, CalendarDays } from 'lucide-react';

function formatData(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function IniziativaCard({ iniziativa, giaSostenuta, onSostieni }) {
    const { id, categoria, titolo, descrizione, sostenitori, propostoDa, data } = iniziativa;

    return (
        <div className="bac-card">
            <div className="bac-card__top">
                <span className="bac-badge">{categoria}</span>
                {data && (
                    <span className="bac-card__data">
                        <CalendarDays size={13} />
                        {formatData(data)}
                    </span>
                )}
            </div>
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
                {giaSostenuta ? (
                    <button className="bac-sostieni-btn bac-sostieni-btn--sostenuto" disabled>
                        Sostenuto <Check size={14} />
                    </button>
                ) : (
                    <button className="bac-sostieni-btn" onClick={() => onSostieni(id)}>
                        Sostieni <TrendingUp size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
