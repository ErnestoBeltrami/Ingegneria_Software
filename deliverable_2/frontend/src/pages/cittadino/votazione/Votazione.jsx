import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CalendarDays, Moon, Sun } from 'lucide-react';
import './Votazione.css';
import { fetchVotazioneCittadino, submitVotazione, fetchProfile } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Votazione() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [profilo, setProfilo] = useState(null);
    const [votazione, setVotazione] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadVotazione = async () => {
            try {
                const res = await fetchVotazioneCittadino(id);
                setVotazione(res.votazione);
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
    const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
    const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';

    const handleVote = async () => {
        if (!selectedOption || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await submitVotazione(votazione._id, selectedOption);
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

    const renderTopbar = () => (
        <header className="cd-topbar">
            <span className="cd-topbar__logo">IoSonoTrento</span>
            <div className="cd-topbar__right">
                <button
                    className="cd-topbar__theme"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
                >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <div className="cd-topbar__user" onClick={() => navigate('/cittadino/profilo')}>
                    <div className="cd-topbar__avatar">{initials}</div>
                    <span className="cd-topbar__name">{fullName}</span>
                </div>
            </div>
        </header>
    );

    if (loading) {
        return (
            <div className="cd-layout">
                {renderTopbar()}
                <div className="cd-page">
                    <p>Caricamento votazione in corso...</p>
                </div>
            </div>
        );
    }

    if (error || !votazione) {
        return (
            <div className="cd-layout">
                {renderTopbar()}
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
    const isConclusa = votazione.stato === 'concluso';

    return (
        <div className="cd-layout">
            {renderTopbar()}
            <div className="cd-page">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Torna indietro</span>
                </button>

                <div className="votazione-header">
                    <div className="badge-container">
                        <span className={`badge-stato ${votazione.stato}`}>
                            {isConclusa ? 'Votazione conclusa' : 'Votazione in corso'}
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
                    <div className="domanda-card">
                        <h2>Esprimi il tuo voto</h2>
                        <h3 className="domanda-testo">{domanda.titolo}</h3>
                        <p className="domanda-hint">(Scegli una singola opzione)</p>

                        {hasVoted ? (
                            <div className="success-banner">
                                <span className="success-icon">✓</span>
                                <div>
                                    <h3>Voto registrato!</h3>
                                    <p>Il tuo voto è stato registrato con successo. Grazie per aver partecipato.</p>
                                </div>
                            </div>
                        ) : isConclusa ? (
                            <div className="conclusa-banner">
                                La votazione è terminata e non accetta più risposte.
                            </div>
                        ) : (
                            <>
                                <div className="options-container">
                                    {domanda.opzioni.map(opzione => (
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
                                </div>
                                <div className="navigation-buttons">
                                    <button
                                        className="nav-btn nav-btn-primary"
                                        disabled={!selectedOption || isSubmitting}
                                        onClick={handleVote}
                                    >
                                        {isSubmitting ? 'Invio in corso...' : 'Conferma il voto'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
