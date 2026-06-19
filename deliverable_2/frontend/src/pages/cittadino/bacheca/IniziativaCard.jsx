import { useRef, useState, useLayoutEffect } from 'react';
import { Users, TrendingUp, Check, CalendarDays } from 'lucide-react';

function formatData(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function IniziativaCard({ iniziativa, giaSostenuta, onSostieni, onApri }) {
    const { id, categoria, titolo, descrizione, sostenitori, propostoDa, data } = iniziativa;

    const descRef = useRef(null);
    const [troncata, setTroncata] = useState(false);

    useLayoutEffect(() => {
        const el = descRef.current;
        if (el) setTroncata(el.scrollHeight > el.clientHeight + 1);
    }, [descrizione]);

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
            <h2 className="bac-card__title bac-card__title--clickable" onClick={() => onApri(id)}>
                {titolo}
            </h2>
            <p ref={descRef} className="bac-card__desc">{descrizione}</p>
            {troncata && (
                <button className="bac-card__leggi" onClick={() => onApri(id)}>
                    Leggi tutto
                </button>
            )}
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
