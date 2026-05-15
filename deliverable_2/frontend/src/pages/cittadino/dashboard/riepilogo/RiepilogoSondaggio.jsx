import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import '../../DashboardCittadinePage.css';
import '../riepilogo/RiepilogoVotazione.css';

/* ── Mock data ── */
const MOCK_SONDAGGIO = {
    titolo: 'Riqualificazione di Piazza Fiera: priorità dei cittadini',
    descrizione: 'Sondaggio rivolto ai residenti del Comune di Trento per raccogliere opinioni sulle priorità di intervento nella riqualificazione di Piazza Fiera. I risultati saranno utilizzati per orientare le scelte progettuali.',
    domande: [
        {
            id: 'q1',
            titolo: 'Quale aspetto ritieni più importante nella riqualificazione?',
            risultati: [
                { etichetta: 'Aree verdi', percentuale: 42, colore: '#009966' },
                { etichetta: 'Parcheggi', percentuale: 28, colore: '#e53e3e' },
                { etichetta: 'Spazi pedonali', percentuale: 20, colore: '#3182ce' },
                { etichetta: 'Piste ciclabili', percentuale: 10, colore: '#d69e2e' },
            ],
        },
        {
            id: 'q2',
            titolo: 'Con quale frequenza utilizzi Piazza Fiera?',
            risultati: [
                { etichetta: 'Ogni giorno', percentuale: 15, colore: '#009966' },
                { etichetta: 'Qualche volta a settimana', percentuale: 35, colore: '#3182ce' },
                { etichetta: 'Raramente', percentuale: 38, colore: '#d69e2e' },
                { etichetta: 'Mai', percentuale: 12, colore: '#a0aec0' },
            ],
        },
        {
            id: 'q3',
            titolo: 'Saresti favorevole alla chiusura al traffico nei weekend?',
            risultati: [
                { etichetta: 'Sì', percentuale: 64, colore: '#009966' },
                { etichetta: 'No', percentuale: 25, colore: '#e53e3e' },
                { etichetta: 'Non so', percentuale: 11, colore: '#a0aec0' },
            ],
        },
    ],
};

export default function RiepilogoSondaggio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Mock – in futuro verrà sostituito con useEffect + API
    const sondaggio = MOCK_SONDAGGIO;

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
                </div>
            </header>

            <div className="crv-page">
                <button className="crv-back" onClick={() => navigate('/cittadino/archivio')}>
                    <ArrowLeft size={16} />
                    Torna all'archivio
                </button>

                <h1 className="crv-title">{sondaggio.titolo}</h1>
                <p>
                    {sondaggio.descrizione}
                </p>

                {/* Card per ogni domanda */}
                {sondaggio.domande.map((domanda, index) => (
                    <div key={domanda.id}>
                        <p>
                            Domanda {index + 1}
                        </p>
                        <h3>
                            {domanda.titolo}
                        </h3>

                        {/* Corpo card — qui verrà inserito GraficoRisultati */}
                    </div>
                ))}
            </div>
        </div>
    );
}
