import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import TopBarCittadino from '../../../components/TopBarCittadino';
import BackButton from '../../../components/BackButton';
import { fetchProfile, fetchRiepilogoVotazione } from '../../../services/api';
import GraficoRisultati from '../../../components/GraficoRisultati';
import '../dashboard/DashboardCittadinePage.css';
import './RiepilogoVotazione.css';

/* Colori per opzioni */
const COLORI = ['#009966', '#e53e3e', '#a0aec0', '#3182ce', '#d69e2e', '#805ad5', '#dd6b20'];
const colore = (i) => COLORI[i % COLORI.length];

export default function RiepilogoVotazione() {
    const { id } = useParams();
    const { state } = useLocation();
    const [profilo, setProfilo] = useState(state?.profilo ?? null);
    const [riepilogo, setRiepilogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        if (!state?.profilo) {
            fetchProfile()
                .then(data => { if (!cancelled && data?.data) setProfilo(data.data); })
                .catch(() => { });
        }

        fetchRiepilogoVotazione(id)
            .then(data => { if (!cancelled) setRiepilogo(data); })
            .catch(err => { if (!cancelled) setError(err.message || 'Errore nel caricamento'); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [id]);

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';

    if (loading) return (
        <div className="cd-layout">
            <TopBarCittadino nome={nome} cognome={cognome} />
            <div className="crv-page"><p className="crv-status">Caricamento…</p></div>
        </div>
    );

    if (error) return (
        <div className="cd-layout">
            <TopBarCittadino nome={nome} cognome={cognome} />
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
            <TopBarCittadino nome={nome} cognome={cognome} />

            <div className="crv-page">
                <header className="crv-header">
                    <BackButton variant="subtle" label="Torna all'archivio" to="/cittadino/archivio" />
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
