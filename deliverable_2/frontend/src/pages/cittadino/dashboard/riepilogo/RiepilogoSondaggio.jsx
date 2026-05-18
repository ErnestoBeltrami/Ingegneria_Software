import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { fetchProfile, fetchRiepilogoSondaggio, fetchSondaggioById } from '../../../../services/api';
import GraficoRisultati from '../../../../components/GraficoRisultati';
import '../../DashboardCittadinePage.css';
import './RiepilogoSondaggio.css';

const COLORI = ['#009966', '#e53e3e', '#3182ce', '#d69e2e', '#805ad5', '#a0aec0', '#dd6b20'];
const colore = (i) => COLORI[i % COLORI.length];

export default function RiepilogoSondaggio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [profilo, setProfilo] = useState(null);
    const [riepilogo, setRiepilogo] = useState(null);
    const [dettaglio, setDettaglio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [domandaCorrente, setDomandaCorrente] = useState(0);

    useEffect(() => {
        fetchProfile()
            .then(data => { if (data?.data) setProfilo(data.data); })
            .catch(() => { });

        Promise.all([
            fetchRiepilogoSondaggio(id),
            fetchSondaggioById(id),
        ])
            .then(([riepData, dettData]) => {
                setRiepilogo(riepData);
                setDettaglio(dettData.sondaggio);
            })
            .catch(err => setError(err.message || 'Errore nel caricamento'))
            .finally(() => setLoading(false));
    }, [id]);

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';
    const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
    const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';

    if (loading) return (
        <div className="cd-layout">
            <header className="cd-topbar"><span className="cd-topbar__logo">IoSonoTrento</span></header>
            <div className="crs-page"><p className="crs-status">Caricamento…</p></div>
        </div>
    );

    if (error) return (
        <div className="cd-layout">
            <header className="cd-topbar"><span className="cd-topbar__logo">IoSonoTrento</span></header>
            <div className="crs-page"><p className="crs-status crs-status--error">⚠️ {error}</p></div>
        </div>
    );

    const { sondaggio: titolo, totaleVotiUnici, riepilogoPerDomanda = [] } = riepilogo;
    const domandeFull = dettaglio?.ID_domande || [];
    const totaleDomande = riepilogoPerDomanda.length;
    const domanda = riepilogoPerDomanda[domandaCorrente];
    const domandaDettaglio = domandeFull[domandaCorrente];

    // Merge: parti da tutte le opzioni, aggiungi voti/percentuale dal riepilogo
    const datiGrafico = domanda && domandaDettaglio
        ? domandaDettaglio.opzioni.map((opzione, i) => {
            const risultato = domanda.risultati.find(
                r => r.opzioneId === opzione._id || r.testoOpzione === opzione.testo
            );
            return {
                etichetta: opzione.testo,
                percentuale: risultato ? risultato.percentuale : 0,
                colore: colore(i),
            };
        })
        : domanda
            ? domanda.risultati.map((r, i) => ({
                etichetta: r.testoOpzione,
                percentuale: r.percentuale,
                colore: colore(i),
            }))
            : [];

    const indietro = () => setDomandaCorrente(prev => Math.max(0, prev - 1));
    const avanti = () => setDomandaCorrente(prev => Math.min(totaleDomande - 1, prev + 1));

    return (
        <div className="cd-layout">
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

            <div className="crs-page">
                <header className="crs-header">
                    <button className="crs-back" onClick={() => navigate('/cittadino/archivio')}>
                        <ArrowLeft size={16} />
                        Torna all'archivio
                    </button>
                    <h1 className="crs-title">{titolo}</h1>
                    {dettaglio?.descrizione && (
                        <p className="crs-descrizione">{dettaglio.descrizione}</p>
                    )}
                    <div className="crs-participants">
                        <span className="crs-participants__num">{totaleVotiUnici}</span>
                        <span className="crs-participants__label">partecipanti totali</span>
                    </div>
                </header>

                {totaleDomande === 0 ? (
                    <p className="crs-status">Nessun risultato disponibile per questo sondaggio.</p>
                ) : (
                    <>
                        {/* Card domanda corrente */}
                        <div className="crs-card">
                            <span className="crs-badge">Domanda {domandaCorrente + 1} di {totaleDomande}</span>

                            <div className="crs-card__header">
                                <h3 className="crs-card__title">{domanda.titoloDomanda}</h3>
                            </div>

                            <GraficoRisultati dati={datiGrafico} />
                        </div>

                        {/* Navigazione avanti/indietro */}
                        <div className="crs-nav">
                            <button
                                className="crs-nav__btn"
                                onClick={indietro}
                                disabled={domandaCorrente === 0}
                            >
                                <ChevronLeft size={18} />
                                Precedente
                            </button>

                            <span className="crs-nav__indicator">
                                {domandaCorrente + 1} / {totaleDomande}
                            </span>

                            <button
                                className="crs-nav__btn"
                                onClick={avanti}
                                disabled={domandaCorrente === totaleDomande - 1}
                            >
                                Successiva
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
