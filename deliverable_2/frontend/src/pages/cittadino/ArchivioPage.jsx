import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, CalendarDays, ChevronRight, Archive } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchProfile, fetchAllActivities } from '../../services/api';
import { useEffect } from 'react';
import './DashboardCittadinePage.css';   /* topbar + cd-layout + cd-page */
import './ArchivioPage.css';


function formatDate(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
}


export default function Archivio() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('votazioni');
    const [profilo, setProfilo] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile()
            .then(data => { if (data?.data) setProfilo(data.data); })
            .catch(() => { });

        fetchAllActivities()
            .then(data => {
                const concluded = data.filter(a => a.stato === 'concluso' || (a.data_fine && new Date(a.data_fine) < new Date()));
                setActivities(concluded);
            })
            .catch(err => setError(err.message || "Errore durante il caricamento"))
            .finally(() => setLoading(false));
    }, []);

    const nome = profilo?.nome || '';
    const cognome = profilo?.cognome || '';
    const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
    const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Cittadino';

    const items = activities.filter(a => activeTab === 'votazioni' ? a.tipo === 'votazione' : a.tipo === 'sondaggio');

    const handleRiepilogo = (item) => {
        if (item.tipo === 'votazione') {
            navigate(`/cittadino/archivio/votazione/${item._id}`);
        } else {
            navigate(`/cittadino/archivio/sondaggio/${item._id}`);
        }
    };

    return (
        <div className="cd-layout">
            {/* ── TopBar ── */}
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
                    <h1 className="cd-header__title">
                        <Archive size={24} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                        Archivio
                    </h1>
                </header>

                <div className="archivio-tabs">
                    <button
                        className={`archivio-tab ${activeTab === 'votazioni' ? 'archivio-tab--active' : ''}`}
                        onClick={() => setActiveTab('votazioni')}
                    >
                        Votazioni
                    </button>
                    <button
                        className={`archivio-tab ${activeTab === 'sondaggi' ? 'archivio-tab--active' : ''}`}
                        onClick={() => setActiveTab('sondaggi')}
                    >
                        Sondaggi
                    </button>
                </div>

                {/* ── Griglia card ── */}
                {loading && <div className="archivio-empty"><p>Caricamento...</p></div>}
                {error && !loading && <div className="archivio-empty"><p style={{ color: 'red' }}>⚠️ {error}</p></div>}
                {!loading && !error && items.length === 0 ? (
                    <div className="archivio-empty">
                        <div className="archivio-empty__icon">📂</div>
                        <p>Nessuna {activeTab === 'votazioni' ? 'votazione' : 'sondaggio'} archiviata.</p>
                    </div>
                ) : !loading && !error && (
                    <div className="archivio-grid">
                        {items.map(item => (
                            <div className="archivio-card" key={item._id}>
                                {/* Top: categoria + data */}
                                <div className="archivio-card__top">
                                    <span className={`archivio-card__categoria archivio-card__categoria--${item.tipo}`}>
                                        {item.categoria || (item.tipo === 'votazione' ? 'Votazione' : 'Sondaggio')}
                                    </span>
                                    <span className="archivio-card__data">
                                        <CalendarDays size={14} />
                                        {formatDate(item.data_fine)}
                                    </span>
                                </div>

                                <p className="archivio-card__titolo">{item.titolo}</p>

                                <button
                                    className="archivio-card__btn"
                                    onClick={() => handleRiepilogo(item)}
                                >
                                    Visualizza riepilogo
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
