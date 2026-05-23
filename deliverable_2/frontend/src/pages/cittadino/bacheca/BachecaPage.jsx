import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Search, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import IniziativaCard from './IniziativaCard';
import '../dashboard/DashboardCittadinePage.css';
import './BachecaPage.css';

const MOCK_INIZIATIVE = [
    {
        id: 1,
        categoria: 'Sicurezza',
        titolo: 'Illuminazione Parco Gocciadoro',
        descrizione: 'Alcuni lampioni non funzionano da mesi e non ci sentiamo sicuri la sera, vanno riparate.',
        sostenitori: 131,
        propostoDa: 'Ernesto OG',
    },
    {
        id: 2,
        categoria: 'Sport',
        titolo: 'Canestri del campo di basket P.zza Venezia',
        descrizione: 'Sono rotte da mesi e i miei bambini non riescono più a giocarci.',
        sostenitori: 70,
        propostoDa: 'GenWoo OG',
    },
    {
        id: 3,
        categoria: 'Verde',
        titolo: 'Più panchine al Parco delle Albere',
        descrizione: 'Il parco è molto frequentato ma ha poche panchine, specialmente nella zona nord.',
        sostenitori: 45,
        propostoDa: 'Maria R.',
    },
];

export default function BachecaPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

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

            <div className="bac-page">
                <header className="bac-header">
                    <div className="bac-header__left">
                        <h1 className="bac-header__title">Bacheca iniziative 📋</h1>
                        <p className="bac-header__subtitle">Proponi le tue idee e sostieni quelle degli altri</p>
                    </div>
                    <button className="bac-proponi-btn" onClick={() => navigate('/cittadino/iniziativa/crea')}>
                        + Proponi iniziativa
                    </button>
                </header>

                <div className="bac-search">
                    <Search size={16} className="bac-search__icon" />
                    <input
                        type="text"
                        className="bac-search__input"
                        placeholder="Cerca una proposta o iniziativa..."
                        readOnly
                    />
                    <SlidersHorizontal size={16} className="bac-search__filter" />
                </div>

                <p className="bac-count">{MOCK_INIZIATIVE.length} iniziative trovate</p>

                <div className="bac-grid">
                    {MOCK_INIZIATIVE.map(item => (
                        <IniziativaCard key={item.id} iniziativa={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}
