import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun, Search, Lightbulb, ChevronRight, Bell, Check, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConsultazioneCard } from '../../../components/ConsultazioneCard';
import { QuickActionCards } from '../../../components/QuickActionCard';
import { fetchAllActivities, fetchProfile, fetchNotifiche, marcaNotificaLetta, marcaTutteNotificheLette } from '../../../services/api';
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
    const { theme, toggleTheme } = useTheme();

    const [profilo, setProfilo] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [notifiche, setNotifiche] = useState([]);
    const [showNotifiche, setShowNotifiche] = useState(false);
    const bellRef = useRef(null);

    const nonLette = notifiche.filter(n => !n.letta).length;

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';
    const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
    const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';

    useEffect(() => {
        loadActivities();
        fetchProfile()
            .then(data => { if (data?.data) setProfilo(data.data); })
            .catch(() => { });
        const loadNotifiche = () =>
            fetchNotifiche()
                .then(data => setNotifiche(data.notifiche || []))
                .catch(() => { });

        loadNotifiche();
        const notificheInterval = setInterval(loadNotifiche, 2 * 60 * 1000);
        return () => clearInterval(notificheInterval);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setShowNotifiche(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = () => setShowNotifiche(v => !v);

    const handleNotificaClick = async (n) => {
        if (!n.letta) {
            try {
                await marcaNotificaLetta(n._id);
                setNotifiche(prev => prev.map(x => x._id === n._id ? { ...x, letta: true } : x));
            } catch { }
        }
    };

    const handleLeggiTutte = async () => {
        try {
            await marcaTutteNotificheLette();
            setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
        } catch { }
    };

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

                    <div className="cd-notifiche-wrap" ref={bellRef}>
                        <button className="cd-bell" onClick={handleBellClick} aria-label="Notifiche">
                            <Bell size={17} />
                            {nonLette > 0 && (
                                <span className="cd-bell__badge">{nonLette > 9 ? '9+' : nonLette}</span>
                            )}
                        </button>

                        {showNotifiche && (
                            <div className="cd-notifiche-panel">
                                <div className="cd-notifiche-panel__header">
                                    <span className="cd-notifiche-panel__title">Notifiche</span>
                                    {nonLette > 0 && (
                                        <button className="cd-notifiche-panel__leggi-tutte" onClick={handleLeggiTutte}>
                                            Segna tutte come lette
                                        </button>
                                    )}
                                </div>
                                <div className="cd-notifiche-lista">
                                    {notifiche.length === 0 ? (
                                        <p className="cd-notifiche-vuote">Nessuna notifica</p>
                                    ) : (
                                        notifiche.map(n => (
                                            <div
                                                key={n._id}
                                                className={`cd-notifica ${!n.letta ? 'cd-notifica--nuova' : ''}`}
                                                onClick={() => handleNotificaClick(n)}
                                            >
                                                <div className={`cd-notifica__icon ${n.tipo === 'iniziativa_approvata' ? 'cd-notifica__icon--ok' : 'cd-notifica__icon--ko'}`}>
                                                    {n.tipo === 'iniziativa_approvata' ? <Check size={13} /> : <X size={13} />}
                                                </div>
                                                <div className="cd-notifica__body">
                                                    <p className="cd-notifica__msg">{n.messaggio}</p>
                                                    <span className="cd-notifica__time">{formatRelativeTime(n.createdAt)}</span>
                                                </div>
                                                {!n.letta && <span className="cd-notifica__dot" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
