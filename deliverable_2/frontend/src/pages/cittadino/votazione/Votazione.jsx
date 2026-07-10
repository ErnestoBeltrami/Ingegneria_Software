import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import './Votazione.css';
import { fetchVotazioneCittadino, submitVotazione, fetchProfile } from '../../../services/api';
import { getFase } from '../../../lib/fase';
import TopBarCittadino from '../../../components/TopBarCittadino';

export default function Votazione() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profilo, setProfilo] = useState(null);
    const [votazione, setVotazione] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadVotazione = async () => {
            try {
                const res = await fetchVotazioneCittadino(id);
                setVotazione(res.consultazione ?? res.votazione);
                if (res.voted) {
                    setHasVoted(true);
                }
            } catch (err) {
                setError(err.message || 'Errore nel caricamento della votazione');
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
        loadVotazione();
        loadProfile();
    }, [id]);

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';

    const handleVote = async () => {
        if (!selectedOptions.length || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await submitVotazione(votazione._id, selectedOptions);
            setHasVoted(true);
        } catch (err) {
            alert(err.message || "Errore durante l'invio del voto.");
        } finally {
            setIsSubmitting(false);
        }
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
                    <p>Caricamento votazione in corso...</p>
                </div>
            </div>
        );
    }

    if (error || !votazione) {
        return (
            <div className="cd-layout">
                <TopBarCittadino nome={nome} cognome={cognome} />
                <div className="cd-page">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>Torna indietro</span>
                    </button>
                    <div className="cd-status cd-status--error">
                        {error || 'Votazione non trovata.'}
                    </div>
                </div>
            </div>
        );
    }

    const domanda = votazione.ID_domanda;
    const fase = getFase(votazione);
    const isConclusa = fase === 'conclusa' || votazione.stato === 'concluso';
    const isInArrivo = fase === 'in_arrivo';
    const isMultipla = domanda.tipo === 'risposta_multipla';

    const badgeStato = isConclusa ? 'concluso' : isInArrivo ? 'in-arrivo' : 'attivo';
    const badgeTesto = isConclusa
        ? 'Votazione conclusa'
        : isInArrivo
            ? 'Votazione non ancora iniziata'
            : 'Votazione in corso';

    const toggleOption = (opzioneId) => {
        if (isMultipla) {
            setSelectedOptions(prev =>
                prev.includes(opzioneId)
                    ? prev.filter(id => id !== opzioneId)
                    : [...prev, opzioneId]
            );
        } else {
            setSelectedOptions([opzioneId]);
        }
    };

    return (
        <div className="cd-layout">
            <TopBarCittadino nome={nome} cognome={cognome} />
            <div className="cd-page">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Torna indietro</span>
                </button>

                <div className="votazione-header">
                    <div className="badge-container">
                        <span className={`badge-stato ${badgeStato}`}>
                            {badgeTesto}
                        </span>
                    </div>
                    <h1 className="votazione-title">{votazione.titolo}</h1>
                    <div className="votazione-meta">
                        <div className="meta-item">
                            <CalendarDays size={18} />
                            <span>Discussa il {formatDate(votazione.data_discussione)}</span>
                        </div>
                        <div className="meta-item deadline-meta">
                            <Clock size={18} />
                            <span>Scade il {formatDate(votazione.data_fine)}</span>
                        </div>
                    </div>
                </div>

                <section className="info-section">
                    <h2>Descrizione della proposta</h2>
                    <p className="descrizione-text">{votazione.descrizione}</p>
                </section>

                <section className="form-section">
                    {!hasVoted && isInArrivo ? (
                        <div className="conclusa-banner">
                            La votazione non è ancora iniziata. Apre il {formatDate(votazione.data_inizio)} e da quel momento potrai esprimere il tuo voto.
                        </div>
                    ) : !hasVoted && isConclusa ? (
                        <div className="conclusa-banner">
                            La votazione è terminata e non accetta più risposte.
                        </div>
                    ) : (
                        <div className="domanda-card">
                            <h2>Esprimi il tuo voto</h2>
                            <h3 className="domanda-testo">{domanda.titolo}</h3>
                            <p className="domanda-hint">
                                {isMultipla ? '(Puoi scegliere una o più opzioni)' : '(Scegli una singola opzione)'}
                            </p>

                            {hasVoted ? (
                                <div className="success-banner">
                                    <span className="success-icon">✓</span>
                                    <div>
                                        <h3>Voto registrato!</h3>
                                        <p>Il tuo voto è stato registrato con successo. Grazie per aver partecipato.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="options-container">
                                        {domanda.opzioni.map(opzione => {
                                            const selezionata = selectedOptions.includes(opzione._id);
                                            return (
                                                <label
                                                    key={opzione._id}
                                                    className={`option-label ${selezionata ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type={isMultipla ? 'checkbox' : 'radio'}
                                                        name="votazione_opzioni"
                                                        value={opzione._id}
                                                        checked={selezionata}
                                                        onChange={() => toggleOption(opzione._id)}
                                                    />
                                                    <span className={isMultipla ? 'checkbox-custom' : 'radio-custom'}></span>
                                                    <span className="option-text">{opzione.testo}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <div className="navigation-buttons">
                                        <button
                                            className="nav-btn nav-btn-primary"
                                            disabled={!selectedOptions.length || isSubmitting}
                                            onClick={handleVote}
                                        >
                                            {isSubmitting ? 'Invio in corso...' : 'Conferma il voto'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
