import { useState, useEffect } from 'react';
import './GraficoRisultati.css';

export default function GraficoRisultati({ dati = [], totaleVoti = 0 }) {
    const [animate, setAnimate] = useState(false);

    // Quando i dati cambiano, facciamo ripartire l'animazione da 0
    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [dati]);

    if (!dati.length) return null;

    return (
        <div className="gr-container">
            {totaleVoti > 0 && (
                <div className="gr-total">
                    <span className="gr-total__num">{totaleVoti}</span>
                    <span className="gr-total__label">voti totali</span>
                </div>
            )}

            <div className="gr-bars">
                {dati.map((d, i) => (
                    <div className="gr-row" key={i}>
                        <div className="gr-row__header">
                            <span className="gr-row__label">{d.etichetta}</span>
                            <span className="gr-row__pct">{Number(d.percentuale).toFixed(0)}%</span>
                        </div>
                        <div className="gr-row__track">
                            <div
                                className="gr-row__fill"
                                style={{
                                    width: animate ? `${d.percentuale}%` : '0%',
                                    backgroundColor: d.percentuale > 0 ? d.colore : 'transparent',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

