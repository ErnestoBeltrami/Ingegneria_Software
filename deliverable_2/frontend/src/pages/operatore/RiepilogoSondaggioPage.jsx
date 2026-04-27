import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TopBar from '@/components/TopBar';
import './RiepilogoSondaggioPage.css';

const PALETTE = ['#5b8aff', '#00c47a', '#f5c842', '#ff5252', '#a78bfa'];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

async function apiFetch(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
  return data;
}

export default function RiepilogoSondaggioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [riepilogo, setRiepilogo] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [r, m] = await Promise.all([
          apiFetch(`/sondaggio/${id}/riepilogo`),
          apiFetch(`/sondaggio/${id}`),
        ]);
        setRiepilogo(r);
        setMeta(m.sondaggio ?? m);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="rs-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rs-page"><p className="rs-status">Caricamento…</p></div>
    </div>
  );

  if (error) return (
    <div className="rs-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rs-page"><p className="rs-status rs-status--error">{error}</p></div>
    </div>
  );

  const { sondaggio: titolo, totaleVotiUnici, riepilogoPerDomanda = [] } = riepilogo;
  const stato = meta?.stato ?? '';
  const data_inizio = meta?.data_inizio;
  const data_fine = meta?.data_fine;

  return (
    <div className="rs-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rs-page">

        {/* Header */}
        <header className="rs-header">
          <button className="rs-back" onClick={() => navigate('/sondaggi')}>
            <ArrowLeft size={16} />
            Riepilogo sondaggio
          </button>
          <h1 className="rs-header__title">{titolo}</h1>
          <p className="rs-header__meta">
            <span className={`rs-badge rs-badge--${stato}`}>{stato}</span>
            {data_inizio && <span>Dal {formatDate(data_inizio)}</span>}
            {data_fine && <span>al {formatDate(data_fine)}</span>}
          </p>
        </header>

        {/* Stat card */}
        <div className="rs-stat">
          <p className="rs-stat__num">{totaleVotiUnici}</p>
          <p className="rs-stat__label">Rispondenti totali</p>
        </div>

        {/* Domande */}
        {riepilogoPerDomanda.length === 0
          ? <p className="rs-status">Nessun dato disponibile.</p>
          : (
            <div className="rs-domande">
              {riepilogoPerDomanda.map((domanda, di) => (
                <div key={domanda.domandaId} className="rs-domanda">
                  <div className="rs-domanda__header">
                    <span className="rs-domanda__num">Domanda {di + 1}</span>
                    <h2 className="rs-domanda__titolo">{domanda.titoloDomanda}</h2>
                  </div>
                  <div className="rs-opzioni">
                    {domanda.risultati.map((r, oi) => {
                      const color = PALETTE[oi % PALETTE.length];
                      const pct = Math.round(r.percentuale ?? 0);
                      return (
                        <div key={r.opzioneId} className="rs-opzione">
                          <div className="rs-opzione__top">
                            <span className="rs-opzione__testo">{r.testoOpzione}</span>
                            <div className="rs-opzione__meta">
                              <span className="rs-opzione__pct" style={{ color }}>{pct}%</span>
                              <span className="rs-opzione__voti">{r.voti} voti</span>
                            </div>
                          </div>
                          <div className="rs-bar-track">
                            <div
                              className="rs-bar-fill"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        }

      </div>
    </div>
  );
}
