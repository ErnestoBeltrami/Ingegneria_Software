import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, ChevronRight } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './GestioneVotazioniPage.css';

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

export default function GestioneVotazioniPage() {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [votazioni, setVotazioni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/votazioni?limit=100');
      setVotazioni(data.votazioni ?? []);
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
      await apiFetch(`/votazioni/${id}/publish`, { method: 'PATCH' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleElimina = async (id) => {
    if (!window.confirm('Eliminare questa votazione? L\'operazione non è reversibile.')) return;
    setActionLoading(id);
    try {
      await apiFetch(`/votazioni/${id}`, { method: 'DELETE' });
      setVotazioni((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const bozze    = votazioni.filter((v) => v.stato === 'bozza');
  const attive   = votazioni.filter((v) => v.stato === 'attivo');
  const concluse = votazioni.filter((v) => v.stato === 'concluso' || v.stato === 'archiviato');

  return (
    <div className="gv-layout">
      <TopBar nome={nome} cognome={cognome} />

      <div className="gv-page">
        <header className="gv-header">
          <div>
            <h1 className="gv-header__title">Gestione votazioni</h1>
            <p className="gv-header__subtitle">{votazioni.length} votazioni totali</p>
          </div>
          <button className="gv-btn-new" onClick={() => navigate('/votazioni/crea')}>
            <Plus size={16} />
            Nuova votazione
          </button>
        </header>

        <div className="gv-counters">
          <div className="gv-counter gv-counter--bozza">
            <span className="gv-counter__num">{bozze.length}</span>
            <span className="gv-counter__label">Bozze</span>
          </div>
          <div className="gv-counter gv-counter--attiva">
            <span className="gv-counter__num">{attive.length}</span>
            <span className="gv-counter__label">Attive</span>
          </div>
          <div className="gv-counter gv-counter--conclusa">
            <span className="gv-counter__num">{concluse.length}</span>
            <span className="gv-counter__label">Concluse</span>
          </div>
        </div>

        {error && <p className="gv-error" role="alert">{error}</p>}
        {loading && <p className="gv-status">Caricamento…</p>}

        {!loading && votazioni.length === 0 && !error && (
          <p className="gv-status">Nessuna votazione trovata.</p>
        )}

        {!loading && votazioni.length > 0 && (
          <div className="gv-grid">
            {votazioni.map((v) => (
              <VotazioneCard
                key={v._id}
                votazione={v}
                busy={actionLoading === v._id}
                onPubblica={() => handlePubblica(v._id)}
                onElimina={() => handleElimina(v._id)}
                onModifica={() => navigate(`/votazioni/${v._id}/modifica`)}
                onRiepilogo={() => navigate(`/votazioni/${v._id}/riepilogo`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VotazioneCard({ votazione, busy, onPubblica, onElimina, onModifica, onRiepilogo }) {
  const { stato, titolo, data_fine } = votazione;

  return (
    <div className="gv-card">
      <span className={`gv-badge gv-badge--${stato}`}>{stato}</span>

      <p className="gv-card__titolo">{titolo}</p>

      <p className="gv-card__termine">Termine: {formatDate(data_fine)}</p>

      <div className="gv-card__actions">
        {stato === 'bozza' && (
          <>
            <button
              className="gv-action gv-action--elimina"
              onClick={onElimina}
              disabled={busy}
              aria-label="Elimina"
            >
              <Trash2 size={13} />
              Elimina
            </button>
            <button
              className="gv-action gv-action--modifica"
              onClick={onModifica}
              disabled={busy}
              aria-label="Modifica"
            >
              <Pencil size={13} />
              Modifica
            </button>
            <button
              className="gv-action gv-action--pubblica"
              onClick={onPubblica}
              disabled={busy}
            >
              {busy ? '…' : 'Pubblica'}
            </button>
          </>
        )}

        {stato === 'attivo' && (
          <button
            className="gv-action gv-action--riepilogo gv-action--riepilogo-gray"
            onClick={onRiepilogo}
            disabled={busy}
          >
            Visualizza riepilogo
            <ChevronRight size={15} />
          </button>
        )}

        {(stato === 'concluso' || stato === 'archiviato') && (
          <button
            className="gv-action gv-action--riepilogo gv-action--riepilogo-blue"
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
