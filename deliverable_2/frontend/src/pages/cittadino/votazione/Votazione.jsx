import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import './Votazione.css';

// Dati hardcoded simulando la struttura di una Consultazione di tipo 'votazione'
// che include una Domanda con opzioni
const HARDCODED_VOTAZIONE = {
    _id: "vot_123",
    tipo: "votazione",
    stato: "attivo",
    titolo: "Inserimento di cibo vegetariano nelle mense",
    descrizione: "Si propone l'inserimento di opzioni vegetariane in tutte le mense scolastiche e comunali, al fine di promuovere un'alimentazione più sostenibile e inclusiva. L'obiettivo è garantire pasti bilanciati e ridurre l'impatto ambientale legato al consumo di carne.",
    data_inizio: "2026-05-01T00:00:00.000Z",
    data_fine: "2026-05-30T23:59:59.000Z",
    data_discussione: "2026-04-15T00:00:00.000Z",
    domanda: {
        _id: "dom_123",
        titolo: "Sei favorevole all'inserimento obbligatorio di un'opzione vegetariana in tutti i menù delle mense comunali?",
        tipo: "risposta_singola",
        opzioni: [
            { _id: "op_1", testo: "Sì, sono favorevole" },
            { _id: "op_2", testo: "No, sono contrario" },
            { _id: "op_3", testo: "Mi astengo" }
        ]
    }
};

export default function Votazione() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    // TODO fetch api votazione

    const handleVote = () => {
        if (!selectedOption) return;
        // TODO API POST per inviare il voto associato all'opzione
        setHasVoted(true);
        console.log("Voto registrato per l'opzione:", selectedOption);
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="votazione-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>Torna indietro</span>
            </button>

            <div className="votazione-header">
                <div className="badge-container">
                    <span className="badge-stato attivo">Votazione in corso</span>
                </div>
                <h1 className="votazione-title">{HARDCODED_VOTAZIONE.titolo}</h1>
                <div className="votazione-meta">
                    <div className="meta-item">
                        <CalendarDays size={18} />
                        <span>Discussa il {formatDate(HARDCODED_VOTAZIONE.data_discussione)}</span>
                    </div>
                    <div className="meta-item deadline-meta">
                        <Clock size={18} />
                        <span>Scade il {formatDate(HARDCODED_VOTAZIONE.data_fine)}</span>
                    </div>
                </div>
            </div>

            <div className="votazione-content-stack">
                <section className="info-section">
                    <h2>Descrizione della proposta</h2>
                    <p className="descrizione-text">{HARDCODED_VOTAZIONE.descrizione}</p>
                </section>

                <section className="form-section">
                    <h2>Esprimi il tuo voto</h2>
                        <p className="domanda-testo">{HARDCODED_VOTAZIONE.domanda.titolo}</p>
                        
                        {hasVoted ? (
                            <div className="success-banner">
                                <span className="success-icon">✓</span>
                                <div>
                                    <h3>Voto registrato!</h3>
                                    <p>Il tuo voto è stato registrato con successo. Grazie per aver partecipato.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="options-container">
                                {HARDCODED_VOTAZIONE.domanda.opzioni.map(opzione => (
                                    <label 
                                        key={opzione._id} 
                                        className={`option-label ${selectedOption === opzione._id ? 'selected' : ''}`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="votazione_radio" 
                                            value={opzione._id}
                                            checked={selectedOption === opzione._id}
                                            onChange={() => setSelectedOption(opzione._id)}
                                        />
                                        <span className="radio-custom"></span>
                                        <span className="option-text">{opzione.testo}</span>
                                    </label>
                                ))}
                                <button 
                                    className="submit-vote-btn" 
                                    disabled={!selectedOption}
                                    onClick={handleVote}
                                >
                                    Conferma il voto
                                </button>
                            </div>
                        )}
                    </section>
            </div>
        </div>
    );
}
