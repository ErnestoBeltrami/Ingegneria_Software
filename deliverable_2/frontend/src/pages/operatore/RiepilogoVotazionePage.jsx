import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Download, CheckCircle, XCircle } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import TopBar from '@/components/TopBar';
import './RiepilogoVotazionePage.css';

const COL = {
  favorevole: '#1f3a89',
  contrario:  '#e7000b',
  astenuto:   '#99a1af',
};

const FASCE_ORDER = ['18-25', '26-35', '36-50', '51-65', '66+'];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

async function apiFetch(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Errore ${res.status}`);
  return data;
}

function colorForTesto(testo = '') {
  const t = testo.toLowerCase();
  if (t.includes('favor')) return COL.favorevole;
  if (t.includes('contra')) return COL.contrario;
  return COL.astenuto;
}

function keyForTesto(testo = '') {
  const t = testo.toLowerCase();
  if (t.includes('favor')) return 'favorevole';
  if (t.includes('contra')) return 'contrario';
  return 'astenuto';
}

export default function RiepilogoVotazionePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || '';
  const cognome = localStorage.getItem('cognome') || '';

  const [base, setBase] = useState(null);
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [b, d] = await Promise.all([
          apiFetch(`/votazioni/${id}/riepilogo`),
          apiFetch(`/votazioni/${id}/riepilogo/demografico`),
        ]);
        setBase(b);
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
    <div className="rv-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rv-page"><p className="rv-status">Caricamento…</p></div>
    </div>
  );

  if (error) return (
    <div className="rv-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rv-page"><p className="rv-status rv-status--error">{error}</p></div>
    </div>
  );

  // --- dati base ---
  const { votazione: titolo, totaleVoti, risultati = [] } = base;
  const { stato, data_inizio, data_fine, opzioniMap = {}, perGenere = [], perFasciaEta = [], partecipazioneGiornaliera = [] } = demo;

  // Opzione vincente
  const best = risultati.reduce((a, b) => (b.percentuale > a.percentuale ? b : a), risultati[0] || {});
  const approvata = best?.percentuale > 50 && keyForTesto(best?.testoOpzione) === 'favorevole';
  const hasBanner = totaleVoti > 0;

  // --- donut data ---
  const donutData = risultati.map(r => ({
    name: r.testoOpzione,
    value: r.voti,
    color: colorForTesto(r.testoOpzione),
  }));

  // --- line chart data ---
  const lineData = partecipazioneGiornaliera.map(p => ({
    data: formatShortDate(p.data),
    voti: p.voti,
  }));

  // --- grouped bar per fascia ---
  const opzioniList = risultati.map(r => ({ id: r.opzioneId?.toString(), testo: r.testoOpzione }));
  const fasciaMap = {};
  perFasciaEta.forEach(({ fascia, opzioneId, voti }) => {
    if (!fasciaMap[fascia]) fasciaMap[fascia] = { fascia };
    const testo = opzioniMap[opzioneId] || opzioneId;
    fasciaMap[fascia][keyForTesto(testo)] = voti;
  });
  const fasciaData = FASCE_ORDER.map(f => fasciaMap[f] || { fascia: f });

  // --- horizontal bar per genere ---
  const generiList = ['Uomo', 'Donna'];
  const genereMap = {};
  perGenere.forEach(({ genere, opzioneId, voti }) => {
    if (!genereMap[genere]) genereMap[genere] = { genere };
    const testo = opzioniMap[opzioneId] || opzioneId;
    genereMap[genere][keyForTesto(testo)] = voti;
  });
  const genereData = generiList.map(g => genereMap[g] || { genere: g });

  const LEGEND_ITEMS = opzioniList.map(o => ({ testo: o.testo, color: colorForTesto(o.testo) }));

  return (
    <div className="rv-layout">
      <TopBar nome={nome} cognome={cognome} />
      <div className="rv-page">

        {/* Header */}
        <header className="rv-header">
          <button className="rv-back" onClick={() => navigate('/votazioni')}>
            <ArrowLeft size={16} />
            Riepilogo votazione
          </button>
          <h1 className="rv-header__title">{titolo}</h1>
          <p className="rv-header__meta">
            <span className={`rv-badge rv-badge--${stato}`}>{stato}</span>
            {data_inizio && <span>Dal {formatDate(data_inizio)}</span>}
            {data_fine && <span>al {formatDate(data_fine)}</span>}
          </p>
        </header>

        {/* Stat cards */}
        <div className="rv-stats">
          <div className="rv-stat rv-stat--total">
            <p className="rv-stat__num">{totaleVoti}</p>
            <p className="rv-stat__label">Totale votanti</p>
          </div>
          {risultati.map(r => (
            <div key={r.opzioneId} className="rv-stat" style={{ borderTop: `3px solid ${colorForTesto(r.testoOpzione)}` }}>
              <p className="rv-stat__num" style={{ color: colorForTesto(r.testoOpzione) }}>
                {r.percentuale.toFixed(0)}%
              </p>
              <p className="rv-stat__label">{r.testoOpzione}</p>
              <p className="rv-stat__sub">{r.voti} voti</p>
            </div>
          ))}
        </div>

        {/* Banner risultato */}
        {hasBanner && (
          <div className={`rv-banner ${approvata ? 'rv-banner--ok' : 'rv-banner--ko'}`}>
            {approvata
              ? <CheckCircle size={20} />
              : <XCircle size={20} />
            }
            <div>
              <p className="rv-banner__title">
                {approvata ? 'Approvata dalla maggioranza' : 'Respinta dalla maggioranza'}
              </p>
              <p className="rv-banner__sub">
                {risultati.map(r => `${r.percentuale.toFixed(0)}% ${r.testoOpzione}`).join(' · ')}
              </p>
            </div>
          </div>
        )}

        {/* Filtri demografici */}
        <div className="rv-filters-bar">
          <div className="rv-filters-bar__left">
            <Filter size={14} />
            <span className="rv-filters-bar__label">Filtri demografici</span>
          </div>
          <button className="rv-export-btn">
            <Download size={13} />
            Esporta
          </button>
        </div>
        <div className="rv-filter-pills">
          {['Per età', 'Per genere', 'Partecipazione'].map(f => (
            <span key={f} className="rv-pill rv-pill--active">{f}</span>
          ))}
        </div>

        {/* Grid 2 col: donut + line */}
        <div className="rv-charts-grid">
          <div className="rv-chart-card">
            <h3 className="rv-chart-card__title">Distribuzione voti</h3>
            {totaleVoti === 0
              ? <p className="rv-status">Nessun voto registrato.</p>
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                      {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} voti`, n]} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )
            }
          </div>

          <div className="rv-chart-card">
            <h3 className="rv-chart-card__title">Partecipazione giornaliera</h3>
            {lineData.length === 0
              ? <p className="rv-status">Nessun dato disponibile.</p>
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="voti" stroke="#1f3a89" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )
            }
          </div>
        </div>

        {/* Full-width: distribuzione per fascia d'età */}
        <div className="rv-chart-card">
          <h3 className="rv-chart-card__title">Distribuzione per fascia d'età</h3>
          {perFasciaEta.length === 0
            ? <p className="rv-status">Nessun dato demografico disponibile.</p>
            : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={fasciaData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="fascia" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="favorevole" name="Favorevoli" fill={COL.favorevole} radius={[3,3,0,0]} maxBarSize={28} />
                    <Bar dataKey="contrario"  name="Contrari"   fill={COL.contrario}  radius={[3,3,0,0]} maxBarSize={28} />
                    <Bar dataKey="astenuto"   name="Astenuti"   fill={COL.astenuto}   radius={[3,3,0,0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="rv-legend">
                  <span className="rv-legend__item"><span className="rv-legend__dot" style={{ background: COL.favorevole }} />Favorevoli</span>
                  <span className="rv-legend__item"><span className="rv-legend__dot" style={{ background: COL.contrario }} />Contrari</span>
                  <span className="rv-legend__item"><span className="rv-legend__dot" style={{ background: COL.astenuto }} />Astenuti</span>
                </div>
              </>
            )
          }
        </div>

        {/* Grid 2 col: genere + placeholder quartiere */}
        <div className="rv-charts-grid">
          <div className="rv-chart-card">
            <h3 className="rv-chart-card__title">Confronto per genere</h3>
            {perGenere.length === 0
              ? <p className="rv-status">Nessun dato demografico disponibile.</p>
              : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={genereData} layout="vertical" margin={{ top: 8, right: 16, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="genere" tick={{ fontSize: 11 }} width={45} />
                      <Tooltip />
                      <Bar dataKey="favorevole" name="Favorevoli" fill={COL.favorevole} radius={[0,3,3,0]} maxBarSize={20} />
                      <Bar dataKey="contrario"  name="Contrari"   fill={COL.contrario}  radius={[0,3,3,0]} maxBarSize={20} />
                      <Bar dataKey="astenuto"   name="Astenuti"   fill={COL.astenuto}   radius={[0,3,3,0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="rv-legend">
                    <span className="rv-legend__item"><span className="rv-legend__dot" style={{ background: COL.favorevole }} />Favorevoli</span>
                    <span className="rv-legend__item"><span className="rv-legend__dot" style={{ background: COL.contrario }} />Contrari</span>
                    <span className="rv-legend__item"><span className="rv-legend__dot" style={{ background: COL.astenuto }} />Astenuti</span>
                  </div>
                </>
              )
            }
          </div>

          <div className="rv-chart-card rv-chart-card--disabled">
            <h3 className="rv-chart-card__title">Distribuzione per quartiere</h3>
            <p className="rv-status">Dato non disponibile — il profilo cittadino non include il quartiere di residenza.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
