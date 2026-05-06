import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ConsultazioneCard } from '../../components/ConsultazioneCard';
import { QuickActionCards } from '../../components/QuickActionCard';
import { fetchAllActivities, fetchProfile } from '../../services/api';
import './DashboardCittadinePage.css';

const FILTER_MAP = {
    All:       () => true,
    Votazione: (a) => a.tipo === 'votazione',
    Sondaggio: (a) => a.tipo === 'sondaggio',
};

const FILTER_LABELS = {
    All:       'Tutte le attività',
    Votazione: 'Votazioni attive',
    Sondaggio: 'Sondaggi attivi',
};

export default function DashboardCittadinePage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [profilo,      setProfilo]      = useState(null);
    const [activities,   setActivities]   = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);

    const nome     = profilo?.nome     || '';
    const cognome  = profilo?.cognome  || '';
    const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
    const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';

    useEffect(() => {
        loadActivities();
        fetchProfile()
            .then(data => { if (data?.data) setProfilo(data.data); })
            .catch(() => {});
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            setActivities(await fetchAllActivities());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isNotExpired = (a) => !a.data_fine || new Date(a.data_fine) >= new Date();

    const visible = activities
        .filter(FILTER_MAP[activeFilter] || (() => true))
        .filter(isNotExpired);

    const handleAction = (id) =>
        setActivities(prev => prev.map(a => a._id === id ? { ...a, voted: !a.voted } : a));

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

            <div className="cd-page">
                <header className="cd-header">
                    <h1 className="cd-header__title">Ciao, {nome || 'Cittadino'} 👋</h1>
                </header>

                <QuickActionCards />

                <section className="cd-activity">
                    <h2 className="cd-activity__title">
                        <Activity size={16} color="#00c47a" />
                        Attività recenti
                    </h2>

                    <div className="cd-filters">
                        {Object.keys(FILTER_MAP).map(key => (
                            <button
                                key={key}
                                className={`cd-filter-btn ${activeFilter === key ? 'cd-filter-btn--active' : ''}`}
                                onClick={() => setActiveFilter(key)}
                            >
                                {FILTER_LABELS[key]}
                            </button>
                        ))}
                    </div>

                    {loading && <p className="cd-status">Caricamento…</p>}
                    {error && !loading && <p className="cd-status cd-status--error">⚠️ {error}</p>}
                    {!loading && !error && visible.length === 0 && (
                        <p className="cd-status">Nessuna attività disponibile.</p>
                    )}
                    {!loading && !error && visible.length > 0 && (
                        <div className="cd-activity-grid">
                            {visible.map(a => (
                                <ConsultazioneCard
                                    key={a._id}
                                    activity={a}
                                    mode="cittadino"
                                    voted={a.voted}
                                    onAction={handleAction}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
