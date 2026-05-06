import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import './Sondaggio.css';

// Dati hardcoded simulando la struttura di un Sondaggio
const HARDCODED_SONDAGGIO = {
    _id: "sond_456",
    tipo: "sondaggio",
    stato: "attivo",
    titolo: "Riqualificazione di Piazza Fiera",
    descrizione: "Il comune di Trento intende raccogliere le opinioni della cittadinanza sulle priorità per la riqualificazione di Piazza Fiera. Il sondaggio ha l'obiettivo di individuare le esigenze più sentite dai residenti in merito ad aree verdi, mobilità e arredo urbano. La tua opinione è fondamentale per il progetto finale.",
    data_inizio: "2026-05-10T00:00:00.000Z",
    data_fine: "2026-06-15T23:59:59.000Z",
    data_discussione: "2026-05-02T00:00:00.000Z",
    domande: [
        {
            _id: "dom_1",
            titolo: "Quale dovrebbe essere la priorità principale?",
            tipo: "risposta_singola",
            opzioni: [
                { _id: "op_1_1", testo: "Aumento delle aree verdi" },
                { _id: "op_1_2", testo: "Più parcheggi per residenti" },
                { _id: "op_1_3", testo: "Aree pedonali più ampie" }
            ]
        },
        {
            _id: "dom_2",
            titolo: "Quali nuovi arredi urbani riterresti utili? (Puoi scegliere più opzioni)",
            tipo: "risposta_multipla",
            opzioni: [
                { _id: "op_2_1", testo: "Nuove panchine" },
                { _id: "op_2_2", testo: "Fontanelle pubbliche" },
                { _id: "op_2_3", testo: "Cestini per la raccolta differenziata" },
                { _id: "op_2_4", testo: "Rastrelliere per biciclette" }
            ]
        }
    ]
};

export default function Sondaggio() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Mappa ID domanda -> ID opzione (o array di ID opzioni per scelte multiple)
    const [answers, setAnswers] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleOptionChange = (domandaId, opzioneId, tipoDomanda) => {
        setAnswers(prev => {
            if (tipoDomanda === 'risposta_singola') {
                return { ...prev, [domandaId]: opzioneId };
            } else {
                // Risposta multipla
                const currentSelections = prev[domandaId] || [];
                if (currentSelections.includes(opzioneId)) {
                    return { ...prev, [domandaId]: currentSelections.filter(id => id !== opzioneId) };
                } else {
                    return { ...prev, [domandaId]: [...currentSelections, opzioneId] };
                }
            }
        });
    };

    const isFormValid = () => {
        // Tutte le domande devono avere una risposta
        return HARDCODED_SONDAGGIO.domande.every(d => {
            const answer = answers[d._id];
            if (d.tipo === 'risposta_singola') return !!answer;
            return answer && answer.length > 0;
        });
    };

    const handleSubmit = () => {
        if (!isFormValid()) return;
        setHasSubmitted(true);
        console.log("Risposte registrate:", answers);
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="sondaggio-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>Torna indietro</span>
            </button>

            <div className="sondaggio-header">
                <div className="badge-container">
                    <span className="badge-stato attivo">Sondaggio aperto</span>
                </div>
                <h1 className="sondaggio-title">{HARDCODED_SONDAGGIO.titolo}</h1>
                <div className="sondaggio-meta">
                    <div className="meta-item">
                        <CalendarDays size={18} />
                        <span>Discusso il {formatDate(HARDCODED_SONDAGGIO.data_discussione)}</span>
                    </div>
                    <div className="meta-item deadline-meta">
                        <Clock size={18} />
                        <span>Scade il {formatDate(HARDCODED_SONDAGGIO.data_fine)}</span>
                    </div>
                </div>
            </div>

            <div className="sondaggio-content-stack">
                <section className="info-section">
                    <h2>Descrizione</h2>
                    <p className="descrizione-text">{HARDCODED_SONDAGGIO.descrizione}</p>
                </section>

                <section className="form-section">
                    <h2>Compila il sondaggio</h2>
                    
                    {hasSubmitted ? (
                        <div className="success-banner">
                            <span className="success-icon">✓</span>
                            <div>
                                <h3>Sondaggio completato!</h3>
                                <p>Le tue risposte sono state registrate. Grazie per il tuo contributo.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="domande-list">
                            {HARDCODED_SONDAGGIO.domande.map((domanda, index) => (
                                <div key={domanda._id} className="domanda-card">
                                    <h3 className="domanda-testo">
                                        <span className="domanda-numero">{index + 1}.</span> {domanda.titolo}
                                    </h3>
                                    <div className="options-container">
                                        {domanda.opzioni.map(opzione => {
                                            const isMultipla = domanda.tipo === 'risposta_multipla';
                                            const isSelected = isMultipla 
                                                ? (answers[domanda._id] || []).includes(opzione._id)
                                                : answers[domanda._id] === opzione._id;

                                            return (
                                                <label 
                                                    key={opzione._id} 
                                                    className={`option-label ${isSelected ? 'selected' : ''}`}
                                                >
                                                    <input 
                                                        type={isMultipla ? "checkbox" : "radio"} 
                                                        name={`domanda_${domanda._id}`} 
                                                        value={opzione._id}
                                                        checked={isSelected}
                                                        onChange={() => handleOptionChange(domanda._id, opzione._id, domanda.tipo)}
                                                    />
                                                    <span className={isMultipla ? "checkbox-custom" : "radio-custom"}></span>
                                                    <span className="option-text">{opzione.testo}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            
                            <button 
                                className="submit-sondaggio-btn" 
                                disabled={!isFormValid()}
                                onClick={handleSubmit}
                            >
                                Invia Risposte
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
