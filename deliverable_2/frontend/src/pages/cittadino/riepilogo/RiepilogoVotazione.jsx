import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { fetchProfile, fetchRiepilogoVotazione } from '../../../services/api';
import GraficoRisultati from '../../../components/GraficoRisultati';
import '../dashboard/DashboardCittadinePage.css';
import './RiepilogoVotazione.css';

/* Colori per opzioni */
const COLORI = ['#009966', '#e53e3e', '#a0aec0', '#3182ce', '#d69e2e', '#805ad5', '#dd6b20'];
const colore = (i) => COLORI[i % COLORI.length];

export default function RiepilogoVotazione() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { theme, toggleTheme } = useTheme();

    const [profilo, setProfilo] = useState(state?.profilo ?? null);
    const [riepilogo, setRiepilogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!state?.profilo) {
            fetchProfile()
                .then(data => { if (data?.data) setProfilo(data.data); })
                .catch(() => { });
        }

        fetchRiepilogoVotazione(id)
            .then(data => setRiepilogo(data))
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
            <div className="crv-page"><p className="crv-status">Caricamento…</p></div>
        </div>
    );

    if (error) return (
        <div className="cd-layout">
            <header className="cd-topbar"><span className="cd-topbar__logo">IoSonoTrento</span></header>
            <div className="crv-page"><p className="crv-status crv-status--error">⚠️ {error}</p></div>
        </div>
    );

    const { votazione: titolo, totaleVoti, risultati = [] } = riepilogo;
    const datiGrafico = [...risultati]
        .sort((a, b) => b.voti - a.voti)
        .map((r, i) => ({
            etichetta: r.testoOpzione,
            percentuale: r.percentuale,
            colore: colore(i),
        }));

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

            <div className="crv-page">
                <header className="crv-header">
                    <button className="crv-back" onClick={() => navigate('/cittadino/archivio')}>
                        <ArrowLeft size={16} />
                        Torna all'archivio
                    </button>
                    <h1 className="crv-title">{titolo}</h1>
                    <div className="crv-participants">
                        <span className="crv-participants__num">{totaleVoti}</span>
                        <span className="crv-participants__label">voti totali</span>
                    </div>
                </header>

                {totaleVoti === 0 ? (
                    <p className="crv-status">Nessun voto registrato.</p>
                ) : (
                    <GraficoRisultati dati={datiGrafico} />
                )}
            </div>
        </div>
    );
}
