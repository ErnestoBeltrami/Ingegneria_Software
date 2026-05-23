import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, Lightbulb, ChevronRight } from 'lucide-react';
import { ConsultazioneCard } from '../../../components/ConsultazioneCard';
import { QuickActionCards } from '../../../components/QuickActionCard';
import { fetchAllActivities, fetchProfile } from '../../../services/api';
import TopBarCittadino from '../../../components/TopBarCittadino';
import './DashboardCittadinePage.css';

function formatRelativeTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Adesso';
    if (mins < 60) return `${mins}m fa`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h fa`;
    return `${Math.floor(hours / 24)}g fa`;
}

const FILTER_MAP = {
    All: () => true,
    Votazione: (a) => a.tipo === 'votazione',
    Sondaggio: (a) => a.tipo === 'sondaggio',
};

const FILTER_LABELS = {
    All: 'Tutte le attività',
    Votazione: 'Votazioni attive',
    Sondaggio: 'Sondaggi attivi',
};

export default function DashboardCittadinePage() {
    const navigate = useNavigate();

    const [profilo, setProfilo] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';

    useEffect(() => {
        loadActivities();
        fetchProfile()
            .then(data => { if (data?.data) setProfilo(data.data); })
            .catch(() => { });
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

    const visible = activities
        .filter(a => a.stato !== 'concluso')
        .filter(FILTER_MAP[activeFilter] || (() => true))
        .filter(a => search === '' || a.titolo.toLowerCase().includes(search.toLowerCase()));

    const handleAction = (id, tipo) => {
        if (tipo === 'votazione') {
            navigate(`/cittadino/votazione/${id}`);
        } else if (tipo === 'sondaggio') {
            navigate(`/cittadino/sondaggio/${id}`);
        }
    };

    return (
        <div className="cd-layout">
            <TopBarCittadino nome={nome} cognome={cognome} />

            <div className="cd-page">
                <header className="cd-header">
                    <h1 className="cd-header__title">Ciao, {nome || 'Cittadino'} 👋</h1>
                </header>

                <QuickActionCards />

                <button className="cd-action-btn" onClick={() => navigate('/cittadino/iniziativa/crea')}>
                    <div className="cd-action-btn__icon">
                        <Lightbulb size={18} />
                    </div>
                    <div className="cd-action-btn__text">
                        <span className="cd-action-btn__title">Proponi un'idea</span>
                        <span className="cd-action-btn__subtitle">Invia una proposta alla comunità</span>
                    </div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
                </button>

                <div className="cd-search">
                    <Search size={16} color="rgba(128,128,128,0.5)" />
                    <input
                        type="text"
                        placeholder="Cerca una votazione o sondaggio…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="cd-search__input"
                    />
                </div>

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
