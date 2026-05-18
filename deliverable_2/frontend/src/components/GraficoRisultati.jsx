import { motion } from 'framer-motion';
import './GraficoRisultati.css';

export default function GraficoRisultati({ dati = [] }) {
    if (!dati.length) return null;

    return (
        <div className="gr-container">
            <div className="gr-bars">
                {dati.map((d, i) => (
                    <div className="gr-row" key={i}>
                        <div className="gr-row__header">
                            <span className="gr-row__label">{d.etichetta}</span>
                            <span className="gr-row__pct">{Number(d.percentuale).toFixed(0)}%</span>
                        </div>
                        <div className="gr-row__track">
                            <motion.div
                                className="gr-row__fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${d.percentuale}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{
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
