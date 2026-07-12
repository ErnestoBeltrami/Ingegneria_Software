import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import './VotaSondaggio.css';
import { fetchSondaggioCittadino, submitSondaggio, fetchProfile } from '../../../services/api';
import TopBarCittadino from '../../../components/TopBarCittadino';
import BackButton from '../../../components/BackButton';

export default function VotaSondaggio() {
    const { id } = useParams();
    const [profilo, setProfilo] = useState(null);

    const [sondaggio, setSondaggio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadSondaggio = async () => {
            try {
                const res = await fetchSondaggioCittadino(id);
                setSondaggio(res.consultazione ?? res.sondaggio);
                if (res.voted) {
                    setHasSubmitted(true);
                }
            } catch (err) {
                setError(err.message || 'Errore nel caricamento del sondaggio');
            } finally {
                setLoading(false);
            }
        };
        const loadProfile = async () => {
            try {
                const res = await fetchProfile();
                setProfilo(res);
            } catch (err) {
                console.warn('Errore fetch profilo', err);
            }
        };
        loadSondaggio();
        loadProfile();
    }, [id]);

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';

    const handleOptionChange = (domandaId, opzioneId, tipoDomanda) => {
        setAnswers(prev => {
            if (tipoDomanda === 'risposta_singola') {
                return { ...prev, [domandaId]: [opzioneId] };
            } else {
                const currentSelections = prev[domandaId] || [];
                if (currentSelections.includes(opzioneId)) {
                    return { ...prev, [domandaId]: currentSelections.filter(id => id !== opzioneId) };
                } else {
                    return { ...prev, [domandaId]: [...currentSelections, opzioneId] };
                }
            }
        });
    };

    const isCurrentQuestionValid = () => {
        if (!sondaggio) return false;
        const currentQuestion = sondaggio.ID_domande[currentQuestionIndex];
        const answer = answers[currentQuestion._id];
        return answer && answer.length > 0;
    };

    const handleSubmit = async () => {
        if (!isCurrentQuestionValid() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const dettagliRisposte = Object.keys(answers).map(domandaId => ({
                ID_domanda: domandaId,
                opzioniScelte: answers[domandaId]
            }));

            await submitSondaggio(id, dettagliRisposte);
            setHasSubmitted(true);
        } catch (err) {
            alert(err.message || "Errore durante l'invio del sondaggio.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (isCurrentQuestionValid()) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setCurrentQuestionIndex(prev => prev - 1);
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="cd-layout">
                <TopBarCittadino nome={nome} cognome={cognome} />
                <div className="cd-page">
                    <p>Caricamento sondaggio in corso...</p>
                </div>
            </div>
        );
    }

    if (error || !sondaggio) {
        return (
            <div className="cd-layout">
                <TopBarCittadino nome={nome} cognome={cognome} />
                <div className="cd-page">
                    <BackButton to="/cittadino/dashboard" />
                    <div className="cd-status cd-status--error">
                        {error || "Sondaggio non trovato."}
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = sondaggio.ID_domande[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === sondaggio.ID_domande.length - 1;

    return (
        <div className="cd-layout">
            <TopBarCittadino nome={nome} cognome={cognome} />
            <div className="cd-page">
                <BackButton to="/cittadino/dashboard" />

                <div className="sondaggio-header">
                    <div className="badge-container">
                        <span className="badge-stato attivo">Sondaggio in corso</span>
                    </div>
                    <h1 className="sondaggio-title">{sondaggio.titolo}</h1>
                    <div className="sondaggio-meta">
                        <div className="meta-item">
                            <CalendarDays size={18} />
                            <span>Discusso il {formatDate(sondaggio.data_discussione)}</span>
                        </div>
                        <div className="meta-item deadline-meta">
                            <Clock size={18} />
                            <span>Scade il {formatDate(sondaggio.data_fine)}</span>
                        </div>
                    </div>
                </div>

                <section className="info-section">
                    <h2>Descrizione</h2>
                    <p className="descrizione-text">{sondaggio.descrizione}</p>
                </section>

                <section className="form-section">
                    {hasSubmitted ? (
                        <div className="success-banner">
                            <span className="success-icon">✓</span>
                            <div>
                                <h3>Sondaggio completato!</h3>
                                <p>Le tue risposte sono state registrate con successo. Grazie per il tuo contributo!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="domanda-wizard">
                            <div className="wizard-progress">
                                <span className="domanda-numero">
                                    Domanda {currentQuestionIndex + 1} di {sondaggio.ID_domande.length}
                                </span>
                            </div>

                            <div className="domanda-card">
                                <h3 className="domanda-testo">
                                    {currentQuestion.titolo}
                                </h3>
                                <p className="domanda-hint">
                                    {currentQuestion.tipo === 'risposta_multipla' ? "(Puoi scegliere più opzioni)" : "(Scegli una singola opzione)"}
                                </p>

                                <div className="options-container">
                                    {currentQuestion.opzioni.map(opzione => {
                                        const isMultipla = currentQuestion.tipo === 'risposta_multipla';
                                        const isSelected = (answers[currentQuestion._id] || []).includes(opzione._id);

                                        return (
                                            <label
                                                key={opzione._id}
                                                className={`option-label ${isSelected ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type={isMultipla ? "checkbox" : "radio"}
                                                    name={`domanda_${currentQuestion._id}`}
                                                    value={opzione._id}
                                                    checked={isSelected}
                                                    onChange={() => handleOptionChange(currentQuestion._id, opzione._id, currentQuestion.tipo)}
                                                />
                                                <span className={isMultipla ? "checkbox-custom" : "radio-custom"}></span>
                                                <span className="option-text">{opzione.testo}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="navigation-buttons">
                                <button
                                    className="nav-btn nav-btn-secondary"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={handlePrev}
                                >
                                    <ChevronLeft size={20} />
                                    Indietro
                                </button>

                                {isLastQuestion ? (
                                    <button
                                        className="nav-btn nav-btn-primary"
                                        disabled={!isCurrentQuestionValid() || isSubmitting}
                                        onClick={handleSubmit}
                                    >
                                        {isSubmitting ? "Invio in corso..." : "Invia Risposte"}
                                    </button>
                                ) : (
                                    <button
                                        className="nav-btn nav-btn-primary"
                                        disabled={!isCurrentQuestionValid()}
                                        onClick={handleNext}
                                    >
                                        Avanti
                                        <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
