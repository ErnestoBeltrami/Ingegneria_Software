import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Vote, BarChart2, LayoutGrid,
  Plus, Search, Activity, ChevronRight, X,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import { ConsultazioneCard } from '@/components/ConsultazioneCard';
import { API_BASE } from '../../config/api';
import './DashboardOperatorePage.css';

const NAV_CARDS = [
  {
    icon: Vote,
    iconBg: 'rgba(31,58,137,0.18)',
    iconColor: '#829aff',
    label: 'Gestione votazioni',
    desc: 'Crea e monitora le votazioni',
    linkColor: '#829aff',
    href: '/votazioni',
  },
  {
    icon: BarChart2,
    iconBg: 'rgba(0,122,82,0.18)',
    iconColor: '#00c47a',
    label: 'Gestione sondaggi',
    desc: 'Crea e gestisci i sondaggi',
    linkColor: '#00c47a',
    href: '/sondaggi',
  },
  {
    icon: LayoutGrid,
    iconBg: 'rgba(146,64,14,0.18)',
    iconColor: '#f59e0b',
    label: 'Moderazione bacheca',
    desc: 'Gestisci le proposte dei cittadini',
    linkColor: '#f59e0b',
    href: '/moderazione',
  },
];

const FILTERS = ['Tutte le attività', 'Votazioni attive', 'Sondaggi attivi', 'Proposte in arrivo'];

async function fetchWithAuth(url, navigate) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    navigate('/login', { replace: true });
    throw new Error('Sessione scaduta');
  }
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

  const [modalIniziativa, setModalIniziativa] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [motivazione, setMotivazione] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const openModal = (iniziativa) => {
    setModalIniziativa(iniziativa);
    setModalMode('view');
    setMotivazione('');
    setModalError('');
  };

  const closeModal = () => {
    setModalIniziativa(null);
    setModalMode('view');
    setMotivazione('');
    setModalError('');
  };

  const modera = async (stato) => {
    if (stato === 'rifiutata' && !motivazione.trim()) {
      setModalError('La motivazione è obbligatoria per il rifiuto.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/iniziative/${modalIniziativa._id}/modera`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stato, motivazione: motivazione.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
      setActivities(prev => prev.filter(a => a._id !== modalIniziativa._id));
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (filtro === 'Proposte in arrivo') {
          const data = await fetchWithAuth('/iniziative', navigate);
          const inAttesa = (data.iniziative ?? [])
            .filter(i => i.stato === 'in_attesa')
            .map(i => ({ ...i, _tipo: 'iniziativa' }));
          setActivities(inAttesa);
          return;
        }

        if (filtro === 'Votazioni attive') {
          const data = await fetchWithAuth('/votazioni?stato=attivo', navigate);
          setActivities(data.votazioni ?? []);
          return;
        }

        if (filtro === 'Sondaggi attivi') {
          const data = await fetchWithAuth('/sondaggio?stato=attivo', navigate);
          setActivities(data.sondaggi ?? data.votazioni ?? []);
          return;
        }

        // Tutte le attività
        const [vData, sData] = await Promise.all([
          fetchWithAuth('/votazioni?stato=attivo', navigate),
          fetchWithAuth('/sondaggio?stato=attivo', navigate),
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
    <>
    <div className="dashboard-layout">
      <TopBar nome={nome} cognome={cognome} />
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-header__title">Ciao, {nomeOperatore} 👋</h1>
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
        <button className="action-btn action-btn--green" onClick={() => navigate('/sondaggi/crea')}>
          <div className="action-btn__icon action-btn__icon--green">
            <Plus size={18} />
          </div>
          <div className="action-btn__text">
            <span className="action-btn__title action-btn__title--dark">Crea un nuovo sondaggio</span>
            <span className="action-btn__subtitle action-btn__subtitle--dark">Raccogli feedback dalla comunità</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
        </button>
      </div>

      {/* Search */}
      <div className="dashboard-search">
        <Search size={16} color="rgba(255,255,255,0.35)" />
        <input
          type="text"
          placeholder={filtro === 'Proposte in arrivo' ? 'Cerca una proposta…' : 'Cerca una votazione o sondaggio…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dashboard-search__input"
        />
      </div>

      {/* Activity section */}
      <section className="dashboard-activity">
        <h2 className="dashboard-activity__title">
          <Activity size={16} color="#829aff" />
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
            {attivitàFiltrate.map((a) =>
              a._tipo === 'iniziativa' ? (
                <div key={a._id} className="activity-card">
                  <div className="activity-card__header">
                    <span className="badge badge--categoria">{a.categoria}</span>
                    <span className="badge badge--attesa">In attesa</span>
                  </div>
                  <p className="activity-card__titolo">{a.titolo}</p>
                  <div className="activity-card__footer">
                    <span className="activity-card__termine">Da: {a.nome_cittadino} {a.cognome_cittadino}</span>
                    <button className="btn-gestisci" onClick={() => openModal(a)}>Esamina</button>
                  </div>
                </div>
              ) : (
                <ConsultazioneCard
                  key={a._id}
                  activity={a}
                  mode="operatore"
                  onAction={(id, tipo) => navigate(`/${tipo === 'votazione' ? 'votazioni' : 'sondaggi'}/${id}/riepilogo`)}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
    </div>

    {modalIniziativa && (

      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>

          <div className="modal-header">
            <span className="badge badge--categoria">{modalIniziativa.categoria}</span>
            <button className="modal-close" onClick={closeModal} aria-label="Chiudi">
              <X size={18} />
            </button>
          </div>

          <h2 className="modal-title">{modalIniziativa.titolo}</h2>
          <p className="modal-meta">Proposta da {modalIniziativa.nome_cittadino} {modalIniziativa.cognome_cittadino}</p>

          <p className="modal-descrizione">{modalIniziativa.descrizione}</p>

          <div className="modal-divider" />

          {modalMode === 'view' && (
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--approve"
                onClick={() => modera('approvata')}
                disabled={modalLoading}
              >
                {modalLoading ? 'Salvataggio…' : 'Pubblica'}
              </button>
              <button
                className="modal-btn modal-btn--reject"
                onClick={() => setModalMode('reject')}
                disabled={modalLoading}
              >
                Rifiuta
              </button>
            </div>
          )}

          {modalMode === 'reject' && (
            <div className="modal-reject-section">
              <label className="modal-reject-label">
                Motivazione del rifiuto <span style={{ color: '#f87171' }}>*</span>
              </label>
              <textarea
                className="modal-textarea"
                placeholder="Spiega al cittadino perché la proposta non può essere pubblicata…"
                value={motivazione}
                onChange={e => setMotivazione(e.target.value)}
                rows={4}
              />
              {modalError && <p className="modal-error">{modalError}</p>}
              <div className="modal-actions">
                <button
                  className="modal-btn modal-btn--back"
                  onClick={() => { setModalMode('view'); setModalError(''); }}
                  disabled={modalLoading}
                >
                  Indietro
                </button>
                <button
                  className="modal-btn modal-btn--confirm-reject"
                  onClick={() => modera('rifiutata')}
                  disabled={modalLoading || !motivazione.trim()}
                >
                  {modalLoading ? 'Salvataggio…' : 'Conferma rifiuto'}
                </button>
              </div>
            </div>
          )}

          {modalMode === 'view' && modalError && (
            <p className="modal-error">{modalError}</p>
          )}

        </div>
      </div>
    )}
    </>
  );
}
