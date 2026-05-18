import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, ChevronRight, Search } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './GestioneSondaggiPage.css';

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
  if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
  return data;
}

export default function GestioneSondaggiPage() {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [sondaggi, setSondaggi] = useState([]);
  const [query, setQuery] = useState('');
  const [filtroStato, setFiltroStato] = useState('tutte');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const STATO_ORDER = { attivo: 0, bozza: 1, concluso: 2, archiviato: 3 };
  const FILTRI = [
    { key: 'tutte',     label: 'Tutte' },
    { key: 'attivo',    label: 'Attivi' },
    { key: 'bozza',     label: 'Bozze' },
    { key: 'concluso',  label: 'Conclusi' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/sondaggio?limit=100');
      setSondaggi(data.sondaggi ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePubblica = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/sondaggio/${id}/publish`, { method: 'PATCH' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleElimina = async (id) => {
    if (!window.confirm('Eliminare questo sondaggio? L\'operazione non è reversibile.')) return;
    setActionLoading(id);
    try {
      await apiFetch(`/sondaggio/${id}`, { method: 'DELETE' });
      setSondaggi((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = sondaggi
    .filter((s) => filtroStato === 'tutte' || s.stato === filtroStato || (filtroStato === 'concluso' && s.stato === 'archiviato'))
    .filter((s) => !q || s.titolo.toLowerCase().includes(q))
    .sort((a, b) => (STATO_ORDER[a.stato] ?? 9) - (STATO_ORDER[b.stato] ?? 9));

  const bozze    = sondaggi.filter((s) => s.stato === 'bozza');
  const attive   = sondaggi.filter((s) => s.stato === 'attivo');
  const concluse = sondaggi.filter((s) => s.stato === 'concluso' || s.stato === 'archiviato');

  return (
    <div className="gs-layout">
      <TopBar nome={nome} cognome={cognome} />

      <div className="gs-page">
        {/* Header */}
        <header className="gs-header">
          <div>
            <h1 className="gs-header__title">Gestione sondaggi</h1>
            <p className="gs-header__subtitle">{sondaggi.length} sondaggi totali</p>
          </div>
          <button
            className="gs-btn-new"
            onClick={() => navigate('/sondaggi/crea')}
          >
            <Plus size={16} />
            Nuovo sondaggio
          </button>
        </header>

        {/* Counter cards */}
        <div className="gs-counters">
          <div className="gs-counter gs-counter--bozza">
            <span className="gs-counter__num">{bozze.length}</span>
            <span className="gs-counter__label">Bozze</span>
          </div>
          <div className="gs-counter gs-counter--attiva">
            <span className="gs-counter__num">{attive.length}</span>
            <span className="gs-counter__label">Attive</span>
          </div>
          <div className="gs-counter gs-counter--conclusa">
            <span className="gs-counter__num">{concluse.length}</span>
            <span className="gs-counter__label">Concluse</span>
          </div>
        </div>

        <div className="gs-search-block">
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
          <div className="gs-filters">
            {FILTRI.map(({ key, label }) => (
              <button
                key={key}
                className={`gs-filter-btn${filtroStato === key ? ' gs-filter-btn--active' : ''}`}
                onClick={() => setFiltroStato(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="gs-error" role="alert">{error}</p>}
        {loading && <p className="gs-status">Caricamento…</p>}

        {!loading && filtered.length === 0 && !error && (
          <p className="gs-status">{q ? 'Nessun sondaggio trovato per questa ricerca.' : 'Nessun sondaggio trovato.'}</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="gs-grid">
            {filtered.map((s) => (
              <SondaggioCard
                key={s._id}
                sondaggio={s}
                busy={actionLoading === s._id}
                onPubblica={() => handlePubblica(s._id)}
                onElimina={() => handleElimina(s._id)}
                onModifica={() => navigate(`/sondaggi/${s._id}/modifica`)}
                onRiepilogo={() => navigate(`/sondaggi/${s._id}/riepilogo`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SondaggioCard({ sondaggio, busy, onPubblica, onElimina, onModifica, onRiepilogo }) {
  const { stato, titolo, data_fine } = sondaggio;

  return (
    <div className="gs-card">
      <div className="gs-card__top">
        <span className={`gs-badge gs-badge--${stato}`}>{stato}</span>
      </div>

      <p className="gs-card__titolo">{titolo}</p>

      <p className="gs-card__termine">Termine: {formatDate(data_fine)}</p>

      <div className="gs-card__actions">
        {stato === 'bozza' && (
          <>
            <button
              className="gs-action gs-action--elimina"
              onClick={onElimina}
              disabled={busy}
              aria-label="Elimina"
            >
              <Trash2 size={13} />
              Elimina
            </button>
            <button
              className="gs-action gs-action--modifica"
              onClick={onModifica}
              disabled={busy}
              aria-label="Modifica"
            >
              <Pencil size={13} />
              Modifica
            </button>
            <button
              className="gs-action gs-action--pubblica"
              onClick={onPubblica}
              disabled={busy}
            >
              {busy ? '…' : 'Pubblica'}
            </button>
          </>
        )}

        {(stato === 'attivo') && (
          <button
            className="gs-action gs-action--riepilogo gs-action--riepilogo-gray"
            onClick={onRiepilogo}
            disabled={busy}
          >
            Visualizza riepilogo
            <ChevronRight size={15} />
          </button>
        )}

        {(stato === 'concluso' || stato === 'archiviato') && (
          <button
            className="gs-action gs-action--riepilogo gs-action--riepilogo-blue"
            onClick={onRiepilogo}
            disabled={busy}
          >
            Visualizza riepilogo
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
