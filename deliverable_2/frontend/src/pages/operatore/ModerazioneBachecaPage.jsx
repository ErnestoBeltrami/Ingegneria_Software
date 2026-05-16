import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './ModerazioneBachecaPage.css';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `Errore ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const FILTRI = [
  { key: 'tutte',     label: 'Tutte' },
  { key: 'in_attesa', label: 'In attesa' },
  { key: 'approvata', label: 'Approvate' },
  { key: 'rifiutata', label: 'Rifiutate' },
];

export default function ModerazioneBachecaPage() {
  const navigate = useNavigate();
  const nome    = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [iniziative,   setIniziative]   = useState([]);
  const [query,        setQuery]        = useState('');
  const [filtro,       setFiltro]       = useState('tutte');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const [modalIniziativa, setModalIniziativa] = useState(null);
  const [modalMode,       setModalMode]       = useState('view');
  const [motivazione,     setMotivazione]     = useState('');
  const [modalLoading,    setModalLoading]    = useState(false);
  const [modalError,      setModalError]      = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/iniziative');
      setIniziative(data.iniziative ?? []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.clear();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

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
      await apiFetch(`/iniziative/${modalIniziativa._id}/modera`, {
        method: 'PATCH',
        body: JSON.stringify({ stato, motivazione: motivazione.trim() || undefined }),
      });
      setIniziative(prev =>
        prev.map(i =>
          i._id === modalIniziativa._id
            ? { ...i, stato, motivazione_moderazione: motivazione.trim() || undefined }
            : i
        )
      );
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const inAttesa  = iniziative.filter(i => i.stato === 'in_attesa');
  const approvate = iniziative.filter(i => i.stato === 'approvata');
  const rifiutate = iniziative.filter(i => i.stato === 'rifiutata');

  const q = query.trim().toLowerCase();
  const filtered = iniziative
    .filter(i => filtro === 'tutte' || i.stato === filtro)
    .filter(i => !q || i.titolo.toLowerCase().includes(q));

  return (
    <>
      <div className="mb-layout">
        <TopBar nome={nome} cognome={cognome} />

        <div className="mb-page">
          <header className="mb-header">
            <div>
              <h1 className="mb-header__title">Moderazione bacheca</h1>
              <p className="mb-header__subtitle">{iniziative.length} proposte totali</p>
            </div>
          </header>

          <div className="mb-counters">
            <div className="mb-counter mb-counter--attesa">
              <span className="mb-counter__num">{inAttesa.length}</span>
              <span className="mb-counter__label">In attesa</span>
            </div>
            <div className="mb-counter mb-counter--approvata">
              <span className="mb-counter__num">{approvate.length}</span>
              <span className="mb-counter__label">Approvate</span>
            </div>
            <div className="mb-counter mb-counter--rifiutata">
              <span className="mb-counter__num">{rifiutate.length}</span>
              <span className="mb-counter__label">Rifiutate</span>
            </div>
          </div>

          <div className="mb-search-block">
            <div className="dashboard-search">
              <Search size={16} color="rgba(255,255,255,0.35)" />
              <input
                className="dashboard-search__input"
                type="text"
                placeholder="Cerca per titolo…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="mb-filters">
              {FILTRI.map(({ key, label }) => (
                <button
                  key={key}
                  className={`mb-filter-btn${filtro === key ? ' mb-filter-btn--active' : ''}`}
                  onClick={() => setFiltro(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mb-error" role="alert">{error}</p>}
          {loading && <p className="mb-status">Caricamento…</p>}

          {!loading && !error && filtered.length === 0 && (
            <p className="mb-status">
              {q ? 'Nessuna proposta trovata per questa ricerca.' : 'Nessuna proposta trovata.'}
            </p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="mb-grid">
              {filtered.map(i => (
                <IniziativaCard
                  key={i._id}
                  iniziativa={i}
                  onEsamina={() => openModal(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalIniziativa && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <span className="mb-badge-categoria">{modalIniziativa.categoria}</span>
              <button className="modal-close" onClick={closeModal} aria-label="Chiudi">
                <X size={18} />
              </button>
            </div>

            <h2 className="modal-title">{modalIniziativa.titolo}</h2>
            <p className="modal-meta">
              Proposta da {modalIniziativa.nome_cittadino} {modalIniziativa.cognome_cittadino}
            </p>

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
                  Motivazione del rifiuto <span className="modal-required-mark">*</span>
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

const LABEL = { in_attesa: 'In attesa', approvata: 'Approvata', rifiutata: 'Rifiutata' };

function IniziativaCard({ iniziativa, onEsamina }) {
  const [expanded, setExpanded] = useState(false);
  const { stato, titolo, nome_cittadino, cognome_cittadino, categoria, createdAt, motivazione_moderazione } = iniziativa;

  return (
    <div className="mb-card">
      <span className={`mb-badge mb-badge--${stato}`}>{LABEL[stato] ?? stato}</span>

      <p className="mb-card__titolo">{titolo}</p>
      <p className="mb-card__meta">{nome_cittadino} {cognome_cittadino} · {categoria}</p>
      <p className="mb-card__data">Inviata il {formatDate(createdAt)}</p>

      <div className="mb-card__actions">
        {stato === 'in_attesa' && (
          <button className="mb-action mb-action--esamina" onClick={onEsamina}>
            Esamina
          </button>
        )}
        {stato === 'rifiutata' && motivazione_moderazione && (
          <button
            className="mb-action mb-action--motivazione"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Nascondi' : 'Motivazione'}
          </button>
        )}
      </div>

      {expanded && motivazione_moderazione && (
        <p className="mb-card__motivazione">{motivazione_moderazione}</p>
      )}
    </div>
  );
}
