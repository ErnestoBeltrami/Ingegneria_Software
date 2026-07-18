import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { API_BASE } from '../../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';
import { useTheme } from '@/contexts/ThemeContext';
import './RiepilogoSondaggioPage.css';

const PALETTE = ['#5b8aff', '#00c47a', '#f5c842', '#ff5252', '#a78bfa'];

const FASCE_ORDER = ['18-25', '26-35', '36-50', '51-65', '66+'];
const GENERI_ORDER = ['Uomo', 'Donna'];
const CATEGORIE_ORDER = ['Lavoratore', 'Disoccupato', 'Pensionato', 'Studente', 'Altro'];

function chartTheme(dark) {
  const line = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
  const tick = dark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.55)';
  const strong = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  const soft = dark ? 'rgba(255,255,255,0.7)'  : 'rgba(0,0,0,0.7)';
  return {
    grid: line,
    tick: { fontSize: 11, fill: tick },
    tooltip: {
      background: dark ? 'rgba(14,14,14,0.96)' : 'rgba(255,255,255,0.98)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'}`,
      borderRadius: '12px',
      color: dark ? '#fff' : '#1a1a1a',
      fontSize: 12,
    },
    tooltipLabel: { color: strong, fontWeight: 600 },
    tooltipItem:  { color: soft },
  };
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

async function apiFetch(url, method = 'GET') {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${url}`, { method, headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
  return data;
}

function opzioniOf(domanda) {
  return domanda.risultati.map((r, oi) => ({
    id: String(r.opzioneId),
    testo: r.testoOpzione,
    color: PALETTE[oi % PALETTE.length],
  }));
}

function buildDimData(dimArr, dimKey, order, domandaId) {
  const rows = dimArr.filter(x => String(x.domandaId) === String(domandaId));
  const map = {};
  rows.forEach(({ [dimKey]: val, opzioneId, voti }) => {
    if (!map[val]) map[val] = { [dimKey]: val };
    map[val][String(opzioneId)] = voti;
  });
  return { data: order.map(v => map[v] || { [dimKey]: v }), hasData: rows.length > 0 };
}

export default function RiepilogoSondaggioPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const CHART = chartTheme(theme === 'dark');
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [riepilogo, setRiepilogo] = useState(null);
  const [meta, setMeta] = useState(null);
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroAttivo, setFiltroAttivo] = useState('sintesi');

  useEffect(() => {
    const load = async () => {
      try {
        const [r, m, d] = await Promise.all([
          apiFetch(`/sondaggio/${id}/riepilogo`),
          apiFetch(`/sondaggio/${id}`),
          apiFetch(`/sondaggio/${id}/riepilogo/aggregato`, 'POST'),
        ]);
        setRiepilogo(r);
        setMeta(m.sondaggio ?? m);
        setDemo(d);
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

  const { perGenere = [], perFasciaEta = [], perCategoria = [] } = demo ?? {};
  const DIMENSIONI = {
    eta:       { arr: perFasciaEta, key: 'fascia',    order: FASCE_ORDER },
    genere:    { arr: perGenere,    key: 'genere',    order: GENERI_ORDER },
    categoria: { arr: perCategoria, key: 'categoria', order: CATEGORIE_ORDER },
  };
  const dim = DIMENSIONI[filtroAttivo];

  return (
    <div className="rs-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rs-page">

        {/* Header */}
        <header className="rs-header">
          <BackButton variant="subtle" label="Riepilogo sondaggio" to="/sondaggi" />
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

        {/* Filtri demografici */}
        <div className="rs-filters-bar">
          <div className="rs-filters-bar__left">
            <Filter size={14} />
            <span className="rs-filters-bar__label">Analisi demografica</span>
          </div>
        </div>
        <div className="rs-filter-pills">
          {[
            { key: 'sintesi',   label: 'Sintesi' },
            { key: 'eta',       label: "Fascia d'età" },
            { key: 'genere',    label: 'Genere' },
            { key: 'categoria', label: 'Occupazione' },
          ].map(f => (
            <button
              key={f.key}
              className={`rs-pill ${filtroAttivo === f.key ? 'rs-pill--active' : ''}`}
              onClick={() => setFiltroAttivo(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {riepilogoPerDomanda.length === 0 ? (
          <p className="rs-status">Nessun dato disponibile.</p>
        ) : filtroAttivo === 'sintesi' ? (
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
                          <div className="rs-bar-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rs-domande">
            {riepilogoPerDomanda.map((domanda, di) => {
              const opzioni = opzioniOf(domanda);
              const { data, hasData } = buildDimData(dim.arr, dim.key, dim.order, domanda.domandaId);
              return (
                <div key={domanda.domandaId} className="rs-chart-card">
                  <div className="rs-domanda__header">
                    <span className="rs-domanda__num">Domanda {di + 1}</span>
                    <h3 className="rs-chart-card__title">{domanda.titoloDomanda}</h3>
                  </div>
                  {!hasData ? (
                    <p className="rs-status">Nessun dato demografico disponibile.</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                          <XAxis dataKey={dim.key} tick={CHART.tick} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                          <YAxis tick={CHART.tick} allowDecimals={false} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={CHART.tooltip} labelStyle={CHART.tooltipLabel} itemStyle={CHART.tooltipItem} />
                          {opzioni.map(o => (
                            <Bar key={o.id} dataKey={o.id} name={o.testo} fill={o.color} radius={[3,3,0,0]} maxBarSize={28} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="rs-legend">
                        {opzioni.map(o => (
                          <span key={o.id} className="rs-legend__item"><span className="rs-legend__dot" style={{ background: o.color }} />{o.testo}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
