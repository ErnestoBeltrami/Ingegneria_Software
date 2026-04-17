import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Vote, BarChart2, LayoutGrid,
  Plus, Search, Activity, ChevronRight,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import './DashboardOperatorePage.css';

const NAV_CARDS = [
  {
    icon: Vote,
    iconBg: 'rgba(31,58,137,0.1)',
    iconColor: '#1f3a89',
    label: 'Gestione votazioni',
    desc: 'Crea e monitora le votazioni',
    linkColor: '#1f3a89',
    href: '/votazioni',
  },
  {
    icon: BarChart2,
    iconBg: 'rgba(0,122,82,0.1)',
    iconColor: '#007a52',
    label: 'Gestione sondaggi',
    desc: 'Crea e gestisci i sondaggi',
    linkColor: '#007a52',
    href: '/sondaggi',
  },
  {
    icon: LayoutGrid,
    iconBg: '#fffbeb',
    iconColor: '#92400e',
    label: 'Moderazione bacheca',
    desc: 'Gestisci le proposte dei cittadini',
    linkColor: '#92400e',
    href: '/moderazione',
  },
];

const FILTERS = ['Tutte le attività', 'Votazioni attive', 'Sondaggi attivi', 'Proposte in arrivo'];

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

async function fetchWithAuth(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Errore ${res.status}`);
  return res.json();
}

export default function DashboardOperatorePage() {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';
  const nomeOperatore = nome || 'Operatore';

  const [filtro, setFiltro] = useState('Tutte le attività');
  const [search, setSearch] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (filtro === 'Proposte in arrivo') {
          setActivities([]);
          return;
        }

        if (filtro === 'Votazioni attive') {
          const data = await fetchWithAuth('/votazioni?stato=attivo');
          setActivities(data.votazioni ?? []);
          return;
        }

        if (filtro === 'Sondaggi attivi') {
          const data = await fetchWithAuth('/sondaggio?stato=attivo');
          setActivities(data.sondaggi ?? data.votazioni ?? []);
          return;
        }

        // Tutte le attività
        const [vData, sData] = await Promise.all([
          fetchWithAuth('/votazioni?stato=attivo'),
          fetchWithAuth('/sondaggio?stato=attivo'),
        ]);
        const merged = [
          ...(vData.votazioni ?? []),
          ...(sData.sondaggi ?? sData.votazioni ?? []),
        ].sort((a, b) => new Date(b.data_fine) - new Date(a.data_fine));
        setActivities(merged);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filtro]);

  const attivitàFiltrate = activities.filter((a) =>
    search === '' || a.titolo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <TopBar nome={nome} cognome={cognome} />
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <p className="dashboard-header__label">Pannello di gestione</p>
        <h1 className="dashboard-header__title">Ciao, {nomeOperatore} 👋</h1>
        <p className="dashboard-header__subtitle">Gestisci le votazioni e le proposte dei cittadini</p>
      </header>

      {/* Nav cards */}
      <div className="dashboard-nav-cards">
        {NAV_CARDS.map(({ icon: Icon, iconBg, iconColor, label, desc, linkColor, href }) => (
          <Link key={label} to={href} className="nav-card">
            <div className="nav-card__icon" style={{ background: iconBg }}>
              <Icon size={20} color={iconColor} />
            </div>
            <div className="nav-card__body">
              <p className="nav-card__label">{label}</p>
              <p className="nav-card__desc">{desc}</p>
            </div>
            <span className="nav-card__link" style={{ color: linkColor }}>
              Vai <ChevronRight size={12} />
            </span>
          </Link>
        ))}
      </div>

      {/* Action buttons */}
      <div className="dashboard-actions">
        <button className="action-btn action-btn--primary" onClick={() => navigate('/votazioni/crea')}>
          <div className="action-btn__icon">
            <Plus size={18} />
          </div>
          <div className="action-btn__text">
            <span className="action-btn__title">Crea una nuova votazione</span>
            <span className="action-btn__subtitle">Avvia una nuova votazione pubblica</span>
          </div>
          <ChevronRight size={16} />
        </button>
        <button className="action-btn action-btn--secondary" onClick={() => navigate('/sondaggi/crea')}>
          <div className="action-btn__icon action-btn__icon--green">
            <Plus size={18} />
          </div>
          <div className="action-btn__text">
            <span className="action-btn__title action-btn__title--dark">Crea un nuovo sondaggio</span>
            <span className="action-btn__subtitle action-btn__subtitle--dark">Raccogli feedback dalla comunità</span>
          </div>
          <ChevronRight size={16} color="#6a7282" />
        </button>
      </div>

      {/* Search */}
      <div className="dashboard-search">
        <Search size={16} color="#99a1af" />
        <input
          type="text"
          placeholder="Ricerca una proposta o iniziativa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dashboard-search__input"
        />
      </div>

      {/* Activity section */}
      <section className="dashboard-activity">
        <h2 className="dashboard-activity__title">
          <Activity size={16} color="#1f3a89" />
          Attività recenti
        </h2>

        <div className="dashboard-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filtro === f ? 'filter-btn--active' : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && <p className="activity-status">Caricamento…</p>}
        {error && <p className="activity-status activity-status--error">{error}</p>}

        {!loading && !error && attivitàFiltrate.length === 0 && (
          <p className="activity-status">Nessuna attività trovata.</p>
        )}

        {!loading && !error && attivitàFiltrate.length > 0 && (
          <div className="activity-grid">
            {attivitàFiltrate.map((a) => (
              <div key={a._id} className="activity-card">
                <div className="activity-card__header">
                  <span className={`badge badge--tipo badge--${a.tipo}`}>
                    {a.tipo === 'votazione' ? 'Votazione' : 'Sondaggio'}
                  </span>
                  <span className="badge badge--stato">
                    {a.stato === 'attivo' ? 'In corso' : a.stato}
                  </span>
                </div>
                <p className="activity-card__titolo">{a.titolo}</p>
                <div className="activity-card__footer">
                  <span className="activity-card__termine">Termine: {formatDate(a.data_fine)}</span>
                  <button className="btn-gestisci">Gestisci</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}
