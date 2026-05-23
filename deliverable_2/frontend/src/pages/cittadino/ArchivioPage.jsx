import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    CalendarDays, ChevronRight, Archive,
    Search, Vote, ClipboardList
} from 'lucide-react';
import TopBarCittadino from '../../components/TopBarCittadino';
import { fetchProfile, fetchAllActivities } from '../../services/api';
import './dashboard/DashboardCittadinePage.css';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const tipoParam = searchParams.get('tipo');
    const activeTab = tipoParam === 'sondaggi' ? 'sondaggi' : 'votazioni';

    //dati
    const [profilo, setProfilo] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //ricerca testuale
    const [searchQuery, setSearchQuery] = useState('');

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

    //filtra per tipo e testo
    const byType = activities.filter(a =>
        activeTab === 'votazioni' ? a.tipo === 'votazione' : a.tipo === 'sondaggio'
    );
    const items = searchQuery.trim()
        ? byType.filter(a => a.titolo?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        : byType;

    const handleTabChange = (tab) => {
        setSearchQuery('');          // reset ricerca al cambio tab
        setSearchParams({ tipo: tab });
    };

    const handleRiepilogo = (item) => {
        const navState = { item, profilo };
        if (item.tipo === 'votazione') {
            navigate(`/cittadino/archivio/votazione/${item._id}`, { state: navState });
        } else {
            navigate(`/cittadino/archivio/sondaggio/${item._id}`, { state: navState });
        }
    };

    //empty state
    const renderEmptyState = () => {
        if (searchQuery.trim()) {
            return (
                <div className="archivio-empty">
                    <div className="archivio-empty__icon">
                        <Search size={36} strokeWidth={1.5} />
                    </div>
                    <p>Nessun risultato per &ldquo;<strong>{searchQuery.trim()}</strong>&rdquo;</p>
                </div>
            );
        }
        if (activeTab === 'votazioni') {
            return (
                <div className="archivio-empty">
                    <div className="archivio-empty__icon">
                        <Vote size={36} strokeWidth={1.5} />
                    </div>
                    <p>Nessuna votazione conclusa al momento</p>
                </div>
            );
        }
        return (
            <div className="archivio-empty">
                <div className="archivio-empty__icon">
                    <ClipboardList size={36} strokeWidth={1.5} />
                </div>
                <p>Nessun sondaggio concluso al momento</p>
            </div>
        );
    };

    return (
        <div className="cd-layout">
            <TopBarCittadino nome={nome} cognome={cognome} />

            <div className="cd-page">
                <header className="cd-header">
                    <h1 className="cd-header__title">
                        <Archive size={24} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                        Archivio
                    </h1>
                </header>

                {/* ── Search bar ── */}
                <div className="archivio-search">
                    <Search size={16} className="archivio-search__icon" />
                    <input
                        id="archivio-search-input"
                        type="text"
                        className="archivio-search__input"
                        placeholder="Cerca votazioni o sondaggi..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Cerca votazioni o sondaggi"
                    />
                    {searchQuery && (
                        <button
                            className="archivio-search__clear"
                            onClick={() => setSearchQuery('')}
                            aria-label="Cancella ricerca"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* ── Tab toggle ── */}
                <div className="archivio-tabs">
                    <button
                        id="tab-votazioni"
                        className={`archivio-tab ${activeTab === 'votazioni' ? 'archivio-tab--active' : ''}`}
                        onClick={() => handleTabChange('votazioni')}
                    >
                        Votazioni
                    </button>
                    <button
                        id="tab-sondaggi"
                        className={`archivio-tab ${activeTab === 'sondaggi' ? 'archivio-tab--active' : ''}`}
                        onClick={() => handleTabChange('sondaggi')}
                    >
                        Sondaggi
                    </button>
                </div>

                {/* ── Griglia card ── */}
                {loading && <div className="archivio-empty"><p>Caricamento...</p></div>}
                {error && !loading && <div className="archivio-empty"><p style={{ color: 'red' }}>⚠️ {error}</p></div>}
                {!loading && !error && items.length === 0 && renderEmptyState()}
                {!loading && !error && items.length > 0 && (
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
